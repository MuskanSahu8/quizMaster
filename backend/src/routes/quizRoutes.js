import express from 'express';
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
} from '../controllers/quizController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getQuizzes);
router.get('/:id', protect, getQuizById);
router.post('/:id/submit', protect, submitQuiz);

export default router;
