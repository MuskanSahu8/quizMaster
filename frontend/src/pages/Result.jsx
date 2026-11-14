import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { attemptApi } from '../api/api.js';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { CategoryBadge, DifficultyBadge } from '../components/Badges.jsx';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const Result = () => {
  const { attemptId } = useParams();
  const location = useLocation();

  const [attempt, setAttempt] = useState(location.state?.attempt || null);
  const [review, setReview] = useState(location.state?.review || null);
  const [loading, setLoading] = useState(!attempt);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If not passed in router state, fetch from server
    if (!attempt && attemptId) {
      const fetchAttempt = async () => {
        setLoading(true);
        try {
          const res = await attemptApi.getAttemptById(attemptId);
          if (res.data.success) {
            setAttempt(res.data.attempt);
            setReview(res.data.review);
          } else {
            setError(res.data.message || 'Attempt not found');
          }
        } catch (err) {
          setError(
            err.response?.data?.message || 'Error loading attempt details'
          );
        } finally {
          setLoading(false);
        }
      };
      fetchAttempt();
    }
  }, [attemptId, attempt]);

  // Confetti celebration if passed
  useEffect(() => {
    if (attempt?.passed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [attempt]);

  if (loading) {
    return <LoadingSpinner message="Calculating your final score..." fullScreen />;
  }

  if (error || !attempt) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-8 text-center space-y-4">
          <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Result Not Found</h3>
          <p className="text-sm text-slate-500">{error || 'Could not load quiz score.'}</p>
          <Link
            to="/quizzes"
            className="inline-block px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold"
          >
            Browse Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const passed = attempt.passed ?? attempt.percentage >= 60;
  const minutes = Math.floor((attempt.timeTaken || 0) / 60);
  const seconds = (attempt.timeTaken || 0) % 60;
  const timeTakenFormatted = `${minutes}m ${seconds}s`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Score Summary Banner */}
      <div
        className={`rounded-3xl border p-8 md:p-10 shadow-sm transition-all ${
          passed
            ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-emerald-200'
            : 'bg-gradient-to-br from-rose-50 via-white to-rose-50/40 border-rose-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  passed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {passed ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quiz Passed</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Needs Improvement</span>
                  </>
                )}
              </span>
              <CategoryBadge category={attempt.category} />
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {attempt.quizTitle}
            </h1>

            <p className="text-sm text-slate-600 max-w-md">
              {passed
                ? 'Outstanding performance! You met and exceeded the 60% mastery threshold.'
                : 'Good attempt! Review the explanations below to strengthen key concepts and try again.'}
            </p>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
            <div className="text-center px-3 border-r border-slate-100">
              <p className="text-xs text-slate-400 font-medium">Score</p>
              <p className="text-2xl font-black text-slate-900">
                {attempt.score}/{attempt.total}
              </p>
            </div>
            <div className="text-center px-3 border-r border-slate-100">
              <p className="text-xs text-slate-400 font-medium">Percentage</p>
              <p
                className={`text-2xl font-black ${
                  passed ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {attempt.percentage}%
              </p>
            </div>
            <div className="text-center px-3">
              <p className="text-xs text-slate-400 font-medium">Time Taken</p>
              <p className="text-lg font-bold text-slate-700">
                {timeTakenFormatted}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-200/70 flex flex-wrap items-center gap-3">
          <Link
            to={`/quiz/${attempt.quizId}`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Quiz</span>
          </Link>
          <Link
            to="/history"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>View Full History</span>
          </Link>
          <Link
            to="/quizzes"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:text-slate-900 ml-auto"
          >
            <span>Explore Other Quizzes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Question-by-Question Detailed Review */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Detailed Answers & Explanations Review
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {review?.length || 0} Questions Evaluated
          </span>
        </div>

        <div className="space-y-6">
          {(review || []).map((item, idx) => {
            const isCorrect = item.isCorrect;
            const isUnanswered =
              item.userSelected === null || item.userSelected === undefined;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                {/* Header status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Question {idx + 1}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {isCorrect ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>{isUnanswered ? 'Unanswered' : 'Incorrect'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {item.text}
                </h3>

                {/* Options Breakdown */}
                <div className="space-y-2 pt-2">
                  {item.options.map((optText, optIdx) => {
                    const isUserChoice = item.userSelected === optIdx;
                    const isRightChoice = item.correctIndex === optIdx;
                    const letter = OPTION_LETTERS[optIdx];

                    let containerStyle = 'border-slate-200 bg-slate-50/50 text-slate-600';
                    let badgeStyle = 'bg-slate-200 text-slate-700';

                    if (isRightChoice) {
                      containerStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium ring-1 ring-emerald-400';
                      badgeStyle = 'bg-emerald-600 text-white';
                    } else if (isUserChoice && !isRightChoice) {
                      containerStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-medium';
                      badgeStyle = 'bg-rose-600 text-white';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center p-3 rounded-xl border text-sm transition-all ${containerStyle}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold mr-3 shrink-0 ${badgeStyle}`}
                        >
                          {letter}
                        </div>
                        <span className="grow">{optText}</span>
                        {isRightChoice && (
                          <span className="text-xs font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-100/80 ml-2">
                            Correct Answer
                          </span>
                        )}
                        {isUserChoice && !isRightChoice && (
                          <span className="text-xs font-bold text-rose-700 px-2 py-0.5 rounded bg-rose-100/80 ml-2">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {item.explanation && (
                  <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-200/70 text-xs text-blue-950 leading-relaxed mt-3">
                    <span className="font-bold block text-blue-800 mb-1">
                      💡 Explanation:
                    </span>
                    {item.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
