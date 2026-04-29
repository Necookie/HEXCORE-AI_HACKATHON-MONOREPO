# StudyBearer Product Requirements Document (PRD) Guide

StudyBearer transforms passive PDF documents into active, gamified learning journeys. It automates the "planning" and "testing" phases by chunking PDFs and pushing a schedule to Google Calendar. It also features a RAG-powered assistant for user support and business monitoring via Discord webhooks.

## 2. User Journey & Flow
1. **Onboarding & Auth:** Frictionless Google OAuth.
2. **The Intake:** Upload PDF, set available study hours and target completion date.
3. **AI Orchestration (n8n):** Parses document, extracts objectives, and segments into bite-sized daily modules.
4. **Calendar Sync:** Pushes the segmented roadmap to Google Calendar as scheduled events.
5. **Gamified Recall:** AI-generated quizzes (MCQ, Enumeration, ID) unlock after scheduled blocks.
6. **Progression Engine:**
   - **Consistency Combos:** Maintain streaks by passing daily quizzes.
   - **Ranked Milestones:** Climb competitive ladders based on Elo points (up to Mythic).
7. **Assistant & Monitoring:**
   - **RAG Chatbot:** Instant replies for users and lead generation for business.
   - **Discord Webhooks:** Real-time business activity logging (signup, login, delete).

## 3. Design & Vibe
- **Aesthetic:** Dark-toned, cinematic, moody (Glow Doctrine / Glass-Neon). Avoids sterile academic portal looks; feels like a premium developer tool or high-end gaming interface.
- **Animations:** Sleek, high-contrast neon glows.

## 4. Technical Stack
- **Frontend:** Astro (Islands architecture) + React
- **Backend & Auth:** Supabase + Prisma
- **AI & Logic Core:** n8n acts as the central nervous system handling all workflows (PDF parsing, chunking, Calendar API, quiz generation, gamification logic).

## 5. Hackathon Rubric Alignment
- **Impact (30%):** Eliminates traditional study friction.
- **Feasibility (20%):** Astro+Supabase allows rapid frontend; n8n handles complex backend logic quickly.
- **User-Centric Design (10%):** Addresses academic burnout, provides immediate gratification via gamification, respects existing habits (Google Calendar).
- **Presentation (20%):** Pitch: "We organize your life, schedule your week, and quiz you like a personal tutor, all while you sleep."
- **Usage of n8n (20%):** n8n is the entire backend brain and rules engine.
