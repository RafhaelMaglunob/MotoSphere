import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { connectDevice, disconnectDevice, getDeviceStatus } from '../services/raspberryPiService.js';

const router = express.Router();

// Public ping to verify route mounting quickly (no auth)
// GET /api/device/ping
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'device routes mounted' });
});

// GET /api/device/status
router.get('/status', verifyToken, async (req, res) => {
  try {
    const status = await getDeviceStatus();
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: `Failed to reach Raspberry Pi device service: ${error.message}`,
    });
  }
});

// POST /api/device/connect
router.post('/connect', verifyToken, async (req, res) => {
  try {
    const { deviceId } = req.body || {};
    const data = await connectDevice({ userId: req.user?.id, deviceId });
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: `Failed to connect via Raspberry Pi device service: ${error.message}`,
    });
  }
});

// POST /api/device/disconnect
router.post('/disconnect', verifyToken, async (req, res) => {
  try {
    const { deviceId } = req.body || {};
    const data = await disconnectDevice({ userId: req.user?.id, deviceId });
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: `Failed to disconnect via Raspberry Pi device service: ${error.message}`,
    });
  }
});

export default router;

