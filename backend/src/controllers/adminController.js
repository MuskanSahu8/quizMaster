import { Quiz, memoryQuizzes } from '../models/Quiz.js';
import { Question, memoryQuestions } from '../models/Question.js';
import { Attempt, memoryAttempts } from '../models/Attempt.js';
import { User, memoryUsers } from '../models/User.js';
import { getDbStatus } from '../config/db.js';

// @desc    Get overall platform statistics for admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
  try {
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const [totalUsers, totalQuizzes, totalQuestions, totalAttempts, recentAttempts] =
        await Promise.all([
          User.countDocuments(),
          Quiz.countDocuments(),
          Question.countDocuments(),
          Attempt.countDocuments(),
          Attempt.find()
            .populate('userId', 'name email')
            .populate('quizId', 'title category')
            .sort({ submittedAt: -1 })
            .limit(10)
            .lean(),
        ]);

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalQuizzes,
          totalQuestions,
          totalAttempts,
          recentAttempts: recentAttempts.map((a) => ({
            _id: a._id,
            userName: a.userId?.name || 'User',
            userEmail: a.userId?.email || '',
            quizTitle: a.quizId?.title || 'Quiz',
            category: a.quizId?.category || 'General',
            score: a.score,
            total: a.total,
            percentage: a.percentage,
            passed: a.percentage >= 60,
            submittedAt: a.submittedAt,
          })),
        },
      });
    }

    // Memory Store branch
    const totalUsers = memoryUsers.length;
    const totalQuizzes = memoryQuizzes.length;
    const totalQuestions = memoryQuestions.length;
    const totalAttempts = memoryAttempts.length;

    const recentAttempts = [...memoryAttempts]
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 10)
      .map((a) => {
        const user = memoryUsers.find((u) => String(u._id) === String(a.userId));
        const quiz = memoryQuizzes.find((q) => String(q._id) === String(a.quizId));
        return {
          _id: a._id,
          userName: user?.name || 'User',
          userEmail: user?.email || '',
          quizTitle: quiz?.title || 'Quiz',
          category: quiz?.category || 'General',
          score: a.score,
          total: a.total,
          percentage: a.percentage,
          passed: a.percentage >= 60,
          submittedAt: a.submittedAt,
        };
      });

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalQuizzes,
        totalQuestions,
        totalAttempts,
        recentAttempts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching admin platform statistics',
    });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAdminUsers = async (req, res) => {
  try {
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
      const usersWithAttempts = await Promise.all(
        users.map(async (u) => {
          const attemptCount = await Attempt.countDocuments({ userId: u._id });
          return {
            ...u,
            attemptsCount: attemptCount,
          };
        })
      );

      return res.json({
        success: true,
        count: usersWithAttempts.length,
        users: usersWithAttempts,
      });
    }

    // Memory Store branch
    const usersWithAttempts = memoryUsers.map((u) => {
      const { password, ...userSafe } = u;
      const count = memoryAttempts.filter(
        (a) => String(a.userId) === String(u._id)
      ).length;
      return {
        ...userSafe,
        attemptsCount: count,
      };
    });

    return res.json({
      success: true,
      count: usersWithAttempts.length,
      users: usersWithAttempts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users list',
    });
  }
};

