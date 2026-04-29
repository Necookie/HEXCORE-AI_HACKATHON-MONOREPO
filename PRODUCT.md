# Product

## Overview
StudyBearer is an AI-powered educational workflow application designed to eradicate the cognitive load of academic planning and testing. By shifting the burden of scheduling, chunking, and testing to an automated AI pipeline, StudyBearer transforms passive dread into an active, gamified learning journey.

## The Problem: The Student Productivity Crisis
The current higher education landscape is defined by a systemic failure in student productivity and retention, driven by four core cognitive barriers.

### 2.1 Executive Dysfunction
The overwhelming task of breaking down a 100-page document into studyable chunks is not merely frustrating—it is clinically debilitating. Success in higher education demands strong executive cognition: planning, problem-solving, and task management. Deficits in these areas directly cause academic underperformance and heightened psychological stress.
> **[DATA CARD]**
> *   **5x** more likely to struggle academically if suffering from executive dysfunction (*Skill Point Therapy, 2024*).
> *   **~30%** of university students show clinically significant executive dysfunction symptoms (*PLOS One / PMC, 2025*).

### 2.2 Planning Friction
A significant portion of students' cognitive energy is consumed not by learning, but by the "meta-task" of deciding what and when to study. This planning overhead results in widespread deadline failure. Nearly half of students invest less than one hour daily in coursework, and the majority submit tasks only in the final hours before a deadline.
> **[DATA CARD]**
> *   **~50%** of students spend less than 1 hour per day on coursework (*Time Mgmt. Stats, 2025*).
> *   **58%** of students submit assignments within 24 hours of the deadline despite having days of lead time (*Life Hack Method, 2025*).

### 2.3 Passive Learning
The dominant study method among students—re-reading, highlighting, and rewatching—is demonstrably the least effective approach to long-term retention. Students who rely on passive reading retain roughly half the material of peers who employ active recall strategies.
> **[DATA CARD]**
> *   **57% vs 29%** retention rate: Active Recall vs. Passive Reading (*Karpicke & Roediger, 2025*).
> *   **91%** of students rely primarily on ineffective re-reading or rewatching (*Persky et al.; ScienceDirect, 2025*).

### 2.4 Lack of Momentum
Traditional learning management systems offer no motivational scaffolding, leaving students to rely entirely on self-discipline—a resource consistently depleted by stress. Procrastination among college-aged students is nearly universal and directly damages grades and well-being.
> **[DATA CARD]**
> *   **80–95%** of college students procrastinate to some degree (*Steel, 2007; APA Monitor on Psychology*).
> *   **75%** of students consider themselves habitual procrastinators (*Frontiers in Psychology, 2022*).

## The CodeBearers Solution
We don't just provide another document reader. We provide an **Automated Learning Pipeline**. 
*   **Cognitive Offloading:** We shift the burden of "planning" and "scheduling" to AI. 
*   **Seamless Integration:** By pushing roadmaps directly to Google Calendar, we meet the student where they already live.
*   **Gamified Retention:** We turn studying into a competitive sport with Elo ranks, streaks, and dynamic rewards, transforming passive dread into active engagement.
*   **Centralized Intelligence:** A RAG-powered nervous system that knows your materials better than you do.

## User Guide: Navigating the Pipeline

This section serves as the definitive manual for both human users and the RAG Assistant.

### 1. Authentication: Joining the Pipeline
*   **Sign Up:** Click the "Sign Up" button on the landing page. Provide your email, a secure password, and a unique username. 
*   **Login:** Access your dashboard by entering your credentials at the login portal. 
*   **Authentication Events:** Every signup and login is monitored by our business nervous system via Discord webhooks to ensure platform security and support.

### 2. Initialization: The Intake Phase
To start your learning journey, you must feed the pipeline:
1.  **Upload PDF:** Navigate to the Dashboard and click **"Upload PDF"**. Select your syllabus, textbook chapter, or lecture notes (Max 25MB).
2.  **Define Constraints:** 
    *   **Goal:** Set your target completion date.
    *   **Availability:** Specify which days you can study and for how long (e.g., 2 hours on MWF).
3.  **Roadmap Generation:** Once submitted, n8n parses the material. Within seconds, a detailed **Study Roadmap** is generated, breaking the PDF into logical "Execution Modules."
4.  **Calendar Sync:** Authorize Google Calendar access to have your study blocks automatically scheduled as timed events, reducing the cognitive load of "when" to study.

