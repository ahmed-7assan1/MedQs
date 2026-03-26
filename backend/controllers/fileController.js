const File = require('../models/File');
const fs = require('fs');
const path = require('path');

const getFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = { isActive: true };
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.year) filter.academicYear = req.query.year;
    if (req.query.search) filter.$text = { $search: req.query.search };

    const [files, total] = await Promise.all([
      File.find(filter).populate('subject', 'name color').populate('academicYear', 'name year').populate('uploadedBy', 'name').skip(skip).limit(limit).sort('-createdAt'),
      File.countDocuments(filter),
    ]);
    res.json({ files, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate('subject').populate('academicYear').populate('uploadedBy', 'name');
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { title, description, subject, academicYear } = req.body;
    const file = await File.create({
      title,
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      subject,
      academicYear,
      uploadedBy: req.user._id,
    });
    await file.populate(['subject', 'academicYear']);
    res.status(201).json(file);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFile = async (req, res) => {
  try {
    const { title, description, subject, academicYear } = req.body;
    const file = await File.findByIdAndUpdate(req.params.id, { title, description, subject, academicYear }, { new: true })
      .populate('subject').populate('academicYear');
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    const filePath = path.join(__dirname, '../uploads', file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    await File.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
    const filePath = path.join(__dirname, '../uploads', file.filename);
    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFiles, getFile, uploadFile, updateFile, deleteFile, downloadFile };
