<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-kanban" viewBox="0 0 16 16">
  <path d="M13.5 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm-11-1a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
  <path d="M6.5 3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zM6.5 8a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1z"/>
</svg>

# 🤖 AI Ops TaskFlow

**An internal workflow platform for AI operations teams.**

Manage annotation tasks, review pipelines, evaluation workflows, and QA processes — with built-in AI assistance, structured validation, and real-time analytics.

> Built for Ethara AI's evaluation pipeline and AI data operations workflows.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Email/password + Google OAuth via Better Auth |
| 👥 **Role-Based Access** | Admin (manage all) and Reviewer (assigned tasks) |
| 📋 **Projects** | Create and manage AI workflow projects |
| ✅ **AI Evaluation Tasks** | Tasks with evaluation type, severity, confidence scoring, QA status |
| 📊 **Dashboard Analytics** | Real-time KPIs, bar charts, pie charts via Recharts |
| 📝 **Activity Logs** | Full audit trail of every action in the system |
| 💬 **Comments** | Task-level discussion with user attribution |
| 🔍 **Search & Filters** | Debounced search, status/type/severity filters |
| 🤖 **AI Evaluation Assistant** | NVIDIA LLM-powered prompt-response evaluation |
| 📱 **Responsive UI** | Clean, enterprise-grade design system |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                  Next.js 16 App                  │
│  ┌───────────────────────────────────────────┐  │
│  │            App Router (pages)              │  │
│  │  /dashboard  /projects  /tasks  /activity  │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │          API Route Handlers                │  │
│  │  /api/projects  /api/tasks  /api/activity  │  │
│  │  /api/ai-evaluate  /api/auth/*             │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │        Services / Actions / Validation     │  │
│  │    Zod Schemas · Server Actions · Lib      │  │
│  └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│              Better Auth · Drizzle ORM           │
│              PostgreSQL (Railway)                │
└─────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework |
| **Language** | TypeScript | Type safety everywhere |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Utility-first design system |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **State** | Zustand | Lightweight state management |
| **HTTP** | Axios | Centralized API client |
| **Tables** | TanStack Table | Data grid & filtering |
| **Charts** | Recharts | Dashboard analytics |
| **Toasts** | Sonner | Notification system |
| **Auth** | Better Auth | Production-grade authentication |
| **ORM** | Drizzle ORM | Type-safe SQL with schema |
| **Database** | PostgreSQL | Relational data modeling |
| **AI** | NVIDIA LLM API | AI Evaluation Assistant |

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- NVIDIA API key (for AI features)

### Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/taskflow
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NVIDIA_API_KEY=your-nvidia-api-key
```

### Install & Run

```bash
# Install dependencies
npm install

# Generate database schema
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push

# Start dev server
npm run dev
```

### Seed Demo Data

```bash
# Navigate to /admin in the browser
# Click "Seed Demo Data" (requires admin role)
```

Or via API:

```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Authorization: Bearer <session-token>"
```

---

## 🚀 Deployment (Railway)

1. Push to GitHub
2. Create a new project on Railway
3. Add your PostgreSQL database
4. Add a Next.js service
5. Set environment variables
6. Deploy

---

## 🧪 How This Project Aligns With AI Operations Workflows

| JD Requirement | Implementation |
|----------------|---------------|
| **Evaluation pipelines** | Tasks with evaluation types (safety, accuracy, relevance, coherence) |
| **Structured data handling** | Drizzle ORM with typed schemas, PostgreSQL relations |
| **Review systems** | Two-tier RBAC (admin creates, reviewer evaluates) |
| **Validation workflows** | Zod schemas on every form and API route |
| **Analytics dashboards** | Recharts KPIs, bar charts, pie charts |
| **Audit logging** | ActivityLog model tracking every action |
| **Quality checks** | QA status workflow (pending → reviewed → approved/rejected) |
| **AI integration** | NVIDIA LLM-powered evaluation assistant |

---

## 📁 Project Structure

```
├── app/
│   ├── (app)/              # Protected routes with sidebar
│   │   ├── dashboard/      # Analytics dashboard
│   │   ├── projects/       # Project management
│   │   ├── tasks/          # Task management
│   │   ├── activity/       # Activity logs
│   │   ├── settings/       # User settings
│   │   ├── admin/          # Admin panel + seed
│   │   └── api/            # REST API routes
│   ├── (auth)/             # Auth pages
│   │   ├── login/
│   │   └── register/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/ui/          # Reusable UI components
├── db/
│   ├── schema/             # Drizzle schema definitions
│   └── migrations/         # Database migrations
├── lib/                    # Utilities and config
│   ├── auth.ts            # Better Auth config
│   ├── auth-client.ts     # Client-side auth
│   ├── db.ts              # Database connection
│   └── utils.ts           # Helper functions
└── middleware.ts           # Route protection
```

---

## 📄 License

MIT
