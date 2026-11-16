import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import {
  FamilyUser,
  FamilyMember,
  Doctor,
  Appointment,
  MedicalRecord,
  MedicalTask,
  DashboardNotification,
  ActivityFeedEvent,
  MedicalHistoryEntry
} from '../src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'carecircle_db.json');
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

export interface DatabaseSchema {
  users: (FamilyUser & { passwordHash: string })[];
  familyMembers: FamilyMember[];
  medicalHistory: MedicalHistoryEntry[];
  doctors: Doctor[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  medicalTasks: MedicalTask[];
  notifications: DashboardNotification[];
  activityFeed: ActivityFeedEvent[];
}

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function getInitialSeedData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Care@123', salt);

  const defaultUser: FamilyUser & { passwordHash: string } = {
    id: 'user_sharma_01',
    email: 'sharma.family@carecircle.io',
    name: 'Rajesh Sharma',
    familyName: 'The Sharma Family',
    emergencyFamilyContact: {
      name: 'Dr. Suresh Kumar (Family Friend)',
      phone: '+91 98100 55443',
      relationship: 'Family Friend & Emergency Contact'
    },
    preferences: {
      dateFormat: 'DD/MM/YYYY',
      notificationsEnabled: true,
      emailAlerts: true,
      reminderWindowDays: 3
    },
    createdAt: new Date('2026-01-01T08:00:00Z').toISOString(),
    passwordHash
  };

  const familyMembers: FamilyMember[] = [
    {
      id: 'member_rajesh',
      familyId: defaultUser.id,
      fullName: 'Rajesh Sharma',
      dateOfBirth: '1974-05-14',
      age: 52,
      gender: 'Male',
      relationship: 'Self (Father)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bloodGroup: 'O+',
      phone: '+91 98200 11223',
      email: 'rajesh.sharma@carecircle.io',
      emergencyContact: {
        name: 'Sunita Sharma',
        phone: '+91 98200 44556',
        relationship: 'Spouse'
      },
      allergies: ['Penicillin (Moderate rash)', 'Dust Mites'],
      existingConditions: ['Type 2 Diabetes', 'Hypertension'],
      notes: 'Taking Metformin 500mg and Telmisartan 40mg. Needs routine blood sugar monitoring.',
      createdAt: new Date('2026-01-05T10:00:00Z').toISOString()
    },
    {
      id: 'member_sunita',
      familyId: defaultUser.id,
      fullName: 'Sunita Sharma',
      dateOfBirth: '1978-09-22',
      age: 48,
      gender: 'Female',
      relationship: 'Spouse (Mother)',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      bloodGroup: 'B+',
      phone: '+91 98200 44556',
      email: 'sunita.sharma@carecircle.io',
      emergencyContact: {
        name: 'Rajesh Sharma',
        phone: '+91 98200 11223',
        relationship: 'Spouse'
      },
      allergies: ['Sulfonamides', 'Shellfish'],
      existingConditions: ['Hypothyroidism'],
      notes: 'Taking Levothyroxine 50mcg daily morning empty stomach. Annual thyroid check recommended.',
      createdAt: new Date('2026-01-05T10:05:00Z').toISOString()
    },
    {
      id: 'member_aarav',
      familyId: defaultUser.id,
      fullName: 'Aarav Sharma',
      dateOfBirth: '2010-08-11',
      age: 16,
      gender: 'Male',
      relationship: 'Son',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      bloodGroup: 'O+',
      phone: '+91 98200 77889',
      email: 'aarav.sharma@carecircle.io',
      emergencyContact: {
        name: 'Rajesh Sharma',
        phone: '+91 98200 11223',
        relationship: 'Father'
      },
      allergies: ['Peanuts (Mild urticaria)', 'Seasonal Pollen'],
      existingConditions: ['Mild Bronchial Asthma'],
      notes: 'Uses Salbutamol inhaler as needed for sports or seasonal changes. Yearly pediatric growth evaluation.',
      createdAt: new Date('2026-01-05T10:10:00Z').toISOString()
    },
    {
      id: 'member_savitri',
      familyId: defaultUser.id,
      fullName: 'Savitri Sharma',
      dateOfBirth: '1948-03-04',
      age: 78,
      gender: 'Female',
      relationship: 'Grandmother',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      bloodGroup: 'A+',
      phone: '+91 98200 33221',
      email: 'savitri.care@carecircle.io',
      emergencyContact: {
        name: 'Rajesh Sharma',
        phone: '+91 98200 11223',
        relationship: 'Son'
      },
      allergies: ['NSAIDs / Ibuprofen (causes gastric distress)'],
      existingConditions: ['Bilateral Knee Osteoarthritis', 'Mild Cataract in Right Eye'],
      notes: 'Undergoing knee physiotherapy twice weekly. Avoid steps without railing assistance.',
      createdAt: new Date('2026-01-05T10:15:00Z').toISOString()
    }
  ];

