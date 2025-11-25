# BS Companion - Technical Documentation

## Project Overview

**BS Companion** is a comprehensive full-stack web application designed for BS Data Science students at IIT Madras. It serves as a one-stop platform for academic preparation, peer interaction, and performance analytics.

### Core Purpose
- **Quiz Platform**: Practice questions from extensive question banks categorized by subject, exam type (quiz1, quiz2, ET), and topic
- **Study Guide Generation**: AI-powered study guides using Google Gemini
- **Performance Analytics**: Detailed quiz results with AI-driven insights and recommendations
- **Leaderboard System**: Competitive environment with ranking based on quiz performance
- **Discussion Forums**: Community-driven question discussions with threaded conversations

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.x | UI framework with hooks-based architecture |
| **Vite** | Latest | Build tool and dev server |
| **React Router** | 6.x | Client-side routing and navigation |
| **Axios** | Latest | HTTP client for API communication |
| **GSAP** | Latest | High-performance animations (custom cursor, transitions) |
| **Framer Motion** | Latest | Declarative animations and gestures |
| **Recharts** | Latest | Data visualization for analytics |
| **React Markdown** | Latest | Markdown rendering for study guides |
| **React Syntax Highlighter** | Latest | Code syntax highlighting |
| **Locomotive Scroll** | Latest | Smooth scrolling effects (landing page) |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 4.x | Web application framework |
| **MongoDB** | 5.x | NoSQL database |
| **Mongoose** | 7.x | MongoDB ODM |
| **JWT** | Latest | Authentication tokens |
| **bcryptjs** | Latest | Password hashing |
| **Google Generative AI** | Latest | Gemini AI integration |
| **dotenv** | Latest | Environment variable management |
| **nodemon** | Latest | Development auto-restart |

### Development Tools
- **ESLint**: Code linting
- **Git**: Version control
- **VS Code**: Primary IDE

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │  Dashboard   │  │  Quiz/Study  │      │
│  │     Page     │  │  Components  │  │  Components  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                          │                                   │
│                    Axios HTTP Client                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   REST API     │
                    │ (Express.js)   │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
  ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐
  │  MongoDB  │      │  Google   │      │   JWT     │
  │ Database  │      │  Gemini   │      │   Auth    │
  └───────────┘      └───────────┘      └───────────┘
```

### Project Structure

```
BSCompanion/
├── backend/
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Subjects.js
│   │   ├── QuizResult.js
│   │   ├── StudyGuide.js
│   │   ├── Discussion.js
│   │   └── Feedback.js
│   ├── routes/              # API route handlers
│   │   ├── questions.js
│   │   ├── results.js
│   │   ├── ai.js
│   │   ├── study-guides.js
│   │   ├── user.js
│   │   ├── feedback.js
│   │   ├── leaderboard.js
│   │   └── stats.js
│   ├── middleware/
│   │   └── auth.js          # JWT verification
│   ├── questionbank/        # JSON question files
│   ├── seed.js              # Database seeding script
│   ├── server.js            # Express app entry point
│   └── .env                 # Environment variables
│
└── bscompanion/             # Frontend (React + Vite)
    ├── src/
    │   ├── components/      # React components
    │   │   ├── Quiz.jsx     # Main quiz interface
    │   │   ├── Dashboard.jsx
    │   │   ├── MagicBento.jsx
    │   │   ├── StudyGuideModal.jsx
    │   │   ├── StudyGuideView.jsx
    │   │   ├── StudyGuideHistory.jsx
    │   │   ├── LandingPage.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── Dock.jsx
    │   │   ├── UserProfile.jsx
    │   │   ├── Settings.jsx
    │   │   ├── QuizHistory.jsx
    │   │   ├── Leaderboard.jsx
    │   │   └── landing/     # Landing page components
    │   │       ├── CustomCursor.jsx
    │   │       ├── MagneticButton.jsx
    │   │       ├── ScrambleText.jsx
    │   │       └── TiltCard.jsx
    │   ├── context/
    │   │   └── ThemeContext.jsx  # Global state management
    │   ├── pages/
    │   ├── App.jsx          # Root component
    │   └── index.css        # Global styles
    └── package.json
