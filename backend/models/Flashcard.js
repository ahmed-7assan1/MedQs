const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  front: { type: String, required: true },
  back: { type: String, required: true },
  deck: { type: String, required: true, trim: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

flashcardSchema.index({ subject: 1, academicYear: 1, deck: 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
