import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attemptApi } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { CategoryBadge, DifficultyBadge } from '../components/Badges.jsx';
import {
  Award,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowRight,
  Filter,
  BarChart2,
} from 'lucide-react';

export const History = () => {
  const { isAuthenticated } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchHistoryAndStats = async () => {
      setLoading(true);
      try {
        const [attemptsRes, statsRes] = await Promise.all([
          attemptApi.getUserAttempts(),
          attemptApi.getUserStats(),
        ]);

        if (attemptsRes.data.success) {
          setAttempts(attemptsRes.data.attempts);
        }
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
      } catch (err) {
        console.error('Error fetching quiz history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryAndStats();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-8 text-center space-y-4">
          <Clock className="w-10 h-10 text-blue-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Sign In to View History</h2>
          <p className="text-sm text-slate-600">
            Keep track of your performance over time, review past quiz answers, and watch your scores climb.
          </p>
          <Link
            to="/login?redirect=/history"
            className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm"
          >
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading your quiz attempt records..." fullScreen />;
  }

  const filteredAttempts =
    selectedCategory === 'All'
      ? attempts
      : attempts.filter(
          (a) => a.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  const categoriesList = [
    'All',
    'Java',
    'JavaScript',
    'React',
    'HTML',
    'CSS',
    'General Knowledge',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Quiz Attempt History & Performance
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review your previous submissions, verify correct solutions, and track your topic mastery.
        </p>
      </div>

      {/* Performance Summary Cards */}
      {stats && stats.totalAttempts > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center space-x-2 text-slate-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Attempts
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">
              {stats.totalAttempts}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center space-x-2 text-blue-500 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Average Score
              </span>
            </div>
            <p className="text-3xl font-extrabold text-blue-600">
              {stats.averageScore}%
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center space-x-2 text-emerald-500 mb-2">
              <Award className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Best Score
              </span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600">
              {stats.bestScore}%
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center space-x-2 text-indigo-500 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pass Rate
              </span>
            </div>
            <p className="text-3xl font-extrabold text-indigo-600">
              {stats.passRate}%
            </p>
          </div>
        </div>
      )}

      {/* Category Breakdown Bars */}
      {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>Performance by Topic Domain</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.categoryBreakdown.map((catStat) => (
              <div
                key={catStat.category}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <CategoryBadge category={catStat.category} />
                  <span className="text-xs text-slate-400 font-medium">
                    {catStat.attemptsCount} attempt{catStat.attemptsCount > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xs text-slate-500 font-medium">Avg Score:</span>
                  <span className="text-base font-bold text-slate-800">
                    {catStat.averageScore}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${catStat.averageScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attempts Ledger / Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">
            Past Attempts Log ({filteredAttempts.length})
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredAttempts.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-6">Quiz Title</th>
                    <th className="py-3.5 px-4">Topic</th>
                    <th className="py-3.5 px-4">Difficulty</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Percentage</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAttempts.map((attempt) => {
                    const isPassed = attempt.percentage >= 60;
                    const dateFormatted = new Date(
                      attempt.submittedAt
                    ).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const minutes = Math.floor((attempt.timeTaken || 0) / 60);
                    const seconds = (attempt.timeTaken || 0) % 60;

                    return (
                      <tr
                        key={attempt._id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {attempt.quizTitle}
                        </td>
                        <td className="py-4 px-4">
                          <CategoryBadge category={attempt.category} />
                        </td>
                        <td className="py-4 px-4">
                          <DifficultyBadge difficulty={attempt.difficulty} />
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-800">
                          {attempt.score}/{attempt.total}
                        </td>
                        <td className="py-4 px-4 font-bold">
                          <span
                            className={
                              isPassed ? 'text-emerald-600' : 'text-rose-600'
                            }
                          >
                            {attempt.percentage}%
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              isPassed
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {isPassed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                          {minutes}m {seconds}s
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500">
                          {dateFormatted}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            to={`/result/${attempt._id}`}
                            className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            <span>Review</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No Attempts Yet
            </h3>
            <p className="text-xs text-slate-500">
              You haven't attempted any quizzes in this category. Complete a quiz to view your historical scores here!
            </p>
            <Link
              to="/quizzes"
              className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white"
            >
              Start a Quiz
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
