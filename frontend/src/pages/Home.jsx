import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizApi } from '../api/api.js';
import { QuizCard } from '../components/QuizCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import {
  Code,
  Layers,
  Sparkles,
  Clock,
  Award,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Java',
    desc: 'OOP, Collections, JVM & Multithreading',
    icon: Code,
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    name: 'JavaScript',
    desc: 'Closures, Promises, Event Loop & ES6+',
    icon: Sparkles,
    color: 'from-yellow-500 to-amber-600',
    bg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  },
  {
    name: 'React',
    desc: 'Hooks, Virtual DOM, Lifecycle & Context',
    icon: Layers,
    color: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    name: 'HTML',
    desc: 'Semantic HTML5, ARIA & Forms',
    icon: BookOpen,
    color: 'from-orange-500 to-red-600',
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    name: 'CSS',
    desc: 'Flexbox, Grid, Specificity & Responsive Design',
    icon: Award,
    color: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    name: 'General Knowledge',
    desc: 'Computing History, Protocols & Web Foundations',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

export const Home = () => {
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await quizApi.getQuizzes();
        if (res.data.success) {
          setFeaturedQuizzes(res.data.quizzes.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching featured quizzes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>MERN-Powered Timed Quiz Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight mb-6">
            Master Technical Concepts Under <span className="text-blue-600">Real Time Pressure</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Practice topic-wise multiple-choice questions on Java, JavaScript, React, HTML, CSS, and General Knowledge. Get instant server-graded scores, deep explanations, and track your mastery over time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/quizzes"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center space-x-2"
            >
              <span>Explore All Quizzes</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-300 shadow-sm transition-all text-center"
            >
              Create Free Account
            </Link>
          </div>

          {/* Quick Credibility Stats */}
          <div className="mt-14 pt-10 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div>
              <p className="text-3xl font-extrabold text-slate-900">6</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Core Tech Topics</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-blue-600">100%</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Instant Scoring</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">&lt; 30s</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Urgency Warning</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-600">Free</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Open Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Select Your Learning Domain
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Target specific programming languages and fundamentals tailored for developer job interviews and technical certifications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/quizzes?category=${encodeURIComponent(cat.name)}`}
                className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform"
                       style={{ backgroundImage: `linear-gradient(to top right, var(--tw-gradient-stops))` }}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>Browse {cat.name} Quizzes</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Simple 3-Step Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              How QuizMaster Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center mb-4 text-base">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Pick a Topic & Difficulty</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Choose from Java, JavaScript, React, HTML, CSS, or General Knowledge. Select your difficulty and review the quiz rules and countdown limit.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center mb-4 text-base">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Answer Against the Clock</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Take questions one-by-one or jump with the Question Palette. If time runs out, answers are automatically securely submitted for server grading.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center mb-4 text-base">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Review & Track Progress</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Receive instant score breakdown, examine detailed explanations for every correct and incorrect answer, and track your history and averages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Quizzes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Featured Quizzes
            </h2>
            <p className="text-sm text-slate-500">
              Popular challenges to test your understanding right now
            </p>
          </div>
          <Link
            to="/quizzes"
            className="inline-flex items-center space-x-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View all quizzes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredQuizzes.map((quiz) => (
              <QuizCard key={quiz._id} quiz={quiz} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
