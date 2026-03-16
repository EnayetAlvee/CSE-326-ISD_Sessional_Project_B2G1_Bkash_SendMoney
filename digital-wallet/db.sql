-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
create table public."Profiles" (
  id uuid not null default gen_random_uuid (),
  email text not null default ''::text,
  full_name text null,
  phone text null,
  created_at timestamp with time zone null default now(),
  two_fa_enabled boolean null default false,
  date_of_birth date null,
  nid_number text null,
  picture_url text null,
  is_verified boolean not null default false,
  constraint Profiles_pkey primary key (id),
  constraint Profiles_email_key unique (email),
  constraint Profiles_id_fkey foreign KEY (id) references auth.users (id)
) TABLESPACE pg_default;

create table public.wallets (
  created_at timestamp with time zone not null default now(),
  user_id uuid not null,
  balance numeric null default '0'::numeric,
  constraint wallets_pkey primary key (user_id),
  constraint wallets_user_id_fkey foreign KEY (user_id) references "Profiles" (id),
  constraint balance_non_negative check ((balance >= (0)::numeric))
) TABLESPACE pg_default;

create table public.transactions (
  transaction_id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  from_user_id uuid null,
  to_user_id uuid not null,
  amount numeric not null,
  charge numeric not null default '0'::numeric,
  type text null,
  constraint transactions_pkey primary key (transaction_id),
  constraint transactions_from_user_id_fkey foreign KEY (from_user_id) references "Profiles" (id),
  constraint transactions_to_user_id_fkey foreign KEY (to_user_id) references "Profiles" (id),
  constraint transactions_type_check check (
    (
      type = any (array['send money'::text, 'add money'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_transactions_from_user on public.transactions using btree (from_user_id) TABLESPACE pg_default;

create index IF not exists idx_transactions_to_user on public.transactions using btree (to_user_id) TABLESPACE pg_default;

create index IF not exists idx_transactions_created on public.transactions using btree (created_at desc) TABLESPACE pg_default;

create table public.priyo_numbers (
  user_id uuid not null,
  created_at timestamp with time zone not null default now(),
  priyo_user_id uuid not null,
  label text null,
  constraint priyo_numbers_pkey primary key (user_id, priyo_user_id),
  constraint priyo_numbers_priyo_user_id_fkey foreign KEY (priyo_user_id) references "Profiles" (id),
  constraint priyo_numbers_user_id_fkey foreign KEY (user_id) references "Profiles" (id)
) TABLESPACE pg_default;

create table public.otps (
  id uuid not null default gen_random_uuid (),
  email text not null,
  otp text not null,
  purpose text not null,
  expires_at timestamp with time zone not null,
  used boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint otps_pkey primary key (id),
  constraint otps_purpose_check check (
    (
      purpose = any (
        array[
          'verification'::text,
          'reset'::text,
          '2fa'::text,
          'login'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_otps_email_purpose on public.otps using btree (email, purpose) TABLESPACE pg_default;

create index IF not exists idx_otps_email_purpose on public.otps using btree (email, purpose) TABLESPACE pg_default;




create policies

//extra

ALTER TABLE public."Profiles"
ADD COLUMN IF NOT EXISTS date_of_birth DATE NULL,
ADD COLUMN IF NOT EXISTS nid_number TEXT NULL,
ADD COLUMN IF NOT EXISTS picture_url TEXT NULL,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;


ALTER TABLE public.otps
DROP CONSTRAINT otps_purpose_check;

ALTER TABLE public.otps
ADD CONSTRAINT otps_purpose_check CHECK (
  purpose = ANY (ARRAY['verification'::text, 'reset'::text, '2fa'::text, 'login'::text])
);


ALTER TABLE public.priyo_numbers
ADD COLUMN IF NOT EXISTS label TEXT NULL;



-- Enable RLS on all tables
ALTER TABLE public."Profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priyo_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own row
CREATE POLICY "Users can view own profile"
  ON public."Profiles" FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public."Profiles" FOR UPDATE
  USING (auth.uid() = id);

-- Wallets: users can only see their own wallet
CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

-- Transactions: users can see transactions they sent or received
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Priyo numbers: users manage their own
CREATE POLICY "Users can manage own priyo numbers"
  ON public.priyo_numbers FOR ALL
  USING (auth.uid() = user_id);



--disable RLS to drop policies
ALTER TABLE public."Profiles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.priyo_numbers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps DISABLE ROW LEVEL SECURITY;




-- ============================================
-- DROP ALL EXISTING POLICIES
-- ============================================
DROP POLICY IF EXISTS "service_role_profiles" ON public."Profiles";
DROP POLICY IF EXISTS "service_role_wallets" ON public.wallets;
DROP POLICY IF EXISTS "service_role_transactions" ON public.transactions;
DROP POLICY IF EXISTS "service_role_priyo" ON public.priyo_numbers;
DROP POLICY IF EXISTS "service_role_otps" ON public.otps;
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own profile" ON public."Profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON public."Profiles";
DROP POLICY IF EXISTS "Users can manage own priyo numbers" ON public.priyo_numbers;
-- ============================================
-- REMOVE SERVICE ROLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "profiles_service_role" ON public."Profiles";
DROP POLICY IF EXISTS "wallets_service_role" ON public.wallets;
DROP POLICY IF EXISTS "transactions_service_role" ON public.transactions;
DROP POLICY IF EXISTS "priyo_service_role" ON public.priyo_numbers;
DROP POLICY IF EXISTS "otps_service_role" ON public.otps;

-- ============================================
-- REMOVE USER-LEVEL (AUTHENTICATED) POLICIES
-- ============================================
DROP POLICY IF EXISTS "profiles_own_row" ON public."Profiles";
DROP POLICY IF EXISTS "wallets_own_row" ON public.wallets;
DROP POLICY IF EXISTS "transactions_own_rows" ON public.transactions;
DROP POLICY IF EXISTS "priyo_own_rows" ON public.priyo_numbers;
DROP POLICY IF EXISTS "otps_own_rows" ON public.otps;

-- ============================================
-- PROFILES
-- User can do anything on their own row only
-- ============================================
CREATE POLICY "profiles_service_role"
ON public."Profiles"
AS PERMISSIVE FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "profiles_own_row"
ON public."Profiles"
AS PERMISSIVE FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- WALLETS
-- User can read + update only their own wallet
-- ============================================
CREATE POLICY "wallets_service_role"
ON public.wallets
AS PERMISSIVE FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "wallets_own_row"
ON public.wallets
AS PERMISSIVE FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRANSACTIONS
-- User can view transactions where they are sender OR receiver
-- User cannot insert directly — only service_role (backend) inserts
-- ============================================
CREATE POLICY "transactions_service_role"
ON public.transactions
AS PERMISSIVE FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "transactions_own_rows"
ON public.transactions
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  auth.uid() = from_user_id OR
  auth.uid() = to_user_id
);

-- ============================================
-- PRIYO NUMBERS
-- User can do anything on rows where user_id = their id
-- Cannot touch other users priyo lists
-- ============================================
CREATE POLICY "priyo_service_role"
ON public.priyo_numbers
AS PERMISSIVE FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "priyo_own_rows"
ON public.priyo_numbers
AS PERMISSIVE FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- OTPS
-- User can only see their own OTPs by email
-- Only service_role can insert/update OTPs
-- ============================================
CREATE POLICY "otps_service_role"
ON public.otps
AS PERMISSIVE FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "otps_own_rows"
ON public.otps
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  email = (
    SELECT email FROM public."Profiles"
    WHERE id = auth.uid()
  )
);

