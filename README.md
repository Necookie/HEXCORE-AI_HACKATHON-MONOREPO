# StudyBearer: Automating the Friction of Studying

StudyBearer is an AI-powered educational workflow application designed to eradicate the cognitive load of academic planning and testing. By shifting the burden of scheduling, chunking, and testing to an automated AI pipeline, StudyBearer transforms passive dread into an active, gamified learning journey.

## Deployment
- **Landing:** [sb.necookie.dev](https://sb.necookie.dev)
- **Platform:** [app.sb.necookie.dev](https://app.sb.necookie.dev)
- **Status:** [Astro SSR on Cloudflare Pages]
- **Last Updated:** 2026-05-03 23:45 (Feature Sync)

## Features
- **n8n Nervous System:** Orchestrates all complex logic, AI agent routing, and third-party integrations (Google Calendar, Discord).
- **Automated AI Orchestration:** Upload a PDF and let n8n chunk your curriculum into daily learning objectives based on your specific availability and goals.
- **Google Calendar Sync:** Your AI-generated study roadmap is pushed directly to your Google Calendar as timed events.
- **RAG Chatbot:** Instant intelligence via Retrieval-Augmented Generation (Gemini 1.5 Pro/Flash + 3072d Vector Store) for product and study material context.
- **Gamified Study Sessions:** Dynamic quizzes (MCQ, Enumeration, ID) and flashcards are generated for every session.
- **Competitive Progression:** Earn Elo, build streaks, and climb the ranks from Cub to Spirit Bear.
- **Business Monitoring:** Real-time Discord webhooks for registrations, logins, and account activity to assist platform management and user conversion.

## Tech Stack
- **Frontend:** Astro & React (Islands architecture)
- **Backend:** Supabase (Auth, Postgres, Storage)
- **ORM:** Prisma
- **AI & Automation:** n8n (OpenAI / Gemini integrations)

## Getting Started
Please refer to the guides for more details:
- [SRS Guide](SRS_Guide.md)
- [PRD Guide](PRD_Guide.md)
- [Brand & Design Guidelines](brand.md)

### Running Locally
To run the monorepo:
1. Ensure `pnpm` is installed.
2. Install dependencies: `pnpm install`
3. Start the development server: `pnpm run dev`

## Design Doctrine
StudyBearer follows a "Glass-Neon" aesthetic: deep voids (`#0a0a0c`), surface greys (`#121216`), and neon accents (`#6366f1` and `#8b5cf6`). We exclusively use dark mode.

## The Team: CodeBearers
**School:** Laguna State Polytechnic University - Sta Cruz Campus

- **Dheyn Michael Orlanda** - 3rd year BSCS Student
- **Francis Neil Mistica** - 3rd year BSCS Student
- **Christine Arroyo** - 2nd year BSCS Student

**Coach:** Mark Bernardino

---
*Built for the iSITE AI Hackathon 2026*
