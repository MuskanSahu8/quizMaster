import React from 'react';

export const CategoryBadge = ({ category, className = '' }) => {
  const getColors = (cat) => {
    switch (cat) {
      case 'Java':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'JavaScript':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'React':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'HTML':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'CSS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'General Knowledge':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getColors(
        category
      )} ${className}`}
    >
      {category}
    </span>
  );
};

export const DifficultyBadge = ({ difficulty, className = '' }) => {
  const getColors = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-blue-100 text-blue-800';
      case 'Hard':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getColors(
        difficulty
      )} ${className}`}
    >
      {difficulty}
    </span>
  );
};
