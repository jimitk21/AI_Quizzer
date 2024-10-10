const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const generateQuizAI = require('../utils/generateQuizAI');

// Generate a new quiz
exports.generateQuiz = async (req, res) => {
  try {
    const { grade, subject, totalQuestions, maxScore, difficulty } = req.body;
    const quizData = await generateQuizAI(grade, subject, totalQuestions, maxScore, difficulty);

    const quiz = new Quiz({
      grade,
      subject,
      totalQuestions,
      maxScore,
      difficulty,
      createdBy: req.user.id,
      questions: quizData.questions
    });

    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate quiz', error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    // Extracting quizId and user responses from the request body
    const { quizId, responses } = req.body;

    // Fetch the corresponding quiz from the database
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Assuming quiz contains questions array with correct answers
    let score = 0;
    // Iterate over each response and calculate the score
    responses.forEach(response => {
      const question = quiz.questions.find(q => String(q._id) === String(response.questionId));

      if (question) {
        if (question.answer === response.userResponse) {
          score += question.points || 1; // assuming each question has a points field
        }
      }
    });

    // Save the submission and score in the quiz history or user profile (depending on design)
    const submission = {
      quizId,
      answers: responses,
      score,
      userId: req.user.id,
      submittedAt: new Date()
    };

    // Save submission in the database (create a Submission model or add to user history)
    // Assuming there is a model for storing quiz submissions
    await new Submission(submission).save();

    // Return the calculated score and the submission object as the response
    res.json({ score, submission });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit quiz", error: error.message });
  }
};


// Get quiz history
exports.getHistory = async (req, res) => {
  try {
    const { from, to, grade, subject, marks, completedDate } = req.query;
    let matchStage = {};

    // Add filters for grade, subject, and marks if they exist
    if (grade) matchStage.grade = grade;
    if (subject) matchStage['quizInfo.subject'] = subject; // assuming subject field exists in quizInfo after lookup
    if (marks) matchStage.score = parseInt(marks, 10);

    // Add filter for completedDate or a date range if provided
    if (from || to) {
      matchStage.createdAt = {}; // Initialize as an empty object first
      if (from) matchStage.createdAt.$gte = new Date(from); // greater than or equal to 'from' date
      if (to) matchStage.createdAt.$lte = new Date(to);     // less than or equal to 'to' date
    } else if (completedDate) {
      matchStage.createdAt = new Date(completedDate); // exact match for a specific date
    }
    const submissions = await Submission.aggregate([
      {
        $lookup: {
          from: 'quizzes',        // Name of the collection to join (adjust this if necessary)
          localField: 'quizId',   // Field in Submission collection
          foreignField: '_id',    // Field in Quiz collection
          as: 'quizInfo'          // Resulting field with quiz info
        }
      },
      { $unwind: '$quizInfo' },   // Unwind the resulting array from the lookup to handle quizInfo correctly
      { $match: matchStage },     // Apply filters from query parameters
      {
        $project: {
          _id: 1,
          score: 1,
          completedDate: 1,
          grade: 1,
          quizInfo: {
            _id: 1,
            subject: 1,
            questions: 1,
            createdBy: 1,
            createdAt: 1
          }
        }
      }
    ]);

    res.json(submissions);
  } catch (error) {
    console.error('Error retrieving quiz history:', error);
    res.status(500).json({ error: 'Server error retrieving quiz history.' });
  }
};

exports.getHint = async (req, res) => {
  const quizId = req.params.quizId;
  const questionId = req.params.questionId;

  try {
    const quiz = await Quiz.findById(quizId).exec();
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    const question = quiz.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    return res.json({ hints: question.hints });
  } catch (error) {
    console.error('Error retrieving hint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


