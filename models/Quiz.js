const mongoose = require('mongoose');
const QuizSchema = new mongoose.Schema({
  gradeLevel: Number,
  subject: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: [
    {
      question: String,
      options: [String],
      hints: [String],
      answer: String,
      points:Number,

    }
  ],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Quiz', QuizSchema);
