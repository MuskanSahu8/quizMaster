import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: [true, 'Please provide the question text'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Question must have four options'],
      validate: [
        (val) => val.length === 4,
        'Question must have exactly 4 options',
      ],
    },
    correctIndex: {
      type: Number,
      required: [true, 'Please provide the correct option index (0 to 3)'],
      min: [0, 'Option index must be between 0 and 3'],
      max: [3, 'Option index must be between 0 and 3'],
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// In-Memory store for offline fallback
export const memoryQuestions = [];

export const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
