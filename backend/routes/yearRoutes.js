// yearRoutes.js
const express = require('express');
const router = express.Router();
const { getYears, createYear, updateYear, deleteYear } = require('../controllers/structureController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getYears);
router.post('/', protect, admin, createYear);
router.put('/:id', protect, admin, updateYear);
router.delete('/:id', protect, admin, deleteYear);

module.exports = router;