  const medicalHistory: MedicalHistoryEntry[] = [
    {
      id: 'hist_01',
      familyMemberId: 'member_rajesh',
      conditionOrDiagnosis: 'Type 2 Diabetes Mellitus',
      date: '2018-04-12',
      description: 'Diagnosed with elevated fasting blood glucose (162 mg/dL) and HbA1c of 7.8%. Started on Metformin 500mg twice daily with dietary regimen.',
      relatedDoctorName: 'Dr. Arvind Raman',
      notes: 'Requires 3-monthly HbA1c review and daily home glucometer log.',
      createdAt: '2026-01-06T09:00:00Z'
    },
    {
      id: 'hist_02',
      familyMemberId: 'member_rajesh',
      conditionOrDiagnosis: 'Primary Essential Hypertension',
      date: '2021-09-18',
      description: 'Stage 1 Hypertension noted during preventive health screening (145/92 mmHg). Prescribed Telmisartan 40mg once daily.',
      relatedDoctorName: 'Dr. Priya Mehta',
      notes: 'Blood pressure currently stable around 124/80 mmHg.',
      createdAt: '2026-01-06T09:15:00Z'
    },
    {
      id: 'hist_03',
      familyMemberId: 'member_sunita',
      conditionOrDiagnosis: 'Hypothyroidism (Hashimoto)',
      date: '2015-11-04',
      description: 'Presented with fatigue and cold intolerance. Serum TSH was 9.4 uIU/mL. Thyroid antibodies positive. Titrated to 50mcg Levothyroxine.',
      relatedDoctorName: 'Dr. Arvind Raman',
      notes: 'TSH well controlled at 2.1 uIU/mL on current dosage.',
      createdAt: '2026-01-06T09:30:00Z'
    },
    {
      id: 'hist_04',
      familyMemberId: 'member_aarav',
      conditionOrDiagnosis: 'Mild Intermittent Asthma',
      date: '2019-02-14',
      description: 'Episodes of wheezing triggered by winter viral infections and cold air exertion. Normal spirometry baseline.',
      relatedDoctorName: 'Dr. Ananya Sen',
      notes: 'Prescribed Levolin / Salbutamol inhaler with spacer as needed prior to active sports.',
      createdAt: '2026-01-06T09:45:00Z'
    },
    {
      id: 'hist_05',
      familyMemberId: 'member_savitri',
      conditionOrDiagnosis: 'Bilateral Knee Osteoarthritis (Grade 3)',
      date: '2020-07-20',
      description: 'Persistent mechanical knee joint pain and joint space narrowing on weight-bearing X-ray. Conservative management with quadriceps strengthening.',
      relatedDoctorName: 'Dr. Vikramaditya Joshi',
      notes: 'Takes Glucosamine + Paracetamol SOS. Intra-articular hyaluronic acid viscosupplementation completed in 2023.',
      createdAt: '2026-01-06T10:00:00Z'
    },
    {
      id: 'hist_06',
      familyMemberId: 'member_savitri',
      conditionOrDiagnosis: 'Senile Cataract - Left Eye Phacoemulsification',
      date: '2022-03-10',
      description: 'Uneventful left eye phacoemulsification with monofocal IOL implantation. Best corrected visual acuity 20/20 in left eye.',
      relatedDoctorName: 'Dr. Renu Malhotra (Eye Specialist)',
      notes: 'Right eye has early immature cataract, monitoring yearly.',
      createdAt: '2026-01-06T10:15:00Z'
    }
  ];

