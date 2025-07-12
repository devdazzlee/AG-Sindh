import { Router } from 'express';
import { OutgoingController, requireSuperAdmin } from '../../controllers/outgoingController/outgoingController';
import { requireAuth } from '../../middlewares/auth';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/outgoing/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

// Apply authentication to all routes
router.use(requireAuth);

// Create outgoing letter (with file upload)
router.post('/', upload.single('image'), OutgoingController.createOutgoing);

// Get all outgoing letters
router.get('/', OutgoingController.getAllOutgoing);

// Get outgoing letter by id
router.get('/:id', OutgoingController.getOutgoingById);

// Get outgoing letter by QR code
router.get('/qr/:qrCode', OutgoingController.getOutgoingByQR);

// Update outgoing letter - Super admin only
router.put('/:id', requireSuperAdmin, upload.single('image'), OutgoingController.updateOutgoing);

// Update outgoing letter status - Super admin only
router.patch('/:id/status', requireSuperAdmin, OutgoingController.updateOutgoingStatus);

// Delete outgoing letter - Super admin only
router.delete('/:id', requireSuperAdmin, OutgoingController.deleteOutgoing);

// Get outgoing letters by department
router.get('/department/:departmentId', OutgoingController.getOutgoingByDepartment);

// Get outgoing statistics
router.get('/stats/overview', OutgoingController.getOutgoingStats);

// Scan QR code (POST endpoint for scanning)
router.post('/scan', OutgoingController.scanOutgoingQR);

export default router; 