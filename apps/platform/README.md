# StudyBearer Platform

AI-powered adaptive learning platform built with Astro, React, and Supabase.

## Stack
- **Framework**: Astro 6 (SSR / Islands Architecture)
- **UI**: React 19 + Lucide-React icons
- **Styling**: Tailwind CSS v4
- **Auth + DB**: Supabase (SSR)
- **AI Orchestration**: n8n webhooks (REQ-105)

## Dev
```bash
pnpm install
pnpm dev        # Starts on http://localhost:4322
```

## Pages
| Route | File | Description |
|---|---|---|
| `/platform` | `pages/platform/index.astro` | Project Intake — PDF upload + schedule config |
| `/platform/dashboard` | `pages/platform/dashboard.astro` | Learning Dashboard — roadmap + metrics |

## Integration Points
| Stub | Location | Replace With |
|---|---|---|
| `UPLOAD_PDF` | `ProjectIntake.tsx` | Supabase Storage upload |
| `TRIGGER_N8N` | `ProjectIntake.tsx` | n8n webhook POST |
| `MOCK` data | `LearningDashboard.tsx` | Supabase query via `dashboard.astro` |
