const mongoose = require('mongoose');
const SubmissionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [
    { questionId: String, userResponse: String }
  ],
  score: Number,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Submission', SubmissionSchema);
