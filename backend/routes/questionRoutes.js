const express = require('express');
const router = express.Router();
const { getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion, submitAnswers } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getQuestions);
router.post('/', protect, admin, createQuestion);
router.post('/submit', protect, submitAnswers);
router.get('/:id', protect, getQuestion);
router.put('/:id', protect, admin, updateQuestion);
router.delete('/:id', protect, admin, deleteQuestion);

module.exports = router;
