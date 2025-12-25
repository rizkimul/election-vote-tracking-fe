import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X, TriangleAlert, Calendar, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string | undefined;
  description?: string;
  affectedItems?: any[]; 
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  description,
  affectedItems,
}: DeleteConfirmationDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
        className="relative w-full bg-white dark:bg-[#1f0f0f] rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 flex flex-col items-center p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200"
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
        <div className="text-center w-full mb-6">
          <h2 className="text-gray-900 dark:text-white tracking-tight text-2xl font-bold leading-tight mb-4">
            Hapus Kegiatan?
          </h2>
          <div className="space-y-3">
            <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed">
              Anda akan menghapus kegiatan <span className="font-semibold text-gray-900 dark:text-gray-100">"{itemName}"</span>.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed">
              {description || "Tindakan ini tidak dapat dibatalkan."}
            </p>

            {affectedItems && affectedItems.length > 0 && (
              <div className="mt-4 text-left">
                <p className="text-sm font-medium text-red-600 mb-2">
                  Data berikut juga akan terhapus:
                </p>
                <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border border-red-100 dark:border-red-900/20 max-h-60 overflow-y-auto">
                  {affectedItems.slice(0, isExpanded ? undefined : 3).map((item, idx) => (
                    <div 
                        key={idx} 
                        className={`flex flex-col gap-2 ${idx > 0 ? 'mt-4 pt-4 border-t border-red-200 dark:border-red-800/30' : ''}`}
                    >
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {item.activity_name}
                        </span>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                             <span className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" />
                                {item.date}
                             </span>
                             <span className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" />
                                {item.location}
                             </span>
                        </div>
                    </div>
                  ))}
                  
                  {affectedItems.length > 3 && (
                    <div 
                      className="border-t border-red-200 dark:border-red-800/30 text-left"
                      style={{ marginTop: '16px', paddingTop: '12px' }}
                    >
                        <button
                          type="button"
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                        >
                          {isExpanded ? (
                            <>
                              Tampilkan lebih sedikit
                              <ChevronUp className="ml-1 w-3 h-3" />
                            </>
                          ) : (
                            <>
                              +{affectedItems.length - 3} lainnya
                              <ChevronDown className="ml-1 w-3 h-3" />
                            </>
                          )}
                        </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ height: '10px' }}></div>

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
