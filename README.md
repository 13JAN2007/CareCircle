# CareCircle – Family Healthcare Management System

**CareCircle** is a modern, intuitive, and comprehensive family healthcare management application designed to organize and streamline all medical activities for the entire family from a single centralized platform.

---

## 🌟 Key Capabilities & Sections

### 1. Persistent Navigation
- **Dashboard**: Central overview of upcoming doctor appointments, notifications & reminders, pending medical tasks, family member cards, and live audit feed.
- **Family Members**: Detailed profiles for each family member with 4 dedicated tabs:
  - **Tab 1: Medical History**: Diagnoses, chronic conditions, surgeries, and clinical notes.
  - **Tab 2: Appointments**: Filtered into Upcoming, Completed, Cancelled, and Missed.
  - **Tab 3: Prescriptions & Reports**: Historical document archive (Prescriptions, Blood Tests, X-Rays, MRIs, CT Scans, Discharge Summaries).
  - **Tab 4: Medical Timeline**: Chronological healthcare journey with newest events first.
- **Appointments Management**:
  - Dual view: **List View** & **Interactive Monthly Calendar View**.
  - Schedule appointments with doctors, clinics, and consultation reasons.
  - Mark appointments as completed with consultation notes and attached diagnostic records.
  - Full filtering by family member, doctor, status, and date.
- **Doctors Directory**:
  - Centralized family doctor directory with specialties, clinic addresses (Google Maps navigation), clickable phone calls, and OPD hours.
  - Doctor profiles highlighting which family members have consulted them, plus upcoming & past appointments.
- **Medical Records Vault**:
  - Browse, upload, preview, and download medical reports across all family members.
  - Searchable and filterable by patient, document category, and date.
- **System Settings**:
  - Account profile, family emergency directives, password update, date format preferences, and 1-click demo dataset reset.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### Installation & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run in Development Mode (Vite + Express):**
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

3. **Run in Production Mode (Built Single Server):**
   ```bash
   npm run build
   npm run start
   ```
   - Access the complete application at `http://localhost:5000`

---

## 🔑 Demo Account Credentials
- **Email**: `sharma.family@carecircle.io`
- **Password**: `Care@123`
- *(A convenient "1-Click Demo Login" button is also provided on the sign-in modal)*

---

## 🔒 Security & Architecture
- **Authentication**: JWT token-based authentication with bcrypt password hashing.
- **Family Isolation**: All records are scoped to the authenticated family account.
- **Document Protection**: Medical files are served through authorized streaming routes (`/api/records/:id/download`).
- **Data Persistence**: Stored atomically in `data/carecircle_db.json` with file write safeguards.