```

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, indexed),
  password: String (hashed with bcrypt),
  subjects: [String],         // Enrolled subjects
  city: String,
  bloodGroup: String,
  currentLevel: String,
  role: String (enum: ["student", "admin"]),
  createdAt: Date,
  updatedAt: Date
}
```

### Subjects Collection
```javascript
{
  _id: ObjectId,
  subjectName: String (required),
  papers: {
    quiz1: [QuestionSchema],
    quiz2: [QuestionSchema],
    ET: [QuestionSchema]
  }
}

// QuestionSchema
{
  context: String,              // Optional passage/instructions
  image: String,                // Image URL (Cloudinary)
  question: String (required),
  exam: String (required),      // "quiz1", "quiz2", "ET"
  term: String,                 // "Jan 2023", "Sept 2023", etc.
  topic: String,                // Topic classification
  options: Mixed,               // Object {A, B, C, D} or null for numerical
  correctOption: Mixed,         // String, Array, or {min, max}
  questionType: String          // "single", "multiple", "numerical"
}
```

### QuizResults Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: "User", indexed),
  subject: String (required),
  exam: String,
  term: String,
  topic: String,
  score: Number (required),
  totalQuestions: Number (required),
  timeTaken: Number,            // Seconds
  questions: [{
    questionId: String,
    userAnswer: Mixed,
    correctAnswer: Mixed,
    status: String,             // "correct", "incorrect", "not_attempted"
    topic: String
  }],
  aiAnalysis: String,           // Stringified JSON from Gemini
  createdAt: Date (indexed),
  hasAiAnalysis: Boolean
}
```

### StudyGuides Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: "User", indexed),
  subject: String (required),
  exam: String (enum: ["quiz1", "quiz2", "ET"]),
  topics: [String],
  questionsUsed: [Object],      // Simplified question objects
  aiResponse: String,           // Markdown content from Gemini
  createdAt: Date (indexed)
}

// Compound indexes:
// - {userId: 1, createdAt: -1}
// - {userId: 1, subject: 1, exam: 1}
// - {subject: 1, exam: 1}  // For caching optimization
```

### Discussions Collection
```javascript
{
  _id: ObjectId,
  questionId: String (indexed),
  userId: ObjectId (ref: "User"),
  userName: String,
  subject: String,
  title: String (required),
  content: String (required),
  replies: [{
    userId: ObjectId,
    userName: String,
    content: String,
    createdAt: Date
  }],
  createdAt: Date (indexed),
  updatedAt: Date
}
```

### Feedback Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: "User"),
  email: String,
  category: String (enum: ["Bug", "Feature", "Improvement", "Other"]),
  message: String (required),
  status: String (default: "pending"),
  createdAt: Date
}
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | No | User registration |
| POST | `/login` | No | User login (returns JWT) |
| GET | `/getuser` | Yes | Get current user profile |

### Questions
| Method | Endpoint | Query Params | Description |
|--------|----------|--------------|-------------|
| GET | `/api/questions` | `subject`, `exam`, `topic`, `term`, `limit` | Fetch questions with filters |

### Quiz Results
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/results/submit` | Yes | Submit quiz results |
| GET | `/api/results/user/:userId` | Yes | Get user's quiz history |
| GET | `/api/results/:id` | Yes | Get specific quiz result |

### AI Analysis
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/analyze` | Yes | Generate AI performance analysis |

### Study Guides
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/study-guides/generate` | Yes | Generate or retrieve cached study guide |
| GET | `/api/study-guides/user` | Yes | List all user's study guides |
| GET | `/api/study-guides/:id` | Yes | Get specific study guide |
| DELETE | `/api/study-guides/:id` | Yes | Delete study guide |

### User Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/api/user/subjects` | Yes | Update enrolled subjects |
| DELETE | `/api/user/subjects` | Yes | Remove a subject |
| GET | `/api/user/profile` | Yes | Get detailed profile |
| PUT | `/api/user/profile` | Yes | Update profile |

### Leaderboard
| Method | Endpoint |Query Params | Description |
|--------|----------|------|-------------|
| GET | `/api/leaderboard` | `subject`, `exam`, `term` | Get ranked leaderboard |

### Feedback
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/feedback/submit` | Yes | Submit feedback |

### Statistics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stats/user/:userId` | Yes | Get user statistics |

---

## Key Features & Implementation

### 1. Quiz System