  const doctors: Doctor[] = [
    {
      id: 'doc_arvind',
      familyId: defaultUser.id,
      fullName: 'Dr. Arvind Raman, MD, DM',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      specialization: 'Endocrinologist & Diabetologist',
      hospitalOrClinic: 'Max Care Superspeciality Clinic',
      phone: '+91 98112 34567',
      clinicAddress: 'Suite 402, 4th Floor, Max Medical Tower, Press Enclave, Saket, New Delhi 110017',
      consultationTimings: 'Mon - Fri: 10:00 AM - 4:00 PM, Sat: 10:00 AM - 1:00 PM',
      notes: 'Family diabetologist for Rajesh and endocrinologist for Sunita. Very responsive on WhatsApp for lab reviews.',
      createdAt: '2026-01-05T11:00:00Z'
    },
    {
      id: 'doc_priya',
      familyId: defaultUser.id,
      fullName: 'Dr. Priya Mehta, MD, DNB (Cardiology)',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      specialization: 'Cardiologist',
      hospitalOrClinic: 'Apollo Heart & Vascular Institute',
      phone: '+91 98201 23456',
      clinicAddress: 'OPD Block C, Apollo Hospitals, Sarita Vihar, Mathura Road, New Delhi 110076',
      consultationTimings: 'Mon, Wed, Fri: 9:00 AM - 1:00 PM, 5:00 PM - 7:30 PM',
      notes: 'Senior interventional cardiologist. Consulted for Rajesh’s hypertension and annual cardiac checkup.',
      createdAt: '2026-01-05T11:05:00Z'
    },
    {
      id: 'doc_ananya',
      familyId: defaultUser.id,
      fullName: 'Dr. Ananya Sen, MD (Pediatrics)',
      avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=150&auto=format&fit=crop&q=80',
      specialization: 'Pediatrician & Adolescent Medicine',
      hospitalOrClinic: 'Fortis Bloom Child & Adolescent Health',
      phone: '+91 98450 98765',
      clinicAddress: 'Clinic 12, Fortis Hospital, Sector B, Pocket 1, Aruna Asaf Ali Marg, Vasant Kunj 110070',
      consultationTimings: 'Mon - Sat: 11:00 AM - 2:00 PM, 4:30 PM - 7:00 PM',
      notes: 'Aarav’s pediatrician since childhood. Excellent with adolescent nutrition and allergy management.',
      createdAt: '2026-01-05T11:10:00Z'
    },
    {
      id: 'doc_vikram',
      familyId: defaultUser.id,
      fullName: 'Dr. Vikramaditya Joshi, MS (Ortho), MCh',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      specialization: 'Orthopedic & Joint Replacement Surgeon',
      hospitalOrClinic: 'City Bone & Joint Speciality Hospital',
      phone: '+91 99100 87654',
      clinicAddress: 'Ground Floor OPD, 78 Poorvi Marg, Vasant Vihar, New Delhi 110057',
      consultationTimings: 'Tue, Thu, Sat: 2:00 PM - 8:00 PM',
      notes: 'Treats Savitri’s knee osteoarthritis. Conservative and patient-centric approach.',
      createdAt: '2026-01-05T11:15:00Z'
    }
  ];