### 3. The Command Center: Dashboard & Platform
*   **Active Subjects:** View all your uploaded materials and your progress percentage for each.
*   **Today's Sessions:** A prioritized list of modules scheduled for the current 24-hour window.
*   **Stat Strip:** Real-time tracking of your **Current Streak (Combo)**, **Elo Rating**, **Quizzes Passed**, and **Total Study Hours**.

### 4. Execution: The Study Session
When it's time to study:
1.  **Start Session:** Click on a scheduled module. You will be presented with the specific "chunk" of material to focus on.
2.  **Active Recall (Quiz):** After studying, you must pass a dynamic quiz. These are generated on-the-fly and include Multiple Choice, Identification, and Enumeration questions.
3.  **Flashcards:** Use the AI-generated flashcard deck for quick-fire review and spaced repetition.
4.  **Mind Map:** Visualize the connections between topics within your subject using the interactive Mind Map view.

### 5. Progression: Ranks & Achievements
*   **Earning Elo:** Pass quizzes with high accuracy to gain Elo. Consecutive successes build a **Combo multiplier**.
*   **Climbing Ranks:** Progress through the five Bear Tiers: **Cub $\rightarrow$ Panda $\rightarrow$ Grizzly $\rightarrow$ Polar $\rightarrow$ Spirit Bear**.
*   **Unlocking Badges:** Earn cosmetic achievements like "First Blood" (First quiz pass) or "7-Day Inferno" (Week-long streak).

### 6. RAG Assistant: Instant Intelligence
The RAG-powered chatbot is accessible throughout the platform. You can:
*   **Ask about the Product:** "How do I sync my calendar?" or "What are the rank requirements?"
*   **Ask about your Materials:** "Summarize Chapter 3 of my Biology PDF" or "Explain the concept of Recursion from my notes."
*   **Get Study Tips:** "How can I improve my quiz accuracy?"

## How We Do It (Execution)
1.  **Intake Phase:** The user provides the raw material (PDF) and their constraints (availability, deadline).
2.  **Orchestration Phase:** n8n (our Central Nervous System) takes over—parsing the file, chunking topics, and calculating the optimal schedule.
3.  **Deployment Phase:** The roadmap is simultaneously updated in the platform dashboard and pushed to the user's Google Calendar.
4.  **Feedback Loop:** After each session, n8n generates a custom quiz. Passing the quiz builds streaks and awards Elo, triggering cinematic animations that reinforce the "win."

## Technical Architecture
*   **Frontend:** **Astro** (Islands Architecture for speed) & **React JS** (for interactive components).
*   **Backend & Database:** **Supabase** (Postgres, Auth, Storage) managed with **Prisma ORM**.
*   **Automation Core:** **n8n** acting as the central nervous system for AI agent routing and API orchestration.
*   **Deployment & CDN:** Hosted on **Cloudflare Pages** utilizing **Cloudflare's Edge Network** for global performance.
*   **AI Engine:** Integration with **Gemini/OpenAI** models for RAG and content generation.

## Feature Ecosystem

### 1. User Side (Learning Experience)
The user side focus is on frictionless learning and cognitive offloading.

*   **RAG-Powered Personal Assistant:** A dedicated chatbot (Retrieval-Augmented Generation) that allows users to ask specific questions about the product, their materials, or study techniques and receive immediate, context-aware answers.
*   **n8n "Nervous System":** The entire backend logic is orchestrated by n8n, acting as the central nervous system that coordinates between the user's files, the AI models, and external services.
*   **Automated Study Roadmap:** 
    *   **Intake:** Users upload study materials (PDFs) and define their target goals (e.g., "Master Data Structures by May 20th").
    *   **Parameters:** Users specify their availability (time spent per session, specific study days).
    *   **Orchestration:** n8n automatically parses the material, chunks it into logical modules, and generates a personalized roadmap.
    *   **Calendar Sync:** The roadmap is pushed directly to the user's **Google Calendar**, automatically scheduling study blocks to reduce the friction of manual planning.
*   **Gamified Study Sessions:**
    *   Each study session triggers the generation of **dynamic quizzes** (MCQ, Identification, Enumeration) and **flashcards**.
    *   The learning process is gamified with streaks, ranks, and achievements to maintain momentum.
    *   Everything is personalized based on the specific content of the uploaded file.

### 2. Business Side (Management & Growth)
The business side focuses on lead conversion and operational monitoring.

