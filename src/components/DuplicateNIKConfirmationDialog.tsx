import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, MapPin, Calendar, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';

interface Activity {
  activity_name: string;
  date: string;
  location: string;
}

interface DuplicateNIKConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nik: string;
  activities: Activity[];
}

export function DuplicateNIKConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  nik,
  activities,
}: DuplicateNIKConfirmationDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300"
      style={{ zIndex: 99999, position: 'fixed', inset: 0 }}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div 
        className="relative w-full bg-white dark:bg-[#1f1f0f] rounded-xl ring-1 ring-black/10 dark:ring-white/10 flex flex-col items-center p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200"
        style={{ 
          maxWidth: '500px', 
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
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
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20 mb-5">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>

        {/* Content */}
        <div className="text-center w-full mb-6">
          <h2 className="text-gray-900 dark:text-white tracking-tight text-2xl font-bold leading-tight mb-3">
            NIK Sudah Terdaftar
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed">
            NIK <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{nik}</span> sudah terdaftar di kegiatan berikut:
          </p>
        </div>

        {/* Activity List */}
        {(() => {
          // Sort activities by date (most recent first)
          const sortedActivities = [...activities].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          const displayedActivities = showAllActivities ? sortedActivities : sortedActivities.slice(0, 3);
          const remainingCount = sortedActivities.length - 3;

          return (
            <div className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto">
              {displayedActivities.map((activity, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col gap-1 ${index > 0 ? 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-700' : ''}`}
                >
                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {activity.activity_name}
                  </span>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {activity.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activity.location}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* +X more badge - click to expand */}
              {remainingCount > 0 && !showAllActivities && (
                <div 
                  className="border-t border-gray-200 dark:border-gray-700"
                  style={{ marginTop: '0.5rem', paddingTop: '0.875rem' }}
                >
                  <button
                    type="button"
                    onClick={() => setShowAllActivities(true)}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    style={{ width: 'fit-content' }}
                  >
                    +{remainingCount} lainnya
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                </div>
              )}
              
              {/* Collapse button when expanded */}
              {showAllActivities && sortedActivities.length > 3 && (
                <div 
                  className="border-t border-gray-200 dark:border-gray-700"
                  style={{ marginTop: '0.5rem', paddingTop: '0.875rem' }}
                >
                  <button
                    type="button"
                    onClick={() => setShowAllActivities(false)}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    style={{ width: 'fit-content' }}
                  >
                    Tampilkan lebih sedikit
                    <ChevronUp size={14} className="ml-1" />
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Confirmation Text */}
        <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
          Apakah Anda yakin ingin tetap menambahkan peserta dengan NIK ini?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-row gap-3 w-full">
          {/* Cancel Button */}
          <button 
            onClick={onClose}
            className="flex flex-1 items-center justify-center rounded-xl h-12 px-4 bg-white border-2 border-gray-200 dark:bg-transparent dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 text-base font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
          >
            Batal
          </button>
          
          {/* Confirm Button */}
          <button 
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl h-12 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-[#1f1f0f]"
          >
            <UserPlus size={18} />
            <span>Ya, Tambahkan</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
