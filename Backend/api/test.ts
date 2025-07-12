import express from 'express';

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

export default router; 