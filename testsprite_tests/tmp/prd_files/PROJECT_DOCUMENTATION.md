# StudiFy: Project Documentation

## 1. Project Purpose
**StudiFy** is an AI-powered study platform designed to gamify education and enhance the learning experience. It tackles the challenge of maintaining focus and motivation by blending intelligent, AI-driven study tools with a rewarding gamification system. Users can study in a distraction-free environment, interact with an AI tutor, generate quizzes automatically from their own notes, and compete on globally ranked leaderboards.

## 2. Key Features
*   **Gamified Learning Ecosystem**: 
    *   Earn "coins" for studying consistently and maintaining daily streaks.
    *   Unlock badges and achievements (e.g., "Quiz Master").
    *   Participate in global leaderboards based on study time and coins earned.
    *   A built-in **Coin Shop** where users can spend their currency on customizations.
*   **AI Study Assistant**: 
    *   An intelligent chatbot tutor that guides learning without simply giving away answers. 
    *   Powered by Google Genkit and local LLMs (Ollama) to act as a personalized tutor safely and securely.
*   **Automated Quiz Generation**: 
    *   Upload PDFs or images of your study materials and allow the platform to generate interactive quizzes directly from the content.
    *   Uses OCR (Tesseract.js) to extract text from images and PDF.js for documents.
*   **Study Insights & Analytics**: 
    *   Rich data visualizations mapping study consistency, focus levels, and subject mastery over time.
    *   Visual charts generated using Recharts to track progress.

## 3. Technology Stack & Architecture
StudiFy is built using a modern, scalable web architecture:

### Frontend
*   **Framework**: Next.js 15 (React 18) leveraging Server Components and API Routes.
*   **Language**: TypeScript for end-to-end type safety.
*   **Styling**: Tailwind CSS for responsive multi-theme utility classes, combined with a "glassmorphic" aesthetic.
*   **UI Components**: Radix UI for accessible headless components; Framer Motion for physics-based animations and fluid transitions.
*   **Data Visualization**: Recharts for study analytics dashboards.
*   **Forms**: React Hook Form combined with Zod for robust client-side validation.

### Backend & Database
*   **Platform**: Firebase ecosystem.
*   **Authentication**: Firebase Auth handling email/password, social logins, and email verification.
*   **Database**: Firestore (NoSQL) for real-time syncing of user profiles, streaks, study sessions, and coin ledgers.

### AI & Media Processing
*   **AI Engine**: Google Genkit (DeepMind Gemini models) paired with Ollama (local open-source LLMs like LLaMA3) for content generation.
*   **Document Parsing**: `pdfjs-dist` & `react-pdf` for parsing user PDFs; `tesseract.js` for image optical character recognition (OCR).
*   **Media Storage**: Cloudinary for optimized image and avatar storage.

## 4. Application Workflow & How It Works

### Step 1: Onboarding & Authentication
*   **`/signup` & `/verify-email`**: Users create an account. Email verification secures the account.
*   **`/login`**: Authenticated entry. State is managed by Firebase Auth and persisted securely.

### Step 2: The Core Study Loop
*   **Dashboard (`/profile`)**: Upon login, users land on their dashboard showing their daily streak, coin balance, recent quizzes, and visual study insights.
*   **AI Study Assistant (`/study-assistant`)**: Users enter a focused chat environment where they can ask questions about topics. The AI guides them using the Socratic method rather than giving direct answers.
*   **Quiz Creation**: Users upload notes (PDFs/Images). The system extracts text (via OCR or PDF parser), sends it to the AI engine, and returns a structured quiz payload. The user takes the quiz and is rewarded with coins based on their score.

### Step 3: Gamification & Economics
*   **Earning Mechanism**: Whenever a study session finishes or a quiz is passed, a server-side equivalent function updates the Firestore ledger.
*   **`/setup-shop`**: An administrative/user view of the marketplace where coins can be exchanged for virtual goods.
*   **Leaderboards**: Real-time aggregation of top earners to fuel competitive studying.

## 5. Local Development & Setup
To run the project locally:
1.  **Environment Variables**: Ensure `.env.local` is present with your Firebase Auth/Firestore keys, Cloudinary configuration, and Genkit/AI keys.
2.  **Dependencies**: Run `npm install` to download Next.js, Radix UI, and other necessary libraries.
3.  **Start Server**: Use `npm run dev` starting the Next.js dev server (with Turbopack enabled for speed).
4.  **AI Dev**: Run `npm run genkit:dev` parallelly if you need to debug or work on the AI flows locally.
