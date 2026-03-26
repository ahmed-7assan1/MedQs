require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AcademicYear = require('../models/AcademicYear');
const Subject = require('../models/Subject');
const Question = require('../models/Question');
const Flashcard = require('../models/Flashcard');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), AcademicYear.deleteMany(), Subject.deleteMany(), Question.deleteMany(), Flashcard.deleteMany()]);

  // Create academic years
  const years = await AcademicYear.insertMany([
    { name: 'First Year', year: 1, description: 'Basic medical sciences' },
    { name: 'Second Year', year: 2, description: 'Pre-clinical sciences' },
    { name: 'Third Year', year: 3, description: 'Clinical sciences' },
  ]);

  // Create subjects
  const subjects = await Subject.insertMany([
    { name: 'Anatomy', academicYear: years[0]._id, color: '#EF4444', icon: '🦴' },
    { name: 'Physiology', academicYear: years[0]._id, color: '#F97316', icon: '💓' },
    { name: 'Biochemistry', academicYear: years[0]._id, color: '#EAB308', icon: '🧪' },
    { name: 'Pathology', academicYear: years[1]._id, color: '#8B5CF6', icon: '🔬' },
    { name: 'Pharmacology', academicYear: years[1]._id, color: '#06B6D4', icon: '💊' },
    { name: 'Internal Medicine', academicYear: years[2]._id, color: '#10B981', icon: '🏥' },
  ]);

  // Create admin user
  await User.create({
    name: 'Admin User',
    email: 'admin@medibank.com',
    password: 'admin123',
    role: 'admin',
  });

  // Create student user
  await User.create({
    name: 'Student Demo',
    email: 'student@medibank.com',
    password: 'student123',
    role: 'student',
    academicYear: years[0]._id,
  });

  // Create sample questions
  const questions = [
    {
      text: 'Which nerve is responsible for the sensation of the anterior two-thirds of the tongue?',
      options: { A: 'Facial nerve (CN VII)', B: 'Lingual nerve (CN V3)', C: 'Glossopharyngeal nerve (CN IX)', D: 'Hypoglossal nerve (CN XII)' },
      correctAnswer: 'B',
      explanation: 'The lingual nerve, a branch of the mandibular nerve (V3), carries **general somatic afferent** fibers for general sensation from the anterior two-thirds of the tongue.',
      subject: subjects[0]._id, academicYear: years[0]._id, difficulty: 'medium',
    },
    {
      text: 'What is the normal resting membrane potential of a neuron?',
      options: { A: '-55 mV', B: '-70 mV', C: '-90 mV', D: '+30 mV' },
      correctAnswer: 'B',
      explanation: 'The resting membrane potential of a typical neuron is approximately **-70 mV**, maintained primarily by the sodium-potassium ATPase pump and selective membrane permeability.',
      subject: subjects[1]._id, academicYear: years[0]._id, difficulty: 'easy',
    },
    {
      text: 'Which enzyme is deficient in Phenylketonuria (PKU)?',
      options: { A: 'Tyrosinase', B: 'Homogentisate oxidase', C: 'Phenylalanine hydroxylase', D: 'Fumarylacetoacetase' },
      correctAnswer: 'C',
      explanation: 'PKU is caused by deficiency of **phenylalanine hydroxylase**, which converts phenylalanine to tyrosine. This leads to accumulation of phenylalanine and its metabolites.',
      subject: subjects[2]._id, academicYear: years[0]._id, difficulty: 'medium',
    },
    {
      text: 'In Reed-Sternberg cells, which immunohistochemical markers are characteristically positive?',
      options: { A: 'CD3, CD5', B: 'CD15, CD30', C: 'CD20, CD79a', D: 'CD10, BCL-2' },
      correctAnswer: 'B',
      explanation: 'Reed-Sternberg cells in Classical Hodgkin Lymphoma are characteristically positive for **CD15 and CD30** (also called Ki-1 antigen). They are typically negative for CD20 and CD45.',
      subject: subjects[3]._id, academicYear: years[1]._id, difficulty: 'hard',
    },
    {
      text: 'Which beta-blocker is cardioselective (beta-1 selective)?',
      options: { A: 'Propranolol', B: 'Carvedilol', C: 'Metoprolol', D: 'Labetalol' },
      correctAnswer: 'C',
      explanation: '**Metoprolol** is a cardioselective beta-1 blocker. Remember: "A-B-E-M" — Acebutolol, Betaxolol, Esmolol, Metoprolol are selective. Propranolol and carvedilol are non-selective.',
      subject: subjects[4]._id, academicYear: years[1]._id, difficulty: 'easy',
    },
    {
      text: 'A 65-year-old presents with progressive dyspnea, orthopnea, and bilateral leg edema. JVP is elevated. What is the most likely diagnosis?',
      options: { A: 'COPD exacerbation', B: 'Congestive heart failure', C: 'Pulmonary embolism', D: 'Hepatic cirrhosis' },
      correctAnswer: 'B',
      explanation: 'The triad of **dyspnea, orthopnea, bilateral pitting edema + elevated JVP** is classic for Congestive Heart Failure. BNP/NT-proBNP and echocardiography would confirm the diagnosis.',
      subject: subjects[5]._id, academicYear: years[2]._id, difficulty: 'medium',
    },
  ];

  await Question.insertMany(questions);

  // Create sample flashcards
  const flashcards = [
    { front: 'What is the blood supply of the femoral head?', back: 'Primarily from the **medial circumflex femoral artery** (branch of profunda femoris). This is why femoral neck fractures risk avascular necrosis.', deck: 'Hip & Lower Limb', subject: subjects[0]._id, academicYear: years[0]._id },
    { front: 'What is the Frank-Starling mechanism?', back: 'Increased ventricular **end-diastolic volume** (preload) → increased stroke volume. The heart pumps whatever blood it receives, up to a physiological limit.', deck: 'Cardiac Physiology', subject: subjects[1]._id, academicYear: years[0]._id },
    { front: 'Name the rate-limiting enzyme in cholesterol synthesis', back: '**HMG-CoA reductase** — the target of statins. It converts HMG-CoA → mevalonate in the cytoplasm.', deck: 'Lipid Metabolism', subject: subjects[2]._id, academicYear: years[0]._id },
    { front: 'What are the histological features of acute inflammation?', back: '1. Vascular changes (vasodilation, increased permeability)\n2. **Neutrophil** emigration (margination → rolling → adhesion → transmigration)\n3. Exudate formation', deck: 'Inflammation Basics', subject: subjects[3]._id, academicYear: years[1]._id },
    { front: 'Mechanism of action of ACE inhibitors', back: 'Block **angiotensin-converting enzyme** → prevents Ang I → Ang II conversion → vasodilation + reduced aldosterone → decreased BP and preload. Also prevent bradykinin breakdown (→ cough).', deck: 'Antihypertensives', subject: subjects[4]._id, academicYear: years[1]._id },
  ];

  await Flashcard.insertMany(flashcards);

  console.log('✅ Seed data created successfully!');
  console.log('Admin: admin@medibank.com / admin123');
  console.log('Student: student@medibank.com / student123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
