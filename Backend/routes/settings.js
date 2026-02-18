import express from 'express';
import admin from 'firebase-admin';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { db } from '../config/firebase.js';
import { sendAlertNotificationEmail } from '../services/emailService.js';

const router = express.Router();

const readUserSettings = (user) => {
  const prefs = user.preferences || {};
  const notif = prefs.notifications || {};
  return {
    preferences: {
      theme: prefs.theme || 'light',
      language: prefs.language || 'en',
      timezone: prefs.timezone || 'UTC',
      notifications: {
        systemAlerts: notif.systemAlerts !== false,
        messages: notif.messages !== false,
        marketing: !!notif.marketing
      }
    },
    security: {
      visibility: (user.security && user.security.visibility) || 'public',
      twoFactor: {
        enabled: !!user.twoFactorEnabled
      }
    }
  };
};

router.get('/user/settings', verifyToken, async (req, res) => {
  try {
    const snap = await db.collection('users').doc(req.user.id).get();
    if (!snap.exists) return res.status(404).json({ success: false, message: 'User not found' });
    const data = snap.data() || {};
    res.json({ success: true, settings: readUserSettings(data) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to load settings' });
  }
});

router.patch('/user/settings', verifyToken, async (req, res) => {
  try {
    const { preferences, security } = req.body || {};
    const updates = {};
    if (preferences) {
      if (preferences.theme && !['light', 'dark'].includes(preferences.theme)) {
        return res.status(400).json({ success: false, message: 'Invalid theme' });
      }
      if (preferences.language && typeof preferences.language !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid language' });
      }
      if (preferences.timezone && typeof preferences.timezone !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid timezone' });
      }
      if (preferences.notifications) {
        const n = preferences.notifications;
        if (typeof n.systemAlerts !== 'undefined' && typeof n.systemAlerts !== 'boolean') {
          return res.status(400).json({ success: false, message: 'Invalid notifications.systemAlerts' });
        }
        if (typeof n.messages !== 'undefined' && typeof n.messages !== 'boolean') {
          return res.status(400).json({ success: false, message: 'Invalid notifications.messages' });
        }
        if (typeof n.marketing !== 'undefined' && typeof n.marketing !== 'boolean') {
          return res.status(400).json({ success: false, message: 'Invalid notifications.marketing' });
        }
      }
      updates['preferences'] = {
        ...(preferences || {})
      };
    }
    if (security) {
      if (security.visibility && !['public', 'private'].includes(security.visibility)) {
        return res.status(400).json({ success: false, message: 'Invalid visibility' });
      }
      updates['security'] = {
        ...(security || {})
      };
    }
    if (Object.keys(updates).length === 0) {
      return res.json({ success: true, message: 'No changes' });
    }
    updates['updatedAt'] = admin.firestore.Timestamp.now();
    await db.collection('users').doc(req.user.id).set(updates, { merge: true });
    const snap = await db.collection('users').doc(req.user.id).get();
    res.json({ success: true, settings: readUserSettings(snap.data() || {}) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to update settings' });
  }
});

router.get('/user/settings/sessions', verifyToken, async (req, res) => {
  try {
    const ref = db.collection('users').doc(req.user.id).collection('sessions').orderBy('lastActiveAt', 'desc').limit(20);
    const snap = await ref.get();
    const sessions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, sessions });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to load sessions' });
  }
});

router.post('/user/settings/security/logout-others', verifyToken, async (req, res) => {
  try {
    const keepSessionId = req.body?.keepSessionId || null;
    const userRef = db.collection('users').doc(req.user.id);
    const snap = await userRef.get();
    const currentVersion = (snap.data()?.security?.tokenVersion) || 0;
    await userRef.set({ security: { tokenVersion: currentVersion + 1 } }, { merge: true });
    if (keepSessionId) {
      const sessionsRef = userRef.collection('sessions');
      const sessionsSnap = await sessionsRef.get();
      const batch = db.batch();
      sessionsSnap.forEach(doc => {
        if (doc.id !== keepSessionId) {
          batch.update(doc.ref, { revoked: true });
        }
      });
      await batch.commit();
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to logout other devices' });
  }
});

router.get('/user/settings/security/login-history', verifyToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const ref = db.collection('users').doc(req.user.id).collection('loginHistory').orderBy('createdAt', 'desc').limit(limit);
    const snap = await ref.get();
    const history = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, history });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to load login history' });
  }
});

