import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a quiz title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a quiz description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a quiz category'],
      enum: ['Java', 'JavaScript', 'React', 'HTML', 'CSS', 'General Knowledge'],
    },
    difficulty: {
      type: String,
      required: [true, 'Please provide difficulty level'],
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    timeLimit: {
      type: Number,
      required: [true, 'Please provide time limit in minutes'],
      min: [1, 'Time limit must be at least 1 minute'],
      default: 10,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// In-Memory store for offline fallback
export const memoryQuizzes = [];

export const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
