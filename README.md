# MoundVisit AI

An AI-powered baseball mechanics analyzer that gives athletes the same frame-by-frame feedback as a $150/hr private coach — in under 60 seconds, for every position on the diamond.

---

## Features

- **Video Upload & Analysis** — Upload a clip of your mechanics and get a full AI breakdown in seconds
- **Timestamped Breakdowns** — Every finding is tied to the exact moment in your video
- **All 4 Positions** — Pitching, Hitting, Fielding, and Catching each have their own checkpoint system
- **Mechanics Score** — Quantified rating of your form across key checkpoints
- **Drill Prescriptions** — Every flagged issue comes with specific drills to fix it
- **Progress Tracking** — Compare sessions over time to see your mechanics improve
- **Auth System** — Secure sign up / sign in with session management

---

## Position Checkpoints

| Position | Key Checkpoints |
|---|---|
| Pitching | Leg lift, Arm path, Hip separation, Release point, Follow-through |
| Hitting | Stance & load, Hip rotation, Swing path, Contact point, Hand path |
| Fielding | Ready position, First step, Approach angle, Transfer, Throwing |
| Catching | Receiving, Framing, Blocking, Pop time, Footwork |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Anthropic Claude |
| Database & Auth | Supabase |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Getting Started

```bash
git clone https://github.com/Tatopapi3/moundvisitai.git
cd moundvisitai
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_key
```

Run the database schema:

```bash
# Apply supabase-schema.sql to your Supabase project
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
  app/
    (app)/          # Authenticated app routes (dashboard, analysis)
    (auth)/         # Login & signup pages
    api/            # API routes (video analysis, session management)
    page.tsx        # Landing page
    layout.tsx      # Root layout
  components/
    AnalysisReport.tsx     # Full breakdown display
    VideoUploader.tsx      # Video upload UI
    MechanicsScore.tsx     # Score visualization
    DrillCard.tsx          # Drill prescription cards
    PositionSelector.tsx   # Position picker
    Navbar.tsx             # Navigation
  lib/              # Supabase client, utilities
  types/            # TypeScript types
supabase-schema.sql # Database schema
```

---

## Deploying

```bash
vercel --prod
```

Set the environment variables in your Vercel dashboard under Project → Settings → Environment Variables.

---

Built by [Juan Fernandez](https://github.com/Tatopapi3)
