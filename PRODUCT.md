# Product

## Overview
StudyBearer is an AI-powered educational workflow application designed to eradicate the cognitive load of academic planning and testing. By shifting the burden of scheduling, chunking, and testing to an automated AI pipeline, StudyBearer transforms passive dread into an active, gamified learning journey.

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

## Accessibility & Inclusion
- High contrast for primary text (White on Deep Void).
- Exclusively Dark Mode (designed for late-night focus).
- Clear visual hierarchy using Muted Steel for secondary info.
