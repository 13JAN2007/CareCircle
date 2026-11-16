import React, { useState, useEffect } from 'react';
import { Download, Printer, FileText, Calendar, User, Stethoscope, AlertCircle, FileCheck } from 'lucide-react';
import { Modal } from './Modal.tsx';
import { MedicalRecord } from '../../types/index.ts';

interface DocumentPreviewModalProps {
  record: MedicalRecord | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ record, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!record) return;

    // Fetch text preview if available
    setLoading(true);
    const token = localStorage.getItem('carecircle_token') || '';
    fetch(`/api/records/${record.id}/download?token=${encodeURIComponent(token)}`)
      .then(res => res.text())
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Could not load text stream:', err);
        setContent(record.notes || 'Document archived securely.');
        setLoading(false);
      });
  }, [record]);

  if (!record) return null;

  const handleDownload = () => {
    const token = localStorage.getItem('carecircle_token') || '';
    const link = document.createElement('a');
    link.href = `/api/records/${record.id}/download?token=${encodeURIComponent(token)}`;
    link.download = record.fileName || `${record.documentName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const isImage = record.fileType?.startsWith('image/') || record.fileName?.match(/\.(jpe?g|png|webp|gif)$/i);

  return (
    <Modal
      isOpen={!!record}
      onClose={onClose}
      title={record.documentName}
      subtitle={`Category: ${record.category} • Uploaded on ${record.uploadDate}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Document Metadata Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient</span>
              <span className="font-semibold text-slate-800">{record.familyMember?.fullName || 'Family Member'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Associated Doctor</span>
              <span className="font-semibold text-slate-800">{record.doctor?.fullName || 'Unspecified'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date of Record</span>
              <span className="font-semibold text-slate-800">{record.uploadDate}</span>
            </div>
          </div>
        </div>

        {/* Notes callout if any */}
        {record.notes && (
          <div className="p-3 bg-brand-50/60 border border-brand-100 rounded-xl text-xs text-brand-900">
            <span className="font-semibold block mb-0.5">Clinical Summary / Notes:</span>
            <p className="text-slate-700 whitespace-pre-wrap">{record.notes}</p>
          </div>
        )}

        {/* Document Content View */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-inner overflow-hidden min-h-[300px] max-h-[500px] flex flex-col">
          <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{record.fileName || `${record.documentName}.pdf`}</span>
              <span className="text-slate-400 text-[11px]">({(record.fileSize / 1024).toFixed(1)} KB)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
            {isImage ? (
              <div className="flex items-center justify-center p-4">
                <img 
                  src={record.fileUrl} 
                  alt={record.documentName} 
                  className="max-h-[420px] max-w-full rounded-lg shadow border object-contain"
                />
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {content || 'Loading document preview...'}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Close Preview
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Document</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
