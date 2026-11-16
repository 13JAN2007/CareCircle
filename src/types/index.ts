export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Missed';
export type DocumentCategory = 
  | 'Prescription' 
  | 'Blood Test' 
  | 'X-Ray' 
  | 'MRI' 
  | 'CT Scan' 
  | 'Discharge Summary' 
  | 'Other';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  gender?: Gender;
  relationship: string;
  avatar: string;
  bloodGroup?: BloodGroup;
  phone: string;
  email: string;
  emergencyContact: EmergencyContact;
  allergies: string[];
  existingConditions: string[];
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MedicalHistoryEntry {
  id: string;
  familyMemberId: string;
  conditionOrDiagnosis: string;
  date: string; // YYYY-MM-DD
  description: string;
  relatedDoctorId?: string;
  relatedDoctorName?: string;
  notes: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  familyId: string;
  fullName: string;
  avatar: string;
  specialization: string;
  hospitalOrClinic: string;
  phone: string;
  clinicAddress: string;
  consultationTimings: string;
  notes: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  familyId: string;
  familyMemberId: string;
  doctorId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm or "10:30 AM"
  hospitalOrClinic: string;
  reason: string;
  status: AppointmentStatus;
  consultationNotes?: string;
  attachedRecordIds?: string[];
  notes?: string;
  createdAt: string;
  // Joined fields for convenience
  familyMember?: FamilyMember;
  doctor?: Doctor;
  attachedRecords?: MedicalRecord[];
}

export interface MedicalRecord {
  id: string;
  familyId: string;
  familyMemberId: string;
  doctorId?: string;
  appointmentId?: string;
  documentName: string;
  category: DocumentCategory;
  uploadDate: string; // YYYY-MM-DD
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number; // in bytes
  notes?: string;
  createdAt: string;
  // Joined fields
  familyMember?: FamilyMember;
  doctor?: Doctor;
  appointment?: Appointment;
}

export interface MedicalTask {
  id: string;
  familyId: string;
  title: string;
  familyMemberId: string;
  dueDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  // Joined
  familyMember?: FamilyMember;
}

export type NotificationType = 
  | 'appointment_tomorrow' 
  | 'follow_up_due' 
  | 'pending_test' 
  | 'report_ready' 
  | 'appointment_completed' 
  | 'system';

export interface DashboardNotification {
  id: string;
  familyId: string;
  title: string;
  description: string;
  familyMemberId?: string;
  type: NotificationType;
  date: string; // ISO string
  isRead: boolean;
  isDismissed: boolean;
  relatedEntityId?: string;
  // Joined
  familyMember?: FamilyMember;
}

export interface ActivityFeedEvent {
  id: string;
  familyId: string;
  type: 
    | 'member_added' 
    | 'member_updated'
    | 'doctor_added' 
    | 'appointment_scheduled' 
    | 'appointment_completed' 
    | 'appointment_cancelled'
    | 'record_uploaded' 
    | 'history_updated' 
    | 'task_completed';
  title: string;
  description: string;
  familyMemberId?: string;
  timestamp: string; // ISO string
  familyMemberName?: string;
}

export interface FamilyUser {
  id: string;
  email: string;
  name?: string;
  familyName: string;
  emergencyFamilyContact: EmergencyContact;
  preferences: {
    dateFormat: string;
    notificationsEnabled: boolean;
    emailAlerts: boolean;
    reminderWindowDays: number;
  };
  createdAt: string;
}

export interface DashboardStats {
  totalFamilyMembers: number;
  upcomingAppointments: number;
  completedAppointments: number;
  pendingMedicalTasks: number;
}