  // Dynamic dates around local time (2026-11-16)
  const appointments: Appointment[] = [
    {
      id: 'apt_01',
      familyId: defaultUser.id,
      familyMemberId: 'member_rajesh',
      doctorId: 'doc_arvind',
      appointmentDate: '2026-11-17', // Tomorrow
      appointmentTime: '10:30 AM',
      hospitalOrClinic: 'Max Care Superspeciality Clinic',
      reason: 'Quarterly Diabetes & Lipid Profile Follow-up',
      status: 'Scheduled',
      notes: 'Carry fasting blood sugar log and recent HbA1c test report.',
      createdAt: '2026-11-01T10:00:00Z'
    },
    {
      id: 'apt_02',
      familyId: defaultUser.id,
      familyMemberId: 'member_savitri',
      doctorId: 'doc_vikram',
      appointmentDate: '2026-11-19', // In 3 days
      appointmentTime: '03:15 PM',
      hospitalOrClinic: 'City Bone & Joint Speciality Hospital',
      reason: 'Bilateral Knee Pain Assessment & Physical Therapy Review',
      status: 'Scheduled',
      notes: 'Need to review fresh weight-bearing knee X-ray taken at imaging center.',
      createdAt: '2026-11-03T11:00:00Z'
    },
    {
      id: 'apt_03',
      familyId: defaultUser.id,
      familyMemberId: 'member_aarav',
      doctorId: 'doc_ananya',
      appointmentDate: '2026-11-23', // In 7 days
      appointmentTime: '11:45 AM',
      hospitalOrClinic: 'Fortis Bloom Child & Adolescent Health',
      reason: 'Adolescent Annual Health Check & Allergy Inhaler Review',
      status: 'Scheduled',
      notes: 'Check peak expiratory flow meter readings and growth percentiles.',
      createdAt: '2026-11-05T14:30:00Z'
    },
    {
      id: 'apt_04',
      familyId: defaultUser.id,
      familyMemberId: 'member_rajesh',
      doctorId: 'doc_priya',
      appointmentDate: '2026-10-28', // Past
      appointmentTime: '05:30 PM',
      hospitalOrClinic: 'Apollo Heart & Vascular Institute',
      reason: 'Bi-annual Hypertension & Resting ECG Check',
      status: 'Completed',
      consultationNotes: 'Resting BP 122/78 mmHg. Resting 12-lead ECG is normal sinus rhythm. Continue Telmisartan 40mg. 45 min brisk walking 5 days/week encouraged.',
      attachedRecordIds: ['rec_ecg_rajesh', 'rec_rx_priya'],
      notes: 'Follow up in 6 months.',
      createdAt: '2026-10-15T09:00:00Z'
    },
    {
      id: 'apt_05',
      familyId: defaultUser.id,
      familyMemberId: 'member_sunita',
      doctorId: 'doc_arvind',
      appointmentDate: '2026-10-14', // Past
      appointmentTime: '11:00 AM',
      hospitalOrClinic: 'Max Care Superspeciality Clinic',
      reason: 'Thyroid Function Evaluation (TSH, Free T4)',
      status: 'Completed',
      consultationNotes: 'TSH stable at 2.45 uIU/mL. Weight steady. Continue Levothyroxine 50 mcg once daily before breakfast. Repeat panel in 6 months.',
      attachedRecordIds: ['rec_thyroid_sunita'],
      notes: 'Patient feels energetic with no palpitation or cold sensitivity.',
      createdAt: '2026-10-01T10:00:00Z'
    },
    {
      id: 'apt_06',
      familyId: defaultUser.id,
      familyMemberId: 'member_savitri',
      doctorId: 'doc_vikram',
      appointmentDate: '2026-09-12', // Past
      appointmentTime: '04:00 PM',
      hospitalOrClinic: 'City Bone & Joint Speciality Hospital',
      reason: 'Knee Synovial Fluid Evaluation & Pain Management',
      status: 'Completed',
      consultationNotes: 'Mild effusion in right knee subsided. Recommended low-impact stationary cycling and knee flexion/extension exercises.',
      notes: 'Prescribed hot fomentation and physiotherapy.',
      createdAt: '2026-09-01T10:00:00Z'
    }
  ];

