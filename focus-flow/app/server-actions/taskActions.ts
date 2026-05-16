'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* ---------- Task CRUD ---------- */
export async function createTask(name: string) {
  return prisma.task.create({
    data: { name },
  });
}

export async function updateTask(taskId: number, newName: string) {
  const trimmedName = newName.trim();
  if (!trimmedName) return;
  return prisma.task.update({
    where: { id: taskId },
    data: {
      name: trimmedName,
      isArchived: false, // Reset archived status on edit
    },
  });
}

export async function deleteTask(taskId: number) {
  // Soft delete by setting isArchived to true
  return prisma.task.delete({
    where: { id: taskId }
  });
}

export async function archiveTask(taskId: number) {
  return prisma.task.update({
    where: { id: taskId },
    data: { isArchived: true },
  });
}

export async function restoreTask(taskId: number) {
  return prisma.task.update({
    where: { id: taskId },
    data: { isArchived: false },
  });
}

export async function addTaskToSession(taskId: number, sessionId: number) {
  // increment the task's sessionCount
  await prisma.task.update({
    where: { id: taskId },
    data: { sessionCount: { increment: 1 } },
  });

  // fetch current session, append task ID to its JSON tasks field
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error('Session not found');
  const tasks = session.tasks ? JSON.parse(session.tasks) : [];
  tasks.push(taskId);
  await prisma.session.update({
    where: { id: sessionId },
    data: { tasks: JSON.stringify(tasks) },
  });
}

/* ---------- Session handling ---------- */
export async function getSession() {
  // assume the latest session is the active one
  return prisma.session.findFirst({
    orderBy: { id: 'desc' },
  });
}

export async function resetSession(duration = 25) {
  // create a brand‑new session entry
  return prisma.session.create({
    data: {
      duration,
      tasks: JSON.stringify([]),
      completed: false,
    },
  });
}

/* ---------- Task list ---------- */
export async function getTasks(includeArchived = false) {
  return prisma.task.findMany({
    where: includeArchived ? {} : { isArchived: false },
    orderBy: { createdAt: 'desc' },
  });
}
