# ⬡ DealHive — Creator Sponsorship Operating System

> **Where creator deals come alive**
> DealHive is the end-to-end sponsorship operating system for YouTube creators. It manages the complete lifecycle of a brand deal — from discovery and negotiation, through contracts and deliverables, to invoicing and payment — all in one place.

---

## 🚀 Getting Started

Since standard Node.js and NPM command routes are defined but may not be loaded in your environment PATH, follow these steps to execute:

1. **Install Node.js & NPM**: If not already present, download and install the LTS version of [Node.js](https://nodejs.org/).
2. **Open Terminal**: Navigate to the project directory:
   ```bash
   cd d:\SHAURYA_DATA\DealHive
   ```
3. **Install Dependencies**: Install all React 18, Tailwind, Zustand, and React Query dependencies:
   ```bash
   npm install
   ```
4. **Launch Development Server**: Start the local development server:
   ```bash
   npm run dev
   ```
5. **View Application**: Open your browser and navigate to `http://localhost:5173`.

---

## 🛠 Tech Stack

- **Frontend Core**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + CSS Custom Properties (Sora + DM Sans + DM Mono fonts)
- **Icons**: Lucide React (Stroke 1.5px)
- **Routing**: React Router v6
- **Server State**: TanStack React Query
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Toasts**: react-hot-toast

---

## 📁 Directory Structure

```text
DealHive/
├── supabase/
│   └── migrations/
│       └── 20260531000000_init_schema.sql  # Database Schema Setup
├── src/
│   ├── assets/
│   ├── components/                        # Design Spec Component Library
│   │   ├── Button.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Card.tsx
│   │   ├── InputField.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── SegmentedControl.tsx
│   │   ├── DealStageProgressBar.tsx
│   │   ├── DataTable.tsx
│   │   ├── ActivityFeedRow.tsx
│   │   ├── DealCard.tsx
│   │   ├── ShimmerSkeleton.tsx
│   │   ├── Sidebar.tsx
│   │   └── UpgradePrompt.tsx
│   ├── hooks/                             # Custom Animation & Gate Hooks
│   │   ├── useCountUp.ts
│   │   ├── useDashboardEntrance.ts
│   │   ├── usePlanGate.ts
│   │   └── useSubscription.ts
│   ├── pages/                             # High-Fidelity Pages Assembly
│   │   ├── Dashboard.tsx
│   │   ├── Deals.tsx
│   │   ├── DealRoom.tsx
│   │   ├── Payments.tsx
│   │   ├── Profile.tsx
│   │   ├── Inbox.tsx
│   │   └── BrandDashboard.tsx
│   ├── services/                          # Database & Third-Party Service Adapters
│   │   ├── supabase.ts
│   │   ├── stripe.ts
│   │   ├── hellosign.ts
│   │   └── youtube.ts
│   ├── types/
│   │   └── supabase.types.ts
│   ├── App.tsx                            # Root Router Coordinator
│   ├── main.tsx                           # ReactDOM Entry Mount
│   └── index.css                          # CSS Token System & Easing Curves
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## ⚡ High-Fidelity Local Simulation

To enable complete end-to-end testing immediately without requiring complex setup, all services in `src/services/` feature **robust localStorage-backed mock databases**:

* **State Synchronization**: Adding a deal in the My Deals modal updates the database and live active list immediately.
* **RLS Simulations**: Toggling the role at the bottom of the sidebar (Creator $\leftrightarrow$ Brand) switches layouts and updates active permissions.
* **Realtime Messaging**: Entering messages in the Deal Room triggers immediate listener updates.
* **Embedded HelloSign signing iframe**: Generates template steps and launches interactive place e-signature modals.
* **Stripe Connect & Payouts**: Connects sandbox bank accounts, computes 2.5% platform cuts, and settles payouts.
* **YouTube OAuth**: Simulates Google OAuth and grabs actual statistics (Engagement, Subscribers, Country splits).
* **Upgrade Gating**: Limit active deals to 2 on Free tier, upgrade to Pro to unlock rate benchmarking card.