  const medicalRecords: MedicalRecord[] = [
    {
      id: 'rec_hba1c_rajesh',
      familyId: defaultUser.id,
      familyMemberId: 'member_rajesh',
      doctorId: 'doc_arvind',
      appointmentId: 'apt_01',
      documentName: 'Comprehensive Metabolic Panel & HbA1c Report',
      category: 'Blood Test',
      uploadDate: '2026-11-15',
      fileUrl: '/uploads/sample_hba1c_rajesh.pdf',
      fileName: 'HbA1c_Metabolic_Rajesh_Nov2026.pdf',
      fileType: 'application/pdf',
      fileSize: 245000,
      notes: 'Fasting blood glucose 118 mg/dL, HbA1c 6.9% (improved from 7.2%). Lipid profile within acceptable parameters.',
      createdAt: '2026-11-15T08:30:00Z'
    },
    {
      id: 'rec_ecg_rajesh',
      familyId: defaultUser.id,
      familyMemberId: 'member_rajesh',
      doctorId: 'doc_priya',
      appointmentId: 'apt_04',
      documentName: '12-Lead Resting Electrocardiogram (ECG)',
      category: 'Other',
      uploadDate: '2026-10-28',
      fileUrl: '/uploads/sample_ecg_rajesh.pdf',
      fileName: 'ECG_Tracing_Rajesh_Oct2026.pdf',
      fileType: 'application/pdf',
      fileSize: 180000,
      notes: 'Normal sinus rhythm, heart rate 68 bpm. No ST-T segment elevation or ischemic changes observed.',
      createdAt: '2026-10-28T18:00:00Z'
    },
    {
      id: 'rec_rx_priya',
      familyId: defaultUser.id,
      familyMemberId: 'member_rajesh',
      doctorId: 'doc_priya',
      appointmentId: 'apt_04',
      documentName: 'Cardiology Consultation Prescription',
      category: 'Prescription',
      uploadDate: '2026-10-28',
      fileUrl: '/uploads/sample_rx_cardio_rajesh.pdf',
      fileName: 'Prescription_DrPriya_Oct2026.pdf',
      fileType: 'application/pdf',
      fileSize: 125000,
      notes: 'Tab. Telmisartan 40mg OD morning. Tab. Rosuvastatin 10mg OD bedtime.',
      createdAt: '2026-10-28T18:15:00Z'
    },
    {
      id: 'rec_thyroid_sunita',
      familyId: defaultUser.id,
      familyMemberId: 'member_sunita',
      doctorId: 'doc_arvind',
      appointmentId: 'apt_05',
      documentName: 'Serum TSH & Free Thyroid Profile Report',
      category: 'Blood Test',
      uploadDate: '2026-10-12',
      fileUrl: '/uploads/sample_tsh_sunita.pdf',
      fileName: 'Thyroid_Panel_Sunita_Oct2026.pdf',
      fileType: 'application/pdf',
      fileSize: 198000,
      notes: 'TSH: 2.45 uIU/mL (Normal 0.4 - 4.2). Free T4: 1.2 ng/dL. Normal euthyroid range.',
      createdAt: '2026-10-12T15:20:00Z'
    },
    {
      id: 'rec_xray_savitri',
      familyId: defaultUser.id,
      familyMemberId: 'member_savitri',
      doctorId: 'doc_vikram',
      documentName: 'Weight-Bearing Bilateral Knee X-Ray & Radiology Report',
      category: 'X-Ray',
      uploadDate: '2026-11-14',
      fileUrl: '/uploads/sample_knee_xray_savitri.pdf',
      fileName: 'Bilateral_Knee_AP_Lat_XRay_Nov2026.pdf',
      fileType: 'application/pdf',
      fileSize: 420000,
      notes: 'Medial joint space narrowing, subchondral sclerosis, and marginal osteophytes bilaterally. Stable compared to prior films.',
      createdAt: '2026-11-14T11:40:00Z'
    },
    {
      id: 'rec_spirometry_aarav',
      familyId: defaultUser.id,
      familyMemberId: 'member_aarav',
      doctorId: 'doc_ananya',
      documentName: 'Pediatric Spirometry & Peak Flow Analysis',
      category: 'Other',
      uploadDate: '2026-08-20',
      fileUrl: '/uploads/sample_spirometry_aarav.pdf',
      fileName: 'Spirometry_Report_Aarav_Aug2026.pdf',
      fileType: 'application/pdf',
      fileSize: 310000,
      notes: 'FEV1 / FVC ratio 86%. Good bronchodilator reversibility response. Lung capacity within healthy developmental tier.',
      createdAt: '2026-08-20T16:10:00Z'
    }
  ];

