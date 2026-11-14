import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export const QuestionPalette = ({
  totalQuestions,
  currentIndex,
  answers,
  visitedQuestions,
  onSelectIndex,
}) => {
  const answeredCount = Object.keys(answers).filter(
    (key) => answers[key] !== null && answers[key] !== undefined
  ).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 className="text-sm font-bold text-slate-800">Question Palette</h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {answeredCount}/{totalQuestions} Answered
        </span>
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-5 gap-2.5 mb-5">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const isCurrent = currentIndex === index;
          const isAnswered =
            answers[index] !== null && answers[index] !== undefined;
          const isVisited = visitedQuestions.has(index);

          let buttonClasses = 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100';

          if (isAnswered) {
            buttonClasses = 'bg-emerald-500 border-emerald-500 text-white font-bold shadow-sm';
          } else if (isCurrent) {
            buttonClasses = 'bg-blue-600 border-blue-600 text-white font-bold ring-2 ring-blue-300';
          } else if (isVisited) {
            buttonClasses = 'bg-amber-50 border-amber-300 text-amber-700 font-semibold';
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectIndex(index)}
              className={`h-10 w-full rounded-xl border flex items-center justify-center text-xs transition-all focus:outline-none ${buttonClasses}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-blue-600" />
          <span>Current</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
          <span>Visited / Skipped</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
          <span>Not Visited</span>
        </div>
      </div>
    </div>
  );
};
