import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X, TriangleAlert } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string | undefined;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: DeleteConfirmationDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300"
      style={{ zIndex: 99999, position: 'fixed', inset: 0 }}
    >
      {/* Modal Container */}
      <div 
        className="relative w-full bg-white dark:bg-[#1f0f0f] rounded-xl shadow-2xl ring-1 ring-black/5 flex flex-col items-center p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200"
        style={{ maxWidth: '440px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Warning Icon */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 mb-5">
          <TriangleAlert className="w-8 h-8 text-[#ec1313]" />
        </div>

        {/* Content */}
        {/* Content */}
        <div className="text-center w-full mb-14">
          <h2 className="text-gray-900 dark:text-white tracking-tight text-2xl font-bold leading-tight mb-4">
            Hapus Kegiatan?
          </h2>
          <div className="space-y-1">
            <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed">
              Anda akan menghapus kegiatan <span className="font-semibold text-gray-900 dark:text-gray-100">"{itemName}"</span>.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:grid sm:grid-cols-2 gap-4 w-full">
          {/* Cancel Button */}
          <button 
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-xl h-12 px-4 bg-white border border-gray-200 dark:bg-transparent dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 text-base font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
          >
            Batal
          </button>
          
          {/* Delete Button */}
          <button 
            onClick={onConfirm}
            className="group flex w-full items-center justify-center gap-2 rounded-xl h-12 px-6 hover:bg-red-700 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 dark:focus:ring-offset-[#1f0f0f]"
            style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
          >
            <Trash2 size={20} className="group-hover:animate-pulse" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
