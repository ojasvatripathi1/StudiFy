You are an expert Database Architect and Data Modeler. I need you to generate a highly detailed, professional Entity-Relationship (ER) Diagram for my application called **StudiFy**.

StudiFy is an educational platform with gamification, AI study assistants, coin economics, and detailed study session tracking. The backend uses a NoSQL database (Firebase Firestore), but I need a **Conceptual/Logical ER Diagram** to visualize the data models and their relationships clearly for project documentation.

Please generate the ER diagram code using **Mermaid.js syntax (`erDiagram`)** so I can render it directly, and provide a brief explanation of the key relationships.

Here are the precise Entities, Attributes, and Relationships derived from our system's TypeScript models:

### 1. Entities and Attributes

**User (UserData)**
*   `uid` (String, Primary Key)
*   `email` (String)
*   `username` (String, Unique)
*   `displayName` (String)
*   `coins` (Integer)
*   `loginStreak` (Integer)
*   `perfectDays` (Integer)
*   `totalQuizzesTaken` (Integer)
*   `totalStudyMinutes` (Integer)
*   `totalStudySessions` (Integer)
*   `createdAt` (Timestamp)

**Transaction**
*   `id` (String, Primary Key)
*   `userId` (String, Foreign Key)
*   `amount` (Integer)
*   `type` (Enum: credit, debit)
*   `category` (Enum: bonus, quiz, penalty, study_session, shop)
*   `description` (String)
*   `timestamp` (Timestamp)

**StudySession**
*   `id` (String, Primary Key)
*   `userId` (String, Foreign Key)
*   `subject` (String)
*   `title` (String)
*   `status` (Enum: active, paused, completed, abandoned)
*   `startTime` (Timestamp)
*   `endTime` (Timestamp)
*   `duration` (Integer)
*   `focusLevel` (Integer)
*   `productivity` (Integer)
*   `coinsEarned` (Integer)

**SessionInsight**
*   `id` (String, Primary Key)
*   `userId` (String, Foreign Key)
*   `period` (Enum: daily, weekly, monthly)
*   `totalSessions` (Integer)
*   `totalStudyTime` (Integer)
*   `consistencyScore` (Integer)
*   `date` (Timestamp)

**QuizResult**
*   `id` (String, Primary Key)
*   `userId` (String, Foreign Key)
*   `category` (String)
*   `score` (Integer)
*   `totalQuestions` (Integer)
*   `correctAnswers` (Integer)
*   `coinsEarned` (Integer)
*   `timestamp` (Timestamp)

**QuizQuestion**
*   `id` (String, Primary Key)
*   `category` (String)
*   `question` (String)
*   `difficulty` (Enum: easy, medium, hard)
*   `points` (Integer)

**ShopItem**
*   `id` (String, Primary Key)
*   `name` (String)
*   `category` (Enum: booster, visual, profile, avatar)
*   `price` (Integer)
*   `stock` (Integer)

**Purchase**
*   `id` (String, Primary Key)
*   `userId` (String, Foreign Key)
*   `itemId` (String, Foreign Key)
*   `price` (Integer)
*   `purchasedAt` (Timestamp)
*   `active` (Boolean)

**Badge**
*   `id` (String, Primary Key)
*   `name` (String)
*   `description` (String)
*   `icon` (String)
*   `color` (String)

**Notification**
*   `id` (String, Primary Key)
*   `userId` (String, Foreign Key)
*   `title` (String)
*   `message` (String)
*   `type` (String)
*   `read` (Boolean)

---

### 2. Relationships

*   **User to Transaction:** One-to-Many (A user can have multiple coin transactions).
*   **User to StudySession:** One-to-Many (A user can log multiple study sessions).
*   **User to SessionInsight:** One-to-Many (A user has many daily/weekly/monthly insights generated).
*   **User to QuizResult:** One-to-Many (A user can take multiple quizzes and generate results).
*   **QuizResult to QuizQuestion:** Many-to-Many (A quiz result references the specific questions asked during that session).
*   **User to Purchase:** One-to-Many (A user can buy multiple items from the shop).
*   **ShopItem to Purchase:** One-to-Many (A specific shop item can be purchased many times by different users).
*   **User to Badge:** Many-to-Many (Users can unlock multiple badges, and badges belong to multiple users).
*   **User to Notification:** One-to-Many (A user receives multiple notifications).

### Instructions for the AI Output:
1.  Output the **Mermaid.js code block** cleanly so it renders without errors.
2.  Use standard Crow's Foot notation mapping (e.g., `||--o{`).
3.  Include PK and FK tags inside the Mermaid diagram entities.
4.  Optionally, apply a modern, clear theme to the Mermaid diagram.
5.  Provide a short 2-3 sentence summary of the core database topology.
