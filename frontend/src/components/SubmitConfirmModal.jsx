import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export const SubmitConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions,
  answeredCount,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scaleIn">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <span>Ready to Submit?</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          Once submitted, your answers will be graded by the server and you will receive your score breakdown immediately.
        </p>

        {/* Summary Pill Box */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 space-y-2 text-sm">
          <div className="flex justify-between items-center text-slate-600">
            <span>Total Questions:</span>
            <span className="font-bold text-slate-800">{totalQuestions}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-700">
            <span>Answered:</span>
            <span className="font-bold">{answeredCount}</span>
          </div>
          {unansweredCount > 0 && (
            <div className="flex justify-between items-center text-amber-700 font-medium">
              <span>Unanswered / Skipped:</span>
              <span className="font-bold">{unansweredCount}</span>
            </div>
          )}
        </div>

        {unansweredCount > 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mb-6">
            ⚠️ You have {unansweredCount} unanswered questions. Unanswered questions will receive 0 points.
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Review More
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Grading Answers...' : 'Submit Answers Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
