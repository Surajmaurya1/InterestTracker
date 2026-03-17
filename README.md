# <p align="center">💰 Interest Tracker</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-blue?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Auth_+_DB-green?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Framer_Motion-UI-purple?style=for-the-badge&logo=framer" alt="Framer Motion" />
</p>

<p align="center">
  <strong>The premium solution for personal credit & lending management.</strong><br>
  Built with a sleek, high-end fintech aesthetic inspired by Apple Finance and modern banking apps.
</p>

---

## ✨ Features

### 🔐 Authentication & Security
- **Email/Password Auth** — Full sign-up and sign-in flow powered by Supabase Auth
- **Password Visibility Toggle** — Eye icon to show/hide password on login & signup
- **4-Digit MPIN Lock** — Cloud-synced security lock to protect your app
- **Brute-Force Protection** — 5-attempt limit with 30-second lockout and live countdown
- **Forgot MPIN** — Reset via identity verification (re-enter account password)
- **Row Level Security (RLS)** — Each user's data is fully isolated at the database level
- **Input Validation** — Server-side and client-side validation on all forms

### 💰 Transaction Management
- **Lending Tracking** — Log money you lend with person name, amount, daily interest, and date
- **Collection Tracking** — Log money you receive back with full details
- **Transaction Detail Modal** — Tap any transaction to see full breakdown + monthly projection
- **Swipe-to-Delete** — Mobile-native swipe interaction with confirmation dialog
- **Optimistic Updates** — Instant UI response with automatic rollback on failure

### 📊 Dashboard & Analytics
- **Real-Time Stats** — Total Lent, Total Received, Transaction Count, Avg. Daily Interest
- **7-Day Lending Chart** — Interactive bar chart showing lending volume (Recharts)
- **Smart Search** — Case-insensitive search by person name with instant results

### 🎨 Premium UI/UX
- **Deep Dark Fintech Aesthetic** — Custom `#0B0B0C` foundation with glassmorphism cards
- **Smooth Animations** — Framer Motion transitions across modals, lock screen, and interactions
- **Mobile-First Responsive** — Optimized for 320px phones to full desktop
- **Gradient Typography** — Premium "Welcome Back" header with white-to-zinc gradient
- **Custom Scrollbar** — Styled scrollbar matching the dark theme
- **Hidden Number Spinners** — Clean number inputs without browser-default arrows

### ⚡ Performance
- **Lazy-Loaded Modals** — Settings, Add Transaction, and Detail modals load on demand (~40KB saved)
- **Memoized Computations** — Stats and filtered lists use `useMemo` to avoid recalculations
- **Stable Callbacks** — `useCallback` prevents unnecessary child re-renders
- **DNS Prefetch** — Preconnect to Supabase for faster API calls
- **Font Display Swap** — Text visible instantly while Inter font loads

### 👥 Multi-User Support
- **Per-User Data Isolation** — Each account sees only their own transactions
- **Cloud-Synced MPIN** — Security settings persist across devices via Supabase profiles
- **Session Management** — Persistent sessions with auto-refresh tokens
- **Sign Out** — Secure session termination from Settings

---

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/) (Auth + PostgreSQL + RLS)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/) (Dialog)

---

## 🛠️ Rapid Setup

### 1. Database Initialization
Create your Supabase project and execute the following in the **SQL Editor**:

```sql
-- Create the transactions table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  person_name text not null,
  amount numeric not null,
  interest numeric default 0,
  type text check (type in ('lending', 'collection')) default 'lending',
  date timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table transactions enable row level security;

-- Security policies
create policy "Users see own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users delete own transactions" on transactions for delete using (auth.uid() = user_id);

-- Profiles table (for MPIN)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  mpin text check (mpin is null or mpin ~ '^[0-9]{4}$')
);

alter table profiles enable row level security;

create policy "Users see own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
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
| **Corners** | `rounded-2xl / rounded-3xl` (responsive) |
| **Borders** | `1px solid #1A1A1D` |
| **Font** | Inter (Google Fonts, swap display) |
| **Gradient** | `from-white to-zinc-500` (header text) |

---

## 📈 Roadmap

- [x] Email/Password authentication
- [x] Cloud-synced MPIN security lock
- [x] Brute-force protection (5 attempts + lockout)
- [x] Forgot MPIN with identity verification
- [x] Lending + Collection tracking
- [x] Transaction detail with monthly projection
- [x] Swipe-to-delete with confirmation
- [x] Interactive 7-day chart
- [x] Case-insensitive search
- [x] Multi-user data isolation (RLS)
- [x] Lazy-loaded modals for performance
- [x] Full mobile responsive design
- [x] Production-grade input validation
- [ ] Multi-currency support
- [ ] AI-powered repayment predictions
- [ ] Export to PDF/CSV Reports
- [ ] WhatsApp Quick Reminders
- [ ] Due Dates & Late Status indicators

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Surajmaurya1">Suraj Maurya</a>
</p>