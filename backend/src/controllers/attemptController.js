import { Attempt, memoryAttempts } from '../models/Attempt.js';
import { Quiz, memoryQuizzes } from '../models/Quiz.js';
import { Question, memoryQuestions } from '../models/Question.js';
import { getDbStatus } from '../config/db.js';

// @desc    Get logged in user's quiz attempt history
// @route   GET /api/attempts
// @access  Private
export const getUserAttempts = async (req, res) => {
  try {
    const userId = req.user._id;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const attempts = await Attempt.find({ userId })
        .populate('quizId', 'title category difficulty timeLimit')
        .sort({ submittedAt: -1 })
        .lean();

      return res.json({
        success: true,
        count: attempts.length,
        attempts: attempts.map((a) => ({
          _id: a._id,
          quizId: a.quizId?._id || a.quizId,
          quizTitle: a.quizId?.title || 'Unknown Quiz',
          category: a.quizId?.category || 'General',
          difficulty: a.quizId?.difficulty || 'Medium',
          score: a.score,
          total: a.total,
          percentage: a.percentage,
          passed: a.percentage >= 60,
          timeTaken: a.timeTaken,
          submittedAt: a.submittedAt,
        })),
      });
    }

    // Memory Store branch
    const userAttempts = memoryAttempts
      .filter((a) => String(a.userId) === String(userId))
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    const attemptsWithQuiz = userAttempts.map((a) => {
      const quiz = memoryQuizzes.find((q) => String(q._id) === String(a.quizId));
      return {
        _id: a._id,
        quizId: a.quizId,
        quizTitle: quiz ? quiz.title : 'Quiz',
        category: quiz ? quiz.category : 'General',
        difficulty: quiz ? quiz.difficulty : 'Medium',
        score: a.score,
        total: a.total,
        percentage: a.percentage,
        passed: a.percentage >= 60,
        timeTaken: a.timeTaken,
        submittedAt: a.submittedAt,
      };
    });

    return res.json({
      success: true,
      count: attemptsWithQuiz.length,
      attempts: attemptsWithQuiz,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user attempts',
    });
  }
};

// @desc    Get detailed result of an attempt with correct answers & explanations
// @route   GET /api/attempts/:id
// @access  Private
export const getAttemptById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    const dbStatus = getDbStatus();

    let attempt;
    let quiz;
    let questions;

    if (dbStatus.connected) {
      attempt = await Attempt.findById(id).lean();
      if (!attempt) {
        return res.status(404).json({ success: false, message: 'Attempt not found' });
      }

      if (!isAdmin && String(attempt.userId) !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: not authorized to view this attempt',
        });
      }

      quiz = await Quiz.findById(attempt.quizId).lean();
      questions = await Question.find({ quizId: attempt.quizId }).lean();
    } else {
      attempt = memoryAttempts.find((a) => String(a._id) === String(id));
      if (!attempt) {
        return res.status(404).json({ success: false, message: 'Attempt not found' });
      }

      if (!isAdmin && String(attempt.userId) !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: not authorized to view this attempt',
        });
      }

      quiz = memoryQuizzes.find((q) => String(q._id) === String(attempt.quizId));
      questions = memoryQuestions.filter(
        (q) => String(q.quizId) === String(attempt.quizId)
      );
    }

    // Map user answers
    const answersMap = new Map();
    (attempt.answers || []).forEach((ans) => {
      answersMap.set(String(ans.questionId), ans.selectedIndex);
    });

    const review = (questions || []).map((q) => {
      const selectedIndex = answersMap.has(String(q._id))
        ? answersMap.get(String(q._id))
        : null;

      const isCorrect =
        selectedIndex !== null &&
        Number(selectedIndex) === Number(q.correctIndex);

      return {
        questionId: q._id,
        text: q.text,
        options: q.options,
        userSelected: selectedIndex,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation || 'No explanation provided.',
      };
    });

    return res.json({
      success: true,
      attempt: {
        _id: attempt._id,
        quizId: quiz?._id || attempt.quizId,
        quizTitle: quiz?.title || 'Quiz',
        category: quiz?.category || 'General',
        difficulty: quiz?.difficulty || 'Medium',
        score: attempt.score,
        total: attempt.total,
        percentage: attempt.percentage,
        passed: attempt.percentage >= 60,
        timeTaken: attempt.timeTaken,
        submittedAt: attempt.submittedAt,
      },
      review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching attempt result',
    });
  }
};

// @desc    Get user performance summary & analytics
// @route   GET /api/attempts/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const dbStatus = getDbStatus();

    let attempts = [];

    if (dbStatus.connected) {
      attempts = await Attempt.find({ userId })
        .populate('quizId', 'title category')
        .sort({ submittedAt: -1 })
        .lean();
    } else {
      const userAttempts = memoryAttempts.filter(
        (a) => String(a.userId) === String(userId)
      );
      attempts = userAttempts.map((a) => {
        const quiz = memoryQuizzes.find((q) => String(q._id) === String(a.quizId));
        return {
          ...a,
          quizId: quiz || { title: 'Quiz', category: 'General' },
        };
      });
    }

    const totalAttempts = attempts.length;

    if (totalAttempts === 0) {
      return res.json({
        success: true,
        stats: {
          totalAttempts: 0,
          averageScore: 0,
          bestScore: 0,
          passedCount: 0,
          passRate: 0,
          categoryBreakdown: [],
          recentAttempts: [],
        },
      });
    }

    const sumPercentages = attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
    const averageScore = Math.round(sumPercentages / totalAttempts);
    const bestScore = Math.max(...attempts.map((a) => a.percentage || 0));
    const passedCount = attempts.filter((a) => (a.percentage || 0) >= 60).length;
    const passRate = Math.round((passedCount / totalAttempts) * 100);

    // Group by category
    const categoryMap = {};
    attempts.forEach((a) => {
      const cat = a.quizId?.category || 'General';
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          category: cat,
          count: 0,
          totalScore: 0,
          bestScore: 0,
        };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].totalScore += a.percentage || 0;
      categoryMap[cat].bestScore = Math.max(
        categoryMap[cat].bestScore,
        a.percentage || 0
      );
    });

    const categoryBreakdown = Object.values(categoryMap).map((c) => ({
      category: c.category,
      attemptsCount: c.count,
      averageScore: Math.round(c.totalScore / c.count),
      bestScore: c.bestScore,
    }));

    const recentAttempts = attempts.slice(0, 5).map((a) => ({
      _id: a._id,
      quizTitle: a.quizId?.title || 'Quiz',
      category: a.quizId?.category || 'General',
      score: a.score,
      total: a.total,
      percentage: a.percentage,
      passed: a.percentage >= 60,
      timeTaken: a.timeTaken,
      submittedAt: a.submittedAt,
    }));

    return res.json({
      success: true,
      stats: {
        totalAttempts,
        averageScore,
        bestScore,
        passedCount,
        passRate,
        categoryBreakdown,
        recentAttempts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error generating user statistics',
    });
  }
};
