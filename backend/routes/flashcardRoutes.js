const express = require('express');
const router = express.Router();
const { getFlashcards, getDecks, getFlashcard, createFlashcard, updateFlashcard, deleteFlashcard, reviewFlashcard } = require('../controllers/flashcardController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getFlashcards);
router.get('/decks', protect, getDecks);
router.post('/', protect, admin, createFlashcard);
router.post('/:id/review', protect, reviewFlashcard);
router.get('/:id', protect, getFlashcard);
router.put('/:id', protect, admin, updateFlashcard);
router.delete('/:id', protect, admin, deleteFlashcard);

module.exports = router;
