const express = require('express');
const router = express.Router();
const { getFiles, getFile, uploadFile, updateFile, deleteFile, downloadFile } = require('../controllers/fileController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getFiles);
router.post('/', protect, admin, upload.single('file'), uploadFile);
router.get('/:id', protect, getFile);
router.put('/:id', protect, admin, updateFile);
router.delete('/:id', protect, admin, deleteFile);
router.get('/:id/download', protect, downloadFile);

module.exports = router;
