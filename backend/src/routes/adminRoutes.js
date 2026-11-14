import express from 'express';
import {
  getAdminStats,
  getAdminUsers,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAdminQuizQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply auth and admin check to all admin routes
router.use(protect, authorize('admin'));

// Platform Stats & Users
router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);

// Quiz Management
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);

// Questions Management for Quiz
router.get('/quizzes/:id/questions', getAdminQuizQuestions);
router.post('/quizzes/:id/questions', addQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

export default router;
