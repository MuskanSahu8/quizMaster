import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, HelpCircle, ArrowRight } from 'lucide-react';
import { CategoryBadge, DifficultyBadge } from './Badges.jsx';

export const QuizCard = ({ quiz }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between p-6 hover:-translate-y-1">
      <div>
        <div className="flex items-center justify-between mb-3">
          <CategoryBadge category={quiz.category} />
          <DifficultyBadge difficulty={quiz.difficulty} />
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
          {quiz.title}
        </h3>

        <p className="text-sm text-slate-500 line-clamp-2 mb-6">
          {quiz.description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{quiz.questionCount || 5} Questions</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{quiz.timeLimit} Mins</span>
          </div>
        </div>

        <Link
          to={`/quiz/${quiz._id}`}
          className="inline-flex items-center space-x-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          <span>Start</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
