import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.tsx';
import { DocumentCategory, FamilyMember, Doctor, Appointment } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';

interface UploadRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMemberId?: string;
  onUploaded: () => void;
}

export const UploadRecordModal: React.FC<UploadRecordModalProps> = ({
  isOpen,
  onClose,
  initialMemberId,
  onUploaded
}) => {
  const { showToast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [familyMemberId, setFamilyMemberId] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Blood Test');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const categories: DocumentCategory[] = [
    'Prescription',
    'Blood Test',
    'X-Ray',
    'MRI',
    'CT Scan',
    'Discharge Summary',
    'Other'
  ];

  useEffect(() => {
    if (isOpen) {
      setLoadingData(true);
      Promise.all([
        api.getFamilyMembers(),
        api.getDoctors(),
        api.getAppointments()
      ])
        .then(([mRes, dRes, aRes]) => {
          const mList: FamilyMember[] = mRes.members || [];
          setMembers(mList);
          setDoctors(dRes.doctors || []);
          setAppointments(aRes.appointments || []);

          setFamilyMemberId(initialMemberId || (mList[0]?.id ?? ''));
          setCategory('Blood Test');
          setUploadDate(new Date().toISOString().split('T')[0]);
          setDocumentName('');
          setDoctorId('');
          setAppointmentId('');
          setNotes('');
          setFile(null);
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingData(false));
    }
  }, [isOpen, initialMemberId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!documentName) {
        // Auto populate title from file name without extension
        const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setDocumentName(cleanName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyMemberId || !documentName.trim() || !category) {
      showToast('Please fill in patient, document title, and category', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('familyMemberId', familyMemberId);
      formData.append('documentName', documentName.trim());
      formData.append('category', category);
      formData.append('uploadDate', uploadDate);
      if (doctorId) formData.append('doctorId', doctorId);
      if (appointmentId) formData.append('appointmentId', appointmentId);
      if (notes) formData.append('notes', notes.trim());

      await api.uploadMedicalRecord(formData);
      showToast('Medical record archived successfully', 'success');
      onUploaded();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to upload document', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Filter appointments for this selected member
  const memberAppointments = appointments.filter(a => a.familyMemberId === familyMemberId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Medical Document"
      subtitle="Archive prescriptions, blood test results, radiology scans, or discharge summaries"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Dropzone Area */}
        <div className="relative border-2 border-dashed border-slate-200 hover:border-primary-400 bg-slate-50/60 rounded-2xl p-6 text-center transition-colors">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
                <File className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 truncate max-w-xs">{file.name}</p>
                <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB • Click to replace file</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-2 shadow-xs">
                <UploadCloud className="w-6 h-6 stroke-[2]" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Click or drag & drop clinical file here
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports PDF, JPG, PNG, and clinical scan summaries up to 25MB
              </p>
            </div>
          )}
        </div>

        {/* Document Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={documentName}
              onChange={e => setDocumentName(e.target.value)}
              placeholder="e.g. Lipid Profile & HbA1c Lab Report"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              required
              value={category}
              onChange={e => setCategory(e.target.value as DocumentCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Patient & Upload Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Associated Family Member *
            </label>
            <select
              required
              value={familyMemberId}
              onChange={e => setFamilyMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.relationship})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Date of Document *
            </label>
            <input
              type="date"
              required
              value={uploadDate}
              onChange={e => setUploadDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            />
          </div>
        </div>

        {/* Doctor and Appointment associations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Associated Doctor (Optional)
            </label>
            <select
              value={doctorId}
              onChange={e => setDoctorId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            >
              <option value="">None / External Lab</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.fullName} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Related Appointment (Optional)
            </label>
            <select
              value={appointmentId}
              onChange={e => setAppointmentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            >
              <option value="">Not linked to an appointment</option>
              {memberAppointments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.appointmentDate} - {a.reason}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clinical Summary & Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Clinical Summary / Key Findings Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Key test numbers, abnormal markers noted, radiologist impression..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {uploading ? 'Archiving...' : 'Archive Document'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
