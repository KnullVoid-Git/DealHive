# DealHive Production Security & Hardening Guide

This document outlines key steps to secure the DealHive platform when deploying to production infrastructure (Supabase Cloud, Vercel, Stripe connect, and Developer consoles).

---

## 1. Rate Limiting Configurations

### A. Supabase Native Auth Rate Limits (GoTrue Settings)
Supabase provides built-in rate-limiting controls for authentication routes. Configure these in the **Supabase Dashboard** under **Settings > Auth > Security**:
* **Email Rate Limits**: Set a limit of **3 emails per hour per IP** to prevent password-reset or sign-up spamming.
* **SMS Rate Limits**: Set a limit of **10 SMS messages per day** (if using phone auth) to avoid SMS fee exhaustion.
* **Max Sign-In Attempts**: Enforce a maximum of **5 failed login attempts per minute** before temporary lockout.

### B. Securing Serverless Edge Functions (AI & Webhooks)
For endpoints executing external API requests (e.g. OpenAI, Anthropic, HelloSign, or Stripe):
* **Do NOT call raw third-party keys directly from the client.** Keep the keys stored strictly as server-side environment variables in Supabase (via `supabase secrets set`) or Vercel config.
* **Implement Redis-based Rate Limiting**: If you write custom Supabase Edge Functions for the AI counter-offer recommendations, secure them with a fast Redis limiter such as **Upstash Rate Limit**:
  ```typescript
  import { Ratelimit } from "@upstash/ratelimit";
  import { Redis } from "@upstash/redis";

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "60 s"), // Max 3 requests per 60s
  });
  ```

---

## 2. Row-Level Security (RLS) Enforcement

Make sure RLS is enabled on all tables in your live database schema. If adding new tables, run:
```sql
alter table dealhive_table_name enable row level security;
```

### A. Impersonation Guard
Ensure all insert/update policies validate the sender identity explicitly:
```sql
create policy message_insert_policy on dealhive_deal_message 
  for insert with check (
    sender_id = auth.uid()
  );
```

### B. Party Scope Restrictions
For child tables (deliverables, invoices, contracts), always join on the parent deal table to check that the current authenticated user's ID matches either the `creator_id` or the `brand_id`:
```sql
create policy invoice_party_access on dealhive_invoice 
  for all using (
    exists (
      select 1 from dealhive_deal d 
      where d.id = deal_id 
      and (d.creator_id = auth.uid() or d.brand_id = auth.uid())
    )
  );
```

---

## 3. Environment Variables & Secrets Separation

DealHive runs on Vite. In Vite, only environment variables prefixed with `VITE_` are exposed to your client-side code:
* **Public Client-Side Keys (VITE_ Prefixed)**:
  * `VITE_SUPABASE_URL`: Public endpoint for client database connectivity.
  * `VITE_SUPABASE_ANON_KEY`: Public anonymous key. Row-Level Security policies protect data access.
  * `VITE_STRIPE_PUBLISHABLE_KEY`: Public key for card element loading.
  * `VITE_GOOGLE_CLIENT_ID`: Public OAuth identifier.
* **Private Secrets (Strictly Server-Side)**:
  * Do NOT prefix developer API credentials (e.g., Stripe Secret Key, HelloSign App Secret, Supabase Service Role Key) with `VITE_`.
  * Store private keys inside server-side environments (Supabase Edge Secrets, AWS Systems Manager, or Vercel Environment panel).

---

## 4. CORS & Domain Whitelisting

To prevent rogue web clients from calling your Supabase project endpoints or consuming your API keys:
1. In the **Supabase Dashboard**, navigate to **Settings > API**.
2. Under **Allowed Web Origins (CORS)**, remove the wildcard (`*`) configuration.
3. Explicitly whitelist your production domains and local development server:
   ```text
   http://localhost:5173
   https://dealhive.io
   https://*.dealhive.io
   ```

---

## 5. Budget Caps & Billing Alerts Configuration

Usage-based developer platforms (AWS, Google Cloud, OpenAI, Supabase) must have strict budget boundaries and warning thresholds configured to prevent runaway invoices from automated endpoint spamming.

### A. OpenAI / Anthropic API Spend Limits
* Navigate to your LLM developer dashboard settings:
  * **Hard Limit**: Establish a hard cap (e.g. $50/month) at which point all incoming prompts are instantly blocked.
  * **Soft Limit**: Establish a soft cap (e.g. $20/month) that sends email warnings to the administrator.

### B. AWS & Google Cloud Console Alerts
* **Google Billing Budgets**: Create budget rules inside GCP console to dispatch Pub/Sub messages or emails at 50%, 75%, and 100% of predicted spend.
* **AWS Budgets & SNS**: Configure AWS Budgets linked to an SNS alert that notifies PR engineers if EC2, SageMaker, or S3 costs spike.

### C. Supabase Spend Cap Rules
* In the Supabase Cloud dashboard, check billing settings:
  * **Spend Cap Toggle**: Keep the spend cap **ENABLED** (default) on the $25/month Pro Plan. This prevents database queries from racking up charges if you exceed standard storage, CPU, or outbound data quotas.

---

## 6. Database-Level Transaction Constraints & RLS Triggers

To prevent privilege escalation and secure transactions, direct SQL `UPDATE` operations initiated from authenticated client sessions are restricted via database triggers.

### A. User Profile & Role Integrity
* **Role Modifications**: Role column on `dealhive_user` is locked at creation. Triggers reject role changes from `'creator'` to `'brand'` (or vice-versa) to prevent bypassing access scopes.
* **Privilege Column Locking**: Direct writes to `subscription_plan` or `stripe_status` on `dealhive_creator_profile` are blocked for `authenticated` users, preventing subscription payment bypasses.

### B. Deal & Agreement Integrity (`check_deal_agreement_escalation`)
* **Consent Protection**: Creators cannot set `brand_agreed := true` on updates; Brands cannot set `creator_agreed := true`.
* **Renegotiation Reset**: If a user updates key deal terms (such as `agreed_rate`, `currency`, `payment_terms`, `exclusivity`, or `kill_fee`), the trigger automatically resets the other party's agreement flag to `false`.

### C. Deliverables Submission Control (`check_deliverable_tampering`)
* **Review Locks**: Creators are blocked from setting deliverable status to `'approved'` or `'revision_requested'` (preventing self-approving drafts).
* **Upload Locks**: Brands are blocked from uploading file drafts (`file_url`) or modifying revision counts.

### D. Invoice Integrity & Payment Gates (`check_invoice_tampering`)
* **Pricing Integrity**: Triggers block client updates that attempt to modify `amount`, `platform_fee`, or `creator_net` on issued invoices.
* **Direct Status Block**: Client sessions cannot execute `UPDATE ... SET status = 'paid'`. Invoices must be reconciled via webhooks or secure RPC database functions.

### E. Secure RPC Payment Simulation (`simulate_invoice_payment`)
In production, database tables are updated strictly by payment gateway webhooks running under elevated database privileges (e.g. `service_role`). To safely simulate this from the frontend in local testing and live staging modes, a `security definer` database function is used:
```sql
create or replace function simulate_invoice_payment(target_invoice_id uuid)
returns void as $$
begin
  update dealhive_invoice set status = 'paid' where id = target_invoice_id;
  update dealhive_deal set stage = 'completed' where id = (select deal_id from dealhive_invoice where id = target_invoice_id);
end;
$$ language plpgsql security definer;
```
Calling `supabase.rpc('simulate_invoice_payment', { target_invoice_id: id })` executes the payment under function owner privileges, safely bypassing direct `authenticated` client triggers.

