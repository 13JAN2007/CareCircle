import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from './Modal.tsx';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDangerous = true,
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
          isDangerous ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
        }`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm ${
              isDangerous 
                ? 'bg-rose-600 hover:bg-rose-700' 
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