router.post('/user/settings/security/backup-codes/regenerate', verifyToken, async (req, res) => {
  try {
    const codes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));
    const hashed = await Promise.all(codes.map(c => bcryptjs.hash(c, 10)));
    await db.collection('users').doc(req.user.id).set({
      security: {
        backupCodes: hashed,
        lastRegeneratedAt: admin.firestore.Timestamp.now()
      }
    }, { merge: true });
    res.json({ success: true, codes });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to regenerate backup codes' });
  }
});

router.post('/user/settings/privacy/download', verifyToken, async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.user.id);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(404).json({ success: false, message: 'User not found' });
    const sessionsSnap = await userRef.collection('sessions').get();
    const loginSnap = await userRef.collection('loginHistory').get();
    const payload = {
      user: { id: userSnap.id, ...userSnap.data(), password: undefined },
      sessions: sessionsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      loginHistory: loginSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    };
    res.json({ success: true, data: payload });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to prepare data' });
  }
});

router.delete('/user/settings/privacy/delete-account', verifyToken, async (req, res) => {
  try {
    const now = admin.firestore.Timestamp.now();
    await db.collection('users').doc(req.user.id).set({
      deletedAt: now,
      email: `deleted+${req.user.id}@example.com`,
      username: `deleted_${req.user.id.substring(0, 6)}`,
      phoneVerified: false,
      emailVerified: false
    }, { merge: true });
    res.json({ success: true, message: 'Account scheduled for deletion' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to delete account' });
  }
});

router.get('/admin/settings', verifyAdmin, async (req, res) => {
  try {
    const snap = await db.collection('system').doc('settings').collection('config').doc('v1').get();
    res.json({ success: true, settings: snap.exists ? snap.data() : {} });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to load settings' });
  }
});

router.patch('/admin/settings', verifyAdmin, async (req, res) => {
  try {
    const allowed = req.body || {};
    await db.collection('system').doc('settings').collection('config').doc('v1').set(allowed, { merge: true });
    const snap = await db.collection('system').doc('settings').collection('config').doc('v1').get();
    res.json({ success: true, settings: snap.data() || {} });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to update settings' });
  }
});

router.post('/admin/notifications/broadcast', verifyAdmin, async (req, res) => {
  try {
    const { title, body, audience } = req.body || {};
    if (!title || !body) return res.status(400).json({ success: false, message: 'Title and body are required' });
    const doc = await db.collection('broadcasts').add({
      title,
      body,
      audience: audience || 'all',
      createdBy: req.user.id,
      createdAt: admin.firestore.Timestamp.now()
    });
    res.json({ success: true, id: doc.id });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to broadcast' });
  }
});

router.get('/public/broadcasts', async (req, res) => {
  try {
    const q = db.collection('broadcasts').orderBy('createdAt', 'desc').limit(10);
    const snap = await q.get();
    const items = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || '',
        body: data.body || '',
        audience: data.audience || 'all',
        createdBy: data.createdBy || null,
        createdAt: data.createdAt && data.createdAt.toMillis ? data.createdAt.toMillis() : null
      };
    });
    res.json({ success: true, broadcasts: items });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to load broadcasts' });
  }
});

router.get('/admin/broadcasts', verifyAdmin, async (req, res) => {
  try {
    const limitNum = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const q = db.collection('broadcasts').orderBy('createdAt', 'desc').limit(limitNum);
    const snap = await q.get();
    const items = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || '',
        body: data.body || '',
        audience: data.audience || 'all',
        createdBy: data.createdBy || null,
        createdAt: data.createdAt && data.createdAt.toMillis ? data.createdAt.toMillis() : null
      };
    });
    res.json({ success: true, broadcasts: items });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to load broadcasts' });
  }
});

router.delete('/admin/broadcasts/:id', verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'id required' });
    await db.collection('broadcasts').doc(id).delete();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to delete broadcast' });
  }
});

router.post('/admin/settings/smtp/test', verifyAdmin, async (req, res) => {
  try {
    const { toEmail } = req.body || {};
    if (!toEmail) return res.status(400).json({ success: false, message: 'toEmail is required' });
    const r = await sendAlertNotificationEmail(toEmail, { alertType: 'SMTP Test', deviceId: 'SMTP', time_of_occurrence: new Date() });
    res.json({ success: true, result: r });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to send test email' });
  }
});

export default router;
