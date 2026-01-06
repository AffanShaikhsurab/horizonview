# Horizon View - Life Vision Dashboard

<p align="center">
  <img src="public/next.svg" alt="HorizonView Logo" width="120" height="120">
</p>

<p align="center">
  <strong>A personal dashboard to visualize your life missions, projects, and focus budget.</strong>
</p>

<p align="center">
  <a href="https://github.com/affanshaikhsurab/horizonview/actions/workflows/ci.yml">
    <img src="https://github.com/affanshaikhsurab/horizonview/actions/workflows/ci.yml/badge.svg" alt="CI Status">
  </a>
  <a href="https://github.com/affanshaikhsurab/horizonview/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  </a>
  <a href="https://github.com/affanshaikhsurab/horizonview/issues">
    <img src="https://img.shields.io/github/issues/affanshaikhsurab/horizonview" alt="Issues">
  </a>
  <a href="https://github.com/affanshaikhsurab/horizonview/pulls">
    <img src="https://img.shields.io/github/issues-pr/affanshaikhsurab/horizonview" alt="Pull Requests">
  </a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## 🌟 Features

- **🎯 Mission-based Organization** - Group projects under high-level life missions (Education, Career, Startup, etc.)
- **⚡ Focus Budget Meter** - Visualize how your energy is distributed across active projects
- **🤖 AI Command Bar** - Natural language interface to add, archive, and analyze projects
- **📊 Project Status Tracking** - Track progress with statuses (Active, Concept, Maintenance, Archived)
- **🔄 Real-time Updates** - TanStack Query for efficient data fetching and caching
- **🔐 Secure Authentication** - Clerk-based authentication with protected routes
- **🐙 GitHub Integration** - Import projects directly from your GitHub repositories

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 16+ (App Router), React 19, TypeScript |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **Authentication** | Clerk |
| **State Management** | TanStack Query v5 |
| **AI** | Google Generative AI, Groq SDK |
| **UI Components** | Radix UI, Lucide Icons |
| **Styling** | Tailwind CSS (Dark theme) |
| **Testing** | Jest, React Testing Library |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com) account (free tier available)
- A [Clerk](https://clerk.dev) account (free tier available)

### 1. Clone and Install

```bash
git clone https://github.com/affanshaikhsurab/horizonview.git
cd horizonview
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/20260105_add_clerk_auth.sql`
3. Get your API credentials from Settings > API

### 3. Set Up Clerk

1. Create a new application at [clerk.dev](https://clerk.dev)
2. Get your API keys from the Dashboard

### 4. Configure Environment Variables

Copy the example env file and add your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# AI (Optional)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key
GROQ_API_KEY=your-groq-key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your dashboard.

## Usage

### Command Bar Commands

The AI command bar at the bottom accepts natural language commands:

- **Add project**: `Add new scraping tool to Career` or `Create ML pipeline in Startup`
- **Archive project**: `Archive Lean Start`
- **Delete project**: `Delete old experiment`
- **Analyze status**: `Show status` or `Analyze projects`
- **Help**: `help`

### Managing Projects

- **Click** on any project card to edit its details
- **Archive** button (📦) on each card for quick archiving
- **Progress bar** shows "Vision Gap" - how close to completion

### Focus Budget

The energy meter in the header shows your remaining focus capacity:
- Each active project consumes ~20% of your focus
- Red zone (<30%): You're overcommitted
- Orange zone (30-60%): Approaching limits
- White (>60%): Healthy capacity

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Main dashboard page
│   └── globals.css     # Global styles
├── components/
│   ├── dashboard.tsx   # Main dashboard component
│   ├── header.tsx      # Top navigation bar
│   ├── energy-widget.tsx
│   ├── horizon-grid.tsx
│   ├── mission-column.tsx
│   ├── project-card.tsx
│   ├── project-modal.tsx
│   └── command-bar.tsx
├── hooks/
│   └── use-horizon.ts  # TanStack Query hooks
├── lib/
│   └── supabase/
│       ├── client.ts   # Browser client
│       ├── server.ts   # Server client
│       └── middleware.ts
├── providers/
│   └── query-provider.tsx
└── types/
    └── database.ts     # Supabase types
```

## Database Schema

### Missions Table
- `id`: UUID (primary key)
- `title`: Mission name
- `statement`: Mission statement/goal
- `color`: Hex color for visual distinction
- `order_index`: Display order

### Projects Table
- `id`: UUID (primary key)
- `mission_id`: Foreign key to missions
- `title`: Project name
- `status`: Active | Concept | Maintenance | Archived
- `progress`: 0-100 percentage
- `type`: Tool | Platform | Research | AI Agent | Analytics | Experiment | Other
- `description`: Optional description
- `github_url`: Optional GitHub link

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:ci
```

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a Pull Request.

### Quick Start for Contributors

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and lint (`npm run lint && npm test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Branch Protection

This repository has branch protection enabled on `main`:
- All changes must go through a Pull Request
- CI checks (lint + tests) must pass
- At least 1 review approval required
- Only maintainers can bypass these rules

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Clerk](https://clerk.dev/) - Authentication
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Radix UI](https://www.radix-ui.com/) - UI primitives

## 📧 Contact

**Affan Shaikhsurab** - [@affanshaikhsurab](https://github.com/affanshaikhsurab)

Project Link: [https://github.com/affanshaikhsurab/horizonview](https://github.com/affanshaikhsurab/horizonview)

---

<p align="center">Made with ❤️ by <a href="https://github.com/affanshaikhsurab">Affan Shaikhsurab</a></p>
