const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, updateProfile, toggleBookmark, getBookmarks, getMyStats } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getUsers);
router.get('/me/stats', protect, getMyStats);
router.get('/me/bookmarks', protect, getBookmarks);
router.put('/me/profile', protect, updateProfile);
router.post('/me/bookmarks/:questionId', protect, toggleBookmark);
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
