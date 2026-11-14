import express from 'express';
import {
  getUserAttempts,
  getAttemptById,
  getUserStats,
} from '../controllers/attemptController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getUserAttempts);
router.get('/stats', getUserStats);
router.get('/:id', getAttemptById);

export default router;
