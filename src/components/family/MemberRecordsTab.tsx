import React, { useState } from 'react';
import { FileText, Download, Eye, Plus, Calendar, Stethoscope, Trash2, Filter } from 'lucide-react';
import { MedicalRecord, DocumentCategory } from '../../types/index.ts';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../api/index.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';

interface MemberRecordsTabProps {
  memberId: string;
  records: MedicalRecord[];
  onRefresh: () => void;
}

export const MemberRecordsTab: React.FC<MemberRecordsTabProps> = ({
  memberId,
  records,
  onRefresh
}) => {
  const { openUploadRecord, setPreviewRecord } = useApp();
  const { showToast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories: DocumentCategory[] = [
    'Prescription',
    'Blood Test',
    'X-Ray',
    'MRI',
    'CT Scan',
    'Discharge Summary',
    'Other'
  ];

  const filtered = records.filter(r => {
    if (categoryFilter === 'all') return true;
    return r.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteMedicalRecord(deletingId);
      showToast('Document removed from archive', 'info');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete record', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (rec: MedicalRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('carecircle_token') || '';
    const link = document.createElement('a');
    link.href = `/api/records/${rec.id}/download?token=${encodeURIComponent(token)}`;
    link.download = rec.fileName || `${rec.documentName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryColor = (cat: DocumentCategory) => {
    switch (cat) {
      case 'Prescription':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Blood Test':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'X-Ray':
      case 'MRI':
      case 'CT Scan':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Discharge Summary':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              categoryFilter === 'all'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Archive ({records.length})
          </button>
          {categories.map(cat => {
            const count = records.filter(r => r.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        <button
          onClick={() => openUploadRecord(memberId)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Document Archive List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No medical documents in this category</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload diagnostic lab reports, scans, or historical doctor prescriptions.
            </p>
          </div>
        ) : (
          filtered.map(rec => (
            <div
              key={rec.id}
              onClick={() => setPreviewRecord(rec)}
              className="group p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(rec.category)}`}>
                    {rec.category}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{rec.uploadDate}</span>
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                  {rec.documentName}
                </h4>

                {rec.doctor && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Stethoscope className="w-3 h-3 text-slate-400" />
                    <span>Prescribed / Ref: {rec.doctor.fullName}</span>
                  </p>
                )}

                {rec.notes && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {rec.notes}
                  </p>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  {rec.fileName || 'document.pdf'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewRecord(rec);
                    }}
                    title="Preview Document"
                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => handleDownload(rec, e)}
                    title="Download Document"
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(rec.id);
                    }}
                    title="Delete Document"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Medical Document"
        message="Are you sure you want to permanently delete this medical document from the family archive?"
      />
    </div>
  );
};
