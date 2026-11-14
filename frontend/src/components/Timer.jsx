import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export const Timer = ({ totalSeconds, onTimeUp }) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = secondsLeft <= 30;
  const percentage = (secondsLeft / totalSeconds) * 100;

  return (
    <div
      className={`flex items-center space-x-2.5 px-4 py-2 rounded-xl border transition-all ${
        isUrgent
          ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse shadow-sm shadow-rose-200'
          : 'bg-white border-slate-200 text-slate-700 shadow-sm'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
      ) : (
        <Clock className="w-4 h-4 text-blue-600" />
      )}
      <div className="flex flex-col">
        <div className="flex items-center space-x-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Time Left:
          </span>
          <span className="font-mono text-base font-bold tracking-tight">
            {formattedTime}
          </span>
        </div>
        {/* Subtle timer progress bar */}
        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
          <div
            className={`h-full transition-all duration-1000 ${
              isUrgent ? 'bg-rose-500' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.max(0, percentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
