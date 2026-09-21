-- ================================================
-- MICHI APP — Supabase (PostgreSQL) Jadvallar
-- ================================================

-- Foydalanuvchilar jadvali (Supabase Auth bilan birgalikda)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  michi_id TEXT UNIQUE NOT NULL,     -- #Michi-XXXX
  full_name TEXT,
  birth_date DATE,
  phone TEXT,
  address TEXT,
  role TEXT CHECK (role IN ('driver', 'company', 'school', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kirish urinishlari jadvali (Server-side rate limiting)
CREATE TABLE IF NOT EXISTS auth_attempts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address INET,
  device_id TEXT,
  success BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index: Email bo'yicha tez qidirish
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email ON auth_attempts(email);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip ON auth_attempts(ip_address);
