const Question = require('../models/Question');
const User = require('../models/User');

// @desc    Get questions with filters
const getQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.year) filter.academicYear = req.query.year;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.search) filter.$text = { $search: req.query.search };

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('subject', 'name color')
        .populate('academicYear', 'name year')
        .skip(skip).limit(limit).sort('-createdAt'),
      Question.countDocuments(filter),
    ]);

    res.json({ questions, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single question
const getQuestion = async (req, res) => {
  try {
    const q = await Question.findById(req.params.id)
      .populate('subject').populate('academicYear');
    if (!q) return res.status(404).json({ message: 'Question not found' });
    res.json(q);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create question (admin)
const createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    await question.populate(['subject', 'academicYear']);
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update question (admin)
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('subject').populate('academicYear');
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete question (admin)
const deleteQuestion = async (req, res) => {
  try {
    const q = await Question.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit answers and get score
const submitAnswers = async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionId, selected }]
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    const results = answers.map(({ questionId, selected }) => {
      const q = questions.find(q => q._id.toString() === questionId);
      if (!q) return null;
      const correct = q.correctAnswer === selected;
      return { questionId, selected, correct, correctAnswer: q.correctAnswer, explanation: q.explanation };
    }).filter(Boolean);

    const score = results.filter(r => r.correct).length;
    const total = results.length;

    // Update question stats
    for (const result of results) {
      await Question.findByIdAndUpdate(result.questionId, {
        $inc: { 'stats.timesAnswered': 1, ...(result.correct ? { 'stats.timesCorrect': 1 } : {}) },
      });
    }

    // Update user progress
    const user = await User.findById(req.user._id);
    user.progress.totalAnswered += total;
    user.progress.totalCorrect += score;

    const subjectMap = {};
    for (const result of results) {
      const q = questions.find(q => q._id.toString() === result.questionId);
      if (!q) continue;
      const sid = q.subject.toString();
      if (!subjectMap[sid]) subjectMap[sid] = { answered: 0, correct: 0 };
      subjectMap[sid].answered++;
      if (result.correct) subjectMap[sid].correct++;
    }

    for (const [sid, data] of Object.entries(subjectMap)) {
      const idx = user.progress.subjectProgress.findIndex(s => s.subject.toString() === sid);
      if (idx === -1) {
        user.progress.subjectProgress.push({ subject: sid, ...data });
      } else {
        user.progress.subjectProgress[idx].answered += data.answered;
        user.progress.subjectProgress[idx].correct += data.correct;
      }
    }

    await user.save();

    res.json({ score, total, percentage: Math.round((score / total) * 100), results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion, submitAnswers };
