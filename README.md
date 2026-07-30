# KINDRA — AI-Powered Civic Engagement Platform

**Together We Act. Together We Build.**

KINDRA is a full-stack civic engagement platform where citizens report infrastructure issues, AI verifies them using Gemma Vision, and municipal officers resolve them — all while citizens earn Karma rewards.

---

## 🏆 Hackathon Judging & Enterprise Materials

- 📄 **[HACKATHON_DEMO.md](file:///d:/AntiGravity/Kindra/HACKATHON_DEMO.md)** — Elevator Pitch (30s), 5–7 min Demo Script, Problem/Solution Matrix, AI Workflow, & Judge Q&A Cheat Sheet.
- 📊 **[PRESENTATION_SLIDES.md](file:///d:/AntiGravity/Kindra/PRESENTATION_SLIDES.md)** — Complete 12-Slide Pitch Deck Content.
- 🏢 **[ENTERPRISE_RUNBOOK.md](file:///d:/AntiGravity/Kindra/ENTERPRISE_RUNBOOK.md)** — Multi-Tenant City Isolation, Disaster Recovery PITR Backups, Incident Protocol, & System Probes.
- 📜 **[TERMS_AND_PRIVACY.md](file:///d:/AntiGravity/Kindra/TERMS_AND_PRIVACY.md)** — GDPR/CCPA Legal Privacy Policy, Terms of Service, & Cookie Consent Framework.

---

## 🏗️ Architecture

```
Next.js 15 (App Router) + TypeScript
├── Supabase (PostgreSQL, Auth, Storage, RLS)
├── OpenRouter (Gemma 4 Vision AI)
├── Leaflet (Interactive Maps)
├── Material Design 3 (Tailwind CSS)
└── 4 Role-Based Portals
```

## 🎯 Features

### Citizen Portal (`/citizen/*`)
- **Report Issues** — Upload photo, pin location on OpenStreetMap, select category
- **AI Verification** — Gemma Vision analyzes photos for validity, severity, and classification
- **Karma System** — Earn +20 to +100 Karma per verified report
- **Credentials & Badges** — Level up civic credentials through milestones
- **Leaderboard** — Global community rankings
- **Rewards** — Redeem Karma for partner offers
- **Campaigns** — Join civic campaigns and volunteer tasks

### Officer Portal (`/officer/*`)
- **Dashboard** — Pending reports, high priority, critical, resolved today
- **Report Queue** — Filter by status, priority, search; paginated
- **Report Detail** — AI summary, image viewer, status transitions, department assignment
- **Issue Map** — Interactive Leaflet map with priority-colored pins

### Partner Portal (`/partner/*`)
- **Dashboard** — Reward stats, campaign stats
- **Reward Management** — Create, edit, delete reward offers
- **Campaign Management** — Create, activate, pause, complete campaigns

### Admin Portal (`/admin/*`)
- **Dashboard** — System-wide metrics (users, reports, karma)
- **Analytics** — Category/department distribution, AI confidence stats
- **User Management** — Search, role assignment, soft-delete
- **Department Management** — Create and edit departments
- **All Reports** — Unrestricted system-wide report browser
- **System Settings** — Key-value configuration editor
- **Audit Logs** — System activity timeline

---

## 🧠 AI Pipeline

```
Citizen submits report
  → Photo uploaded to Supabase Storage
  → OpenRouter API (google/gemma-4-26b-a4b-it:free)
  → Gemma Vision analyzes image + text
  → JSON response: category, severity, confidence, karma
  → Duplicate detection (GPS radius + 48hr window)
  → Database update (reports, report_ai_results)
  → Karma awarded via award_karma() RPC
  → Notification generated
  → Report enters Officer Queue
```

---

## 📁 Folder Structure

```
d:\AntiGravity\Kindra\
├── app/
│   ├── (auth)/           # Login, Register, Forgot/Reset Password
│   ├── auth/callback/    # Supabase OAuth callback
│   ├── citizen/          # Citizen portal (8 routes)
│   ├── officer/          # Officer portal (4 routes)
│   ├── partner/          # Partner portal (3 routes)
│   ├── admin/            # Admin portal (7 routes)
│   ├── layout.tsx        # Root layout with AuthProvider
│   ├── providers.tsx     # React Query provider
│   └── page.tsx          # Landing page with portal navigation
├── components/
│   ├── auth/             # AuthGuard
│   ├── maps/             # Leaflet map components
│   └── reports/          # AIVerificationCard, ImageUploader
├── contexts/
│   └── AuthContext.tsx    # Global auth state
├── hooks/
│   ├── useAuth.ts
│   └── useCitizenDashboard.ts
├── services/
│   ├── adminService.ts
│   ├── aiVerificationService.ts
│   ├── authService.ts
│   ├── campaignService.ts
│   ├── gamificationService.ts
│   ├── karmaService.ts
│   ├── notificationService.ts
│   ├── officerService.ts
│   ├── partnerService.ts
│   ├── reportService.ts
│   ├── rewardService.ts
│   └── storageService.ts
├── src/
│   ├── components/ui/    # Card, Button, Chip, Input, ProgressBar, TopAppBar
│   ├── lib/
│   │   ├── openrouter.ts # Gemma Vision AI client
│   │   ├── supabase.ts   # Supabase client
│   │   └── mockData.ts   # Landing page demo data
│   └── types/
│       └── database.ts   # Generated Supabase types
└── supabase/
    └── migrations/       # Database migrations
```

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `profiles` | User profiles with karma_points, rank_title |
| `user_roles` | Role assignments (citizen, officer, partner, admin) |
| `reports` | Civic issue reports with GPS, status, priority |
| `report_images` | Photo uploads linked to reports |
| `report_ai_results` | Gemma AI verification results |
| `categories` | Issue categories |
| `departments` | Municipal departments |
| `karma_transactions` | Karma earn/spend ledger |
| `badges` / `user_badges` | Achievement badges |
| `credentials` / `credential_levels` / `user_credentials` | Civic credential progression |
| `rewards` / `redemptions` | Partner reward offers |
| `campaigns` / `campaign_participants` | Civic campaigns |
| `notifications` | User notifications |
| `settings` | System configuration key-value store |
| `activity_logs` | Audit trail |
| `leaderboard_cache` | Cached leaderboard rankings |

**Views**: `view_officer_queue`, `view_leaderboard`, `view_citizen_summary`

**Functions**: `award_karma(user_id, amount, action_type, description, reference_id)`

---

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- **Role-based AuthGuard** on every portal layout
- **Supabase Auth** with email/password and Google OAuth
- **Server-side role validation** via `user_roles` table

---

## 🔧 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-key
NEXT_PUBLIC_OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
```

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Production build
npm run build

# Start production server
npm start
```

---

## 📦 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 15 | App Router, SSR/SSG |
| TypeScript | Type safety |
| Supabase | PostgreSQL, Auth, Storage |
| OpenRouter | Gemma Vision AI |
| Tailwind CSS | Styling (Material Design 3) |
| Leaflet | Interactive maps |
| React Query | Server state management |
| Framer Motion | Animations |
| Zod | Form validation |
| React Hook Form | Form management |

---

## 📊 Route Summary

| Route | Portal | Description |
|---|---|---|
| `/` | Landing | Portal navigation + Stitch demo |
| `/login` | Auth | Email/password login |
| `/register` | Auth | User registration |
| `/forgot-password` | Auth | Password reset request |
| `/reset-password` | Auth | Password reset form |
| `/auth/callback` | Auth | OAuth redirect handler |
| `/citizen/dashboard` | Citizen | Welcome, stats, credentials, leaderboard |
| `/citizen/report` | Citizen | Report issue form |
| `/citizen/report/submitted` | Citizen | AI verification progress |
| `/citizen/leaderboard` | Citizen | Community rankings |
| `/citizen/campaigns` | Citizen | Civic campaigns |
| `/citizen/credentials` | Citizen | Badge & credential viewer |
| `/citizen/rewards` | Citizen | Reward redemption catalog |
| `/citizen/notifications` | Citizen | Notification inbox |
| `/citizen/profile` | Citizen | Profile & activity timeline |
| `/officer/dashboard` | Officer | Officer stats & activity |
| `/officer/queue` | Officer | Filterable report queue |
| `/officer/report/[id]` | Officer | Report detail & actions |
| `/officer/map` | Officer | Interactive issue map |
| `/partner/dashboard` | Partner | Stats & quick actions |
| `/partner/rewards` | Partner | Reward CRUD |
| `/partner/campaigns` | Partner | Campaign management |
| `/admin/dashboard` | Admin | System-wide overview |
| `/admin/analytics` | Admin | Data visualizations |
| `/admin/users` | Admin | User management |
| `/admin/departments` | Admin | Department management |
| `/admin/reports` | Admin | All reports browser |
| `/admin/settings` | Admin | System configuration |
| `/admin/audit` | Admin | Audit log viewer |

---

Built with ❤️ for civic engagement.
