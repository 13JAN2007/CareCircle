import { Router, Response } from 'express';
import { db } from '../db.ts';
import { AuthRequest } from '../auth.ts';
import { MedicalTask, DashboardNotification } from '../../src/types/index.ts';

const router = Router();

// GET dashboard statistics & data
router.get('/overview', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const data = db.getData();

  const members = data.familyMembers.filter(m => m.familyId === familyId);
  const appointments = data.appointments.filter(a => a.familyId === familyId);
  const tasks = data.medicalTasks.filter(t => t.familyId === familyId);

  const upcomingAppointmentsList = appointments
    .filter(a => a.status === 'Scheduled')
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

  const completedAppointmentsCount = appointments.filter(a => a.status === 'Completed').length;
  const pendingTasksList = tasks.filter(t => !t.isCompleted);

  const stats = {
    totalFamilyMembers: members.length,
    upcomingAppointments: upcomingAppointmentsList.length,
    completedAppointments: completedAppointmentsCount,
    pendingMedicalTasks: pendingTasksList.length
  };

  // Populate upcoming appointments
  const upcomingAppointments = upcomingAppointmentsList.slice(0, 5).map(apt => {
    const member = members.find(m => m.id === apt.familyMemberId);
    const doc = data.doctors.find(d => d.id === apt.doctorId);
    return {
      ...apt,
      familyMember: member,
      doctor: doc
    };
  });

  // Populate family overview cards
  const familyOverview = members.map(m => {
    const memberAppointments = appointments.filter(a => a.familyMemberId === m.id).length;
    return {
      id: m.id,
      fullName: m.fullName,
      avatar: m.avatar,
      age: m.age,
      relationship: m.relationship,
      bloodGroup: m.bloodGroup,
      appointmentsCount: memberAppointments
    };
  });

  // Dynamic notifications: ensure up-to-date notifications based on actual records
  // Filter out dismissed notifications
  const notifications = data.notifications
    .filter(n => n.familyId === familyId && !n.isDismissed)
    .map(notif => {
      const member = members.find(m => m.id === notif.familyMemberId);
      return {
        ...notif,
        familyMember: member
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pending medical tasks with member details
  const populatedTasks = tasks
    .map(t => {
      const member = members.find(m => m.id === t.familyMemberId);
      return {
        ...t,
        familyMember: member
      };
    })
    .sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  // Recent activity feed
  const recentActivities = data.activityFeed
    .filter(act => act.familyId === familyId)
    .slice(0, 10);

  res.json({
    stats,
    upcomingAppointments,
    familyOverview,
    notifications,
    tasks: populatedTasks,
    recentActivities
  });
});

// Notifications: Mark as read
router.patch('/notifications/:id/read', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const notif = data.notifications.find(n => n.id === id && n.familyId === familyId);
  if (notif) {
    notif.isRead = true;
    db.save();
  }
  res.json({ success: true, notification: notif });
});

// Notifications: Dismiss
router.patch('/notifications/:id/dismiss', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const notif = data.notifications.find(n => n.id === id && n.familyId === familyId);
  if (notif) {
    notif.isDismissed = true;
    db.save();
  }
  res.json({ success: true });
});

// Notifications: Mark all as read
router.post('/notifications/mark-all-read', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const data = db.getData();

  data.notifications.forEach(n => {
    if (n.familyId === familyId) {
      n.isRead = true;
    }
  });

  db.save();
  res.json({ success: true });
});

// Tasks: Create medical task
router.post('/tasks', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { title, familyMemberId, dueDate, priority } = req.body;

  if (!title || !familyMemberId) {
    return res.status(400).json({ error: 'Title and Family Member are required' });
  }

  const data = db.getData();
  const member = data.familyMembers.find(m => m.id === familyMemberId);

  const newTask: MedicalTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    familyId,
    title,
    familyMemberId,
    dueDate: dueDate || new Date().toISOString().split('T')[0],
    priority: priority || 'Medium',
    isCompleted: false,
    createdAt: new Date().toISOString()
  };

  data.medicalTasks.push(newTask);

  db.logActivity({
    familyId,
    type: 'task_completed',
    title: 'Medical Task Created',
    description: `Created task "${title}" for ${member?.fullName || 'member'}`,
    familyMemberId,
    familyMemberName: member?.fullName
  });

  db.save();

  res.status(201).json({
    task: {
      ...newTask,
      familyMember: member
    }
  });
});

// Tasks: Toggle completion status
router.patch('/tasks/:id/toggle', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const task = data.medicalTasks.find(t => t.id === id && t.familyId === familyId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.isCompleted = !task.isCompleted;
  task.completedAt = task.isCompleted ? new Date().toISOString() : undefined;

  const member = data.familyMembers.find(m => m.id === task.familyMemberId);

  if (task.isCompleted) {
    db.logActivity({
      familyId,
      type: 'task_completed',
      title: 'Medical Task Completed',
      description: `Completed: ${task.title} for ${member?.fullName || 'member'}`,
      familyMemberId: task.familyMemberId,
      familyMemberName: member?.fullName
    });
  }

  db.save();

  res.json({
    task: {
      ...task,
      familyMember: member
    }
  });
});

// Tasks: Delete task
router.delete('/tasks/:id', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const index = data.medicalTasks.findIndex(t => t.id === id && t.familyId === familyId);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  data.medicalTasks.splice(index, 1);
  db.save();

  res.json({ success: true, message: 'Task deleted' });
});

export default router;