#### Question Fetching & Randomization
```javascript
// Backend: routes/questions.js
// Supports multiple filter combinations:
// - subject + exam + topic
// - subject + term
// - subject + exam only

// Randomization algorithm
const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
const selectedQuestions = shuffled.slice(0, totalLimit);
```

#### Quiz Modes
1. **Exam Mode**: Timed, all questions at once, submit at end
2. **Practice Mode**: Instant feedback per question, no timer

#### Answer Validation
- **Single Choice**: Exact match
- **Multiple Choice**: Array comparison (order-independent)
- **Numerical**: Range validation `{min, max}`

#### State Persistence
- Quiz state saved to `localStorage`
- Allows resume after browser refresh
- Cleared only on explicit quit or completion

### 2. AI Integration (Google Gemini)

#### Quiz Performance Analysis
**Model**: `gemini-2.0-flash-exp`

**Input Schema**:
```javascript
{
  resultId: String,
  score: Number,
  totalQuestions: Number,
  topicPerformance: Object,
  questions: Array,
  timeTaken: String
}
```

**Output Schema** (Structured JSON):
```javascript
{
  summary: {
    title: String,
    behavioral_insight: String,
    archetype: String          // e.g., "The Cowboy Coder"
  },
  youtube_resources: [{
    topic: String,
    video_title_idea: String,
    search_query: String,
    reason: String
  }],
  skill_radar_data: [{
    subject: String,
    score: Number (0-100),
    fullMark: 100
  }],
  weak_areas: [{
    topic: String,
    correction: String
  }],
  follow_up_question: {
    question: String,
    options: [String],
    correct_answer: String,
    explanation: String
  }
}
```

#### Study Guide Generation

**Caching Optimization**:
- First request for `{subject, exam}` → AI generation
- Subsequent requests → Clone existing guide
- Saves API costs and provides instant results

**Process**:
1. Check database for existing guide (`subject` + `exam`)
2. If exists → Clone for new user
3. If not → Fetch 30 random questions
4. Extract unique topics
5. Generate comprehensive markdown guide via Gemini
6. Save to database

**AI Prompt Structure**:
- Context: Subject, exam, topics, question count
- Sections: Overview, Topic Breakdown, Study Strategy, Practice Recommendations
- Format: Markdown with proper hierarchy

### 3. Custom Cursor System

**Implementation**:
- Two elements: small dot (10px) + follower ring (40px)
- GSAP animation with different easing
- Global via App.jsx
- Disabled on quiz routes using `useLocation` hook
- CSS: `cursor: none !important` except `.quiz-page`

**Performance**:
- `pointerEvents: none` to prevent cursor interference
- Hardware-accelerated transforms
- Cleanup on unmount

### 4. Bento Grid Dashboard

**Dynamic Card System**:
- Subject cards: Auto-populated from user's enrolled subjects
- Action cards: Study Guide, Guide Library, Profile, Academic Overview
- Special styling: `card--button` class for interactive cards
- Particle effects using custom `ParticleCard` component

**Animations**:
- GSAP for card entrance
- Tilt effects on hover
- Magnetism for buttons

### 5. Leaderboard System

**Ranking Algorithm**:
```javascript
// Weighted scoring
rank_score = (score / totalQuestions) * 100
             + time_bonus
             + accuracy_bonus
```

**Filtering**:
- By subject
- By exam type
- By term
- Real-time updates

**Caching**: Results cached for 5 minutes

### 6. Discussion Forums

**Features**:
- Thread-based conversations
- Question-specific discussions
- Reply system with nesting
- User attribution

**Implementation**:
- MongoDB embedded documents for replies
- Indexed by `questionId` for fast lookup

---

## Authentication & Security

### JWT Implementation
```javascript
// Token generation
const token = jwt.sign(
  { id: user._id, email: user.email },
  JWT_SECRET,
  { expiresIn: '24h' }
);

// Middleware verification
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // Verify and attach user to req.user
};
```

### Password Security
- bcrypt hashing with salt rounds: 10
- Passwords never stored in plain text
- Secure comparison using bcrypt.compare()

### Protected Routes
- Frontend: `ProtectedRoute` component checks token validity
- Backend: `verifyToken` middleware on sensitive endpoints
- Token expiry: 24 hours

---

## Performance Optimizations

