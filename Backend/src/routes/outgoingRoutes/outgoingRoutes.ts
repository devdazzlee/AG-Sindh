import { Router } from 'express';
import { OutgoingController } from '../../controllers/outgoingController/outgoingController';
import { requireAuth } from '../../middlewares/auth';
import multer, { StorageEngine } from 'multer';
import path from 'path';

const router = Router();

// Multer config for image upload (matching incoming pattern)
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads/outgoing'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Apply authentication to all routes
router.use(requireAuth);

// Create outgoing letter (with file upload)
router.post('/', upload.single('image'), OutgoingController.createOutgoing);

// Get all outgoing letters
router.get('/', OutgoingController.getAll);

// Get courier tracking records
router.get('/courier/tracking', OutgoingController.getCourierTrackingRecords);

// Get outgoing statistics
router.get('/stats/overview', OutgoingController.getOutgoingStats);

// Get outgoing by QR code (must come before /:id)
router.get('/qr/:qrCode', OutgoingController.getByQRCode);

// Get outgoing letter by ID
router.get('/:id', OutgoingController.getOutgoingById);

// Update outgoing letter (with file upload)
router.put('/:id', upload.single('image'), OutgoingController.updateOutgoing);

// Delete outgoing letter
router.delete('/:id', OutgoingController.deleteOutgoing);

// Update outgoing letter status
router.patch('/:id/status', OutgoingController.updateOutgoingStatus);
// Update status by QR code (courier tracking)
router.patch('/qr/:qrCode/status', OutgoingController.updateStatusByQRCode);

export default router; 