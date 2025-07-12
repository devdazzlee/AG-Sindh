import express from 'express';
import { PrismaClient } from '../generated/prisma';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/db-test', async (req, res) => {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Try a simple query
    const userCount = await prisma.user.count();
    
    res.json({
      success: true,
      message: 'Database connection successful!',
      userCount,
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    });
  } finally {
    await prisma.$disconnect();
  }
});

export default router; 