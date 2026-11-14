import React, { useEffect, useState } from 'react';
import { adminApi, quizApi } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { CategoryBadge, DifficultyBadge } from '../components/Badges.jsx';
import {
  Shield,
  Users,
  BookOpen,
  HelpCircle,
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  X,
  Layers,
} from 'lucide-react';

const CATEGORIES = [
  'Java',
  'JavaScript',
  'React',
  'HTML',
  'CSS',
  'General Knowledge',
];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'quizzes' | 'users'
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quiz Modal state
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    category: 'JavaScript',
    difficulty: 'Medium',
    timeLimit: 10,
  });

  // Question Manager state
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    text: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
  });

  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Load all admin data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, quizzesRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        quizApi.getQuizzes(),
        adminApi.getUsers(),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (quizzesRes.data.success) setQuizzes(quizzesRes.data.quizzes);
      if (usersRes.data.success) setUsersList(usersRes.data.users);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load dashboard data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Quiz CRUD
  const handleOpenCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({
      title: '',
      description: '',
      category: 'JavaScript',
      difficulty: 'Medium',
      timeLimit: 10,
    });
    setQuizModalOpen(true);
  };

  const handleOpenEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
    });
    setQuizModalOpen(true);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    try {
      if (editingQuiz) {
        await adminApi.updateQuiz(editingQuiz._id, quizForm);
        setFeedback({ type: 'success', message: 'Quiz updated successfully!' });
      } else {
        await adminApi.createQuiz(quizForm);
        setFeedback({ type: 'success', message: 'New quiz created successfully!' });
      }
      setQuizModalOpen(false);
      loadAdminData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save quiz',
      });
    }
  };

  const handleDeleteQuiz = async (quizId, title) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${title}" and all its questions?`
      )
    ) {
      return;
    }
    try {
      await adminApi.deleteQuiz(quizId);
      setFeedback({
        type: 'success',
        message: `Quiz "${title}" deleted successfully.`,
      });
      loadAdminData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete quiz',
      });
    }
  };

  // Question Management
  const handleOpenQuestionManager = async (quiz) => {
    setSelectedQuizForQuestions(quiz);
    try {
      const res = await adminApi.getQuizQuestions(quiz._id);
      if (res.data.success) {
        setQuizQuestions(res.data.questions);
      }
    } catch (err) {
      console.error('Error fetching quiz questions:', err);
    }
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
    });
    setQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      text: q.text,
      options: [...q.options],
      correctIndex: q.correctIndex,
      explanation: q.explanation || '',
    });
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuizForQuestions) return;

    try {
      if (editingQuestion) {
        await adminApi.updateQuestion(editingQuestion._id, questionForm);
        setFeedback({
          type: 'success',
          message: 'Question updated successfully!',
        });
      } else {
        await adminApi.addQuestion(selectedQuizForQuestions._id, questionForm);
        setFeedback({
          type: 'success',
          message: 'New question added successfully!',
        });
      }
      setQuestionModalOpen(false);
      // Reload questions for this quiz
      const res = await adminApi.getQuizQuestions(selectedQuizForQuestions._id);
      if (res.data.success) {
        setQuizQuestions(res.data.questions);
      }
      loadAdminData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save question',
      });
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question from the quiz?')) return;
    try {
      await adminApi.deleteQuestion(qId);
      setFeedback({ type: 'success', message: 'Question deleted successfully.' });
      const res = await adminApi.getQuizQuestions(selectedQuizForQuestions._id);
      if (res.data.success) {
        setQuizQuestions(res.data.questions);
      }
      loadAdminData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete question',
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-rose-200 max-w-md w-full p-8 text-center space-y-4">
          <Shield className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">403 Forbidden</h2>
          <p className="text-sm text-slate-600">
            You do not possess Administrator clearance to view this management console.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading Admin Dashboard..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </span>
            <span className="text-xs text-slate-400">Authenticated: {user?.email}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Quiz Content & Operations Management
          </h1>
        </div>

        <button
          onClick={handleOpenCreateQuiz}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Users
            </span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {stats?.totalUsers || 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Active Quizzes
            </span>
            <BookOpen className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {stats?.totalQuizzes || 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Questions
            </span>
            <HelpCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {stats?.totalQuestions || 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Attempts
            </span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {stats?.totalAttempts || 0}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Recent Attempts
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'quizzes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Quiz Inventory & Questions ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Registered Users ({usersList.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & RECENT ATTEMPTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Recent Attempt Ledger</h3>
              <span className="text-xs text-slate-400">Latest platform activity</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-6">Learner</th>
                    <th className="py-3 px-4">Quiz</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Outcome</th>
                    <th className="py-3 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(stats?.recentAttempts || []).map((att) => (
                    <tr key={att._id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-6 font-medium text-slate-900">
                        {att.userName}
                        <span className="block text-xs text-slate-400">
                          {att.userEmail}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {att.quizTitle}
                      </td>
                      <td className="py-3.5 px-4">
                        <CategoryBadge category={att.category} />
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {att.score}/{att.total}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {att.percentage}%
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            att.passed
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {att.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-500">
                        {new Date(att.submittedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUIZZES MANAGEMENT */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-6">Quiz Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Difficulty</th>
                    <th className="py-3.5 px-4">Questions</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {quizzes.map((quiz) => (
                    <tr key={quiz._id} className="hover:bg-slate-50/80">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {quiz.title}
                        <span className="block text-xs text-slate-400 font-normal line-clamp-1">
                          {quiz.description}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <CategoryBadge category={quiz.category} />
                      </td>
                      <td className="py-4 px-4">
                        <DifficultyBadge difficulty={quiz.difficulty} />
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800">
                        {quiz.questionCount || 0}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 font-medium">
                        {quiz.timeLimit} mins
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenQuestionManager(quiz)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Questions ({quiz.questionCount || 0})
                        </button>
                        <button
                          onClick={() => handleOpenEditQuiz(quiz)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REGISTERED USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-6">User Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Attempts Count</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {u.name}
                    </td>
                    <td className="py-4 px-4 text-slate-600">{u.email}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                          u.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {u.attemptsCount || 0}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT QUIZ */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-lg text-slate-900">
                {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
              </h3>
              <button
                onClick={() => setQuizModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React.js Component Architecture"
                  value={quizForm.title}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief description of skills tested..."
                  value={quizForm.description}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={quizForm.category}
                    onChange={(e) =>
                      setQuizForm({ ...quizForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={quizForm.difficulty}
                    onChange={(e) =>
                      setQuizForm({ ...quizForm, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time Limit (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  required
                  value={quizForm.timeLimit}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, timeLimit: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setQuizModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  {editingQuiz ? 'Save Updates' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUESTION MANAGER MODAL / DRAWER */}
      {selectedQuizForQuestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 animate-scaleIn">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Question Bank Manager
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedQuizForQuestions.title}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleOpenAddQuestion}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
                <button
                  onClick={() => setSelectedQuizForQuestions(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="p-6 overflow-y-auto space-y-4 grow">
              {quizQuestions.length > 0 ? (
                quizQuestions.map((q, idx) => (
                  <div
                    key={q._id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        Question #{idx + 1}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditQuestion(q)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="p-1 text-rose-500 hover:text-rose-700 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {q.text}
                    </h4>

                    {/* Options Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border ${
                            oIdx === q.correctIndex
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="font-bold mr-1.5">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span>{opt}</span>
                          {oIdx === q.correctIndex && (
                            <span className="ml-1 text-[10px] text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                        <span className="font-semibold text-blue-800">
                          Explanation:
                        </span>{' '}
                        {q.explanation}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No questions in this quiz yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT QUESTION */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button
                onClick={() => setQuestionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question Text
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter the question text here..."
                  value={questionForm.text}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, text: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Four Options (Select radio for correct answer)
                </label>
                {questionForm.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correctIndex"
                      checked={questionForm.correctIndex === oIdx}
                      onChange={() =>
                        setQuestionForm({ ...questionForm, correctIndex: oIdx })
                      }
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-500 w-4">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[oIdx] = e.target.value;
                        setQuestionForm({
                          ...questionForm,
                          options: newOptions,
                        });
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Explanation (Shown to learner on results screen)
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why the correct answer is right..."
                  value={questionForm.explanation}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      explanation: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
