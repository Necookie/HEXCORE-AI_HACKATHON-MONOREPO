# StudyBearer: Automating the Friction of Studying

StudyBearer is an AI-powered educational workflow application designed to eradicate the cognitive load of academic planning and testing. By shifting the burden of scheduling, chunking, and testing to an automated AI pipeline, StudyBearer transforms passive dread into an active, gamified learning journey.

## Features
- **Automated AI Orchestration:** Upload a PDF and let n8n chunk your curriculum into daily learning objectives.
- **Google Calendar Sync:** Your AI-generated study roadmap is pushed directly to your Google Calendar.
- **Gamified Quizzes:** Dynamic quizzes (MCQ, Enumeration, ID) unlock after your study blocks.
- **Competitive Progression:** Earn Elo, build streaks, and climb the ranks to Mythic. Education treated like a competitive sport.

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

---
*Built for the iSITE AI Hackathon 2026*
