import React from 'react';
import { Award, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Award className="w-5 h-5" />
              </div>
              <span>Quiz<span className="text-blue-500">Master</span></span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              QuizMaster is a full-stack MERN quiz platform designed for self-learners, job seekers, and developers to test technical concepts under real countdown pressure.
            </p>
            <p className="text-xs text-slate-500">
              Built by <span className="text-slate-300 font-medium">muskan</span> · 2026
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Quiz Topics
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/quizzes?category=Java" className="hover:text-white transition-colors">
                  Java Core & OOP
                </Link>
              </li>
              <li>
                <Link to="/quizzes?category=JavaScript" className="hover:text-white transition-colors">
                  JavaScript & ES6+
                </Link>
              </li>
              <li>
                <Link to="/quizzes?category=React" className="hover:text-white transition-colors">
                  React.js Architecture
                </Link>
              </li>
              <li>
                <Link to="/quizzes?category=HTML" className="hover:text-white transition-colors">
                  HTML5 & Accessibility
                </Link>
              </li>
              <li>
                <Link to="/quizzes?category=CSS" className="hover:text-white transition-colors">
                  CSS3 Flexbox & Grid
                </Link>
              </li>
              <li>
                <Link to="/quizzes?category=General%20Knowledge" className="hover:text-white transition-colors">
                  General Tech Knowledge
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/quizzes" className="hover:text-white transition-colors">
                  All Quizzes
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-white transition-colors">
                  My History
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Account Settings
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Log In / Demo
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-3 sm:space-y-0">
          <p>© 2026 QuizMaster. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Powered by MongoDB, Express, React & Node.js</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
