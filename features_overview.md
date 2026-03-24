# StudiFy: Platform Features and Technology Stack Overview

This document provides a comprehensive overview of the **StudiFy** platform's core features and the underlying libraries and technologies that power them.

## 1. Core Framework & Architecture
**Features / Responsibility:**
*   Overall application routing, server-side rendering (SSR), and frontend component structure.
*   Type-safe development and modular architecture.
**Libraries Used:**
*   **Next.js (v15)**: The primary React framework handling routing, Server Components, and API routes.
*   **React (v18)**: Core UI library.
*   **TypeScript**: Ensures type safety across the frontend and backend logic.

## 2. Authentication, Database & Identity
**Features / Responsibility:**
*   User registration, login, email verification, and session management.
*   Real-time data storage for user profiles, study sessions, quizzes, coin transactions, and leaderboards.
**Libraries Used:**
*   **Firebase / Firebase Admin SDK**: Handles all authentication and Firestore database operations. Firestore acts as the primary NoSQL backend.

## 3. UI/UX Design & Styling
**Features / Responsibility:**
*   Modern, responsive, "glassmorphic" user interface.
*   Fluid animations, interactive hover states, and dynamic page transitions.
*   Accessible UI components (modals, dropdowns, tabs, sliders).
*   Consistent iconography.
**Libraries Used:**
*   **Tailwind CSS**: Utility-first CSS framework for rapid, custom styling.
*   **Framer Motion**: Powers the complex, physics-based animations (especially prominent on the landing page).
*   **Radix UI (`@radix-ui/react-*`)**: Provides robust, headless UI primitives (e.g., Tabs, Dialogs, Selects, Tooltips) that ensure accessibility.
*   **Lucide React**: The primary icon library used throughout the application.
*   **Tailwind Merge / CLSX / CVA**: Utilities for dynamically merging and managing Tailwind classes safely.

## 4. Gamification & Economics
**Features / Responsibility:**
*   **Coins & Daily Bonuses**: Users earn virtual currency for taking quizzes, maintaining login streaks, and studying.
*   **Badges & Achievements**: Visual rewards unlocked for specific milestones (e.g., "Quiz Master", "7 Day Streak").
*   **Leaderboard**: Global ranking system based on coins or study time.
*   **Coin Shop**: A marketplace where users can spend their earned coins to purchase customizations or avatars.
**Libraries Used:**
*   **Firebase Firestore**: Manages the transactional state and leaderboards.
*   **React (Custom Logic)**: State management for live balance updates and streak calculations.

## 5. AI & Machine Learning Integration
**Features / Responsibility:**
*   **Study Assistant Chatbot**: An AI tutor that answers questions and guides learning without just giving away answers.
*   **AI Study Insights**: Analyzes user study patterns, focus levels, and distractions to provide personalized recommendations.
*   **Content Generation**: Automatic generation of quizzes, hints, and study notes from user-provided materials.
**Libraries Used:**
*   **Google Genkit (`@genkit-ai/googleai`, `@genkit-ai/next`) & `@google/generative-ai`**: Integrates DeepMind's Gemini models for powerful cloud-based AI processing.
*   **Local Ollama (`ollamaService.ts`)**: Integrates local LLMs (like `llama3` and `llava` for vision) for privacy-first or localized AI processing (chat, material summarization, quiz generation).

## 6. Document & Image Processing (Study Materials)
**Features / Responsibility:**
*   **PDF to Quiz**: Allows users to upload PDFs or images to generate custom interactive quizzes.
*   **OCR (Optical Character Recognition)**: Extracts text from images uploaded by users.
**Libraries Used:**
*   **pdfjs-dist / react-pdf**: Renders and extracts text from PDF documents.
*   **tesseract.js**: Performs client-side OCR on images to extract textual study material.
*   **Cloudinary / cloudinary-react**: Cloud storage and optimization for user-uploaded images and avatars.

## 7. Data Visualization & Analytics
**Features / Responsibility:**
*   **Coin Analytics**: Visualizes earnings velocity, coin sources, and engagement spectrums.
*   **Study Insights**: Displays charts for subject mastery (hours vs. focus), learning velocity trends, and peak performance times.
**Libraries Used:**
*   **Recharts**: A composable charting library built on React components used to render the Line, Bar, and Pie charts used in analytics dashboards.

## 8. Forms & Validation
**Features / Responsibility:**
*   Handling complex inputs, user registration, and profile customization safely and predictably.
**Libraries Used:**
*   **React Hook Form**: Performant, flexible, and extensible form state management.
*   **Zod** & **@hookform/resolvers**: Schema-based validation to ensure data integrity before it hits the backend.

## 9. Utilities & Communication
**Features / Responsibility:**
*   **Mailing**: Sending transactional emails (like email verification).
*   **Date/Time Formatting**: Parsing and formatting timestamps for quizzes, streaks, and sessions.
**Libraries Used:**
*   **@sendgrid/mail**: External service integration for automated email delivery.
*   **date-fns**: Comprehensive utility library for manipulating JavaScript dates.
*   **react-day-picker**: For calendar and date selection UI components.