  const medicalTasks: MedicalTask[] = [
    {
      id: 'task_01',
      familyId: defaultUser.id,
      title: 'Collect Knee Joint X-Ray Films from Diagnostic Lab',
      familyMemberId: 'member_savitri',
      dueDate: '2026-11-17',
      priority: 'Urgent',
      isCompleted: false,
      createdAt: '2026-11-14T12:00:00Z'
    },
    {
      id: 'task_02',
      familyId: defaultUser.id,
      title: 'Get Fasting Blood Sugar & HbA1c Lab Test',
      familyMemberId: 'member_rajesh',
      dueDate: '2026-11-17',
      priority: 'High',
      isCompleted: true,
      completedAt: '2026-11-15T09:30:00Z',
      createdAt: '2026-11-10T08:00:00Z'
    },
    {
      id: 'task_03',
      familyId: defaultUser.id,
      title: 'Pick up inhaler refill and spacer cleaning kit',
      familyMemberId: 'member_aarav',
      dueDate: '2026-11-20',
      priority: 'Medium',
      isCompleted: false,
      createdAt: '2026-11-12T10:00:00Z'
    },
    {
      id: 'task_04',
      familyId: defaultUser.id,
      title: 'Schedule annual ophthalmology review for right eye cataract',
      familyMemberId: 'member_savitri',
      dueDate: '2026-11-25',
      priority: 'Low',
      isCompleted: false,
      createdAt: '2026-11-13T14:00:00Z'
    },
    {
      id: 'task_05',
      familyId: defaultUser.id,
      title: 'Schedule 6-month thyroid profile blood test',
      familyMemberId: 'member_sunita',
      dueDate: '2026-12-05',
      priority: 'Medium',
      isCompleted: false,
      createdAt: '2026-11-10T11:00:00Z'
    }
  ];

  const notifications: DashboardNotification[] = [
    {
      id: 'notif_01',
      familyId: defaultUser.id,
      title: "Tomorrow's Appointment: Rajesh Sharma",
      description: 'Scheduled with Dr. Arvind Raman (Endocrinologist) at Max Care Clinic at 10:30 AM.',
      familyMemberId: 'member_rajesh',
      type: 'appointment_tomorrow',
      date: '2026-11-16T08:00:00Z',
      isRead: false,
      isDismissed: false,
      relatedEntityId: 'apt_01'
    },
    {
      id: 'notif_02',
      familyId: defaultUser.id,
      title: 'Urgent Task: Collect Knee X-Ray Films',
      description: 'Savitri Sharma’s knee X-ray films are ready for pickup before her orthopedic visit on Nov 19.',
      familyMemberId: 'member_savitri',
      type: 'report_ready',
      date: '2026-11-15T14:00:00Z',
      isRead: false,
      isDismissed: false,
      relatedEntityId: 'task_01'
    },
    {
      id: 'notif_03',
      familyId: defaultUser.id,
      title: 'Upcoming Consultation in 3 Days',
      description: 'Savitri Sharma has an appointment with Dr. Vikramaditya Joshi (Orthopedic) on Nov 19 at 03:15 PM.',
      familyMemberId: 'member_savitri',
      type: 'follow_up_due',
      date: '2026-11-15T09:00:00Z',
      isRead: true,
      isDismissed: false,
      relatedEntityId: 'apt_02'
    },
    {
      id: 'notif_04',
      familyId: defaultUser.id,
      title: 'Appointment Completed & Notes Saved',
      description: 'Rajesh Sharma’s consultation with Dr. Priya Mehta (Cardiology) was successfully completed and recorded.',
      familyMemberId: 'member_rajesh',
      type: 'appointment_completed',
      date: '2026-10-28T19:00:00Z',
      isRead: true,
      isDismissed: false,
      relatedEntityId: 'apt_04'
    }
  ];

