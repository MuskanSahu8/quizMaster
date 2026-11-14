import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizApi } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Timer } from '../components/Timer.jsx';
import { QuestionCard } from '../components/QuestionCard.jsx';
import { QuestionPalette } from '../components/QuestionPalette.jsx';
import { SubmitConfirmModal } from '../components/SubmitConfirmModal.jsx';
import { CategoryBadge, DifficultyBadge } from '../components/Badges.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import {
  Clock,
  HelpCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Flag,
} from 'lucide-react';

export const QuizPlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quiz state
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [index]: selectedIndex }
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  const [startTime, setStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Fetch quiz details and questions
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await quizApi.getQuizById(id);
        if (res.data.success) {
          setQuiz(res.data.quiz);
          setQuestions(res.data.questions);
        } else {
          setError(res.data.message || 'Failed to load quiz');
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Error loading quiz. Please make sure the backend is active.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [id, isAuthenticated]);

  const handleStartQuiz = () => {
    setHasStarted(true);
    setStartTime(Date.now());
  };

  const handleSelectOption = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleClearAnswer = () => {
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentIndex];
      return updated;
    });
  };

  const handleNavigateIndex = (newIndex) => {
    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentIndex(newIndex);
      setVisitedQuestions((prev) => new Set([...prev, newIndex]));
    }
  };

  // Submit Handler
  const handleSubmitQuiz = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setConfirmModalOpen(false);

    try {
      const timeTakenSeconds = startTime
        ? Math.round((Date.now() - startTime) / 1000)
        : (quiz?.timeLimit || 10) * 60;

      // Transform answers dictionary to backend expected array: [{ questionId, selectedIndex }]
      const answersPayload = questions.map((q, idx) => ({
        questionId: q._id,
        selectedIndex: answers[idx] !== undefined ? answers[idx] : null,
      }));

      const res = await quizApi.submitQuiz(id, {
        answers: answersPayload,
        timeTaken: timeTakenSeconds,
      });

      if (res.data.success) {
        // Navigate to result page with attempt and review data
        navigate(`/result/${res.data.attempt._id}`, {
          state: {
            attempt: res.data.attempt,
            review: res.data.review,
          },
        });
      }
    } catch (err) {
      console.error('Quiz submit failed:', err);
      alert(
        err.response?.data?.message ||
          'Failed to submit answers. Please check your network connection.'
      );
      setIsSubmitting(false);
    }
  }, [id, answers, questions, startTime, quiz, isSubmitting, navigate]);

  // Auth Guard
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Login Required</h2>
          <p className="text-sm text-slate-600">
            You must be logged in to start and submit this timed quiz so your results can be recorded in your history.
          </p>
          <div className="pt-2 flex flex-col space-y-2">
            <Link
              to={`/login?redirect=/quiz/${id}`}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm"
            >
              Log In to Continue
            </Link>
            <Link
              to={`/register?redirect=/quiz/${id}`}
              className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Preparing your quiz session..." fullScreen />;
  }

  if (error || !quiz) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Quiz Unavailable</h3>
          <p className="text-sm text-slate-600">{error || 'Quiz not found'}</p>
          <Link
            to="/quizzes"
            className="inline-block px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-800"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  // Pre-Quiz Briefing & Instructions Screen
  if (!hasStarted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2">
            <CategoryBadge category={quiz.category} />
            <DifficultyBadge difficulty={quiz.difficulty} />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {quiz.title}
          </h1>

          <p className="text-slate-600 text-base leading-relaxed">
            {quiz.description}
          </p>

          {/* Rules Banner */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Quiz Rules & Format
            </h3>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>
                <span className="font-semibold text-slate-800">Total Questions:</span>{' '}
                {questions.length} multiple-choice questions
              </li>
              <li>
                <span className="font-semibold text-slate-800">Time Limit:</span>{' '}
                {quiz.timeLimit} minutes ({quiz.timeLimit * 60} seconds)
              </li>
              <li>
                <span className="font-semibold text-slate-800">Auto-Submit:</span>{' '}
                When the countdown reaches 00:00, answers will be submitted automatically.
              </li>
              <li>
                <span className="font-semibold text-slate-800">Navigation:</span>{' '}
                You can freely move back and forth, modify your answers, or use the Question Palette to jump directly.
              </li>
              <li>
                <span className="font-semibold text-slate-800">Passing Grade:</span>{' '}
                60% or higher is considered passing.
              </li>
            </ul>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/quizzes"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Cancel and Return
            </Link>

            <button
              onClick={handleStartQuiz}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
            >
              Start Quiz Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== null
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar with Quiz Title & Countdown Timer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <CategoryBadge category={quiz.category} />
            <DifficultyBadge difficulty={quiz.difficulty} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 line-clamp-1">
            {quiz.title}
          </h1>
        </div>

        {/* Live Countdown Timer */}
        <div className="flex items-center space-x-3 shrink-0">
          <Timer
            totalSeconds={quiz.timeLimit * 60}
            onTimeUp={handleSubmitQuiz}
          />
          <button
            type="button"
            onClick={() => setConfirmModalOpen(true)}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Quiz</span>
          </button>
        </div>
      </div>

      {/* Main Play Grid: Question on left, Palette on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              selectedOption={answers[currentIndex]}
              onSelectOption={handleSelectOption}
            />
          )}

          {/* Navigation Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleNavigateIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {answers[currentIndex] !== undefined && (
              <button
                type="button"
                onClick={handleClearAnswer}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear choice
              </button>
            )}

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => handleNavigateIndex(currentIndex + 1)}
                className="flex items-center space-x-1 px-5 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                className="flex items-center space-x-1 px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                <span>Review & Submit</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="space-y-6">
          <QuestionPalette
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            answers={answers}
            visitedQuestions={visitedQuestions}
            onSelectIndex={handleNavigateIndex}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleSubmitQuiz}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
