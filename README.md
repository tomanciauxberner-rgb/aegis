# Aegis

**AI Compliance & Fundamental Rights Intelligence Platform**

> Know your rights risk before you deploy.

Aegis generates defensible Fundamental Rights Impact Assessments (FRIA) powered by real EU Agency for Fundamental Rights (FRA) data — not empty templates. Built for the EU AI Act Article 27 deadline: August 2, 2026.

## Stack

- **Framework**: Next.js 15 (App Router, RSC, Turbopack)
- **UI**: React 19 + Tailwind CSS 4 + Framer Motion
- **Database**: Supabase PostgreSQL (EU-West-1) + Drizzle ORM
- **Auth**: Supabase Auth (MFA + Row Level Security)
- **AI**: Claude API (Haiku) for FRIA assistance
- **Deploy**: Vercel

## Getting Started

```bash
cp .env.example .env.local
# Fill in Supabase + Anthropic keys

npm install
npm run db:push
npm run dev
```

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── (auth)/       # Login, Register
│   ├── (dashboard)/  # Protected dashboard pages
│   └── api/          # API routes
├── components/       # React components
│   ├── ui/           # Base UI components
│   ├── layout/       # Sidebar, nav
│   ├── fria/         # FRIA wizard components
│   └── charts/       # Data visualization
├── db/               # Drizzle schema + migrations
├── lib/              # Utilities, Supabase clients
├── services/         # Business logic
├── types/            # TypeScript types
scripts/              # ETL + seed data scripts
```

## Security

- Zero trust architecture
- Row Level Security on all tables
- MFA for organization accounts
- CSP headers, rate limiting, input validation
- No PII storage — FRIA = system metadata only
- Audit log (append-only)
- Data residency: EU (Ireland)

---

ThinkLance AI · 2026