  const activityFeed: ActivityFeedEvent[] = [
    {
      id: 'act_01',
      familyId: defaultUser.id,
      type: 'record_uploaded',
      title: 'Medical Report Uploaded',
      description: 'Comprehensive Metabolic Panel & HbA1c Report uploaded for Rajesh Sharma',
      familyMemberId: 'member_rajesh',
      timestamp: '2026-11-15T08:30:00Z',
      familyMemberName: 'Rajesh Sharma'
    },
    {
      id: 'act_02',
      familyId: defaultUser.id,
      type: 'task_completed',
      title: 'Medical Task Completed',
      description: 'Marked completed: Fasting Blood Sugar & HbA1c Lab Test for Rajesh Sharma',
      familyMemberId: 'member_rajesh',
      timestamp: '2026-11-15T09:30:00Z',
      familyMemberName: 'Rajesh Sharma'
    },
    {
      id: 'act_03',
      familyId: defaultUser.id,
      type: 'record_uploaded',
      title: 'X-Ray Report Added',
      description: 'Weight-Bearing Bilateral Knee X-Ray added for Savitri Sharma',
      familyMemberId: 'member_savitri',
      timestamp: '2026-11-14T11:40:00Z',
      familyMemberName: 'Savitri Sharma'
    },
    {
      id: 'act_04',
      familyId: defaultUser.id,
      type: 'appointment_scheduled',
      title: 'Doctor Appointment Scheduled',
      description: 'Scheduled with Dr. Ananya Sen for Aarav Sharma on Nov 23 at 11:45 AM',
      familyMemberId: 'member_aarav',
      timestamp: '2026-11-05T14:30:00Z',
      familyMemberName: 'Aarav Sharma'
    },
    {
      id: 'act_05',
      familyId: defaultUser.id,
      type: 'appointment_scheduled',
      title: 'Doctor Appointment Scheduled',
      description: 'Scheduled with Dr. Vikramaditya Joshi for Savitri Sharma on Nov 19 at 03:15 PM',
      familyMemberId: 'member_savitri',
      timestamp: '2026-11-03T11:00:00Z',
      familyMemberName: 'Savitri Sharma'
    },
    {
      id: 'act_06',
      familyId: defaultUser.id,
      type: 'appointment_completed',
      title: 'Consultation Completed',
      description: 'Completed appointment with Dr. Priya Mehta (Cardiology) for Rajesh Sharma',
      familyMemberId: 'member_rajesh',
      timestamp: '2026-10-28T18:00:00Z',
      familyMemberName: 'Rajesh Sharma'
    },
    {
      id: 'act_07',
      familyId: defaultUser.id,
      type: 'member_added',
      title: 'Family Member Enrolled',
      description: 'Savitri Sharma added to CareCircle family health records',
      familyMemberId: 'member_savitri',
      timestamp: '2026-01-05T10:15:00Z',
      familyMemberName: 'Savitri Sharma'
    }
  ];

