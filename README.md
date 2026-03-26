# 🏥 MedQs — Medical Questions Platform

A full-stack medical education platform inspired by AMBOSS/UWorld, built with Next.js, Express, and MongoDB. Master clinical knowledge through AI-powered questions and adaptive learning.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| State | Zustand |
| Charts | Recharts |

---

## 📁 Project Structure

```
medqs/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, error, upload
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── uploads/         # Uploaded files (auto-created)
│   ├── utils/           # Token gen + seed script
│   └── server.js        # Entry point
│
└── frontend/
    ├── app/
    │   ├── auth/        # Login + Register
    │   ├── dashboard/   # Main dashboard
    │   ├── questions/   # Q-bank (practice + exam)
    │   ├── flashcards/  # Spaced repetition
    │   ├── files/       # File library
    │   ├── bookmarks/   # Saved questions
    │   ├── progress/    # Analytics
    │   └── admin/       # Admin panel
    ├── lib/
    │   ├── api.ts       # Axios instance
    │   └── store/       # Zustand auth store
    └── ...
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & install

```bash
git clone <repo-url>
cd medqs

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend
cd ../frontend
npm install
cp .env.local.example .env.local
# Edit with your API URL
```

### 2. Start MongoDB

```bash
# Local
mongod

# Or use MongoDB Atlas — paste your connection string in backend/.env
```

### 3. Seed the database (optional)

```bash
cd backend
npm run seed
```

This creates:
- **Admin:** admin@medqs.com / admin123
- **Student:** student@medqs.com / student123
- 3 academic years, 6 subjects, 6 questions, 5 flashcard decks

### 4. Run the servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev     # runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev     # runs on http://localhost:3000
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medqs
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📚 Features

### Student Features
- 🔐 Register / Login with JWT sessions
- 📝 **Question Bank** — filter by year, subject, difficulty
- 🎯 **Practice Mode** — instant feedback per question
- ⏱️ **Exam Mode** — timed, submit all at once
- 🃏 **Flashcards** — flip cards with spaced repetition (SM-2 algorithm)
- 📁 **File Library** — download PDFs and lecture notes
- 🔖 **Bookmarks** — save questions for later
- 📊 **Progress Dashboard** — accuracy stats, weak areas

### Admin Features
- ➕ Add / Edit / Delete Questions (with Markdown explanations)
- 🃏 Manage Flashcard decks
- 📤 Upload and manage PDF files
- 🎓 Create Academic Years and Subjects
- 👥 Manage user accounts (activate/deactivate, change roles)

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | 🔒 | Get current user |
| GET | `/api/years` | 🔒 | List academic years |
| POST | `/api/years` | 👑 Admin | Create year |
| GET | `/api/subjects` | 🔒 | List subjects |
| POST | `/api/subjects` | 👑 Admin | Create subject |
| GET | `/api/questions` | 🔒 | List questions (paginated, filtered) |
| POST | `/api/questions` | 👑 Admin | Create question |
| POST | `/api/questions/submit` | 🔒 | Submit exam answers |
| GET | `/api/flashcards` | 🔒 | List flashcards |
| GET | `/api/flashcards/decks` | 🔒 | List decks |
| POST | `/api/flashcards/:id/review` | 🔒 | Update spaced repetition |
| GET | `/api/files` | 🔒 | List files |
| POST | `/api/files` | 👑 Admin | Upload file |
| GET | `/api/files/:id/download` | 🔒 | Download file |
| GET | `/api/users` | 👑 Admin | List all users |
| GET | `/api/users/me/stats` | 🔒 | Get my progress |
| POST | `/api/users/me/bookmarks/:id` | 🔒 | Toggle bookmark |

---

## ☁️ Deployment

### Backend → Render

1. Create new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `backend/.env`

### Frontend → Vercel

1. Import your repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add env variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
4. Deploy!

---

## 🎨 Design System

- **Primary color:** Sky blue (`#0ea5e9`)
- **Font:** DM Sans (body) + Instrument Serif (display)
- **Dark mode:** Class-based, persisted in localStorage
- **Animations:** CSS transitions + keyframe animations
- Inspired by AMBOSS / UWorld / Anki

---

## 📄 License

MIT — free for educational use.