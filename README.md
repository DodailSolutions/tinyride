# TinyRide by Dodail — AI-Assisted School Transportation Platform

> **Little Rides. Big Peace of Mind.**  
> Built for Dodail Solutions Private Limited • Initial Pilot: Hyderabad, Telangana, India.

---

## 🚌 Overview

TinyRide connects parents with verified independent school auto and van drivers across Hyderabad.
The platform prioritizes **child safety**, **strict data privacy**, **multi-tenant Row Level Security (RLS)**, **seat capacity enforcement**, and **reliable monthly Razorpay billing cycles**.

---

## 📁 Repository Structure

```
tinyride/
├── apps/
│   ├── parent/              # React Native (Expo Router) mobile app for parents
│   ├── driver/              # React Native (Expo Router) mobile app for drivers
│   └── admin/               # Next.js 15 App Router operations portal
├── packages/
│   ├── ui/                  # Visual tokens (Navy #0F1E36 & Orange #FF6B00), formatters
│   ├── types/               # TypeScript domain interfaces & Enums
│   ├── validation/          # Zod validation schemas (Telangana regulations, phone, UUIDs)
│   ├── api-client/          # Supabase client & OfflineTripSyncQueue with idempotency
│   └── config/              # Shared tsconfig.base.json
├── supabase/
│   ├── migrations/          # PostgreSQL DDL, triggers, and comprehensive RLS policies
│   ├── functions/           # Supabase Edge Functions (Razorpay orders, webhooks, AI assistant)
│   └── seed.sql             # Hyderabad pilot schools & test routes
├── services/
│   └── route-optimizer/     # Google OR-Tools CVRPTW solver
├── docs/                    # Implementation plan, architecture, assumptions, security, progress
├── package.json             # Root monorepo configuration
├── pnpm-workspace.yaml      # pnpm workspace mapping
└── turbo.json               # Pipeline configuration
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js >= 20.x
- pnpm >= 10.x
- Python 3.9+ (for route optimizer)

### 2. Installation
```bash
git clone https://github.com/DodailSolutions/tinyride.git
cd tinyride
pnpm install
```

### 3. Environment Setup
```bash
cp .env.example .env
# Fill in your Supabase, Razorpay, and Google Maps API keys
```

### 4. Running Applications
```bash
# Run Next.js Operations Admin
pnpm --filter @tinyride/admin dev

# Run Parent Mobile App (Expo)
pnpm --filter @tinyride/parent start

# Run Driver Mobile App (Expo)
pnpm --filter @tinyride/driver start
```

### 5. Running Automated Tests
```bash
# Run TypeScript package test suites (Vitest)
pnpm test

# Run Route Optimizer tests (Python)
python3 services/route-optimizer/test_optimizer.py
```

---

## 🔒 Security & Privacy Guarantees

1. **Child Data Protection**: Children's locations, grades, and emergency contacts are never exposed to unauthorized drivers or third parties. PostgreSQL Row Level Security (RLS) restricts access strictly to verified parents and assigned route drivers during active shifts.
2. **Two-Party Human Approval**: Driver onboarding and route publication require manual approval from an Operations Admin (`apps/admin/app/drivers`). Zero automatic approvals.
3. **Cryptographic Payment Webhooks**: No client-side payment success is trusted. All subscriptions are confirmed via server-side HMAC-SHA256 signature verification.
4. **Idempotent Trip Milestones**: Device-generated UUID idempotency keys prevent duplicate pickup/drop records in low-connectivity areas.

---

## 📄 License
Proprietary software belonging to Dodail Solutions Private Limited. All rights reserved.
