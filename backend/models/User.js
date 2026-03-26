const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  progress: {
    totalAnswered: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    subjectProgress: [{
      subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
      answered: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
    }],
  },
  flashcardProgress: [{
    flashcard: { type: mongoose.Schema.Types.ObjectId, ref: 'Flashcard' },
    known: { type: Boolean, default: false },
    nextReview: { type: Date, default: Date.now },
    interval: { type: Number, default: 1 },
    ease: { type: Number, default: 2.5 },
  }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
