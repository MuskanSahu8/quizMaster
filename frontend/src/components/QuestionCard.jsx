import React from 'react';
import { Check } from 'lucide-react';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      {/* Question Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="text-xs text-slate-400 font-medium">Single Choice</span>
      </div>

      {/* Question Text */}
      <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug mb-8">
        {question.text}
      </h2>

      {/* Options List */}
      <div className="space-y-3">
        {question.options.map((optionText, idx) => {
          const isSelected = selectedOption === idx;
          const letter = OPTION_LETTERS[idx] || `${idx + 1}`;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectOption(idx)}
              className={`w-full flex items-center text-left p-4 rounded-xl border-2 transition-all duration-150 min-h-[52px] group focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-medium shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
              }`}
            >
              {/* Option Letter Pill */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs mr-3.5 transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                }`}
              >
                {isSelected ? <Check className="w-4 h-4" /> : letter}
              </div>

              {/* Option Text */}
              <span className="text-sm md:text-base leading-relaxed grow">
                {optionText}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
