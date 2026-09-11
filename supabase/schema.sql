create extension if not exists pgcrypto;

create table if not exists public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  attempts smallint not null default 0 check (attempts >= 0 and attempts <= 10),
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists email_verifications_email_idx on public.email_verifications (lower(email));
create index if not exists email_verifications_expires_idx on public.email_verifications (expires_at);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  public_code text unique not null,
  manage_token_hash text unique not null,
  creator_name text not null check (char_length(creator_name) between 1 and 80),
  crush_name text not null check (char_length(crush_name) between 1 and 80),
  creator_email text not null,
  language text not null default 'zh' check (language in ('zh', 'en')),
  personal_note text check (char_length(personal_note) <= 500),
  status text not null default 'pending' check (status in ('pending', 'answered', 'expired')),
  email_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  answered_at timestamptz
);
create index if not exists invitations_public_code_idx on public.invitations (public_code);
create index if not exists invitations_email_idx on public.invitations (lower(creator_email));
create index if not exists invitations_status_idx on public.invitations (status);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid unique not null references public.invitations(id) on delete cascade,
  answers jsonb not null,
  submitted_at timestamptz not null default now(),
  report_email_sent_at timestamptz,
  report_email_error text
);
create index if not exists responses_invitation_idx on public.responses (invitation_id);

alter table public.email_verifications enable row level security;
alter table public.invitations enable row level security;
alter table public.responses enable row level security;

revoke all on public.email_verifications from anon, authenticated;
revoke all on public.invitations from anon, authenticated;
revoke all on public.responses from anon, authenticated;
