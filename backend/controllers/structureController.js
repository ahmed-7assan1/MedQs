const AcademicYear = require('../models/AcademicYear');
const Subject = require('../models/Subject');

// --- Academic Year Controllers ---
const getYears = async (req, res) => {
  try {
    const years = await AcademicYear.find({ isActive: true }).sort('year');
    res.json(years);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createYear = async (req, res) => {
  try {
    const year = await AcademicYear.create(req.body);
    res.status(201).json(year);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateYear = async (req, res) => {
  try {
    const year = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!year) return res.status(404).json({ message: 'Year not found' });
    res.json(year);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteYear = async (req, res) => {
  try {
    await AcademicYear.findByIdAndDelete(req.params.id);
    res.json({ message: 'Year deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Subject Controllers ---
const getSubjects = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.year) filter.academicYear = req.query.year;
    const subjects = await Subject.find(filter).populate('academicYear', 'name year').sort('name');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    await subject.populate('academicYear');
    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('academicYear');
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getYears, createYear, updateYear, deleteYear, getSubjects, createSubject, updateSubject, deleteSubject };
