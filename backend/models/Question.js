const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  image: { type: String, default: '' },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true },
  },
  correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  explanation: { type: String, default: '' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  stats: {
    timesAnswered: { type: Number, default: 0 },
    timesCorrect: { type: Number, default: 0 },
  },
}, { timestamps: true });

questionSchema.index({ subject: 1, academicYear: 1, difficulty: 1 });
questionSchema.index({ text: 'text' });

module.exports = mongoose.model('Question', questionSchema);
