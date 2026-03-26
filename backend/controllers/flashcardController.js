const Flashcard = require('../models/Flashcard');
const User = require('../models/User');

const getFlashcards = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = { isActive: true };
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.year) filter.academicYear = req.query.year;
    if (req.query.deck) filter.deck = req.query.deck;

    const [flashcards, total] = await Promise.all([
      Flashcard.find(filter).populate('subject', 'name color').populate('academicYear', 'name year').skip(skip).limit(limit),
      Flashcard.countDocuments(filter),
    ]);
    res.json({ flashcards, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDecks = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.year) filter.academicYear = req.query.year;
    const decks = await Flashcard.aggregate([
      { $match: filter },
      { $group: { _id: { deck: '$deck', subject: '$subject', academicYear: '$academicYear' }, count: { $sum: 1 } } },
      { $lookup: { from: 'subjects', localField: '_id.subject', foreignField: '_id', as: 'subject' } },
      { $lookup: { from: 'academicyears', localField: '_id.academicYear', foreignField: '_id', as: 'academicYear' } },
      { $unwind: { path: '$subject', preserveNullAndEmpty: true } },
      { $unwind: { path: '$academicYear', preserveNullAndEmpty: true } },
    ]);
    res.json(decks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFlashcard = async (req, res) => {
  try {
    const fc = await Flashcard.findById(req.params.id).populate('subject').populate('academicYear');
    if (!fc) return res.status(404).json({ message: 'Flashcard not found' });
    res.json(fc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFlashcard = async (req, res) => {
  try {
    const fc = await Flashcard.create(req.body);
    await fc.populate(['subject', 'academicYear']);
    res.status(201).json(fc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFlashcard = async (req, res) => {
  try {
    const fc = await Flashcard.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('subject').populate('academicYear');
    if (!fc) return res.status(404).json({ message: 'Flashcard not found' });
    res.json(fc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFlashcard = async (req, res) => {
  try {
    const fc = await Flashcard.findByIdAndDelete(req.params.id);
    if (!fc) return res.status(404).json({ message: 'Flashcard not found' });
    res.json({ message: 'Flashcard deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Spaced repetition review update
const reviewFlashcard = async (req, res) => {
  try {
    const { known } = req.body;
    const user = await User.findById(req.user._id);
    const idx = user.flashcardProgress.findIndex(fp => fp.flashcard.toString() === req.params.id);

    let fp;
    if (idx === -1) {
      fp = { flashcard: req.params.id, known, interval: 1, ease: 2.5, nextReview: new Date() };
      user.flashcardProgress.push(fp);
    } else {
      fp = user.flashcardProgress[idx];
      fp.known = known;
      if (known) {
        fp.interval = Math.round(fp.interval * fp.ease);
        fp.ease = Math.min(fp.ease + 0.1, 3.0);
      } else {
        fp.interval = 1;
        fp.ease = Math.max(fp.ease - 0.2, 1.3);
      }
      fp.nextReview = new Date(Date.now() + fp.interval * 24 * 60 * 60 * 1000);
    }

    await user.save();
    res.json({ message: 'Progress updated', nextReview: fp.nextReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFlashcards, getDecks, getFlashcard, createFlashcard, updateFlashcard, deleteFlashcard, reviewFlashcard };