*   **RAG-Powered Lead Assistance:** The RAG chatbot doubles as a sales assistant, helping potential clients understand how StudyBearer can assist them, providing instant replies to inquiries, and facilitating user conversion.
*   **Discord Business Webhooks:** A real-time monitoring system via Discord webhooks (triggered by n8n) that logs:
    *   **User Registrations:** Notifies owners of new signups.
    *   **Logins/Logouts:** Tracks platform activity and engagement.
    *   **Account Deletions:** Provides insights into churn and feedback.
*   **Operational Transparency:** Owners can manage and monitor the "nervous system" through the n8n dashboard, ensuring the AI orchestration is performing as expected.

## Users
Overwhelmed students struggling with executive dysfunction and heavy academic loads, and competitive learners motivated by gamification, streaks, and visual progression.

## Product Purpose
StudyBearer automates the friction of academic planning by transforming passive PDF course materials into an active, scheduled, and gamified learning pipeline integrated with Google Calendar and AI-powered quizzes.

## Brand Personality
Cinematic, Moody, Tactical, Competitive, Precise. It feels like a high-end AI assistant or a tactical gaming dashboard—exacting and authoritative, yet fully on the user's side.

## Design Principles
1. **The Deep Void:** Use a cinematic, infinite dark canvas to reduce cognitive dread and eye strain.
2. **Tactical Precision:** Every interface element should feel like a piece of high-end equipment or a tactical HUD.
3. **Gamified Momentum:** Progress is never just "done"; it's a "combo," a "rank-up," or an "achievement."
4. **Frictionless Orchestration:** The AI does the heavy lifting (planning, chunking, testing), so the UI should feel like a command center for that automation.
5. **Neon Guidance:** Use glowing accents (Indigo/Violet) to draw focus to the "Next Action" or high-tier achievements.

## Design Doctrine: The "Glass-Neon" Aesthetic
StudyBearer explicitly distances itself from sterile, institutional, and infantilizing educational platforms.
*   **The Deep Void:** We use a cinematic, infinite dark canvas (`#0a0a0c`) to reduce cognitive dread and eye strain.
*   **Tactical HUD:** Every interface element is designed to feel like a piece of high-end equipment or a tactical command center.
*   **Neon Guidance:** Glowing accents (Neon Indigo and Violet Arc) draw the user's focus to the "Next Action" or high-tier achievements.

## Gamification Philosophy (The Lexicon)
We treat studying like a competitive sport. Our terminology reflects this shift in mindset:
*   **The Pipeline / Roadmap:** Instead of a static "Study Plan."
*   **Executing Modules:** Instead of "Doing Homework."
*   **Combo / Streak:** Instead of "Consecutive Days."
*   **Elo / Points:** Instead of "Grades / Scores."
*   **Competitive Ranks:** Users progress through tiers: **Cub, Panda, Grizzly, Polar, and Spirit Bear.**

## Accessibility & Inclusion
- High contrast for primary text (White on Deep Void).
- Exclusively Dark Mode (designed for late-night focus).
- Clear visual hierarchy using Muted Steel for secondary info.

## The Team: CodeBearers
**School:** Laguna State Polytechnic University - Sta Cruz Campus

- **Dheyn Michael Orlanda** - 3rd year BSCS Student
- **Francis Neil Mistica** - 3rd year BSCS Student
- **Christine Arroyo** - 2nd year BSCS Student

**Coach:** Mark Bernardino

## References
1.  Steel, P. (2007). The nature of procrastination: A meta-analytic and theoretical review of quintessential self-regulatory failure. *Psychological Bulletin*. American Psychological Association (APA).
2.  Karpicke, J. D., & Roediger, H. L. (2008/2025). The Critical Importance of Retrieval for Learning. *Science* (Updated data via FlashGenius Meta-study 2025).
3.  Persky, A. M., et al. (2025). Survey of student study habits and adoption of active learning strategies. *ScienceDirect*.
4.  Skill Point Therapy (2024). Clinical impacts of executive dysfunction on academic performance in higher education.
5.  Life Hack Method (2025). Time Management Statistics: Annual Report on Student Productivity and Deadline Compliance.
6.  *PLOS One / PMC* (2025). Prevalence of Executive Dysfunction Symptoms in University Populations: A Multi-Center Study.
7.  *Frontiers in Psychology* (2022). Habitual Procrastination and its Impact on Student Grades and Well-being.