  return {
    users: [defaultUser],
    familyMembers,
    medicalHistory,
    doctors,
    appointments,
    medicalRecords,
    medicalTasks,
    notifications,
    activityFeed
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    ensureDirectories();
    this.data = this.load();
    this.createSampleUploads();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to read database, reseeding...', err);
      }
    }
    const seed = getInitialSeedData();
    this.save(seed);
    return seed;
  }

  public save(data?: DatabaseSchema) {
    if (data) {
      this.data = data;
    }
    ensureDirectories();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public resetToDefault() {
    this.data = getInitialSeedData();
    this.save();
    return this.data;
  }

  private createSampleUploads() {
    // Generate realistic placeholder sample PDF/text files so downloads/previews work immediately
    const sampleFiles = [
      { name: 'sample_hba1c_rajesh.pdf', title: 'Comprehensive Metabolic Panel & HbA1c - Rajesh Sharma', content: 'CareCircle Diagnostic Report\nPatient: Rajesh Sharma | DOB: 1974-05-14 | Blood Group: O+\nDoctor: Dr. Arvind Raman (Endocrinology)\nDate: 15-Nov-2026\n\nTEST RESULTS:\n- Fasting Blood Sugar: 118 mg/dL (Normal: 70 - 99 mg/dL)\n- HbA1c: 6.9% (Pre-diabetic/Good Control for Known Diabetics)\n- Serum Creatinine: 0.9 mg/dL (Normal: 0.7 - 1.3 mg/dL)\n- Total Cholesterol: 182 mg/dL (Desirable: <200 mg/dL)\n- Triglycerides: 145 mg/dL (Normal: <150 mg/dL)\n\nINTERPRETATION: Good glycemic control maintained on current Metformin regimen.' },
      { name: 'sample_ecg_rajesh.pdf', title: 'Resting 12-Lead Electrocardiogram - Rajesh Sharma', content: 'CareCircle Cardiology Report\nPatient: Rajesh Sharma | Age: 52 | Gender: Male\nPhysician: Dr. Priya Mehta (Cardiology)\nDate: 28-Oct-2026\n\nECG ANALYSIS:\n- Heart Rate: 68 bpm\n- PR Interval: 148 ms\n- QRS Duration: 88 ms\n- QT/QTc: 390/414 ms\n- Rhythm: Normal Sinus Rhythm\n- ST-T segment: Normal, No acute ischemic changes or prior infarction patterns.' },
      { name: 'sample_rx_cardio_rajesh.pdf', title: 'Prescription - Dr. Priya Mehta', content: 'Apollo Heart & Vascular Institute\nDr. Priya Mehta, MD, DNB (Cardiology)\nPatient: Rajesh Sharma | Age: 52\nDate: 28-Oct-2026\n\nRx:\n1. Tab. Telmisartan 40 mg - 1 tablet orally once daily after breakfast (Morning)\n2. Tab. Rosuvastatin 10 mg - 1 tablet orally at bedtime (Night)\n3. Tab. Metformin 500 mg - 1 tablet twice daily after major meals\n\nAdvice:\n- Low sodium diet (<2g/day)\n- Daily walking 40 mins\n- Review with BP chart in 6 months.' },
      { name: 'sample_tsh_sunita.pdf', title: 'Thyroid Function Panel - Sunita Sharma', content: 'Max Care Diagnostic Services\nPatient: Sunita Sharma | Age: 48 | Gender: Female\nRef. Doctor: Dr. Arvind Raman\nDate: 12-Oct-2026\n\nTHYROID PANEL:\n- TSH (Ultrasensitive): 2.45 uIU/mL (Reference: 0.40 - 4.20)\n- Free T3: 3.1 pg/mL (Reference: 2.0 - 4.4)\n- Free T4: 1.22 ng/dL (Reference: 0.8 - 1.8)\n\nEuthyroid state maintained. Continue Tab. Levothyroxine 50mcg daily.' },
      { name: 'sample_knee_xray_savitri.pdf', title: 'Bilateral Knee Weight-Bearing X-Ray - Savitri Sharma', content: 'City Bone & Joint Speciality Hospital - Department of Radiodiagnosis\nPatient: Savitri Sharma | Age: 78 | Gender: Female\nConsultant: Dr. Vikramaditya Joshi\nDate: 14-Nov-2026\n\nFINDINGS:\n- Bilateral knee joint weight-bearing AP and Lateral views.\n- Moderate to severe medial compartment joint space narrowing bilaterally.\n- Prominent subchondral sclerosis and marginal osteophyte formation.\n- No evidence of acute fracture or dislocation.\n\nIMPRESSION: Grade 3 Bilateral Knee Osteoarthritis, medial predominant. Stable.' },
      { name: 'sample_spirometry_aarav.pdf', title: 'Pediatric Pulmonary Function Test - Aarav Sharma', content: 'Fortis Bloom Child & Adolescent Health - Pulmonary Lab\nPatient: Aarav Sharma | Age: 16 | Gender: Male\nPediatrician: Dr. Ananya Sen\nDate: 20-Aug-2026\n\nSPIROMETRY FINDINGS:\n- FEV1: 3.42 L (92% of predicted)\n- FVC: 3.98 L (94% of predicted)\n- FEV1/FVC Ratio: 85.9%\n- Post-bronchodilator improvement: +6%\n\nIMPRESSION: Normal baseline lung volumes with mild intermittent bronchial reactivity.' }
    ];

    for (const f of sampleFiles) {
      const filePath = path.join(UPLOADS_DIR, f.name);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, f.content, 'utf-8');
      }
    }
  }

  // Activity logger helper
  public logActivity(event: Omit<ActivityFeedEvent, 'id' | 'timestamp'>) {
    const newEvent: ActivityFeedEvent = {
      ...event,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.data.activityFeed.unshift(newEvent);
    // Keep max 100 activities
    if (this.data.activityFeed.length > 100) {
      this.data.activityFeed.pop();
    }
    this.save();
    return newEvent;
  }
}

export const db = new Database();
