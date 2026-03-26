const User = require('../models/User');

// @desc    Get all users (admin)
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };

    const [users, total] = await Promise.all([
      User.find(filter).populate('academicYear').skip(skip).limit(limit).sort('-createdAt'),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID (admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('academicYear').select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user (admin)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, role, isActive, academicYear } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (academicYear) user.academicYear = academicYear;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile (self)
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, password } = req.body;
    if (name) user.name = name;
    if (password) user.password = password;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bookmark a question
const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const qId = req.params.questionId;
    const idx = user.bookmarks.indexOf(qId);
    if (idx === -1) user.bookmarks.push(qId);
    else user.bookmarks.splice(idx, 1);
    await user.save();
    res.json({ bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bookmarked questions
const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({ path: 'bookmarks', populate: [{ path: 'subject' }, { path: 'academicYear' }] });
    res.json(user.bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my stats / progress
const getMyStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('progress.subjectProgress.subject');
    res.json({
      totalAnswered: user.progress.totalAnswered,
      totalCorrect: user.progress.totalCorrect,
      accuracy: user.progress.totalAnswered > 0
        ? Math.round((user.progress.totalCorrect / user.progress.totalAnswered) * 100)
        : 0,
      subjectProgress: user.progress.subjectProgress,
      bookmarkCount: user.bookmarks.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, updateProfile, toggleBookmark, getBookmarks, getMyStats };
