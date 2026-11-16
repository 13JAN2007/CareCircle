import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';
import { AuthRequest } from '../auth.ts';

const router = Router();

// GET settings & profile
router.get('/', (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Session missing' });
  }

  const data = db.getData();
  const user = data.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User account not found' });
  }

  const { passwordHash: _, ...safeUser } = user;
  res.json({ settings: safeUser });
});

// PUT update profile & user info
router.put('/profile', (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Session missing' });
  }

  const { familyName, name, email } = req.body;
  if (!familyName && !name && !email) {
    return res.status(400).json({ error: 'Family name or email is required' });
  }

  const data = db.getData();
  const user = data.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User account not found' });
  }

  if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
    const cleanEmail = email.trim().toLowerCase();
    const existing = data.users.find(u => u.email.toLowerCase() === cleanEmail && u.id !== userId);
    if (existing) {
      return res.status(400).json({ error: 'This email address is already in use by another account' });
    }
    user.email = cleanEmail;
  }

  const newFamilyName = familyName?.trim() || name?.trim();
  if (newFamilyName) {
    user.familyName = newFamilyName;
    user.name = newFamilyName;
  }

  db.save();
  const { passwordHash: _, ...safeUser } = user;
  res.json({ settings: safeUser, user: safeUser, message: 'Profile updated successfully' });
});

// PUT update family info & emergency contact
router.put('/family', (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Session missing' });
  }

  const { familyName, emergencyFamilyContact } = req.body;
  const data = db.getData();

  const user = data.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User account not found' });
  }

  if (familyName) user.familyName = familyName.trim();
  if (emergencyFamilyContact) user.emergencyFamilyContact = emergencyFamilyContact;

  db.save();
  const { passwordHash: _, ...safeUser } = user;
  res.json({ settings: safeUser, user: safeUser, message: 'Family details updated successfully' });
});

// PUT update preferences
router.put('/preferences', (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Session missing' });
  }

  const { dateFormat, notificationsEnabled, emailAlerts, reminderWindowDays } = req.body;
  const data = db.getData();

  const user = data.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User account not found' });
  }

  user.preferences = {
    dateFormat: dateFormat || user.preferences.dateFormat,
    notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : user.preferences.notificationsEnabled,
    emailAlerts: emailAlerts !== undefined ? emailAlerts : user.preferences.emailAlerts,
    reminderWindowDays: reminderWindowDays ? Number(reminderWindowDays) : user.preferences.reminderWindowDays
  };

  db.save();
  const { passwordHash: _, ...safeUser } = user;
  res.json({ settings: safeUser, user: safeUser, message: 'Preferences updated successfully' });
});

// POST change password
router.post('/change-password', (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Session missing' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  const data = db.getData();
  const user = data.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User account not found' });
  }

  const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPassword, salt);
  db.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

// POST reset demo data
router.post('/reset-demo', (req: AuthRequest, res: Response) => {
  db.resetToDefault();
  res.json({ success: true, message: 'Database reset to initial demo state' });
});

export default router;
