import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { quizApi } from '../api/api.js';
import { QuizCard } from '../components/QuizCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { Search, Filter, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Java',
  'JavaScript',
  'React',
  'HTML',
  'CSS',
  'General Knowledge',
];

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export const Quizzes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Keep searchParams in sync if changed from external navigation
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory && selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        if (selectedDifficulty && selectedDifficulty !== 'All') {
          params.difficulty = selectedDifficulty;
        }
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const res = await quizApi.getQuizzes(params);
        if (res.data.success) {
          setQuizzes(res.data.quizzes);
        }
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Browse Quizzes
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Choose a quiz topic, review the duration, and challenge your technical precision.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quizzes by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-400 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Difficulty:</span>
            </span>
            <div className="flex items-center space-x-1.5">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedDifficulty === diff
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters button if active */}
          {(selectedCategory !== 'All' ||
            selectedDifficulty !== 'All' ||
            searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Quiz Grid or Empty State */}
      {loading ? (
        <LoadingSpinner message="Loading available quizzes..." />
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz._id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No Quizzes Found
          </h3>
          <p className="text-sm text-slate-500">
            We couldn't find any quizzes matching your current filters or search query.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
