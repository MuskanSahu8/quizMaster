import { Quiz, memoryQuizzes } from '../models/Quiz.js';
import { Question, memoryQuestions } from '../models/Question.js';
import { Attempt, memoryAttempts } from '../models/Attempt.js';
import { getDbStatus } from '../config/db.js';

// @desc    Get all quizzes with optional filter & search
// @route   GET /api/quizzes
// @access  Public
export const getQuizzes = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const filter = {};
      if (category && category !== 'All') {
        filter.category = category;
      }
      if (difficulty && difficulty !== 'All') {
        filter.difficulty = difficulty;
      }
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const quizzes = await Quiz.find(filter).sort({ createdAt: -1 }).lean();

      // Attach question counts
      const quizzesWithCount = await Promise.all(
        quizzes.map(async (quiz) => {
          const count = await Question.countDocuments({ quizId: quiz._id });
          return {
            ...quiz,
            questionCount: count,
          };
        })
      );

      return res.json({
        success: true,
        count: quizzesWithCount.length,
        quizzes: quizzesWithCount,
      });
    }

    // Memory store branch
    let results = [...memoryQuizzes];

    if (category && category !== 'All') {
      results = results.filter(
        (q) => q.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (difficulty && difficulty !== 'All') {
      results = results.filter(
        (q) => q.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    const quizzesWithCount = results.map((quiz) => {
      const qCount = memoryQuestions.filter(
        (item) => String(item.quizId) === String(quiz._id)
      ).length;
      return {
        ...quiz,
        questionCount: qCount,
      };
    });

    return res.json({
      success: true,
      count: quizzesWithCount.length,
      quizzes: quizzesWithCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching quizzes',
    });
  }
};

// @desc    Get single quiz by ID with questions (WITHOUT correct answers for secure play)
// @route   GET /api/quizzes/:id
// @access  Private (Learners)
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const quiz = await Quiz.findById(id).lean();
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found',
        });
      }

      // Explicitly EXCLUDE correctIndex and explanation for integrity
      const questions = await Question.find({ quizId: id })
        .select('_id quizId text options createdAt')
        .lean();

      return res.json({
        success: true,
        quiz: {
          ...quiz,
          questionCount: questions.length,
        },
        questions,
      });
    }

    // Memory Store branch
    const quiz = memoryQuizzes.find((q) => String(q._id) === String(id));
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Exclude correctIndex & explanation
    const questions = memoryQuestions
      .filter((q) => String(q.quizId) === String(id))
      .map((q) => ({
        _id: q._id,
        quizId: q.quizId,
        text: q.text,
        options: q.options,
        createdAt: q.createdAt,
      }));

    return res.json({
      success: true,
      quiz: {
        ...quiz,
        questionCount: questions.length,
      },
      questions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving quiz',
    });
  }
};

// @desc    Submit answers for a quiz, compute score server-side, save attempt
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res) => {
  try {
    const { id: quizId } = req.params;
    const { answers = [], timeTaken = 0 } = req.body;
    const userId = req.user._id;
    const dbStatus = getDbStatus();

    let quiz;
    let questions;

    if (dbStatus.connected) {
      quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }
      questions = await Question.find({ quizId });
    } else {
      quiz = memoryQuizzes.find((q) => String(q._id) === String(quizId));
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }
      questions = memoryQuestions.filter((q) => String(q.quizId) === String(quizId));
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Quiz has no questions available to score',
      });
    }

    // Map answers by questionId
    const answersMap = new Map();
    answers.forEach((ans) => {
      answersMap.set(String(ans.questionId), ans.selectedIndex);
    });

    let score = 0;
    const total = questions.length;
    const reviewDetails = [];

    questions.forEach((q) => {
      const selectedIndex = answersMap.has(String(q._id))
        ? answersMap.get(String(q._id))
        : null;

      const isCorrect =
        selectedIndex !== null &&
        Number(selectedIndex) === Number(q.correctIndex);

      if (isCorrect) {
        score += 1;
      }

      reviewDetails.push({
        questionId: q._id,
        text: q.text,
        options: q.options,
        userSelected: selectedIndex,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation || 'No explanation provided.',
      });
    });

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = percentage >= 60; // 60% passing benchmark

    const attemptData = {
      userId,
      quizId,
      answers: answers.map((a) => ({
        questionId: a.questionId,
        selectedIndex: a.selectedIndex,
      })),
      score,
      total,
      percentage,
      timeTaken: Math.max(1, Number(timeTaken) || 0),
      submittedAt: new Date(),
    };

    let savedAttempt;

    if (dbStatus.connected) {
      const attempt = new Attempt(attemptData);
      savedAttempt = await attempt.save();
    } else {
      savedAttempt = {
        _id: `mem_att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ...attemptData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryAttempts.unshift(savedAttempt);
    }

    return res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      attempt: {
        _id: savedAttempt._id,
        quizId: quiz._id,
        quizTitle: quiz.title,
        category: quiz.category,
        difficulty: quiz.difficulty,
        score,
        total,
        percentage,
        passed,
        timeTaken: savedAttempt.timeTaken,
        submittedAt: savedAttempt.submittedAt,
      },
      review: reviewDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error scoring and submitting quiz',
    });
  }
};
