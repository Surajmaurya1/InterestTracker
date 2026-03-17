# <p align="center">💰 LendingTracker PRO</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-blue?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Framer_Motion-UI-purple?style=for-the-badge&logo=framer" alt="Framer Motion" />
</p>

<p align="center">
  <strong>The premium solution for personal credit management.</strong><br>
  Built with a sleek, high-end fintech aesthetic inspired by Apple Finance and modern banking apps.
</p>

---

## ✨ Features

- **🌑 Deep Dark Aesthetic**: Custom-crafted UI with a `#0B0B0C` foundation and premium glassmorphism.
- **📊 Interactive Analytics**: Real-time rendering of lending volume over the last 7 days using Recharts.
- **📲 Swipe-to-Delete**: Mobile-native interactions powered by Framer Motion for a fluid, high-end feel.
- **💸 Daily Yield Tracking**: Advanced interest model tracking daily earnings in rupees rather than generic percentages.
- **⚡ Optimistic UI**: Instant deletions and updates for zero-lag user experience.
- **🛡️ Supabase Powered**: Secure, real-time PostgreSQL backend with instant synchronization.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🛠️ Rapid Setup

### 1. Database Initialization
Create your Supabase project and execute the following in the **SQL Editor**:

```sql
-- Create the transactions table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  person_name text not null,
  amount numeric not null,
  interest numeric default 0, -- Daily rupees amount
  type text check (type in ('lending', 'collection')) default 'lending',
  date timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

-- Note: Configure RLS policies or disable for testing
alter table transactions disable row level security;
```

### 2. Configure Environment
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Launch Development
```bash
npm install
npm run dev
```

---

## 🎨 UI System

| Aspect | Detail |
| :--- | :--- |
| **Primary BG** | `#0B0B0C` (Deep Black) |
| **Card Surface** | `#111113` (Zinc-900) |
| **Accent Text** | `Zinc-500` for hierarchy |
| **Corners** | `rounded-3xl` (24px radius) |
| **Borders** | `1px solid #1A1A1D` |

---

## 📈 Roadmap

- [x] Swipe-to-delete animation
- [x] Daily interest model
- [x] Performance optimized Recharts
- [ ] Multi-currency support
- [ ] AI-powered repayment predictions
- [ ] Export to PDF/CSV Reports

---

<p align="center">
  Built with ❤️ for professional credit tracking.
</p>