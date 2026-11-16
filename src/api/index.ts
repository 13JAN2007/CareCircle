const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('carecircle_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    return res.json();
  },

  async register(data: { email: string; password: string; familyName: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  // Dashboard
  async getDashboardOverview() {
    const res = await fetch(`${API_BASE}/dashboard/overview`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/dashboard/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return res.json();
  },

  async dismissNotification(id: string) {
    const res = await fetch(`${API_BASE}/dashboard/notifications/${id}/dismiss`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/dashboard/notifications/mark-all-read`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  async createTask(data: { title: string; familyMemberId: string; dueDate?: string; priority?: string }) {
    const res = await fetch(`${API_BASE}/dashboard/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create task');
    }
    return res.json();
  },

  async toggleTask(id: string) {
    const res = await fetch(`${API_BASE}/dashboard/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return res.json();
  },

  async deleteTask(id: string) {
    const res = await fetch(`${API_BASE}/dashboard/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Family Members
  async getFamilyMembers() {
    const res = await fetch(`${API_BASE}/family/members`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch family members');
    return res.json();
  },

  async getFamilyMember(id: string) {
    const res = await fetch(`${API_BASE}/family/members/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch member details');
    return res.json();
  },

  async createFamilyMember(data: any) {
    const res = await fetch(`${API_BASE}/family/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create member');
    }
    return res.json();
  },

  async updateFamilyMember(id: string, data: any) {
    const res = await fetch(`${API_BASE}/family/members/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update member');
    }
    return res.json();
  },

  async deleteFamilyMember(id: string) {
    const res = await fetch(`${API_BASE}/family/members/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete member');
    return res.json();
  },

  // Medical History
  async getMemberHistory(memberId: string) {
    const res = await fetch(`${API_BASE}/family/members/${memberId}/history`, { headers: getHeaders() });
    return res.json();
  },

  async addMemberHistory(memberId: string, data: any) {
    const res = await fetch(`${API_BASE}/family/members/${memberId}/history`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add history entry');
    }
    return res.json();
  },

  async updateMemberHistory(historyId: string, data: any) {
    const res = await fetch(`${API_BASE}/family/history/${historyId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteMemberHistory(historyId: string) {
    const res = await fetch(`${API_BASE}/family/history/${historyId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  async getMemberTimeline(memberId: string) {
    const res = await fetch(`${API_BASE}/family/members/${memberId}/timeline`, { headers: getHeaders() });
    return res.json();
  },

  // Doctors
  async getDoctors() {
    const res = await fetch(`${API_BASE}/doctors`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch doctors');
    return res.json();
  },

  async getDoctor(id: string) {
    const res = await fetch(`${API_BASE}/doctors/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch doctor details');
    return res.json();
  },

  async createDoctor(data: any) {
    const res = await fetch(`${API_BASE}/doctors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create doctor');
    }
    return res.json();
  },

  async updateDoctor(id: string, data: any) {
    const res = await fetch(`${API_BASE}/doctors/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update doctor');
    return res.json();
  },

  async deleteDoctor(id: string) {
    const res = await fetch(`${API_BASE}/doctors/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete doctor');
    return res.json();
  },

  // Appointments
  async getAppointments(filters?: { memberId?: string; doctorId?: string; status?: string; search?: string; date?: string }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
    }
    const res = await fetch(`${API_BASE}/appointments?${params.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  async getAppointment(id: string) {
    const res = await fetch(`${API_BASE}/appointments/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async createAppointment(data: any) {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to schedule appointment');
    }
    return res.json();
  },

  async updateAppointment(id: string, data: any) {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update appointment');
    return res.json();
  },

  async updateAppointmentStatus(id: string, status: string, consultationNotes?: string, attachedRecordIds?: string[]) {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, consultationNotes, attachedRecordIds })
    });
    if (!res.ok) throw new Error('Failed to update appointment status');
    return res.json();
  },

  async deleteAppointment(id: string) {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Medical Records / Documents
  async getMedicalRecords(filters?: { memberId?: string; category?: string; search?: string; date?: string }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
    }
    const res = await fetch(`${API_BASE}/records?${params.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch medical records');
    return res.json();
  },

  async uploadMedicalRecord(formData: FormData) {
    const token = localStorage.getItem('carecircle_token');
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/records/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload document');
    }
    return res.json();
  },

  async deleteMedicalRecord(id: string) {
    const res = await fetch(`${API_BASE}/records/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`, { headers: getHeaders() });
    return res.json();
  },

  async updateProfile(data: { familyName: string; email: string }) {
    const res = await fetch(`${API_BASE}/settings/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateFamilySettings(data: { familyName: string; emergencyFamilyContact: any }) {
    const res = await fetch(`${API_BASE}/settings/family`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updatePreferences(data: any) {
    const res = await fetch(`${API_BASE}/settings/preferences`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const res = await fetch(`${API_BASE}/settings/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to change password');
    }
    return res.json();
  },

  async resetDemoData() {
    const res = await fetch(`${API_BASE}/settings/reset-demo`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  }
};
