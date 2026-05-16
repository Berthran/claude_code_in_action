"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Plus, ChevronUp, ChevronDown, Search, MoreVertical, Archive, Inbox } from 'lucide-react';
import PremiumClock from './components/PremiumClock';
import Modal, { PromptModal, AlertModal } from './components/Modal';
import AllocationModal from './components/AllocationModal';
import DropdownMenu from './components/DropdownMenu';
import { motion } from 'framer-motion';
import { createTask, updateTask, deleteTask, archiveTask, restoreTask, getSession, getTasks } from './server-actions/taskActions';

interface Task {
  id: number;
  name: string;
  createdAt: Date;
  sessionCount: number;
  isArchived: boolean;
}

export default function Dashboard() {
  
  // Hero quotes data
  const quotes = [
    { text: "Focus on being productive, not busy.", author: "Tim Ferriss" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It's not about having time, it's about making time.", author: "Unknown" },
    { text: "Productivity is never an accident.", author: "Paul J. Meyer" },
    { text: "Do less, accomplish more.", author: "Todd Henry" },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Make each day your masterpiece.", author: "John Wooden" },
    { text: "Simplicity boils down to two steps: Identify the essential. Eliminate the rest.", author: "Leo Babauta" },
    { text: "Focus on being productive instead of busy.", author: "Unknown" }
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const router = useRouter();
  const [sessionMinutes, setSessionMinutes] = useState<number | string>(25);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);
  const [allocations, setAllocations] = useState<Array<{id:number; name:string}>>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedName, setEditedName] = useState<string>('');
  const [showArchived, setShowArchived] = useState(false);
  const [menuOpenTaskId, setMenuOpenTaskId] = useState<number | null>(null);
  const [permissions, setPermissions] = useState({
    createTask: true,
    editTask: true,
    deleteTask: true,
    archiveTask: true,
    restoreTask: true,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fetch tasks and session on mount
  useEffect(() => {
    async function fetchData() {
      const session = await getSession();
      if (session) {
        setSessionId(session.id);
      }
      const allTasks = await getTasks(showArchived);
      setTasks(allTasks as Task[]);
    }
    fetchData();
  }, [showArchived]); // Re-fetch when showArchived changes


  

  const handleCreateTask = async (name: string) => {
    if (!name) return;
    await createTask(name);
    const updated = await getTasks();
    setTasks(updated as Task[]);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditedName(task.name);
    setIsEditOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!editingTask) return;
    const updatedTask = await updateTask(editingTask.id, editedName);
    if (updatedTask) {
      const updated = await getTasks();
      setTasks(updated as Task[]);
      setIsEditOpen(false);
      setEditingTask(null);
      setEditedName('');
    }
  };

  const handleArchiveTask = async (taskId: number) => {
    // Archive using archiveTask server action
    await archiveTask(taskId);
    const updated = await getTasks();
    setTasks(updated as Task[]);
    // Show toast/alert for confirmation
    setAlertMessage('Task archived');
    setIsAlertOpen(true);
  };

  const handleRestoreTask = async (taskId: number) => {
    // Restore using restoreTask server action
    await restoreTask(taskId);
    const updated = await getTasks(true);
    setTasks(updated as Task[]);
    setShowArchived(false);
    // Show toast/alert for confirmation
    setAlertMessage('Task restored');
    setIsAlertOpen(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    await deleteTask(taskId);
    setIsDeleteConfirmOpen(false);
    const updated = await getTasks(true);
    setTasks(updated as Task[]);
    const remainingArchivedTasks = updated.filter(task => task.isArchived === true);
    if (remainingArchivedTasks.length === 0 && showArchived) {
      setShowArchived(false);
      setAlertMessage('Task permanently deleted. No archived tasks remaining.');
    } else {
      setAlertMessage('Task permanently deleted');
    }

    setIsAlertOpen(true);
  };

  const openDeleteConfirm = (taskId: number) => {
    setPendingDeleteTaskId(taskId);
    setIsDeleteConfirmOpen(true);
  };

  const toggleTaskSelection = (id: number) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStartSession = () => {
    if (selectedTaskIds.size === 0) {
      setAlertMessage('Please select at least one task.');
      setIsAlertOpen(true);
      return;
    }

    const minutes = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) || 25 : sessionMinutes;
    // Prepare selected tasks for allocation modal
    const selectedTasks = Array.from(selectedTaskIds).map(id => {
      const task = tasks.find(t => t.id === id);
      return task ? { id: task.id, name: task.name } : null;
    }).filter(Boolean) as {id:number; name:string}[];
    setAllocations(selectedTasks);
    setIsAllocationOpen(true);
  };

  const handleAllocationConfirm = (allocs: Array<{id:number; name:string; allocated:number}>) => {
    const minutes = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) || 25 : sessionMinutes;
    const taskIds = allocs.map(a => a.id).join(',');
    console.log(taskIds);
    const allocatedMinutes = allocs.map(a => a.allocated).join(',');
    router.push(`/timer?duration=${minutes}&tasks=${taskIds}&allocations=${allocatedMinutes}`);
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 flex flex-col items-center font-black">
        {/* Application title */}
        <h1 className="text-4xl font-extrabold mb-6 text-emerald-500 font-black">Focus Flow</h1>
        {/* Hero quote carousel */}
        <div className="relative w-full max-w-2xl mb-8 p-6 rounded-lg bg-zinc-900 text-center" style={{backgroundImage: `url('/quotes/${quoteIndex}.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <p className="text-xl font-medium text-emerald-300">{quotes[quoteIndex].text}</p>
          <p className="mt-2 text-sm text-zinc-400">- {quotes[quoteIndex].author}</p>
        </div>
      {/* Premium Clock Section */}
      <div className="mb-8 w-full max-w-2xl flex flex-col items-center">
        <PremiumClock />

        {/* Duration Input */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex flex-col items-center">
            <input
              type="text"
              inputMode="numeric"
              value={sessionMinutes}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d+$/.test(val)) {
                  setSessionMinutes(val);
                }
              }}
              className="w-20 text-emerald-400 text-4xl font-black text-center px-2 py-2 focus:outline-none bg-zinc-900 rounded"
            />
            <span className="text-zinc-400 text-sm">mins</span>
          </div>
          <div className="flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const current = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) || 0 : sessionMinutes;
                setSessionMinutes(current + 5);
              }}
              className="w-6 h-6 flex items-center justify-center hover:bg-emerald-500"
            >
              <ChevronUp size={16} className="text-emerald-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const current = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) || 0 : sessionMinutes;
                setSessionMinutes(Math.max(current - 5, 5));
              }}
              className="w-6 h-6 flex items-center justify-center hover:bg-emerald-500"
            >
              <ChevronDown size={16} className="text-emerald-400" />
            </motion.button>
          </div>
        </div>

        {/* Start Session Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartSession}
          className="p-6 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-all text-black"
        >
          <Play size={48} />
        </motion.button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-12">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPromptOpen(true)}
          className="px-6 py-3 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-600 transition-all"
        >
          <Plus size={20} className="inline mr-2" />
          Create Task
        </motion.button>
              </div>

      {/* TASK LIST */}
      {/* Task List */}
<div className="w-full max-w-2xl">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-black tracking-tight text-emerald-400">
      {showArchived ? 'Archived Tasks' : 'Active Tasks'}
    </h2>
    {/* Icon Toggle Button */}
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setShowArchived(!showArchived)}
      className="relative group"
      title={showArchived ? 'Show Active Tasks' : 'Show Archived Tasks'}
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
        {showArchived ? (
          <>
            <Inbox size={18} className="text-emerald-400" />
            <span className="text-sm text-zinc-300">Active</span>
          </>
        ) : (
          <>
            <Archive size={18} className="text-emerald-400" />
            <span className="text-sm text-zinc-300">Archived</span>
          </>
        )}
      </div>

    </motion.button>
  

  </div>
  
  <div className="mb-4">
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
      <input
        type="text"
        placeholder={`Search ${showArchived ? 'archived' : 'active'} tasks...`}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-2 py-2 bg-zinc-800 border border-emerald-400 rounded text-white focus:outline-none focus:border-emerald-300"
      />
    </div>
  </div>
  
  <div className="space-y-3">
  {tasks
      .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(t => showArchived ? t.isArchived === true : t.isArchived === false)
      .map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
            task.isArchived 
              ? 'bg-zinc-900/50 border border-zinc-700 opacity-75' 
              : 'bg-zinc-900 border-l-4 border-emerald-500'
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            {!task.isArchived && (
              <input
                type="checkbox"
                checked={selectedTaskIds.has(task.id)}
                onChange={() => toggleTaskSelection(task.id)}
                className="w-5 h-5 accent-emerald-500"
              />
            )}
            <div className="flex flex-col">
              <span className={`text-lg ${task.isArchived ? 'line-through text-zinc-500' : 'text-white'}`}>
                {task.name}
              </span>
              {task.isArchived && (
                <span className="text-xs text-zinc-500">Archived - Cannot be selected for sessions</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-emerald-400 font-bold">
              {task.sessionCount} {task.sessionCount === 1 ? 'session' : 'sessions'}
            </span>
            
            <div className="relative">
              <button
                onClick={() => setMenuOpenTaskId(menuOpenTaskId === task.id ? null : task.id)}
                className="p-1 hover:bg-zinc-700 rounded transition-colors"
              >
                <MoreVertical size={20} className="text-zinc-400" />
              </button>
              
              <DropdownMenu 
                isOpen={menuOpenTaskId === task.id} 
                onClose={() => setMenuOpenTaskId(null)}
              >
                {!task.isArchived ? (
                  <>
                    <button
                      onClick={() => {
                        handleEditTask(task);
                        setMenuOpenTaskId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleArchiveTask(task.id);
                        setMenuOpenTaskId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-emerald-600 hover:text-white transition-colors border-t border-zinc-700"
                    >
                      Archive
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        handleRestoreTask(task.id);
                        setMenuOpenTaskId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => {
                        openDeleteConfirm(task.id);
                        setMenuOpenTaskId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white transition-colors border-t border-zinc-700"
                    >
                      Delete Permanently
                    </button>
                  </>
                )}
              </DropdownMenu>
            </div>
          </div>
        </motion.div>
      ))}
    
    {tasks
      .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(t => showArchived ? t.isArchived === true : t.isArchived === false)
      .length === 0 && (
      <p className="text-center text-zinc-500 py-6">
        {searchTerm 
          ? `No ${showArchived ? 'archived' : 'active'} tasks match your search.` 
          : showArchived 
            ? 'No archived tasks. Archive active tasks to see them here.' 
            : 'No active tasks. Click Create Task to add one.'}
      </p>
    )}
  </div>
</div>
      
      <PromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        onSubmit={handleCreateTask}
        title="Create Task"
        placeholder="Task name"
      />
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        message={alertMessage}
      />
      <AllocationModal
        isOpen={isAllocationOpen}
        onClose={() => setIsAllocationOpen(false)}
          sessionId={sessionId as number}
        tasks={allocations.map(t => ({ id: t.id, name: t.name, allocated: 0 }))}
        totalDuration={typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) || 25 : sessionMinutes}
        onConfirm={handleAllocationConfirm}
      />
      {/* Edit Task Modal */}
      {isEditOpen && editingTask && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Task">
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800 border border-emerald-500 rounded text-white mb-4 focus:outline-none"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setIsEditOpen(false); setEditingTask(null); setEditedName(''); }}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmEdit}
              className="px-4 py-2 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-600 transition-colors"
            >
              Save
            </button>
          </div>
        </Modal>
      )}
      {/* Delete Task Modal */}
      {isDeleteConfirmOpen && (
        <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Delete">
          <p className="text-zinc-300 mb-6">
            Are you sure you want to permanently delete this task? This action cannot be undone
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={()=> setIsDeleteConfirmOpen(false)}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors">
                Cancel
            </button>
            <button
              onClick={() => {
                if (pendingDeleteTaskId) {
                  handleDeleteTask(pendingDeleteTaskId);
                  setPendingDeleteTaskId(null);
                }
              }} className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors">
                Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Permissions Modal */}
      {isSettingsOpen && (
        <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Permissions">
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={permissions.createTask}
                onChange={() => setPermissions({ ...permissions, createTask: !permissions.createTask })}
                className="w-5 h-5 accent-emerald-500"
              />
              Create Task
            </label>
            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={permissions.editTask}
                onChange={() => setPermissions({ ...permissions, editTask: !permissions.editTask })}
                className="w-5 h-5 accent-emerald-500"
              />
              Edit Task
            </label>
            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={permissions.deleteTask}
                onChange={() => setPermissions({ ...permissions, deleteTask: !permissions.deleteTask })}
                className="w-5 h-5 accent-emerald-500"
              />
              Delete Task
            </label>
            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={permissions.archiveTask}
                onChange={() => setPermissions({ ...permissions, archiveTask: !permissions.archiveTask })}
                className="w-5 h-5 accent-emerald-500"
              />
              Archive Task
            </label>
            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={permissions.restoreTask}
                onChange={() => setPermissions({ ...permissions, restoreTask: !permissions.restoreTask })}
                className="w-5 h-5 accent-emerald-500"
              />
              Restore Task
            </label>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // In a real app, you would send permissions to the server here
                console.log('Saving permissions:', permissions);
                setIsSettingsOpen(false);
              }}
              className="px-4 py-2 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-600 transition-colors"
            >
              Save
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
