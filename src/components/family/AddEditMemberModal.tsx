import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.tsx';
import { FamilyMember, BloodGroup, Gender } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { Plus, X, AlertTriangle } from 'lucide-react';

interface AddEditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember | null;
  onSaved: () => void;
}

export const AddEditMemberModal: React.FC<AddEditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  onSaved
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender>('Prefer not to say');
  const [relationship, setRelationship] = useState('Spouse');
  const [avatar, setAvatar] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | ''>('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [existingConditions, setExistingConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (member) {
      setFullName(member.fullName);
      setDateOfBirth(member.dateOfBirth);
      setGender(member.gender || 'Prefer not to say');
      setRelationship(member.relationship);
      setAvatar(member.avatar || '');
      setBloodGroup(member.bloodGroup || '');
      setPhone(member.phone || '');
      setEmail(member.email || '');
      setEmergencyName(member.emergencyContact?.name || '');
      setEmergencyPhone(member.emergencyContact?.phone || '');
      setEmergencyRel(member.emergencyContact?.relationship || '');
      setAllergies(member.allergies || []);
      setExistingConditions(member.existingConditions || []);
      setNotes(member.notes || '');
    } else {
      setFullName('');
      setDateOfBirth('1990-01-01');
      setGender('Male');
      setRelationship('Spouse');
      setAvatar('');
      setBloodGroup('');
      setPhone('');
      setEmail('');
      setEmergencyName('');
      setEmergencyPhone('');
      setEmergencyRel('');
      setAllergies([]);
      setExistingConditions([]);
      setNotes('');
    }
  }, [member, isOpen]);

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (idx: number) => {
    setAllergies(allergies.filter((_, i) => i !== idx));
  };

  const handleAddCondition = () => {
    if (newCondition.trim() && !existingConditions.includes(newCondition.trim())) {
      setExistingConditions([...existingConditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (idx: number) => {
    setExistingConditions(existingConditions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dateOfBirth || !relationship) {
      showToast('Please fill in full name, date of birth, and relationship', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        dateOfBirth,
        gender,
        relationship,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName.trim())}`,
        bloodGroup: bloodGroup || undefined,
        phone: phone.trim(),
        email: email.trim(),
        emergencyContact: {
          name: emergencyName.trim(),
          phone: emergencyPhone.trim(),
          relationship: emergencyRel.trim()
        },
        allergies,
        existingConditions,
        notes: notes.trim()
      };

      if (member) {
        await api.updateFamilyMember(member.id, payload);
        showToast('Family member profile updated', 'success');
      } else {
        await api.createFamilyMember(payload);
        showToast('New family member added to CareCircle', 'success');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save family member', 'error');
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const relationships = ['Self', 'Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Grandfather', 'Grandmother', 'Sibling', 'Other Relative'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={member ? 'Edit Family Member Profile' : 'Add New Family Member'}
      subtitle="Keep health histories and medical contacts organized in one place"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name & Relationship */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Rajesh Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Relationship *
            </label>
            <select
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            >
              {relationships.map(rel => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>
        </div>

        {/* DOB, Gender & Blood Group */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              required
              value={dateOfBirth}
              onChange={e => setDateOfBirth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value as Gender)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={e => setBloodGroup(e.target.value as BloodGroup)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            >
              <option value="">Unknown / Select</option>
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98200 12345"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="member@carecircle.io"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Emergency Contact Information
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={emergencyName}
              onChange={e => setEmergencyName(e.target.value)}
              placeholder="Contact Person Name"
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="tel"
              value={emergencyPhone}
              onChange={e => setEmergencyPhone(e.target.value)}
              placeholder="Emergency Phone"
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="text"
              value={emergencyRel}
              onChange={e => setEmergencyRel(e.target.value)}
              placeholder="Relationship (e.g. Spouse)"
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Known Allergies */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Known Allergies
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newAllergy}
              onChange={e => setNewAllergy(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddAllergy(); } }}
              placeholder="e.g. Penicillin, Peanuts, Pollen..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={handleAddAllergy}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[26px]">
            {allergies.map((allergy, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
              >
                <span>{allergy}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAllergy(idx)}
                  className="hover:text-rose-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Existing Medical Conditions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Existing Medical Conditions
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newCondition}
              onChange={e => setNewCondition(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCondition(); } }}
              placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={handleAddCondition}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[26px]">
            {existingConditions.map((cond, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
              >
                <span>{cond}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCondition(idx)}
                  className="hover:text-amber-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Additional Clinical Notes / Instructions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Routine medications, dietary guidelines, mobility constraints..."
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
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : member ? 'Update Profile' : 'Save Family Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
