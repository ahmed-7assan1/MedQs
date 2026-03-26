const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/structureController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getSubjects);
router.post('/', protect, admin, createSubject);
router.put('/:id', protect, admin, updateSubject);
router.delete('/:id', protect, admin, deleteSubject);

module.exports = router;
