-- Migration 20260531000000: DealHive Initial Schema Setup
-- Run this migration in Supabase to initialize all dealhive_ tables and RLS policies

create extension if not exists "uuid-ossp";

-- Users table
create table dealhive_user (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  role text not null check (role in ('creator', 'brand')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Creator Profile
create table dealhive_creator_profile (
  id uuid references dealhive_user(id) on delete cascade primary key,
  username text not null unique check (username ~* '^[a-zA-Z0-9_]{3,20}$'),
  full_name text not null,
  avatar_url text,
  bio text,
  niche_tags text[] default '{}'::text[] not null,
  rate_card jsonb default '{
    "integration": 0,
    "dedicated": 0,
    "shorts": 0,
    "social_package": 0,
    "exclusivity_premium": 0
  }'::jsonb not null,
  youtube_connected boolean default false not null,
  youtube_channel_id text,
  youtube_stats jsonb default null,
  stripe_connected_id text,
  stripe_status text default 'unconnected' check (stripe_status in ('unconnected', 'pending', 'active')) not null,
  subscription_plan text default 'free' check (subscription_plan in ('free', 'pro', 'business')) not null,
  visibility text default 'public' check (visibility in ('public', 'unlisted', 'private')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Brand Profile
create table dealhive_brand_profile (
  id uuid references dealhive_user(id) on delete cascade primary key,
  company_name text not null,
  industry text not null,
  website text,
  billing_email text not null,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Deals Table
create table dealhive_deal (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references dealhive_creator_profile(id) not null,
  brand_id uuid references dealhive_brand_profile(id) not null,
  title text not null,
  deal_type text not null check (deal_type in ('Integration', 'Dedicated Video', 'Shorts', 'Social Package', 'Long-Term Partnership')),
  stage text default 'negotiating' check (stage in ('negotiating', 'contracted', 'in_production', 'draft_submitted', 'revisions', 'approved', 'published', 'payment_pending', 'completed')) not null,
  agreed_rate numeric(12,2) not null default 0.00,
  currency text not null default 'USD',
  payment_terms text not null default 'Net 30',
  exclusivity text,
  usage_rights text,
  kill_fee numeric(12,2) default 0.00 not null,
  term_change_history jsonb default '[]'::jsonb not null,
  creator_agreed boolean default false not null,
  brand_agreed boolean default false not null,
  last_viewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages
create table dealhive_deal_message (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references dealhive_deal(id) on delete cascade not null,
  sender_id uuid references dealhive_user(id) not null,
  message_text text,
  attachments jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Deliverables
create table dealhive_deliverable (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references dealhive_deal(id) on delete cascade not null,
  name text not null,
  due_date date not null,
  status text default 'pending' check (status in ('pending', 'submitted', 'approved', 'revision_requested')) not null,
  file_url text,
  revision_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Contracts
create table dealhive_contract (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references dealhive_deal(id) on delete cascade not null,
  pdf_url text,
  hellosign_request_id text,
  creator_signature_status text default 'unsigned' not null,
  brand_signature_status text default 'unsigned' not null,
  status text default 'unsigned' check (status in ('unsigned', 'partially_signed', 'fully_signed')) not null,
  signed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invoices
create table dealhive_invoice (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references dealhive_deal(id) on delete cascade not null,
  amount numeric(12,2) not null,
  platform_fee numeric(12,2) not null,
  creator_net numeric(12,2) not null,
  due_date date not null,
  stripe_payment_intent_id text,
  pdf_url text,
  status text default 'pending' check (status in ('pending', 'invoice_sent', 'overdue', 'paid')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payment Reminders
create table dealhive_payment_reminder (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references dealhive_invoice(id) on delete cascade not null,
  reminder_type text not null check (reminder_type in ('7d', '1d', '0d', 'overdue')),
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Rate Benchmarks
create table dealhive_rate_benchmarks (
  id uuid default gen_random_uuid() primary key,
  niche text not null,
  subscriber_tier text not null,
  median_rate numeric(12,2) not null,
  p25_rate numeric(12,2) not null,
  p75_rate numeric(12,2) not null,
  sample_size integer not null,
  calculated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications
create table dealhive_notification (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references dealhive_user(id) on delete cascade not null,
  icon text not null,
  title text not null,
  message text not null,
  link text not null,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Incoming Offers Table
create table dealhive_incoming_offer (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references dealhive_creator_profile(id) not null,
  brand_id uuid references dealhive_brand_profile(id) not null,
  title text not null,
  message text not null,
  requested_rate numeric(12,2) not null,
  creative_freedom integer not null check (creative_freedom between 0 and 100),
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  rejected_at timestamp with time zone
);

-- Enable RLS
alter table dealhive_user enable row level security;
alter table dealhive_creator_profile enable row level security;
alter table dealhive_brand_profile enable row level security;
alter table dealhive_deal enable row level security;
alter table dealhive_deal_message enable row level security;
alter table dealhive_deliverable enable row level security;
alter table dealhive_contract enable row level security;
alter table dealhive_invoice enable row level security;
alter table dealhive_payment_reminder enable row level security;
alter table dealhive_rate_benchmarks enable row level security;
alter table dealhive_notification enable row level security;
alter table dealhive_incoming_offer enable row level security;

-- Policies
create policy user_own_read_write on dealhive_user for all using (auth.uid() = id);
create policy creator_profile_read on dealhive_creator_profile for select using (visibility != 'private' or auth.uid() = id);
create policy creator_profile_write on dealhive_creator_profile for all using (auth.uid() = id);
create policy brand_profile_read on dealhive_brand_profile for select using (true);
create policy brand_profile_write on dealhive_brand_profile for all using (auth.uid() = id);
create policy deal_creator_access on dealhive_deal for all using (auth.uid() = creator_id);
create policy deal_brand_access on dealhive_deal for all using (auth.uid() = brand_id);

-- Secure Messages: allow select to deal parties, allow inserts only for self (prevent impersonation), allow updates/deletions only to author
create policy message_select_policy on dealhive_deal_message for select using (exists (select 1 from dealhive_deal d where d.id = deal_id and (d.creator_id = auth.uid() or d.brand_id = auth.uid())));
create policy message_insert_policy on dealhive_deal_message for insert with check (sender_id = auth.uid() and exists (select 1 from dealhive_deal d where d.id = deal_id and (d.creator_id = auth.uid() or d.brand_id = auth.uid())));
create policy message_update_delete_policy on dealhive_deal_message for all using (sender_id = auth.uid());

create policy deliverable_party_access on dealhive_deliverable for all using (exists (select 1 from dealhive_deal d where d.id = deal_id and (d.creator_id = auth.uid() or d.brand_id = auth.uid())));
create policy contract_party_access on dealhive_contract for all using (exists (select 1 from dealhive_deal d where d.id = deal_id and (d.creator_id = auth.uid() or d.brand_id = auth.uid())));
create policy invoice_party_access on dealhive_invoice for all using (exists (select 1 from dealhive_deal d where d.id = deal_id and (d.creator_id = auth.uid() or d.brand_id = auth.uid())));

-- Secure Payment Reminders: access only if you are creator or brand of the invoice's deal
create policy reminder_access on dealhive_payment_reminder for all using (exists (select 1 from dealhive_invoice i join dealhive_deal d on d.id = i.deal_id where i.id = invoice_id and (d.creator_id = auth.uid() or d.brand_id = auth.uid())));

-- Secure Rate Benchmarks: authenticated users can read, only admin write
create policy rate_benchmarks_select on dealhive_rate_benchmarks for select using (auth.role() = 'authenticated');

create policy notification_owner_access on dealhive_notification for all using (auth.uid() = user_id);

-- Secure Incoming Offers: select only for sender or receiver, insert only for sender, update only for parties
create policy offer_select_policy on dealhive_incoming_offer for select using (auth.uid() = creator_id or auth.uid() = brand_id);
create policy offer_insert_policy on dealhive_incoming_offer for insert with check (auth.uid() = creator_id);
create policy offer_update_delete_policy on dealhive_incoming_offer for all using (auth.uid() = creator_id or auth.uid() = brand_id);

-- Error Logs table for monitoring what's breaking
create table dealhive_error_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references dealhive_user(id) on delete set null,
  error_message text not null,
  error_stack text,
  component_stack text,
  url text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on error logs
alter table dealhive_error_log enable row level security;

-- Policies for Error Logs: allow insertions from any client session (to report errors before/during auth), restrict reads to trace owner
create policy error_log_insert_policy on dealhive_error_log for insert with check (true);
create policy error_log_select_policy on dealhive_error_log for select using (auth.uid() = user_id);

-- Enforce default non-escalated values on creator profile insertion from client sessions
create or replace function set_default_creator_privileges()
returns trigger as $$
begin
  if (auth.role() = 'authenticated') then
    new.subscription_plan := 'free';
    new.stripe_status := 'unconnected';
    new.stripe_connected_id := null;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger enforce_default_creator_privileges
  before insert on dealhive_creator_profile
  for each row
  execute function set_default_creator_privileges();

-- Prevent users from modifying subscription plans or stripe credentials directly on update
create or replace function prevent_user_profile_privilege_escalation()
returns trigger as $$
begin
  if (new.subscription_plan <> old.subscription_plan or
      new.stripe_status <> old.stripe_status or
      new.stripe_connected_id is distinct from old.stripe_connected_id) then
    if (auth.role() = 'authenticated') then
      raise exception 'Security Exception: Direct modifications to subscription plan or Stripe credentials are prohibited.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger check_profile_privilege_escalation
  before update on dealhive_creator_profile
  for each row
  execute function prevent_user_profile_privilege_escalation();

-- Prevent modifications to user role once set
create or replace function prevent_user_role_modification()
returns trigger as $$
begin
  if (new.role <> old.role) then
    if (current_user = 'authenticated') then
      raise exception 'Security Exception: Modifying user role is prohibited.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger check_user_role_modification
  before update on dealhive_user
  for each row
  execute function prevent_user_role_modification();

-- Prevent deal agreement escalation and reset consent if key terms change
create or replace function prevent_deal_agreement_escalation()
returns trigger as $$
begin
  if (current_user = 'authenticated') then
    -- Creator signing check
    if (auth.uid() = old.creator_id) then
      if (new.brand_agreed is true and old.brand_agreed is not true) then
        raise exception 'Security Exception: Creators cannot agree to terms on behalf of brands.';
      end if;
      -- Reset brand agreement if key deal terms change
      if (new.agreed_rate <> old.agreed_rate or
          new.deal_type <> old.deal_type or
          new.currency <> old.currency or
          new.payment_terms <> old.payment_terms or
          new.exclusivity is distinct from old.exclusivity or
          new.usage_rights is distinct from old.usage_rights or
          new.kill_fee <> old.kill_fee) then
        new.brand_agreed := false;
      end if;
    end if;

    -- Brand signing check
    if (auth.uid() = old.brand_id) then
      if (new.creator_agreed is true and old.creator_agreed is not true) then
        raise exception 'Security Exception: Brands cannot agree to terms on behalf of creators.';
      end if;
      -- Reset creator agreement if key deal terms change
      if (new.agreed_rate <> old.agreed_rate or
          new.deal_type <> old.deal_type or
          new.currency <> old.currency or
          new.payment_terms <> old.payment_terms or
          new.exclusivity is distinct from old.exclusivity or
          new.usage_rights is distinct from old.usage_rights or
          new.kill_fee <> old.kill_fee) then
        new.creator_agreed := false;
      end if;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger check_deal_agreement_escalation
  before update on dealhive_deal
  for each row
  execute function prevent_deal_agreement_escalation();

-- Prevent deliverables tampering (creator cannot approve/reject, brand cannot upload/change revision counts)
create or replace function prevent_deliverable_tampering()
returns trigger as $$
declare
  deal_creator_id uuid;
  deal_brand_id uuid;
begin
  select creator_id, brand_id into deal_creator_id, deal_brand_id
  from dealhive_deal
  where id = new.deal_id;

  if (current_user = 'authenticated') then
    -- Creator cannot approve or reject/request revisions
    if (auth.uid() = deal_creator_id) then
      if (new.status in ('approved', 'revision_requested') and (old.status is distinct from new.status)) then
        raise exception 'Security Exception: Creators cannot approve or request revisions on their own deliverables.';
      end if;
    end if;

    -- Brand cannot upload/submit drafts or change revision counts
    if (auth.uid() = deal_brand_id) then
      if (new.file_url is distinct from old.file_url or new.revision_count <> old.revision_count) then
        raise exception 'Security Exception: Brands cannot upload drafts or modify revision counts on deliverables.';
      end if;
      if (new.status = 'submitted' and (old.status is distinct from new.status)) then
        raise exception 'Security Exception: Brands cannot submit drafts for deliverables.';
      end if;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger check_deliverable_tampering
  before update on dealhive_deliverable
  for each row
  execute function prevent_deliverable_tampering();

-- Prevent contract signature or metadata tampering
create or replace function prevent_contract_tampering()
returns trigger as $$
declare
  deal_creator_id uuid;
  deal_brand_id uuid;
begin
  select creator_id, brand_id into deal_creator_id, deal_brand_id
  from dealhive_deal
  where id = new.deal_id;

  if (current_user = 'authenticated') then
    if (new.deal_id <> old.deal_id or new.pdf_url <> old.pdf_url or new.hellosign_request_id <> old.hellosign_request_id) then
      raise exception 'Security Exception: Modifying contract metadata is prohibited.';
    end if;

    -- Creator signing check
    if (auth.uid() = deal_creator_id) then
      if (new.brand_signature_status is distinct from old.brand_signature_status) then
        raise exception 'Security Exception: Creators cannot sign contracts on behalf of brands.';
      end if;
    end if;

    -- Brand signing check
    if (auth.uid() = deal_brand_id) then
      if (new.creator_signature_status is distinct from old.creator_signature_status) then
        raise exception 'Security Exception: Brands cannot sign contracts on behalf of creators.';
      end if;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger check_contract_tampering
  before update on dealhive_contract
  for each row
  execute function prevent_contract_tampering();

-- Prevent invoice status or metadata tampering
create or replace function prevent_invoice_tampering()
returns trigger as $$
declare
  deal_creator_id uuid;
  deal_brand_id uuid;
begin
  select creator_id, brand_id into deal_creator_id, deal_brand_id
  from dealhive_deal
  where id = new.deal_id;

  if (current_user = 'authenticated') then
    -- Do not allow altering invoice amounts, currency, platform fee, net fee, or deal association
    if (new.amount <> old.amount or
        new.platform_fee <> old.platform_fee or
        new.creator_net <> old.creator_net or
        new.deal_id <> old.deal_id or
        new.stripe_payment_intent_id is distinct from old.stripe_payment_intent_id) then
      raise exception 'Security Exception: Modifying invoice pricing or metadata is prohibited.';
    end if;

    -- Do not allow marking invoice as paid directly from the client.
    -- (This must be done via secure RPC payment simulation or payment gateway webhook).
    if (new.status = 'paid' and old.status <> 'paid') then
      raise exception 'Security Exception: Invoices can only be marked as PAID by the payment gateway webhook.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger check_invoice_tampering
  before update on dealhive_invoice
  for each row
  execute function prevent_invoice_tampering();

-- Prevent incoming offer tampering and enforce pending status on insert
create or replace function set_default_offer_status()
returns trigger as $$
begin
  if (current_user = 'authenticated') then
    new.status := 'pending';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger enforce_default_offer_status
  before insert on dealhive_incoming_offer
  for each row
  execute function set_default_offer_status();

create or replace function prevent_offer_tampering()
returns trigger as $$
begin
  if (current_user = 'authenticated') then
    -- Creator cannot accept their own offers
    if (auth.uid() = old.creator_id) then
      if (new.status = 'accepted' and old.status <> 'accepted') then
        raise exception 'Security Exception: Creators cannot accept their own offers.';
      end if;
    end if;

    -- Brand cannot modify details
    if (auth.uid() = old.brand_id) then
      if (new.title <> old.title or
          new.message <> old.message or
          new.requested_rate <> old.requested_rate or
          new.creative_freedom <> old.creative_freedom or
          new.creator_id <> old.creator_id or
          new.brand_id <> old.brand_id) then
        raise exception 'Security Exception: Brands cannot modify offer details.';
      end if;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger check_offer_tampering
  before update on dealhive_incoming_offer
  for each row
  execute function prevent_offer_tampering();

-- Prevent message metadata tampering
create or replace function prevent_message_tampering()
returns trigger as $$
begin
  if (current_user = 'authenticated') then
    if (new.sender_id <> old.sender_id or new.deal_id <> old.deal_id) then
      raise exception 'Security Exception: Modifying message metadata is prohibited.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger check_message_tampering
  before update on dealhive_deal_message
  for each row
  execute function prevent_message_tampering();

-- Secure RPC Payment simulation function (bypasses RLS triggers securely via security definer)
create or replace function simulate_invoice_payment(target_invoice_id uuid)
returns void as $$
begin
  -- Update invoice status to paid (executed as superuser/owner, bypassing the authenticated check)
  update dealhive_invoice
  set status = 'paid'
  where id = target_invoice_id;

  -- Update associated deal stage to completed
  update dealhive_deal
  set stage = 'completed'
  where id = (select deal_id from dealhive_invoice where id = target_invoice_id);
end;
$$ language plpgsql security definer;

