import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';
import { generateToken, authMiddleware, AuthRequest } from '../auth.ts';
import { FamilyUser } from '../../src/types/index.ts';

const router = Router();

// Register new family account - requires only familyName, email, password
router.post('/register', (req, res: Response) => {
  const { email, password, familyName } = req.body;
  if (!email || !password || !familyName) {
    return res.status(400).json({ error: 'Family name, email address, and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanFamilyName = familyName.trim();

  const data = db.getData();
  const existing = data.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newUser: FamilyUser & { passwordHash: string } = {
    id: userId,
    email: cleanEmail,
    name: cleanFamilyName,
    familyName: cleanFamilyName,
    emergencyFamilyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    preferences: {
      dateFormat: 'DD/MM/YYYY',
      notificationsEnabled: true,
      emailAlerts: true,
      reminderWindowDays: 3
    },
    createdAt: new Date().toISOString(),
    passwordHash
  };

  data.users.push(newUser);

  // Welcome notification addressed to the family as a whole
  data.notifications.unshift({
    id: `notif_${Date.now()}`,
    familyId: userId,
    title: `Welcome, ${cleanFamilyName}!`,
    description: `Your family healthcare vault "${cleanFamilyName}" is ready. Start by adding your family members and doctors.`,
    type: 'system',
    date: new Date().toISOString(),
    isRead: false,
    isDismissed: false
  });

  db.logActivity({
    familyId: userId,
    type: 'member_added',
    title: 'Family Vault Created',
    description: `Welcome to CareCircle, ${cleanFamilyName}! Your family vault is ready.`
  });

  db.save();

  const token = generateToken({ id: userId, email: newUser.email, familyId: userId });
  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, token });
});

// Login
router.post('/login', (req, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const data = db.getData();
  const user = data.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email address or password. Please verify your credentials.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email address or password. Please verify your credentials.' });
  }

  const token = generateToken({ id: user.id, email: user.email, familyId: user.id });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

// Current User Profile (Authenticated)
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
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
  res.json({ user: safeUser });
});

export default router;