// @desc    Create a new quiz
// @route   POST /api/admin/quizzes
// @access  Private (Admin)
export const createQuiz = async (req, res) => {
  try {
    const { title, description, category, difficulty, timeLimit } = req.body;

    if (!title || !description || !category || !timeLimit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, and time limit',
      });
    }

    const validCategories = ['Java', 'JavaScript', 'React', 'HTML', 'CSS', 'General Knowledge'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const quiz = await Quiz.create({
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty: difficulty || 'Medium',
        timeLimit: Number(timeLimit),
        createdBy: req.user._id,
      });

      return res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        quiz,
      });
    }

    // Memory Store branch
    const newQuiz = {
      _id: `mem_quiz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty: difficulty || 'Medium',
      timeLimit: Number(timeLimit),
      createdBy: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryQuizzes.unshift(newQuiz);

    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz: newQuiz,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating quiz',
    });
  }
};

// @desc    Update a quiz
// @route   PUT /api/admin/quizzes/:id
// @access  Private (Admin)
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, difficulty, timeLimit } = req.body;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const quiz = await Quiz.findById(id);
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      if (title) quiz.title = title.trim();
      if (description) quiz.description = description.trim();
      if (category) quiz.category = category;
      if (difficulty) quiz.difficulty = difficulty;
      if (timeLimit) quiz.timeLimit = Number(timeLimit);

      await quiz.save();

      return res.json({
        success: true,
        message: 'Quiz updated successfully',
        quiz,
      });
    }

    // Memory Store branch
    const quiz = memoryQuizzes.find((q) => String(q._id) === String(id));
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (title) quiz.title = title.trim();
    if (description) quiz.description = description.trim();
    if (category) quiz.category = category;
    if (difficulty) quiz.difficulty = difficulty;
    if (timeLimit) quiz.timeLimit = Number(timeLimit);
    quiz.updatedAt = new Date();

    return res.json({
      success: true,
      message: 'Quiz updated successfully',
      quiz,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating quiz',
    });
  }
};

// @desc    Delete quiz and cascading delete of linked questions
// @route   DELETE /api/admin/quizzes/:id
// @access  Private (Admin)
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const quiz = await Quiz.findById(id);
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      await Quiz.findByIdAndDelete(id);
      await Question.deleteMany({ quizId: id });
      await Attempt.deleteMany({ quizId: id });

      return res.json({
        success: true,
        message: 'Quiz and all associated questions deleted successfully',
      });
    }

    // Memory Store branch
    const quizIndex = memoryQuizzes.findIndex((q) => String(q._id) === String(id));
    if (quizIndex === -1) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    memoryQuizzes.splice(quizIndex, 1);

    // Remove questions
    for (let i = memoryQuestions.length - 1; i >= 0; i--) {
      if (String(memoryQuestions[i].quizId) === String(id)) {
        memoryQuestions.splice(i, 1);
      }
    }

    // Remove attempts
    for (let i = memoryAttempts.length - 1; i >= 0; i--) {
      if (String(memoryAttempts[i].quizId) === String(id)) {
        memoryAttempts.splice(i, 1);
      }
    }

    return res.json({
      success: true,
      message: 'Quiz and all associated questions deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting quiz',
    });
  }
};

// @desc    Get all questions for a specific quiz (includes correctIndex & explanation for admin editing)
// @route   GET /api/admin/quizzes/:id/questions
// @access  Private (Admin)
export const getAdminQuizQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const questions = await Question.find({ quizId: id }).sort({ createdAt: 1 }).lean();
      return res.json({
        success: true,
        count: questions.length,
        questions,
      });
    }

    // Memory Store branch
    const questions = memoryQuestions.filter(
      (q) => String(q.quizId) === String(id)
    );

    return res.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching quiz questions',
    });
  }
};

// @desc    Add a question to a quiz
// @route   POST /api/admin/quizzes/:id/questions
// @access  Private (Admin)
export const addQuestion = async (req, res) => {
  try {
    const { id: quizId } = req.params;
    const { text, options, correctIndex, explanation } = req.body;

    if (!text || !options || correctIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide question text, 4 options, and the correct option index',
      });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Question must have exactly 4 options',
      });
    }

    const cIndex = Number(correctIndex);
    if (isNaN(cIndex) || cIndex < 0 || cIndex > 3) {
      return res.status(400).json({
        success: false,
        message: 'Correct option index must be between 0 and 3',
      });
    }

    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      const question = await Question.create({
        quizId,
        text: text.trim(),
        options: options.map((opt) => String(opt).trim()),
        correctIndex: cIndex,
        explanation: (explanation || '').trim(),
      });

      return res.status(201).json({
        success: true,
        message: 'Question added successfully',
        question,
      });
    }

    // Memory Store branch
    const quiz = memoryQuizzes.find((q) => String(q._id) === String(quizId));
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const newQuestion = {
      _id: `mem_q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      quizId,
      text: text.trim(),
      options: options.map((opt) => String(opt).trim()),
      correctIndex: cIndex,
      explanation: (explanation || '').trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryQuestions.push(newQuestion);

    return res.status(201).json({
      success: true,
      message: 'Question added successfully',
      question: newQuestion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error adding question',
    });
  }
};

// @desc    Edit a question
// @route   PUT /api/admin/questions/:id
// @access  Private (Admin)
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, options, correctIndex, explanation } = req.body;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ success: false, message: 'Question not found' });
      }

      if (text) question.text = text.trim();
      if (options && Array.isArray(options) && options.length === 4) {
        question.options = options.map((opt) => String(opt).trim());
      }
      if (correctIndex !== undefined) {
        const cIndex = Number(correctIndex);
        if (!isNaN(cIndex) && cIndex >= 0 && cIndex <= 3) {
          question.correctIndex = cIndex;
        }
      }
      if (explanation !== undefined) {
        question.explanation = explanation.trim();
      }

      await question.save();

      return res.json({
        success: true,
        message: 'Question updated successfully',
        question,
      });
    }

    // Memory Store branch
    const question = memoryQuestions.find((q) => String(q._id) === String(id));
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (text) question.text = text.trim();
    if (options && Array.isArray(options) && options.length === 4) {
      question.options = options.map((opt) => String(opt).trim());
    }
    if (correctIndex !== undefined) {
      const cIndex = Number(correctIndex);
      if (!isNaN(cIndex) && cIndex >= 0 && cIndex <= 3) {
        question.correctIndex = cIndex;
      }
    }
    if (explanation !== undefined) {
      question.explanation = explanation.trim();
    }
    question.updatedAt = new Date();

    return res.json({
      success: true,
      message: 'Question updated successfully',
      question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating question',
    });
  }
};

// @desc    Delete a question
// @route   DELETE /api/admin/questions/:id
// @access  Private (Admin)
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ success: false, message: 'Question not found' });
      }

      await Question.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Question deleted successfully',
      });
    }

    // Memory Store branch
    const qIndex = memoryQuestions.findIndex((q) => String(q._id) === String(id));
    if (qIndex === -1) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    memoryQuestions.splice(qIndex, 1);

    return res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting question',
    });
  }
};