### Frontend
1. **Code Splitting**: Lazy loading for route components
2. **Memoization**: `useMemo` for expensive calculations
3. **Debouncing**: Search inputs, autocomplete
4. **Image Optimization**: Cloudinary CDN for question images
5. **Custom Cursor**: Hardware-accelerated CSS transforms

### Backend
1. **Database Indexing**:
   - User email (unique)
   - QuizResults: userId + createdAt
   - StudyGuides: userId + subject + exam
   - Discussions: questionId

2. **Study Guide Caching**: Reuse AI-generated content across users

3. **Query Optimization**:
   - Projection: Select only needed fields
   - Limit: Cap results to prevent large payloads

4. **Connection Pooling**: MongoDB default pooling

---

## Environment Variables

### Backend (.env)
```bash
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend
```bash
VITE_API_URL=http://localhost:5000
```

---

## Deployment Architecture

### Recommended Setup

**Frontend**: Vercel / Netlify
- Auto-deployment from Git
- CDN distribution
- Environment variable management

**Backend**: Railway / Render / Heroku
- Node.js environment
- Auto-restart on crash
- Logging and monitoring

**Database**: MongoDB Atlas
- Managed cluster
- Automatic backups  
- Global distribution

**Media Storage**: Cloudinary
- Image hosting for question images
- CDN delivery

---

## Development Workflow

### Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev

# Frontend
cd bscompanion
npm install
npm run dev
```

### Database Seeding
```bash
cd backend
node seed.js
```

### Running Tests
```bash
# Frontend
npm run test

# Backend
npm run test
```

---

## Code Quality & Standards

### Frontend Conventions
- **Components**: PascalCase
- **Files**: Component name matches file name
- **CSS**: BEM methodology, scoped to components
- **State**: Hooks-based, Context API for global state
- **Props**: Destructuring, PropTypes validation

### Backend Conventions
- **Routes**: RESTful design
- **Errors**: Consistent error handling with try-catch
- **Validation**: Input validation on all endpoints
- **Logging**: Console logs for debugging (production: Winston/Morgan)

### Git Workflow
- **Branches**: `main`, `develop`, `feature/*`
- **Commits**: Conventional commits format
- **PRs**: Required for merging to main

---

## Known Limitations & Future Enhancements

### Current Limitations
1. No real-time collaboration features
2. Limited offline support
3. Single language support (English)
4. Manual question bank updates

### Planned Features
1. **Real-time Quizzes**: Socket.io for multiplayer
2. **PDF Export**: Study guides and quiz results
3. **Mobile App**: React Native version
4. **Advanced Analytics**: ML-based predictions
5. **Gamification**: Badges, achievements, streaks
6. **Discussion Forums**: Upvoting, best answer selection
7. **Admin Dashboard**: Question management, user analytics

---

## Monitoring & Debugging

### Logging
- Frontend: Console logs (development), Sentry (production)
- Backend: Morgan for HTTP request logging

### Error Handling
- Frontend: Error boundaries, fallback UI
- Backend: Centralized error handling middleware

### Performance Monitoring
- Lighthouse scores for frontend
- Response time tracking for API endpoints

---

## Third-Party Services

| Service | Purpose | Documentation |
|---------|---------|---------------|
| MongoDB | Database | https://mongodb.com/docs |
| Google Gemini | AI generation | https://ai.google.dev |
| Cloudinary | Image hosting | https://cloudinary.com/docs |
| Vercel | Frontend hosting | https://vercel.com/docs |

---

## Support & Maintenance

### Bug Reporting
- In-app feedback system
- Email: support@bscompanion.com

### Updates
- Rolling updates with zero downtime
- Backward compatibility for API changes
- Semantic versioning

---

## Conclusion

BS Companion is a modern, full-stack educational platform leveraging cutting-edge technologies to provide an exceptional learning experience. The architecture prioritizes performance, scalability, and user experience while maintaining clean, maintainable code.

**Key Strengths**:
- ✅ Comprehensive quiz system with multiple modes
- ✅ AI-powered insights and study guides
- ✅ Responsive, animated UI with custom cursor
- ✅ Robust authentication and data security
- ✅ Optimized database queries with smart caching
- ✅ Scalable architecture ready for growth

---

**Document Version**: 1.0  
**Last Updated**: November 25, 2025  
**Maintained By**: Development Team
