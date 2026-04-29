# StudiFy — Libraries & Modules Documentation
### Organized by Feature / Functionality

> **Prepared for:** Project Supervisor Review  
> **Project:** StudiFy — AI-Powered Gamified Study Platform  
> **Date:** April 2026  
> **Tech Stack:** Next.js 15 · TypeScript · Firebase · Groq AI · Tailwind CSS  

---

## What is StudiFy?

**StudiFy** is a full-stack, AI-powered gamified learning platform. Students can take daily quizzes across 15+ academic categories, upload study materials for AI-assisted Q&A and summarization, track their progress through rich analytics, earn virtual coins for consistent study habits, spend those coins in a virtual shop, and compete on a global leaderboard.

This document explains every major **feature and functionality** of StudiFy and the specific **libraries and modules** used to deliver each one — including what those libraries are, how they connect to the feature, and why they were chosen.

---

## Table of Contents

| # | Feature / Functionality |
|---|------------------------|
| 1 | [Application Framework & Routing](#1-application-framework--routing) |
| 2 | [User Authentication & Session Management](#2-user-authentication--session-management) |
| 3 | [Database & Real-Time Data Storage](#3-database--real-time-data-storage) |
| 4 | [UI Layout, Components & Design System](#4-ui-layout-components--design-system) |
| 5 | [Animations & Page Transitions](#5-animations--page-transitions) |
| 6 | [Form Handling & Input Validation](#6-form-handling--input-validation) |
| 7 | [Quiz System (Daily & Custom Quizzes)](#7-quiz-system-daily--custom-quizzes) |
| 8 | [AI-Powered Study Assistant Chatbot](#8-ai-powered-study-assistant-chatbot) |
| 9 | [Study Material Upload & Document Processing](#9-study-material-upload--document-processing) |
| 10 | [OCR — Image Text Extraction](#10-ocr--image-text-extraction) |
| 11 | [Study Sessions & Focus Timer](#11-study-sessions--focus-timer) |
| 12 | [Gamification — Coins, Streaks & Rewards](#12-gamification--coins-streaks--rewards) |
| 13 | [Badge System & Achievements](#13-badge-system--achievements) |
| 14 | [Virtual Coin Shop](#14-virtual-coin-shop) |
| 15 | [Leaderboard & Global Rankings](#15-leaderboard--global-rankings) |
| 16 | [Performance Analytics & Data Visualization](#16-performance-analytics--data-visualization) |
| 17 | [AI Study Insights](#17-ai-study-insights) |
| 18 | [User Profile & Avatar Customization](#18-user-profile--avatar-customization) |
| 19 | [Image Upload & Cloud Media Management](#19-image-upload--cloud-media-management) |
| 20 | [Notification Center](#20-notification-center) |
| 21 | [Theme & Visual Customization](#21-theme--visual-customization) |
| 22 | [Server-Side API & Cloud Functions](#22-server-side-api--cloud-functions) |
| 23 | [Type Safety & Code Quality](#23-type-safety--code-quality) |
| 24 | [Complete Library Reference Table](#24-complete-library-reference-table) |

---

## 1. Application Framework & Routing

### What this feature does
StudiFy is a **multi-page web application** with distinct routes for the landing page, login, signup, dashboard, study assistant, profile, contact, legal pages, and email verification. All page navigation is handled without full browser reloads (client-side navigation), and certain pages are server-rendered for performance.

The application also requires a **lightweight server backend** for operations like AI proxying, PDF extraction, and signed image uploads — without needing a separate Express.js server.

### Libraries & Modules Used

#### `next` (Next.js v15.5.x) — Primary Framework
Next.js is the backbone of the entire application. It provides:

- **App Router** (`src/app/`): Each folder inside `src/app/` automatically becomes a URL route. The routes in StudiFy are:

  | Folder | URL Route | Page Purpose |
  |--------|-----------|-------------|
  | `src/app/page.tsx` | `/` | Landing page |
  | `src/app/login/` | `/login` | Login page |
  | `src/app/signup/` | `/signup` | Registration page |
  | `src/app/study-assistant/` | `/study-assistant` | AI chatbot page |
  | `src/app/profile/` | `/profile` | User profile page |
  | `src/app/contact/` | `/contact` | Contact form |
  | `src/app/verify-email/` | `/verify-email` | Email verification gate |
  | `src/app/privacy-policy/` | `/privacy-policy` | Legal page |
  | `src/app/terms-of-service/` | `/terms-of-service` | Legal page |

- **API Routes** (`src/app/api/`): Next.js turns files named `route.ts` inside `src/app/api/` into server-side HTTP endpoints. StudiFy has 9 API routes (detailed in §22).

- **Turbopack**: The dev server runs with `next dev --turbopack`, which uses Next.js's next-generation bundler for extremely fast Hot Module Replacement (HMR) during development.

- **`next/navigation`** (`useRouter`): Used inside `Dashboard.tsx` to programmatically redirect unauthenticated users to `/login` and unverified users to `/verify-email`.

- **Image Optimization**: `next/image` is configured in `next.config.ts` to allow serving optimized images from `firebasestorage.googleapis.com` (for user avatars stored on Firebase).

- **Custom HTTP Headers**: `next.config.ts` sets `Cross-Origin-Opener-Policy: same-origin-allow-popups` on all routes to allow Google OAuth popup windows to communicate with the parent page.

#### `react` + `react-dom` (v18.3.x) — UI Runtime
React is the underlying component model. Every screen in StudiFy is built as a React component tree. `react-dom` renders this tree to the browser DOM. React 18's concurrent rendering engine is used by animation libraries for smooth non-blocking UI updates.

---

## 2. User Authentication & Session Management

### What this feature does
StudiFy supports two sign-in methods:
1. **Email + Password** with mandatory email verification before accessing the dashboard.
2. **Google OAuth** (one-click sign-in with a Google account).

After signing in, the user's session is persisted across browser refreshes and tab closures. Any part of the app that needs to know "who is logged in" reads from a global React context. Unauthenticated users are automatically redirected to the login page.

### Libraries & Modules Used

#### `firebase/auth` (Firebase Client SDK)
All authentication logic lives in `src/lib/firebase.ts`. The following modules are imported:

| Firebase Auth Module | What it does in StudiFy |
|----------------------|-------------------------|
| `initializeApp`, `getApp`, `getApps` | Initializes Firebase with environment-variable credentials; prevents duplicate initialization |
| `getAuth` | Returns the Firebase Auth instance |
| `createUserWithEmailAndPassword` | Used in `signUp()` — registers a new account with email and hashed password |
| `signInWithEmailAndPassword` | Used in `signIn()` — authenticates returning users |
| `GoogleAuthProvider` | Creates a Google OAuth provider config |
| `signInWithPopup` | Opens the Google Sign-In popup window and handles OAuth token exchange |
| `sendEmailVerification` | Sends a verification email to newly registered users before granting dashboard access |
| `updateProfile` | Sets the user's `displayName` on their Firebase Auth record immediately after signup |
| `setPersistence` + `browserLocalPersistence` | Stores the auth token in `localStorage` so the session survives page refresh and browser close |
| `onAuthStateChanged` | Firebase listener that fires whenever auth state changes (login/logout) — the backbone of `AuthContext.tsx` |
| `signOut` | Clears the auth token and session |

#### `src/context/AuthContext.tsx` — Custom Internal Module
This is a React Context file that wraps `onAuthStateChanged` inside a React component. It provides the current `user` object and a `loading` boolean to any component in the app without prop drilling:

```tsx
// Any component can access auth state globally:
const { user, loading } = useContext(AuthContext);
```

Used in `Dashboard.tsx`, `Header.tsx`, `LoginForm.tsx`, `SignUpForm.tsx`, and every protected page.

#### `src/hooks/useAuth.ts` — Custom Hook
A convenience hook that wraps `useContext(AuthContext)` so components don't need to import both `useContext` and `AuthContext` — they just call `useAuth()`.

#### `firebase-admin` (v13.6.x) — Server-Side Verification
In API routes (e.g., `/api/generate-quiz`), the Firebase Admin SDK verifies the user's ID token sent from the browser. This prevents unauthorized requests — only authenticated users can trigger server-side AI or database operations.

---

## 3. Database & Real-Time Data Storage

### What this feature does
Every piece of user data in StudiFy — profiles, coin balances, quiz results, transactions, badges, streaks, notifications, shop items — is stored in and read from Firestore. The database is central to almost every feature in the platform.

### Database Structure
```
Firestore
├── users/{uid}                     ← User profile document
│   ├── transactions/{txnId}        ← Coin credit/debit history
│   ├── quizResults/{resultId}      ← Per-quiz result records
│   └── notifications/{notifId}    ← In-app notification messages
├── quizQuestions/{questionId}      ← Question bank (all categories)
├── badges/{badgeId}                ← Badge definitions & requirements
├── shopItems/{itemId}              ← Virtual shop item catalog
├── customQuizzes/{quizId}          ← User-created quizzes
└── usernames/{username}            ← Username uniqueness index
```

### Libraries & Modules Used

#### `firebase/firestore` (Firebase Client SDK)
All Firestore operations live in `src/lib/firebase.ts`, `src/lib/studySessionFirebase.ts`, and `src/lib/shopFirebase.ts`.

| Firestore Module | Used In | Purpose |
|-----------------|---------|---------|
| `getFirestore` | `firebase.ts` | Initialize the Firestore instance |
| `doc` | Everywhere | Reference a specific document by path |
| `collection` | Everywhere | Reference a collection for queries or new docs |
| `getDoc` | `getUserData()`, `purchaseBadge()` | Read a single document |
| `setDoc` | `signUp()`, `submitQuizResult()` | Create or fully overwrite a document |
| `updateDoc` | `updateUserProfile()`, `claimDailyBonus()` | Update specific fields without overwriting |
| `addDoc` | Notifications, welcome messages | Add a document with an auto-generated ID |
| `deleteDoc` | Username cleanup in `updateUserProfile()` | Delete a document |
| `getDocs` | `getLeaderboard()`, `getTransactions()` | Fetch all documents in a query result |
| `query` / `where` / `orderBy` / `limit` | All list queries | Build filtered, sorted, paginated queries |
| `writeBatch` | `claimDailyBonus()`, `submitQuizResult()` | Group multiple writes atomically — if one fails, none apply |
| `runTransaction` | `updateUserProfile()` | Atomic read-then-write for username uniqueness enforcement |
| `serverTimestamp` | All document writes | Server-generated timestamp to avoid client clock errors |
| `arrayUnion` | `purchaseBadge()`, `checkAndAwardBadges()` | Add badge IDs to arrays without duplicates |
| `getCountFromServer` | `getUserRank()` | Count documents server-side without downloading them (efficient rank calculation) |

**Key Design Decisions:**
- `writeBatch` is used for every coin transaction to guarantee the user's balance and the transaction log are always in sync.
- `runTransaction` prevents two users from simultaneously claiming the same username.
- `serverTimestamp` is always used for dates instead of `new Date()` to prevent incorrect streak calculations caused by client device clock errors.

#### `src/lib/firebase.ts` — Central Database Service Layer (~1,167 lines)
Exports 30+ named functions covering every database operation in the app. No component talks to Firestore directly — they all go through this module.

#### `src/lib/studySessionFirebase.ts` — Study Session Database Service
Handles all Firestore reads/writes specific to the Study Sessions feature: creating session records, updating study minutes, and fetching historical session data. Kept in a separate file to maintain separation of concerns.

#### `src/lib/shopFirebase.ts` — Shop Economy Service
Handles Firestore operations for the virtual shop: fetching shop items, processing purchases, checking active boosters, and consuming booster charges.

---

## 4. UI Layout, Components & Design System

### What this feature does
The entire visual interface of StudiFy — every button, dialog, dropdown, tab, form field, progress bar, card, and tooltip — is built using a consistent design system. The design is dark-mode first, glassmorphic (frosted glass backgrounds), and highly interactive.

### Libraries & Modules Used

#### `@radix-ui/react-*` (18 packages) — Headless UI Component Library
Radix UI provides the **logic and accessibility** for complex interactive components, while all visual styling is handled by Tailwind CSS. Each package listed below serves a specific UI need:

| Radix Package | Version | Feature It Powers |
|---------------|---------|-------------------|
| `@radix-ui/react-tabs` | ^1.1.3 | The main Dashboard navigation (Dashboard / Quizzes / Study / Shop / Profile tabs) |
| `@radix-ui/react-dialog` | ^1.1.6 | Quiz modals, profile edit modals, confirmation dialogs |
| `@radix-ui/react-alert-dialog` | ^1.1.6 | Purchase confirmation popups ("Are you sure you want to spend 500 coins?") |
| `@radix-ui/react-dropdown-menu` | ^2.1.6 | Header user-menu dropdown (profile, settings, sign out) |
| `@radix-ui/react-select` | ^2.1.6 | Quiz category selectors, difficulty selectors |
| `@radix-ui/react-toast` | ^1.2.6 | Non-blocking success/error notifications (e.g., "Quiz Complete!", "Bonus Claimed!") |
| `@radix-ui/react-tooltip` | ^1.1.8 | Hover tooltips on icon buttons |
| `@radix-ui/react-progress` | ^1.1.2 | Study progress bars, quiz score bars |
| `@radix-ui/react-slider` | ^1.2.3 | Setting sliders (number of quiz questions, timer length) |
| `@radix-ui/react-switch` | ^1.1.3 | Toggle switches (dark mode toggle, notification settings) |
| `@radix-ui/react-radio-group` | ^1.2.3 | Multiple-choice answer buttons in quizzes |
| `@radix-ui/react-accordion` | ^1.2.3 | Collapsible sections (FAQ, quiz answer explanations) |
| `@radix-ui/react-avatar` | ^1.1.3 | User profile picture with fallback to initials |
| `@radix-ui/react-popover` | ^1.1.6 | Popover cards for quick stat displays |
| `@radix-ui/react-scroll-area` | ^1.2.3 | Custom scrollable regions (chat history, leaderboard, transaction list) |
| `@radix-ui/react-checkbox` | ^1.1.4 | Multi-select options in settings |
| `@radix-ui/react-separator` | ^1.1.2 | Horizontal/vertical divider lines between UI sections |
| `@radix-ui/react-label` | ^2.1.2 | Properly associated form labels (required for screen readers) |
| `@radix-ui/react-slot` | ^1.2.3 | Allows the `<Button>` component to forward its props to any child element (e.g., rendering a button as an anchor) |

**Why Radix UI?**  
It handles all keyboard navigation, ARIA attributes, focus trapping in modals, and screen reader support automatically — features that are extremely difficult to build correctly from scratch — while remaining completely unstyled, giving full design freedom.

#### `lucide-react` (v0.475.x) — Icon Library
SVG icons used on every screen. Examples:
- `LayoutDashboard` — Dashboard tab icon
- `Trophy` — Badge/Leaderboard icon
- `BookOpen` — Study materials icon
- `MessageSquare` — Study AI / chat icon
- `ShoppingBag` — Shop icon
- `BarChart3` — Analytics icon
- `Bell` — Notifications icon
- `Zap` — Coins / energy reference
- `Moon` / `Sun` — Dark/light theme toggle

All icons are tree-shaken — only icons that are imported appear in the final bundle.

#### `tailwindcss` (v3.4.x) — Utility CSS Framework
Every component is styled entirely with Tailwind utility classes applied in JSX. No separate `.css` files are written for individual components. The configuration in `tailwind.config.ts` extends Tailwind with:

- **CSS Variable Colors**: `bg-primary`, `text-foreground`, `border-muted`, etc. — all driven by CSS custom properties so the entire color scheme switches instantly for dark/light mode.
- **Custom Fonts**: `font-headline` → `Poppins`, `font-body` → `PT Sans`
- **Chart Color Tokens**: `chart-1` through `chart-5` for consistent analytics colors.
- **Custom Border Radius**: Consistent rounded corners tied to a `--radius` CSS variable.
- **Custom Keyframe Animations** (see §5 for details).

#### `class-variance-authority` (v0.7.x) — Component Variant System
Used inside all Shadcn-generated UI components (Button, Badge, Input, etc.) to define type-safe style variants:

```tsx
// Example: Button has multiple variants, all type-checked
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="outline" size="lg">Cancel</Button>
```

TypeScript flags invalid variant names at compile time.

#### `tailwind-merge` + `clsx` — Safe Class Merging
These two utilities are combined into a single `cn()` helper function in `src/lib/utils.ts`:

```typescript
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

- `clsx` handles **conditional classes**: `cn("base", { "text-red-500": hasError })`
- `tailwind-merge` handles **class conflicts**: if both `p-2` and `p-4` are passed, only `p-4` is kept.

Used in **every single component** to apply classes safely.

#### `postcss` + `autoprefixer` — CSS Build Pipeline
Tailwind CSS runs through PostCSS during the build. `autoprefixer` automatically adds vendor prefixes (`-webkit-`, `-moz-`) for cross-browser CSS compatibility.

---

## 5. Animations & Page Transitions

### What this feature does
StudiFy is highly animated. When navigating between pages, content fades and slides in. Dashboard cards animate in staggered sequences. Buttons scale on hover. The landing page features floating 3D avatars. Quiz completion triggers coin reward animations. All of this creates a premium, engaging feel.

### Libraries & Modules Used

#### `framer-motion` (v12.x) — Primary Animation Engine
Framer Motion is imported and used in nearly every component. Key usage patterns:

- **Page Transitions** (`src/app/template.tsx`): Every route renders inside a `motion.div` with `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`, and `exit={{ opacity: 0, y: -20 }}` props. This creates smooth slide-fade transitions when navigating between any two pages.

- **`AnimatePresence`**: Wraps components that can be unmounted (quiz modals, notification toasts, error messages) so they animate out instead of instantly disappearing.

- **Staggered List Animations**: Leaderboard rows, quiz category cards, and shop item cards animate in sequentially using `staggerChildren` on a `variants` object — each item appears 50ms after the previous.

- **Gesture Animations**: 
  - `whileHover={{ scale: 1.03, y: -4 }}` on cards for a lifting effect.
  - `whileTap={{ scale: 0.97 }}` on buttons for a "press" feel.

- **Landing Page**: The 3D avatar and hero text use `animate={{ y: [0, -20, 0] }}` with `repeat: Infinity` for a continuous floating effect.

- **Coin Reward Animation**: When a quiz is completed, a coin counter animates from the old value to the new value using Framer Motion's `useMotionValue` and `useTransform`.

- **Layout Animations** (`layout` prop): Leaderboard entries smoothly reorder their positions when rankings change, rather than jumping abruptly.

#### `tailwindcss-animate` (v1.0.7) — Tailwind Animation Plugin
Adds CSS-based animation utility classes used primarily in Shadcn components:
- `animate-in fade-in` — Components fade in when mounted
- `slide-in-from-bottom-8` — Content slides up on page entry
- `zoom-in-95` — Dialogs scale up slightly when opening
- `fade-out` / `slide-out-to-top-2` — Exit animations for modals and toasts

These are applied declaratively in JSX: `className="animate-in fade-in slide-in-from-bottom-8 duration-700"`.

#### Custom Tailwind Keyframes (`tailwind.config.ts`)
Six custom keyframe animations registered in Tailwind:

| Animation Class | Effect | Used In |
|----------------|--------|---------|
| `animate-glow` | Pulsing glow halo around primary elements | Active tab indicator, CTA buttons |
| `animate-float` | Continuous vertical floating (0 → -20px → 0) | Landing page avatar |
| `animate-float-delayed` | Same float with different timing | Secondary landing page elements |
| `animate-pulse-slow` | Opacity fades 1 → 0.5 → 1 slowly | Loading states, idle badges |
| `animate-bounce-gentle` | Gentle vertical bounce | Quiz completion reward indicator |
| `animate-scale-in` | Scales from 0.9 to 1.0 + fades in | Modal content entry |
| `animate-accordion-down/up` | Height animates open/close | Accordion sections |

---

## 6. Form Handling & Input Validation

### What this feature does
StudiFy has multiple forms: Login, Sign-Up, Profile Edit, and Contact. Each form must:
- Handle user input without excessive re-renders
- Validate fields in real-time (e.g., invalid email format, password too short)
- Display appropriate error messages
- Prevent submission with invalid data

### Libraries & Modules Used

#### `react-hook-form` (v7.54.x) — Form State Management
Used in `LoginForm.tsx`, `SignUpForm.tsx`, `ProfileTab.tsx`, and the Contact page. React Hook Form uses **uncontrolled inputs with ref-based tracking** — this means the form does not re-render on every keystroke, making it significantly more performant than standard React controlled inputs.

```typescript
const {
  register,    // Registers an input field
  handleSubmit, // Wraps the submit handler
  formState: { errors, isSubmitting } // Error & loading state
} = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
```

#### `zod` (v3.24.x) — Schema Validation
Zod defines what valid data looks like for each form. Example: the Sign-Up schema enforces email format, minimum password length of 8 characters, and matching password confirmation — all in one schema declaration. Zod also auto-generates the TypeScript type for the form data:

```typescript
const signupSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignupData = z.infer<typeof signupSchema>; // TypeScript type auto-derived
```

#### `@hookform/resolvers` (v4.1.x) — Zod + React Hook Form Bridge
This adapter package makes React Hook Form run the Zod schema automatically on field blur and form submit, surfacing Zod error messages inside React Hook Form's `errors` object:

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
useForm({ resolver: zodResolver(signupSchema) });
```

Without this, calling Zod validation manually inside React Hook Form would require significant boilerplate code.

---

## 7. Quiz System (Daily & Custom Quizzes)

### What this feature does
The quiz system is the core gameplay mechanic of StudiFy. It includes:
- **15 standard academic categories**: DS/Algo, Database, OS, Networks, Math, Aptitude, Grammar, Programming, Physics, Chemistry, Biology, History, Geography, Literature, General Knowledge.
- **Daily Quiz**: One special quiz per day with a timer and bonus rewards.
- **Custom Quizzes**: User-created quizzes (generated by the AI chatbot or created manually) stored in Firestore.
- **Quiz Modal**: Displays questions one at a time with multiple-choice options, progress tracking, a timer bar, and a results screen showing score, coins earned, and correct answers.
- **AI-Generated Hints**: Users can request a hint for the current question from the AI without being given the direct answer.

### Libraries & Modules Used

#### `firebase/firestore` — Question Bank & Result Storage
- `getQuizQuestions(category)` — Fetches 15 questions for a category from the `quizQuestions` Firestore collection.
- `submitQuizResult(uid, category, questions, answers)` — Calculates score, updates the user's coin balance, records a transaction, saves the detailed quiz result to `users/{uid}/quizResults/`, and updates streak data.
- `saveCustomQuiz()` — Persists user-created quizzes to the `customQuizzes` collection.

#### `src/lib/mockQuestions.ts` — Fallback Question Source
If Firestore is unavailable (network failure, dev environment), the quiz system dynamically imports `getMockQuestions(category)` and uses pre-written offline questions. This ensures the quiz is never broken.

#### `src/lib/quizGenerator.ts` — AI Quiz Parser
When the AI chatbot generates quiz questions in JSON format, this module parses the raw AI output, validates the structure, and normalizes it into the `QuizQuestion[]` type ready to be rendered in the quiz modal.

#### `src/components/EnhancedQuizModal.tsx` — Quiz UI Component
The full quiz experience: question display, progress bar, answer selection via `@radix-ui/react-radio-group`, timer countdown, results screen. Uses `framer-motion` for question-to-question slide transitions and answer feedback animations (green flash = correct, red shake = wrong).

#### `src/components/DailyQuizCard.tsx` — Daily Quiz Trigger Component
Fetches the daily quiz from `/api/daily-quiz` and renders the "Take Today's Quiz" card. Uses `date-fns` to determine if the user has already completed today's quiz.

#### `date-fns` (v3.6.x) — Date Comparison for Quiz Availability
Used to check whether the current calendar day matches the `lastQuizDate` for each category. This gates the "Take Quiz" button — a category quiz can only be taken once per day. Using calendar days (not raw milliseconds) prevents edge cases like claiming the quiz at 11:59 PM and 12:01 AM being counted as two different days.

#### `/api/daily-quiz` — Next.js API Route
Server-side route that selects the day's quiz questions and ensures the same questions are served to all users on a given day (using date-based seeding).

#### `/api/generate-quiz` — Next.js API Route
Accepts a topic and difficulty, calls Groq AI, and returns a structured set of quiz questions. Used for the AI-generated custom quiz flow.

---

## 8. AI-Powered Study Assistant Chatbot

### What this feature does
The Study Assistant is an AI chatbot tutor. Students can:
- Ask subject-matter questions and receive detailed explanations
- Upload study documents (PDF, PPTX, DOCX, images) and ask questions about the content
- Request AI-generated summaries, study notes, or flashcard-style facts from uploaded material
- Conversationally create a custom quiz ("Create a 10-question Python quiz on medium difficulty")
- Receive personalized responses based on their own study stats (streak, badges, quiz performance)

The chatbot supports **streaming responses** — text appears word by word, like a typewriter, for a more natural conversational feel.

### Libraries & Modules Used

#### Groq AI API (`src/lib/groqService.ts`) — Cloud AI Inference
Groq provides ultra-fast inference via its cloud API (no npm package — uses native `fetch`). Two functions are exported:

- **`chatWithGroq()`**: Standard request — sends the full conversation history + system prompt to Groq and waits for the complete response.
- **`streamChatWithGroq()`**: Streaming request (`stream: true`) — the HTTP response body is a readable stream of Server-Sent Events. The frontend reads this stream chunk by chunk and appends each token to the UI as it arrives, creating the typewriter effect.

**AI Models Used:**
- `openai/gpt-oss-120b` — Default high-quality text model.
- `meta-llama/llama-4-scout-17b-16e-instruct` — Vision-capable model. Automatically selected when the user uploads an image so the AI can visually analyze diagrams, handwritten notes, and photos.

**User Context Injection**: The system prompt is dynamically built with the user's real stats pulled from Firestore:
```
- Name: Ojas (@ojasv)
- Coins: 2,450
- Login Streak: 12 days
- Perfect Days: 3
- DS/Algo Streak: 7
```
This enables the AI to answer personal questions like "How many coins do I have?" or give encouragement like "You're on a great streak!"

**AI Quiz Generation Protocol**: The system prompt instructs the AI to respond with a JSON-wrapped quiz object when a user asks to create a quiz — parsed by `src/lib/quizGenerator.ts` and rendered in `EnhancedQuizModal`.

#### Ollama Local AI (`src/lib/ollamaService.ts`) — Offline / Privacy-First Alternative
Ollama runs large language models (e.g., Llama 3, LLaVA) locally on the user's machine. For users who prefer complete data privacy (no data leaving the device), the chatbot can be switched to use Ollama instead of Groq. Functions exported:
- `chatWithOllama()` / `streamChatWithOllama()` — Chat with local model
- `summarizeStudyMaterial()` — Auto-summarizes uploaded document
- `generateStudyNotes()` — Produces structured study notes
- `generateQuizHint()` — Gives a subtle hint without revealing the answer
- `isOllamaAvailable()` — Health-checks the local server before trying to use it

#### `/api/ai` — Next.js API Route
Proxies streaming Groq AI requests from the browser. The browser cannot connect directly to Groq from the frontend for security reasons (the API key must stay server-side). This route adds the `Authorization: Bearer GROQ_API_KEY` header server-side and pipes the stream back to the client.

#### `/api/ollama` — Next.js API Route
Same pattern as `/api/ai` but for the local Ollama server. Handles CORS issues when the browser tries to reach `localhost:11434`.

#### `@radix-ui/react-scroll-area` — Chat Message Scrolling
The chat history is rendered inside a `<ScrollArea>` component that provides a custom-styled scrollbar and auto-scrolls to the latest message.

#### `framer-motion` — Message Entry Animations
Each new chat message (both user and assistant) animates in from the bottom using `AnimatePresence` and `motion.div`, making the conversation feel fluid.

---

## 9. Study Material Upload & Document Processing

### What this feature does
Users can upload study documents to the Study Assistant or the Study Materials tab. Supported formats: **PDF, PPTX, DOCX, TXT, JSON, and Images (JPG/PNG/WEBP)**. The system extracts the text content from the uploaded file and passes it to the AI as context, enabling document-specific Q&A.

### Libraries & Modules Used

#### `src/lib/fileProcessor.ts` — File Processing Engine (Custom Module)
This single file handles routing uploaded files to the correct extractor based on MIME type:

| File Type | Handler | Method |
|-----------|---------|--------|
| `application/pdf` | `extractFromPDF()` | Calls `/api/extract-text` (server-side, PDF.js) |
| `image/*` | `extractFromImage()` | Canvas pre-processing + Tesseract.js OCR (client-side) |
| `.pptx` | `extractFromPowerPoint()` | Calls `/api/extract-text` (server-side) |
| `.docx` | `extractFromWord()` | Calls `/api/extract-text` (server-side) |
| `text/*`, `application/json` | `extractFromText()` | Browser `File.text()` API (no library needed) |

#### `pdfjs-dist` (v5.4.x) — PDF Text Extraction
Mozilla's PDF.js library runs server-side in the `/api/extract-text` route to parse binary PDF data and extract all text content page by page. The extracted text is returned as a plain string to the client, which then passes it to the AI as context.

#### `react-pdf` (v10.x) — In-Browser PDF Viewer
In the Study Materials tab, uploaded PDFs are displayed page-by-page directly inside the browser using the `<Document>` and `<Page>` components from `react-pdf`. `pdfjs-dist` is its underlying rendering engine.

#### `/api/extract-text` — Next.js API Route
Server-side route that receives a multipart form upload and uses the appropriate server-side library to extract text from PDF, PPTX, or DOCX files. Returns `{ text: string }`.

#### `/api/pdf-proxy` — Next.js API Route
Fetches a PDF from an external URL on the server and streams it back to the client. This bypasses CORS restrictions that would prevent the browser from loading PDFs hosted on third-party domains (like Firebase Storage).

---

## 10. OCR — Image Text Extraction

### What this feature does
When a user uploads an image (a photo of lecture notes, a textbook page, a handwritten diagram), StudiFy extracts the text using Optical Character Recognition (OCR) entirely in the browser, without sending the raw image to any server. The extracted text is then passed to the AI chatbot as reading material.

### Libraries & Modules Used

#### `tesseract.js` (v7.x) — Client-Side OCR Engine
Tesseract.js is a JavaScript/WebAssembly port of Google's Tesseract OCR engine. It runs entirely in the browser.

The `extractFromImage()` function in `src/lib/fileProcessor.ts` implements a two-step pipeline:

**Step 1 — Image Pre-Processing** (custom canvas pipeline, no library):
```
Upload Image
    ↓
Draw on HTML5 <canvas>
    ↓
Apply grayscale filter (luminance formula: 0.299R + 0.587G + 0.114B)
    ↓
Apply binarization (pixels < 128 → pure black, else pure white)
    ↓
Ensure minimum 100×100px dimensions (Tesseract minimum)
    ↓
Export preprocessed image as PNG Blob
```
This pre-processing dramatically improves OCR accuracy, especially for low-contrast or dark-background images.

**Step 2 — OCR:**
```typescript
const worker = await createWorker('eng');      // Load English language model
await worker.setParameters({
  tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;()[]/- '
});
const { data: { text } } = await worker.recognize(preprocessedBlob);
await worker.terminate();
```

**Fallback Behavior**: If Tesseract fails (e.g., corrupted image, out of memory), the raw image is sent to `/api/extract-text` for a server-side OCR attempt.

**AI Vision Handoff**: Regardless of OCR success, the original image is also encoded as base64 and passed to the Groq vision model, which can visually analyze diagrams, graphs, and elements that OCR cannot capture as text.

---

## 11. Study Sessions & Focus Timer

### What this feature does
The Study Lab is a Pomodoro-style focused study session system. Students:
- Select a subject and start a timed session
- The timer tracks active study minutes
- Completing a session awards coins and records the session duration
- Session data feeds into the Study Insights analytics dashboard

### Libraries & Modules Used

#### `src/components/StudySessionTab.tsx` — Session UI Component
The main component for the Study Lab tab. Uses React's `useState` for timer state (running/paused, elapsed seconds) and `useEffect` with `setInterval` for the countdown clock.

#### `src/lib/studySessionFirebase.ts` — Session Persistence
Custom Firestore service that saves completed sessions to Firestore. Fields stored per session: `subject`, `startTime`, `endTime`, `durationMinutes`, `coinsEarned`. Also accumulates `totalStudyMinutes` and `totalStudySessions` on the user document.

#### `firebase/firestore` — Batch Writes for Session Completion
When a session ends, a `writeBatch` atomically: updates the user's coin balance, increments `totalStudyMinutes`, records a transaction, and saves the session document.

#### `date-fns` — Duration Formatting
Used to format elapsed time (e.g., `"45 minutes"`, `"1 hour 20 minutes"`) in the session history display.

#### `framer-motion` — Timer Animations
The circular progress ring around the timer animates smoothly as time elapses using Framer Motion's SVG path animation. Session completion triggers a celebration animation.

#### `@radix-ui/react-progress` — Linear Progress Bar
A secondary linear progress bar shows percentage of session target completed.

---

## 12. Gamification — Coins, Streaks & Rewards

### What this feature does
StudiFy uses a virtual economy to motivate consistent study habits:
- **Daily Login Bonus**: 100 coins on day 1, +5 coins per consecutive day (Day 2 = 105, Day 7 = 130, etc.)
- **Quiz Rewards**: 5 coins per correct answer
- **Coin Multiplier Boosters**: Shop items that double or triple quiz rewards
- **Login Streak Tracking**: Consecutive days of logging in
- **Quiz Streak Tracking**: Per-category consecutive days of quiz completion
- **Streak Penalties**: Missing a day reduces the coin balance by (missed streak × 5 coins) for login, or (missed streak × 2 coins) for each quiz category

### Libraries & Modules Used

#### `firebase/firestore` — Economy Data Storage
All balance updates, streak data, and transaction records live in Firestore. Key functions in `src/lib/firebase.ts`:

- **`claimDailyBonus(uid)`**: Uses `writeBatch` to atomically update coins + streak + `lastLoginDate` + add a transaction record in one database round-trip.
- **`submitQuizResult(uid, category, questions, answers)`**: Calculates coins earned (with potential multiplier), updates `quizStreaks[category]`, records the quiz result, and adds a transaction — all in one batch.
- **`applyPenalty(uid, reason, amount)`** (`src/lib/penaltyService.ts`): Deducts coins, records a penalty transaction, and creates a notification explaining the penalty.

#### `serverTimestamp` (Firestore Module)
All streak dates (`lastLoginDate`, `lastQuizDates.{category}`) use `serverTimestamp()` — critical for accuracy. Client clocks can be wrong or in different time zones, which would cause streak calculations to give incorrect results.

#### `date-fns` — Streak Arithmetic
The streak logic compares two `Timestamp` objects using calendar-day arithmetic (not raw millisecond difference):
```typescript
// Calculate days between last login and today using calendar midnight boundaries
const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const lastMidnight = new Date(last.getFullYear(), last.getMonth(), last.getDate());
const daysDiff = Math.round((todayMidnight - lastMidnight) / 86400000);
// daysDiff === 1 → consecutive day → extend streak ✓
// daysDiff === 0 → same day → already claimed today ✓
// daysDiff > 1  → missed days → reset streak + penalty ✓
```

#### `src/components/DailyBonusCard.tsx` — Bonus UI Component
Displays the current streak badge, bonus amount for tomorrow's claim, and the "Claim Daily Bonus" button. The button is disabled if the bonus has already been claimed today (checked by comparing `lastBonusClaimed.toDate()` to today's date).

#### `src/lib/penaltyService.ts` — Penalty Engine (Custom Module)
Handles all negative incentives — deducting coins and notifying the user when streaks are broken.

---

## 13. Badge System & Achievements

### What this feature does
Badges are digital achievement awards displayed on the user's profile. There are two types:
- **Auto-awarded badges**: Automatically given when a milestone is reached (e.g., "7 Day Streak", "Perfect Score", "100 Correct Answers in DS/Algo")
- **Purchasable badges**: Cosmetic badges available in the Badge Store for coins

### Libraries & Modules Used

#### `firebase/firestore` — Badge Storage
- Badge definitions live in the `badges` Firestore collection (name, description, price, icon, color, requirement)
- Owned badge IDs are stored in `users/{uid}.badges` as a string array
- `arrayUnion(badgeId)` atomically adds badge IDs to the array without duplicates (prevents double-awarding)

#### `src/lib/firebase.ts` — Badge Functions
- **`getBadges()`**: Reads the full badge catalog from Firestore.
- **`checkAndAwardBadges(uid, type, value, category)`**: Called after every quiz completion or daily login — compares the user's current streak/score to each badge's requirement and awards any newly-eligible badges using `writeBatch`.
- **`purchaseBadge(uid, badgeId)`**: Validates the user has enough coins, deducts the price, adds the badge to the user's array, and logs a debit transaction — all atomically via `writeBatch`.

#### `src/components/BadgeStore.tsx` — Badge UI Component
Displays owned badges and the purchasable badge catalog in a grid layout. Uses `@radix-ui/react-alert-dialog` for the purchase confirmation dialog and `@radix-ui/react-scroll-area` for the scrollable badge grid.

---

## 14. Virtual Coin Shop

### What this feature does
Users can spend earned coins in a virtual marketplace to purchase:
- **Coin Multiplier Boosters** (e.g., 2× quiz coin earnings for 5 uses)
- **Visual Customizations** (custom themes, profile frames, title badges)
- **Avatar Items** (special avatar unlocks)

### Libraries & Modules Used

#### `src/lib/shopFirebase.ts` — Shop Service Layer
- **`getShopItems()`**: Fetches the `shopItems` Firestore collection
- **`purchaseItem(uid, itemId)`**: Validates user balance, deducts coins, creates a purchase record in `users/{uid}/purchases/`, records a debit transaction — all in a single `writeBatch`.
- **`getActiveMultiplier(uid)`**: Checks if the user has an active booster. Called inside `submitQuizResult()` — if a multiplier is active, `coinsEarned` is multiplied before being credited.
- **`consumeBooster(uid, purchaseId)`**: Decrements the booster's `usesRemaining` count. When it hits 0, the booster is marked inactive.

#### `src/components/ShopTab.tsx` — Shop UI Component  
Renders shop items in a grid with category filters (Boosters / Visual / Profile / Avatar). Uses `@radix-ui/react-tabs` for category switching, `@radix-ui/react-alert-dialog` for purchase confirmation, and `framer-motion` for item card hover effects.

#### `src/components/ShopItemCard.tsx` — Item Card Component
Individual shop item card. Displays item name, description, price, stock, and a "Buy" button. Shows a "Purchased" state for already-owned items.

---

## 15. Leaderboard & Global Rankings

### What this feature does
A global leaderboard ranks all StudiFy users by their coin balance. The current user's rank is displayed on their dashboard and updates in real time after quiz completions and daily bonuses.

### Libraries & Modules Used

#### `firebase/firestore` — Leaderboard Queries
- **`getLeaderboard(limit)`**: Queries the `users` collection, fetches up to 50 users, sorts by coin balance in-memory (client-side), and deduplicates.
- **`getUserRank(uid, coins)`**: Uses `getCountFromServer(query(usersRef, where('coins', '>', userCoins)))` to count how many users have more coins — adding 1 gives the user's rank. This is highly efficient: it does not download user documents, just asks Firestore to run a server-side COUNT query.

#### `src/components/Leaderboard.tsx` — Leaderboard UI Component
Renders the ranked user list. Uses:
- `@radix-ui/react-avatar` — User profile pictures with initial fallbacks
- `@radix-ui/react-scroll-area` — Scrollable list for >10 entries
- `framer-motion` — Staggered entrance animation for rows + layout animation for rank changes

---

## 16. Performance Analytics & Data Visualization

### What this feature does
The Analytics tab (`CoinAnalytics.tsx`) provides interactive charts showing:
- Coin earning velocity over the past 7/14/30 days (line chart)
- Coins broken down by source: quiz vs. daily bonus vs. penalties (pie/bar chart)
- Quiz accuracy by category (bar chart, one bar per category)
- Engagement spectrum (how consistently the user logs in)

### Libraries & Modules Used

#### `recharts` (v2.15.x) — React Charting Library
Built on React + D3.js, Recharts renders all charts as SVG components. Components used in StudiFy:

| Recharts Component | Chart Type | Used For |
|-------------------|------------|---------|
| `LineChart` + `Line` | Time-series | Coin earnings over 7/14/30 days |
| `BarChart` + `Bar` | Category bars | Quiz performance by subject |
| `PieChart` + `Pie` + `Cell` | Donut chart | Coin source breakdown |
| `RadarChart` | Spider chart | Subject mastery overview |
| `ResponsiveContainer` | Layout wrapper | Makes all charts resize fluidly with screen width |
| `Tooltip` | Hover overlay | Shows precise values on hover |
| `Legend` | Chart legend | Labels for each data series |
| `XAxis` + `YAxis` | Axes | Date labels and coin amount labels |

#### `date-fns` — Chart Data Preparation
Used to generate the date labels for chart X-axes (e.g., `"Mon"`, `"Apr 12"`) and to group Firestore transaction records by calendar day for the time-series data.

#### `firebase/firestore` — Analytics Data Source
Transaction documents from `users/{uid}/transactions/` are fetched and aggregated client-side to produce chart data points. Each transaction has `amount`, `type`, `category`, and `timestamp` fields.

---

## 17. AI Study Insights

### What this feature does
The Insights tab (`StudyInsightsTab.tsx`) uses AI to analyze a user's study session history and quiz performance, then generates personalized recommendations displayed alongside charts. Examples: *"You consistently perform best between 8–10 PM"*, *"Your Biology score has improved 23% this week."*

### Libraries & Modules Used

#### `/api/generate-study-insights` — Next.js API Route
Receives the user's session history JSON payload, formats it into a prompt, calls Groq AI, and returns a structured insights object with recommendations, peak performance times, focus scores, and improvement suggestions.

#### Groq AI (`src/lib/groqService.ts`) — Insight Generation
The same `chatWithGroq()` function is called with a specialized system prompt that instructs the model to act as a learning analytics advisor and respond with structured JSON.

#### `recharts` — Insights Charts
The Insights tab shows additional charts: study minutes per day (area chart), focus quality score per session, and subject coverage (radar chart).

#### `date-fns` — Session Aggregation
Groups study session records by day/week for chart data and calculates streaks and averages.

---

## 18. User Profile & Avatar Customization

### What this feature does
Each user has a profile with:
- Display name and a unique username (3–20 characters, alphanumeric + dots/underscores)
- A bio / description
- A selected 3D avatar from a built-in avatar library
- Custom profile pictures (uploaded from device)
- Active badges displayed on the profile

### Libraries & Modules Used

#### `firebase/firestore` + `runTransaction` — Username Uniqueness
`updateUserProfile()` uses Firestore's `runTransaction` to enforce globally unique usernames. The transaction atomically:
1. Reads the current user document
2. Reads the target username document in the `usernames` collection
3. If the username is taken by someone else → **throw error**
4. If the username is available → delete the old username mapping, create the new one, update the user document

All steps happen as a single atomic unit — preventing race conditions.

#### `src/lib/avatarUtils.ts` — Avatar Utility (Custom Module)
Manages the built-in 3D avatar library. Exports the default avatar path and helper functions to list available male/female avatars from the `/public/3d_avatar_studify/` folder.

#### `src/components/ProfileTab.tsx` — Profile UI Component
Profile editing form. Uses:
- `react-hook-form` + `zod` — Form state and username validation
- `@radix-ui/react-tabs` — Sub-tabs inside the profile page (Edit Profile / Avatar Selection / Achievements)
- `@radix-ui/react-avatar` — Profile picture display with fallback initials
- `@radix-ui/react-dialog` — Avatar selection modal

#### `firebase/auth` — `updateProfile()`
After saving profile changes, `auth.currentUser.updateProfile({ displayName })` is called to sync the display name on the Firebase Auth record alongside the Firestore document.

---

## 19. Image Upload & Cloud Media Management

### What this feature does
Users can upload a custom profile picture from their device. The image is stored on Cloudinary's CDN (not Firebase Storage) and served via Cloudinary's optimized delivery URLs. When a new avatar is uploaded, the old one is automatically deleted from Cloudinary to prevent storage waste.

### Libraries & Modules Used

#### `cloudinary` (v2.9.x) — Cloud Media Platform
Used server-side in two API routes:

#### `/api/cloudinary-sign` — Signed Upload URL Generator
The Cloudinary API Secret must never be exposed in the browser. This API route:
1. Receives upload parameters from the client (filename, folder, timestamp)
2. Uses the Cloudinary SDK to generate a `SHA-256` signature with the secret key
3. Returns `{ signature, timestamp, cloudName, apiKey }` to the client

The client then uses this signature to upload the image directly to Cloudinary from the browser — the actual file bytes go straight from the browser to Cloudinary, bypassing the Next.js server (saving bandwidth).

#### `/api/cloudinary-delete` — Asset Deletion
Receives a `publicId` and uses the Cloudinary Admin API (authenticated with the secret) to permanently delete the asset. Called when a user uploads a new profile picture.

#### Upload Flow Summary
```
1. User selects image file → ProfileTab.tsx
2. Frontend calls POST /api/cloudinary-sign → gets signature
3. Frontend uploads image directly to Cloudinary (browser → Cloudinary CDN)
4. Cloudinary returns the hosted image URL
5. URL is saved to users/{uid}.avatarUrl in Firestore via updateUserProfile()
6. Frontend calls POST /api/cloudinary-delete with old publicId → old image removed
```

---

## 20. Notification Center

### What this feature does
StudiFy delivers in-app notifications for system events:
- Badge awarded automatically (streak milestone, perfect score)
- Streak penalty applied (missed login or quiz day)
- Welcome message for new users
- Leaderboard rank change alerts

Notifications are marked as read/unread and can be dismissed.

### Libraries & Modules Used

#### `firebase/firestore` — Notification Storage
Notifications live in `users/{uid}/notifications/` as individual documents. Fields: `type`, `message`, `read`, `createdAt`. Creating a notification uses `addDoc()` for auto-generated IDs.

Database operations used:
- `getDocs(query(notifRef, orderBy('createdAt', 'desc'), limit(20)))` — Fetch latest 20 notifications
- `updateDoc(notifRef, { read: true })` — Mark individual notification as read
- `writeBatch` — Batch mark-all-as-read operation

#### `src/components/NotificationCenter.tsx` — UI Component
Renders the notification list with unread count badge. Uses:
- `@radix-ui/react-scroll-area` — Scrollable notification list
- `@radix-ui/react-badge` — Unread count indicator
- `framer-motion` — Each notification slides in from the right when it arrives
- `date-fns` — Formats timestamps as relative time ("2 hours ago", "Yesterday")

---

## 21. Theme & Visual Customization

### What this feature does
StudiFy supports multiple color themes that users can switch between. The entire color scheme changes instantly — not just one or two colors, but the entire palette including backgrounds, cards, primary accents, borders, and text colors. The selected theme persists across browser sessions.

### Libraries & Modules Used

#### `src/context/ThemeContext.tsx` — Theme State Manager (Custom Module)
A React Context that:
- Reads the saved theme from `localStorage` on mount
- Applies the selected theme by adding/removing CSS class names on the `<html>` element (`class="dark theme-violet"`)
- Exports `useTheme()` hook for any component to read or change the theme

#### `tailwindcss` — CSS Variable Color System
All colors in StudiFy are defined as CSS custom properties in `src/app/globals.css`:
```css
:root {
  --background: 240 10% 3.9%;
  --primary: 263.4 70% 50.4%;
  --foreground: 0 0% 98%;
  ...
}
.theme-blue {
  --primary: 221.2 83.2% 53.3%;
  ...
}
```
When the theme class changes on `<html>`, every element using `bg-primary`, `text-foreground`, etc. automatically updates its color — zero JavaScript DOM manipulation needed.

#### `src/components/CustomizationTab.tsx` — Theme Selector UI
Displays theme previews as color swatches. Clicking a swatch calls `setTheme(themeName)` from `useTheme()`, which updates the class on `<html>` and saves to `localStorage`.

---

## 22. Server-Side API & Cloud Functions

### What this feature does
Certain operations cannot safely or correctly run in the browser:
- AI API keys must stay server-side
- PDF text extraction requires Node.js libraries
- Cloudinary signatures require the API secret
- Scheduled tasks (daily quiz reset, cron jobs) must run on a server

### Libraries & Modules Used

#### Next.js API Routes (`src/app/api/`) — BFF (Backend-For-Frontend)
9 API routes that run on the Next.js server Node.js runtime:

| Route | HTTP | Libraries Used | Purpose |
|-------|------|---------------|---------|
| `/api/ai` | POST | Native `fetch` to Groq | Proxies Groq AI (streaming or standard) |
| `/api/ollama` | POST | Native `fetch` to Ollama | Proxies local Ollama AI requests |
| `/api/extract-text` | POST | `pdfjs-dist`, server-side parsers | Extracts text from PDF/PPTX/DOCX |
| `/api/generate-quiz` | POST | Groq API | AI-generated quiz questions by topic |
| `/api/daily-quiz` | GET | `firebase-admin` | Serves today's quiz questions |
| `/api/generate-study-insights` | POST | Groq API | AI analysis of study performance |
| `/api/cloudinary-sign` | POST | `cloudinary` SDK | Generates signed upload URLs |
| `/api/cloudinary-delete` | POST | `cloudinary` SDK | Deletes assets from Cloudinary |
| `/api/pdf-proxy` | GET | Native `fetch` | Streams external PDFs, bypasses CORS |

#### Firebase Cloud Functions (`firebase-functions` v4.4.x — `functions/` folder)
Serverless functions deployed to Google Cloud. Used for:
- **Scheduled cron jobs**: Daily quiz question rotation, streak reminder push notifications
- **Firestore triggers**: Automatically updating derived data when user documents change

**Dependencies inside `functions/`**:
- `firebase-admin` v11.x — Admin SDK for privileged Firestore writes
- `firebase-functions` v4.4.x — Cloud Functions SDK (triggers, HTTP functions, scheduled functions)
- `@google-cloud/storage` v6.9.x — Direct access to Firebase Storage buckets from functions
- `axios` v1.6.x — HTTP client for making external API calls within functions

#### `dotenv` (v16.x) — Environment Variable Management
All secrets are stored in `.env.local` (never committed to Git). Next.js automatically loads this file. Variables:
- `NEXT_PUBLIC_FIREBASE_*` — Firebase project config (publicly safe since prefixed with `NEXT_PUBLIC_`)
- `GROQ_API_KEY` — Server-only Groq API key
- `CLOUDINARY_API_SECRET` — Server-only Cloudinary secret
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` — Cloudinary identifiers

#### `tsx` (v4.20.x) — TypeScript Script Runner
Used to run database seeding scripts directly with TypeScript without compilation:
```bash
tsx src/scripts/initializeShop.ts   # Seeds shop items into Firestore
tsx src/scripts/seedBadges.ts       # Populates the badge catalog
```

---

## 23. Type Safety & Code Quality

### What this feature does
The entire codebase is written in TypeScript, with strict type checking catching bugs at development time before they reach users. ESLint enforces code quality and React best practices. Type definitions for all data models are centralized.

### Libraries & Modules Used

#### `typescript` (v5.x) — Static Type Checker
All files end in `.ts` or `.tsx`. Custom types are defined in `src/lib/types.ts`:

| Type / Interface | Represents |
|-----------------|------------|
| `UserData` | Complete user profile (30+ fields) |
| `Transaction` | Coin credit/debit record |
| `QuizQuestion` | A single quiz question |
| `QuizResult` | A completed quiz session |
| `Badge` | Badge definition + requirements |
| `ShopItem` | A virtual shop product |
| `Purchase` | A completed shop transaction |
| `Notification` | An in-app notification |
| `LeaderboardEntry` | A leaderboard user entry |
| `QuizCategory` | Union type of all 15 category strings |

#### `@types/node`, `@types/react`, `@types/react-dom` — Type Definitions
These DevDependency packages provide TypeScript type definitions for Node.js built-ins, React APIs, and ReactDOM — enabling full IDE IntelliSense and compile-time checking.

#### `eslint` (v8.57.x) + `eslint-config-next` — Code Linting
- `npm run lint` runs ESLint across all source files
- `eslint-config-next` enforces Next.js-specific rules: React Hooks rules, no missing key props in lists, no direct `<img>` usage (must use `next/image`), Core Web Vitals performance patterns
- The `functions/` folder has a separate ESLint config using `@typescript-eslint` rules for server-side TypeScript

---

## 24. Complete Library Reference Table

| Library / Package | Version | Category | Core Purpose in StudiFy |
|------------------|---------|----------|------------------------|
| `next` | ^15.5.14 | Framework | App routing, SSR, API routes, Turbopack |
| `react` + `react-dom` | ^18.3.1 | Framework | UI component model |
| `typescript` | ^5 | Language | Static type safety |
| `@radix-ui/react-tabs` | ^1.1.3 | UI | Dashboard tab navigation |
| `@radix-ui/react-dialog` | ^1.1.6 | UI | Quiz modals, profile dialogs |
| `@radix-ui/react-alert-dialog` | ^1.1.6 | UI | Purchase confirmations |
| `@radix-ui/react-dropdown-menu` | ^2.1.6 | UI | Header navigation dropdown |
| `@radix-ui/react-select` | ^2.1.6 | UI | Category / difficulty selectors |
| `@radix-ui/react-toast` | ^1.2.6 | UI | Success/error notifications |
| `@radix-ui/react-tooltip` | ^1.1.8 | UI | Icon hover tooltips |
| `@radix-ui/react-progress` | ^1.1.2 | UI | Progress bars |
| `@radix-ui/react-slider` | ^1.2.3 | UI | Settings sliders |
| `@radix-ui/react-switch` | ^1.1.3 | UI | Toggle switches |
| `@radix-ui/react-radio-group` | ^1.2.3 | UI | Quiz answer selection |
| `@radix-ui/react-accordion` | ^1.2.3 | UI | Collapsible sections |
| `@radix-ui/react-avatar` | ^1.1.3 | UI | Profile picture display |
| `@radix-ui/react-popover` | ^1.1.6 | UI | Pop-over information cards |
| `@radix-ui/react-scroll-area` | ^1.2.3 | UI | Custom scrollable regions |
| `@radix-ui/react-checkbox` | ^1.1.4 | UI | Multi-select options |
| `@radix-ui/react-separator` | ^1.1.2 | UI | Section dividers |
| `@radix-ui/react-label` | ^2.1.2 | UI | Accessible form labels |
| `@radix-ui/react-slot` | ^1.2.3 | UI | Polymorphic button component |
| `lucide-react` | ^0.475.0 | UI | SVG icon library |
| `tailwindcss` | ^3.4.1 | Styling | Utility CSS framework |
| `framer-motion` | ^12.34.0 | Animation | Page transitions, micro-interactions |
| `tailwindcss-animate` | ^1.0.7 | Animation | CSS entry/exit animations |
| `class-variance-authority` | ^0.7.1 | Styling | Type-safe component variants |
| `tailwind-merge` | ^3.0.1 | Styling | Tailwind class conflict resolution |
| `clsx` | ^2.1.1 | Styling | Conditional class application |
| `firebase` | ^11.9.1 | Backend | Client SDK — Auth + Firestore + Storage |
| `firebase-admin` | ^13.6.1 | Backend | Admin SDK — server-side privileged ops |
| `firebase-functions` | ^4.4.0 | Backend | Cloud Functions — cron jobs, triggers |
| `firebase-tools` | ^15.6.0 | DevTools | Firebase CLI for deployment |
| Groq API (fetch) | — | AI | Cloud LLM inference (chat + vision) |
| Ollama API (fetch) | — | AI | Local LLM inference (privacy-first) |
| `tesseract.js` | ^7.0.0 | AI / OCR | Client-side image text extraction |
| `pdfjs-dist` | ^5.4.624 | Documents | PDF rendering and text extraction |
| `react-pdf` | ^10.3.0 | Documents | In-browser PDF viewer component |
| `cloudinary` | ^2.9.0 | Media | Image upload, storage, CDN delivery |
| `react-hook-form` | ^7.54.2 | Forms | Performant form state management |
| `zod` | ^3.24.2 | Validation | Schema validation + TypeScript types |
| `@hookform/resolvers` | ^4.1.3 | Validation | Zod ↔ React Hook Form bridge |
| `recharts` | ^2.15.1 | Analytics | Interactive React charts |
| `date-fns` | ^3.6.0 | Utilities | Date manipulation and formatting |
| `dotenv` | ^16.6.1 | Config | Environment variable loading |
| `tsx` | ^4.20.5 | DevTools | TypeScript script runner |
| `eslint` + `eslint-config-next` | ^8.57.1 | DevTools | Code linting and quality enforcement |
| `postcss` + `autoprefixer` | ^8 | Build | CSS processing pipeline |
| `@types/node/react/react-dom` | v20/18/18 | DevTools | TypeScript type definitions |

---

*Document prepared based on full source code analysis of the StudiFy project — `package.json`, all `src/lib/` service files, `src/components/`, `src/app/api/`, `src/context/`, and configuration files. All version numbers reflect actual installed dependencies as of April 2026.*
