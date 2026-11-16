import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  Calendar, 
  User, 
  Stethoscope, 
  Plus,
  FileCheck
} from 'lucide-react';
import { MedicalRecord, DocumentCategory, FamilyMember } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useApp } from '../../context/AppContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { UploadRecordModal } from './UploadRecordModal.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';

export const MedicalRecordsView: React.FC = () => {
  const { 
    isUploadRecordModalOpen, 
    setIsUploadRecordModalOpen, 
    openUploadRecord, 
    setPreviewRecord, 
    refreshKey, 
    triggerRefresh 
  } = useApp();
  const { showToast } = useToast();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const [deletingRecord, setDeletingRecord] = useState<MedicalRecord | null>(null);

  const categories: DocumentCategory[] = [
    'Prescription',
    'Blood Test',
    'X-Ray',
    'MRI',
    'CT Scan',
    'Discharge Summary',
    'Other'
  ];

  const fetchRecords = async () => {
    try {
      const [recRes, memRes] = await Promise.all([
        api.getMedicalRecords({
          memberId: memberFilter,
          category: categoryFilter,
          date: dateFilter,
          search: search.trim()
        }),
        api.getFamilyMembers()
      ]);

      setRecords(recRes.records || []);
      setMembers(memRes.members || []);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [memberFilter, categoryFilter, dateFilter, search, refreshKey]);

  const handleDelete = async () => {
    if (!deletingRecord) return;
    try {
      await api.deleteMedicalRecord(deletingRecord.id);
      showToast('Document removed from archive', 'info');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete record', 'error');
    } finally {
      setDeletingRecord(null);
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

  const getCategoryBadge = (cat: DocumentCategory) => {
    switch (cat) {
      case 'Prescription':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Blood Test':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'X-Ray':
      case 'MRI':
      case 'CT Scan':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Discharge Summary':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Search, Filter Bar and Upload Action */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reports by title, test name, notes, or doctor..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <button
            onClick={() => openUploadRecord()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all shrink-0"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Filter Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Member Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Family Member
            </label>
            <select
              value={memberFilter}
              onChange={e => setMemberFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Family Members</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.fullName}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Document Category
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Document Types</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Upload Date
            </label>
            <div className="flex gap-1.5">
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  title="Clear Date"
                  className="px-2 py-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Medical Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {records.length === 0 ? (
          <div className="col-span-full text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">No medical records found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search || memberFilter !== 'all' || categoryFilter !== 'all' || dateFilter
                ? 'Try adjusting your search or filters.'
                : 'Upload doctor prescriptions, laboratory tests, or diagnostic scans to centralize family health records.'}
            </p>
          </div>
        ) : (
          records.map(rec => (
            <div
              key={rec.id}
              onClick={() => setPreviewRecord(rec)}
              className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadge(rec.category)}`}>
                    {rec.category}
                  </span>

                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{rec.uploadDate}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                  {rec.documentName}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {rec.familyMember?.fullName || 'Family Member'}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      ({rec.familyMember?.relationship})
                    </span>
                  </div>

                  {rec.doctor && (
                    <div className="flex items-center gap-2 truncate">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Ref: {rec.doctor.fullName}</span>
                    </div>
                  )}
                </div>

                {rec.notes && (
                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {rec.notes}
                  </p>
                )}
              </div>

              {/* Footer Toolbar */}
              <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                  {rec.fileName || 'record.pdf'}
                </span>

                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setPreviewRecord(rec)}
                    title="Preview Document"
                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={e => handleDownload(rec, e)}
                    title="Download File"
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingRecord(rec)}
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

      <UploadRecordModal
        isOpen={isUploadRecordModalOpen}
        onClose={() => setIsUploadRecordModalOpen(false)}
        onUploaded={triggerRefresh}
      />

      <ConfirmDialog
        isOpen={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleDelete}
        title="Delete Medical Document"
        message={`Are you sure you want to permanently delete "${deletingRecord?.documentName}" from the family medical vault?`}
      />
    </div>
  );
};
