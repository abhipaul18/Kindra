# KINDRA — Hackathon Judging Package & Demo Guide

**Tagline**: *Together We Act. Together We Build.*

---

## ⚡ 1. Elevator Pitch (30 Seconds)

> "Cities face thousands of unreported or unverified infrastructure issues every day, while citizens feel disconnected from municipal governance. 
> 
> **KINDRA** changes that. Citizens snap a photo of any civic problem — like a dangerous pothole or overflowing waste. In seconds, our **OpenRouter Gemma 4 Vision AI** verifies the image, rates the severity, checks for duplicates, and routes it directly to the right department. 
> 
> In return, citizens earn **Karma points**, unlock milestone credentials, and redeem real rewards from local business partners. KINDRA turns civic duty into an engaging, rewarding community movement."

---

## 🎬 2. Step-by-Step Demo Script (5–7 Minutes)

### **Act 1: Landing Page & Portal Ecosystem (1 Min)**
1. Navigate to `/` (Landing Page).
2. Point out the **Launch Live Portals** section displaying 4 role-based portals:
   - 🧑 **Citizen Portal** (`/citizen/dashboard`)
   - 🛡️ **Officer Portal** (`/officer/dashboard`)
   - 🏪 **Partner Portal** (`/partner/dashboard`)
   - ⚙️ **Admin Portal** (`/admin/dashboard`)
3. Highlight that all portals are role-gated with **Supabase Authentication** and **Row Level Security (RLS)**.

---

### **Act 2: Citizen Issue Reporting & Real-time AI Verification (2 Mins)**
1. Click **Citizen Portal** → Navigate to `/citizen/report`.
2. **Step 1: Upload Photo**: Drag-and-drop or select an issue photo (e.g. pothole or trash dump).
3. **Step 2: Pin Location**: Open the interactive OpenStreetMap Leaflet component and drop a pin on the exact location.
4. **Step 3: Submit**: Fill in Title & Description, then click **Submit Report**.
5. **Real-time AI Engine (`/citizen/report/submitted`)**:
   - Show the **AIVerificationCard** processing in real-time.
   - Explain what Gemma Vision does:
     - 🔍 **Image Classification**: Confirms physical civic disruption.
     - 🎯 **Confidence Score**: Calculates 0–100% confidence rating.
     - 🚨 **Severity Rating**: Classifies Low, Medium, High, or Critical urgency.
     - 📍 **Duplicate Check**: Queries 500m GPS radius and 48hr window to prevent spam.
     - 🌿 **Karma Awarded**: Awards +20 to +100 Karma dynamically based on severity.

---

### **Act 3: Gamification, Credentials & Rewards (1 text/live min)**
1. Navigate to `/citizen/dashboard`:
   - Show updated Karma balance and level progress bar.
2. Navigate to `/citizen/rewards`:
   - View available partner discounts (e.g., "20% off Coffee").
   - Click **Redeem** → Watch Karma validate and deduct via PostgreSQL `award_karma` RPC.
3. Navigate to `/citizen/leaderboard`:
   - Show global community rankings with highlighted user position.
4. Navigate to `/citizen/profile`:
   - Display unlocked badges, milestone credentials progression, and activity history timeline.

---

### **Act 4: Officer Triage & Resolution Workflow (1.5 Mins)**
1. Switch to **Officer Portal** → Navigate to `/officer/queue`.
2. View the newly submitted report at the top of the queue.
3. Click through to `/officer/report/[id]`:
   - View AI summary, severity, and photo.
   - Click **In Progress** or **Approved** → Status updates live in PostgreSQL.
   - Assign to municipal department (e.g., Roads & Infrastructure).
   - Add internal officer notes.
4. Open `/officer/map`:
   - View all open reports rendered as priority-colored circle markers on the interactive Leaflet map.

---

### **Act 5: Partner & Admin Management (1 Min)**
1. Navigate to **Partner Portal** (`/partner/dashboard`):
   - Show reward creation form (`/partner/rewards`) and civic campaign lifecycle management (`/partner/campaigns`).
