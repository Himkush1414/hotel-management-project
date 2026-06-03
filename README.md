# HotelOS — Hotel Management System

> A full-stack, production-grade hotel management platform built for real-world client operations. Dark-themed, pixel-perfect, and engineered for speed.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

**Live Demo:** https://hotel-management-project-eta.vercel.app

---

## Overview

**HotelOS** is a complete hotel management system designed to handle every operational aspect of a modern hotel — from guest check-ins and room management to billing, staff attendance, and real-time analytics. Built with a refined dark UI inspired by the quality bar of Vercel, Linear, and Stripe.

---

## Features

### Core Modules

- **Dashboard** — Bento grid with today's revenue, occupancy ring chart, 30-day revenue trend, room status map, and recent check-ins
- **Bookings** — Full lifecycle: Pending → Confirmed → Checked In → Checked Out, with search and inline actions
- **Rooms** — Grid and list views, status cycling, room type management, visual color-coded room map
- **Guests** — Guest profiles with full booking history, ID management, and nationality tracking
- **Billing** — Invoice management, partial/full payment recording, multiple payment modes
- **Staff** — Role-based staff management with activate/deactivate controls
- **Attendance** — Daily attendance marking, bulk mark present, date navigator, summary strip
- **Expenses** — Category-wise tracking with 30-day trend chart and category breakdown
- **Notifications** — Grouped by date, unread indicators, mark all read
- **Settings** — Hotel profile, GST/tax config, check-in/out times, currency, danger zone
- **Analytics** — 30-day revenue vs expenses chart, occupancy area chart, peak day stats

### Design System

- **Dark theme** — #0a0a0f base with layered surface depths
- **Typography** — DM Sans (UI) + DM Mono (numbers, codes, amounts)
- **Color palette** — Purple accent #6c5ce7 with semantic status colors
- **Responsive** — Mobile bottom nav, tablet 2-col, desktop full sidebar
- **Animations** — Page fade-in, card hover lift, modal entrance, skeleton shimmer

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + CSS custom properties |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Charts | Recharts |
| Notifications | Sonner |
| Icons | Lucide React |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A Supabase project

### 1. Clone the repository

```bash
git clone https://github.com/Himkush1414/hotel-management-project.git
cd hotel-management-project
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_HOTEL_ID=your_hotel_id
```

### 4. Run the development server

```bash
pnpm dev
```

Open http://localhost:3000

### 5. Build for production

```bash
pnpm build
pnpm start
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `rooms` | Room inventory with status |
| `room_types` | Room categories and base pricing |
| `guests` | Guest profiles and ID details |
| `bookings` | Booking records with lifecycle status |
| `invoices` | Billing and payment tracking |
| `staff` | Staff members and roles |
| `attendance` | Daily attendance records |
| `expenses` | Operational expense records |
| `notifications` | System and activity notifications |
| `hotel_settings` | Hotel configuration |

---

## Deployment

Deployed on **Vercel** — https://hotel-management-project-eta.vercel.app

Any push to `main` branch auto-deploys to production.

---

## License

Private — All rights reserved.

---

<div align="center">
  <strong>Built with precision for real-world hotel operations.</strong><br/>
  <sub>Dark. Fast. Production-ready.</sub>
</div>
