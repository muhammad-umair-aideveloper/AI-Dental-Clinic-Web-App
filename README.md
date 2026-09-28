# 🦷 Lahore Dental — AI-Powered Dental Clinic Web App

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.7-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![OpenAI GPT-4o-mini](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat-square&logo=openai)](https://platform.openai.com/)

A production-ready, mobile-first dental clinic web application engineered for **Lahore Dental** located on Main Boulevard, Gulberg III, Lahore, Pakistan. Built using **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui** with complete bilingual English and Urdu (RTL) localization, an AI dental triage assistant powered by **Vercel AI SDK** and **OpenAI GPT-4o-mini**, an interactive appointment booking engine, and a **real authentication backend** with cryptographic salted password hashing, persistent HTTP-only sessions, and strict **Role-Based Access Control (RBAC)**.

---

## 🌟 Key Highlights & Core Features

### 1. 🔐 Real Authentication & Role-Based Access Control (RBAC)
- **Zero Plaintext Passwords:** Passwords encrypted using cryptographic **PBKDF2** with individual 16-byte random salts (`salt:hash`) and verified with `crypto.timingSafeEqual`.
- **Persistent HTTP-Only Sessions:** Uses signed HMAC-SHA256 session tokens stored in secure `lahore_dental_session` cookies valid for 7 days, surviving page refreshes and browser restarts.
- **Automatic User Role Assignment:** Every new patient account created via Sign Up is automatically assigned the `"user"` role.
- **Role-Based Redirection:**
  - Authenticated `"admin"` accounts $\rightarrow$ Redirected to `/[locale]/admin-dashboard`
  - Authenticated `"user"` accounts $\rightarrow$ Redirected to `/[locale]/user-dashboard`
- **Strict Route Protection:** Enforced at both Next.js Edge Middleware and client page levels. **Normal users cannot access `/admin-dashboard` or `/admin` by manually typing the URL**; any unauthorized attempt is intercepted and safely redirected to `/user-dashboard?error=admin_only` with an alert notice.
- **Pre-Seeded Accounts:**
  - **Clinic Owner / Admin:** `admin` or `admin@lahoredental.pk` / `admin123` (Role: `admin`)
  - **Patient Demo Account:** `patient@lahoredental.pk` / `patient123` (Role: `user`)

### 2. 📅 Interactive Appointment Booking Engine
- **Visual Date & Time Slot Picker:** Dedicated modal allows patients to pick any valid upcoming date, select 45-minute clinic slots (11:00 AM – 8:00 PM), choose dental procedures, and enter contact info.
- **Live Slot Availability Check:** Integrates with clinic database and Google Calendar FreeBusy API to avoid double-booking.
- **Instant WhatsApp & Email Confirmations:** Generates instant WhatsApp notification links and email confirmation triggers via Resend.

### 3. 🤖 Intelligent Bilingual AI Dental Assistant
- **Vercel AI SDK & OpenAI GPT-4o-mini:** Real-time streaming conversational assistant embedded directly in the web app.
- **Bilingual & Urdu RTL Native:** Automatically detects language and replies fluently in English, Urdu (اردو), or Roman Urdu.
- **Automated Tool Calling:**
  - `checkAvailability(date)`: Checks database and calendar for open consultation slots.
  - `bookAppointment(name, phone, date, time, reason)`: Directly books appointments into the database during chat.
- **Medical Emergency Triage:** Detects acute symptoms (severe bleeding, acute trauma, tooth knocked out) and immediately surfaces the 24/7 clinic emergency hotline (`+92 300 1234567`).

### 4. 📊 Portals & Dashboards
- **Patient Dashboard (`/[locale]/user-dashboard`):**
  - Personal profile details, active account status, and role badge.
  - Dental care process timeline (Booked $\rightarrow$ WhatsApp Alert $\rightarrow$ Consultation $\rightarrow$ Treatment).
  - List of past and upcoming booked appointments with status badges (Confirmed, Completed, Cancelled).
  - Single-click directions to Gulberg III clinic and WhatsApp clinic helpline.
  - "Book New Appointment" trigger.
- **Admin & Clinic Management Portal (`/[locale]/admin-dashboard`):**
  - Real-time KPI summary (Total appointments, Today's schedule, Confirmed bookings, Inquiries).
  - Tabbed interface: Appointments manager, Web contact inquiries, and Walk-in / Phone booking form.
  - Status updater (Confirmed $\rightarrow$ Completed $\rightarrow$ Cancelled) and appointment cancellation/deletion.
  - Single-click patient WhatsApp reminder generator with pre-formatted appointment reminder text.

### 5. 🎨 Design System, Glassmorphism & Typography
- **Medical Dental Color Palette:**
  - Primary Dark Navy: `#001a4b`
  - Classic Navy: `#04326d`
  - Soft Slate Accent: `#b2bed6`
- **Modern Typography Pairing:**
  - **Headings (H1, H2, H3):** *Plus Jakarta Sans* (600/700 weight, tight line-height, crisp modern medical feel).
  - **Body, Navigation, Cards & Forms:** *Inter* (400/500 weight, 1.5 line-height for maximum readability).
  - **Inputs & CTA Buttons:** *Inter* at minimum 16px font-size to prevent unwanted mobile iOS/Android auto-zoom.
- **Glassmorphism Doctor Showcase:** Interactive in-page modal for Dr. Sarah Tariq Khan (BDS, RDS) with qualifications, clinical experience, specializations, verified PMDC credentials, and patient reviews.

---

## 🛠️ Tech Stack Architecture

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Turbopack, React 19) |
| **Language** | TypeScript (Strict mode) |
| **Styling** | Tailwind CSS, PostCSS, Lucide Icons, Glassmorphism UI |
| **Internationalization (i18n)** | `next-intl` (v3) with dynamic `/en` & `/ur` localized routing and RTL support |
| **AI & LLM** | Vercel AI SDK (`ai`), `@ai-sdk/openai` (`gpt-4o-mini`), `zod` |
| **Authentication & RBAC** | Custom PBKDF2 crypto salted hashing, HTTP-only HMAC-SHA256 session cookies, Next.js Edge Middleware |
| **Database** | Supabase (PostgreSQL `appointments`, `inquiries`, `users`) with in-memory & file-backed fallback |
| **Calendar Integration** | Google Calendar FreeBusy and Events API |
| **Notifications** | Resend (Email confirmations) and Twilio (WhatsApp confirmations) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js:** v18.18+ or v20+ / v22+
- **Package Manager:** `npm`, `pnpm`, or `yarn`

### 2. Clone the Repository
```bash
git clone https://github.com/muhammad-umair-aideveloper/AI-Dental-Clinic-Web-App.git
cd AI-Dental-Clinic-Web-App
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Fill in the necessary API keys:
```env
# Authentication Secret (Used for HMAC session token signing)
AUTH_SECRET=your-random-32-byte-secret-key-here

# OpenAI API Key (For AI Dental Assistant Chatbot)
OPENAI_API_KEY=sk-proj-...

# Supabase (PostgreSQL Database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Notifications (Optional)
RESEND_API_KEY=re_...
CLINIC_ADMIN_EMAIL=admin@lahoredental.pk
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Google Calendar (Optional)
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GOOGLE_API_KEY=AIzaSy...
```
*(Note: If cloud keys are omitted, the application runs in local offline development mode with persistent JSON data storage, allowing full testing of authentication, booking, and dashboards out-of-the-box.)*

### 5. Run the Application

```bash
# Start development server
npm run dev

# Or build and run for production
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Credentials

| Role | Username / Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Clinic Administrator** | `admin` or `admin@lahoredental.pk` | `admin123` | `/[locale]/admin-dashboard` |
| **Normal Patient** | `patient@lahoredental.pk` | `patient123` | `/[locale]/user-dashboard` |
| **New Patients** | *Any email via Sign Up* | *Chosen password* | `/[locale]/user-dashboard` |

---

## 📁 Repository Structure

```
AI-Dental-Clinic-Web-App/
├── data/
│   └── users.json               # Persistent local user store with salted hashes
├── messages/
│   ├── en.json                  # English localization dictionary
│   └── ur.json                  # Urdu localization dictionary (RTL)
├── public/                      # Static assets & icons
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── admin/           # Admin page redirect to admin-dashboard
│   │   │   ├── admin-dashboard/ # Protected Clinic Owner & Staff Portal (RBAC)
│   │   │   ├── user-dashboard/  # Protected Patient Appointment Portal (RBAC)
│   │   │   ├── my-appointments/ # Backwards-compatible patient route
│   │   │   ├── layout.tsx       # Locale provider, RTL layout & metadata
│   │   │   └── page.tsx         # Modern landing page
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── data/        # Protected admin data route (role check)
│   │   │   │   └── login/       # Admin credential verification
│   │   │   ├── appointments/    # CRUD appointment endpoints
│   │   │   ├── auth/
│   │   │   │   ├── login/       # Password verify & session cookie issuance
│   │   │   │   ├── signup/      # PBKDF2 hash & auto "user" role assignment
│   │   │   │   ├── me/          # Persistent session validation
│   │   │   │   └── logout/      # Session cookie termination
│   │   │   ├── chat/            # Vercel AI SDK streaming route & tools
│   │   │   └── contact/         # Inquiries handler
│   │   ├── globals.css          # Color scheme, typography & animations
│   │   └── layout.tsx           # Pass-through root layout
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthButton.tsx   # Sign In / Sign Up modal & user avatar controls
│   │   │   └── AuthProvider.tsx # Global authentication context & state
│   │   ├── booking/
│   │   │   └── BookingModal.tsx # Interactive date & time slot booking modal
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx    # Slide-over chat sheet & streaming UI
│   │   │   └── ChatWidget.tsx   # Floating pulsing action trigger
│   │   ├── layout/
│   │   │   ├── Navbar.tsx       # Sticky navigation & mobile drawer
│   │   │   ├── Footer.tsx       # Clinic info & medical disclaimer
│   │   │   └── LanguageToggle.tsx # EN/UR toggle with persistence
│   │   └── sections/
│   │       ├── HeroSection.tsx
│   │       ├── ServicesSection.tsx
│   │       ├── WhyChooseUsSection.tsx
│   │       ├── DoctorSection.tsx
│   │       ├── GallerySection.tsx
│   │       ├── TestimonialsSection.tsx
│   │       └── ContactSection.tsx
│   ├── i18n/
│   │   ├── request.ts           # next-intl server request config
│   │   └── routing.ts           # next-intl routing definition
│   ├── lib/
│   │   ├── auth-crypto.ts       # PBKDF2 salted hashing & HMAC session tokens
│   │   ├── auth-db.ts           # User repository & Supabase sync
│   │   ├── auth-edge.ts         # Edge-compatible Web Crypto token verification
│   │   ├── calendar.ts          # Google Calendar slot availability
│   │   ├── notifications.ts     # Resend email & Twilio WhatsApp
│   │   ├── rate-limit.ts        # In-memory session rate limiter
│   │   └── supabase.ts          # Supabase client & fallback store
│   └── middleware.ts            # Next.js Edge Middleware for i18n & RBAC
├── supabase/
│   └── schema.sql               # Supabase database schema
├── .env.example                 # Template for environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🇵🇰 Clinic Details

- **Clinic Name:** Lahore Dental
- **Address:** Plaza 42-B, Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan
- **Phone / Helpline:** `+92 300 1234567`
- **Hours:** Monday – Saturday: 11:00 AM – 09:00 PM (Sunday: Emergency Only)

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