2. Navigate to **Admin Portal** (`/admin/dashboard`):
   - View system analytics (`/admin/analytics`), user role management (`/admin/users`), department CRUD (`/admin/departments`), system settings (`/admin/settings`), and audit trail (`/admin/audit`).

---

## 🎯 3. Problem Statement & Solution

| Problem | KINDRA Solution |
|---|---|
| Delayed municipal issue resolution | Automated Gemma Vision AI triage & priority routing |
| Citizen apathy & zero engagement | Gamified Karma system, badges, credentials & rewards |
| Duplicate & spam reports | GPS radius (500m) & temporal (48h) duplicate detection |
| Lack of cross-department visibility | Unified Officer Queue, Map Dashboard, and Admin Audit Trail |

---

## 🧠 4. AI Workflow Architecture

```
User Uploads Photo
  │
  ├── 1. Supabase Storage Upload ('reports' bucket)
  ├── 2. OpenRouter API Call (`google/gemma-4-26b-a4b-it:free`)
  ├── 3. Gemma Vision Multimodal Analysis
  │      ├── Verification (is_valid)
  │      ├── Category Classification
  │      ├── Confidence Score Calculation (0.0 - 1.0)
  │      └── Severity & Urgency Assessment
  ├── 4. Duplicate Check (500m Lat/Lng Radius Query)
  ├── 5. Karma Calculation (Low: +20, Medium: +40, High: +70, Critical: +100)
  ├── 6. Database Update (`reports` & `report_ai_results` tables)
  └── 7. Automated Citizen Notification & Officer Queue Dispatch
```

---

## 💡 5. Innovation Highlights

1. **Gemma Vision Multimodal AI Integration**: Instant vision classification combined with natural language reasoning.
2. **Spatial-Temporal Duplicate Prevention**: Prevents double-counting of municipal issues within 500 meters and 48 hours.
3. **Double-Loop Incentive System**: Citizens get rewarded with Karma & credentials; local businesses get foot traffic through reward redemptions.
4. **4-Role Integrated Platform**: Seamless interaction between Citizens, Officers, Business Partners, and System Admins.

---

## 🙋 6. Judge Q&A Cheat Sheet

### **Q1: How do you handle AI hallucinations or false image uploads?**
> **Answer**: Gemma Vision evaluates both image content and user description against strict JSON verification rules (`is_valid`, `confidence`). If confidence is below threshold or the image is unrelated, the report is flagged for manual officer review rather than auto-rejected, ensuring zero false negatives.

### **Q2: How is security handled for citizen data and karma balances?**
> **Answer**: All database tables enforce Supabase Row Level Security (RLS). Karma adjustments are strictly handled on the backend via PostgreSQL RPC stored procedures (`award_karma`), preventing any client-side tampering with point balances.

### **Q3: What happens if two citizens report the exact same pothole?**
> **Answer**: Our duplicate detection algorithm queries nearby reports within a 500-meter GPS radius created in the last 48 hours. The second report is linked to the original incident, and the reporter receives a partial Karma award (+10 Karma) for confirming the issue.

### **Q4: How scalable is the platform for large cities?**
> **Answer**: KINDRA uses Next.js 15 App Router with server-side page optimization, dynamic route splitting, indexed PostgreSQL tables, and cached database views (`view_officer_queue`, `view_leaderboard`). It can easily handle millions of reports and concurrent users.

---

## 👤 Sample Demo Accounts

| Role | Email | Password | Access Route |
|---|---|---|---|
| **Citizen** | `citizen@kindra.app` | `Kindra123!` | `/citizen/dashboard` |
| **Officer** | `officer@kindra.app` | `Kindra123!` | `/officer/dashboard` |
| **Partner** | `partner@kindra.app` | `Kindra123!` | `/partner/dashboard` |
| **Admin** | `admin@kindra.app` | `Kindra123!` | `/admin/dashboard` |
