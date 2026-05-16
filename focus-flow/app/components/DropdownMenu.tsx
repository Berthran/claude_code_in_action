'use client';
import { ReactNode, useEffect, useRef } from "react";

type DropdownMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function DropdownMenu({
  isOpen,
  onClose,
  children,
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1 w-40 bg-zinc-800 border border-emerald-500 rounded-lg shadow-lg z-50 overflow-hidden"
      style={{ top: '100%' }}
    >
      {children}
    </div>
  );
}