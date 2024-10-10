const express = require('express');
const { generateQuiz, submitQuiz, getHistory,getHint } = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/generate', authMiddleware, generateQuiz);
router.post('/submit', authMiddleware, submitQuiz);
router.get('/history', authMiddleware, getHistory);
router.get('/hint/:quizId/:questionId', authMiddleware, getHint);

module.exports = router;
