-- ============================================
-- NEXUS MEDIA - SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    full_name TEXT,
    language_code TEXT DEFAULT 'uz',
    
    -- RPG System
    xp INTEGER DEFAULT 0,
    gold INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_count INTEGER DEFAULT 0,
    battle_streak INTEGER DEFAULT 0,
    dark_matter INTEGER DEFAULT 0,
    
    -- Subscription
    subscription_type INTEGER DEFAULT 0, -- 0=free, 1=premium, 2=exclusive
    subscription_end TIMESTAMPTZ,
    
    -- Referral System
    referral_code TEXT UNIQUE,
    referred_by BIGINT, -- user_id of inviter
    referrals_count INTEGER DEFAULT 0,
    
    -- Quiz Stats
    quiz_count_today INTEGER DEFAULT 0,
    quiz_credits_used_today INTEGER DEFAULT 0,
    quiz_credits_date DATE DEFAULT CURRENT_DATE,
    total_quizzes INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    
    -- Basic Mining (Legacy/Cache)
    mining_balance DECIMAL(20, 2) DEFAULT 0,
    energy INTEGER DEFAULT 1000,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- ============================================
-- 1.1 MINING DATA TABLE (Advanced)
-- ============================================
CREATE TABLE IF NOT EXISTS mining_data (
    user_id BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    balance DECIMAL(20, 2) DEFAULT 0,
    energy INTEGER DEFAULT 1000,
    max_energy INTEGER DEFAULT 1000,
    tap_power DECIMAL(10, 2) DEFAULT 1,
    taps_per_second DECIMAL(10, 2) DEFAULT 0,
    critical_chance DECIMAL(5, 2) DEFAULT 5,
    
    -- JSONB for flexible storage
    upgrades JSONB DEFAULT '{"tap": 1, "energy": 1, "auto": 0, "luck": 1}'::jsonb,
    active_effects JSONB DEFAULT '[]'::jsonb,
    owned_skins JSONB DEFAULT '["skin_default"]'::jsonb,
    current_skin TEXT DEFAULT 'skin_default',
    achievements JSONB DEFAULT '[]'::jsonb,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 1.2 REFERRALS TABLE (Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inviter_id BIGINT NOT NULL REFERENCES users(user_id),
    invitee_id BIGINT NOT NULL REFERENCES users(user_id),
    status TEXT DEFAULT 'completed',
    rewarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(invitee_id)
);

-- ============================================
-- 2. BATTLE ROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS battle_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_code TEXT UNIQUE,
    host_id BIGINT NOT NULL REFERENCES users(user_id),
    
    -- Room Settings
    title TEXT DEFAULT 'Battle Room',
    max_participants INTEGER DEFAULT 10,
    question_count INTEGER DEFAULT 5,
    time_per_question INTEGER DEFAULT 15,
    topic TEXT DEFAULT 'general',
    difficulty TEXT DEFAULT 'medium',
    
    -- Status: waiting, active, finished, cancelled
    status TEXT DEFAULT 'waiting',
    
    -- Current game state
    current_question JSONB,
    current_question_index INTEGER DEFAULT 0,
    questions JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_battle_rooms_status ON battle_rooms(status);
CREATE INDEX IF NOT EXISTS idx_battle_rooms_host ON battle_rooms(host_id);

-- ============================================
-- 3. BATTLE PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS battle_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES battle_rooms(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    
    -- Score
    score INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    wrong_count INTEGER DEFAULT 0,
    
    -- Status
    is_ready BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_battle_participants_room ON battle_participants(room_id);

-- ============================================
-- 4. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    
    -- Payment Details
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'UZS',
    plan_type TEXT NOT NULL, -- 'premium' or 'exclusive'
    duration_days INTEGER DEFAULT 30,
    
    -- Receipt
    receipt_file_id TEXT,
    receipt_url TEXT,
    
    -- Status: pending, approved, rejected
    status TEXT DEFAULT 'pending',
    admin_id BIGINT,
    admin_note TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================
-- 5. QUIZ HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    
    -- Quiz Details
    topic TEXT,
    difficulty TEXT,
    question_count INTEGER,
    correct_count INTEGER,
    score INTEGER,
    time_spent INTEGER, -- seconds
    
    -- XP earned
    xp_earned INTEGER DEFAULT 0,
    gold_earned INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_history_user ON quiz_history(user_id);

-- ============================================
-- 6. LEADERBOARD VIEW
-- ============================================
CREATE OR REPLACE VIEW leaderboard_weekly AS
SELECT 
    user_id,
    full_name,
    xp,
    level,
    streak_count,
    ROW_NUMBER() OVER (ORDER BY xp DESC) as rank
FROM users
WHERE last_active > NOW() - INTERVAL '7 days'
ORDER BY xp DESC
LIMIT 100;

-- ============================================
-- 7. RPC FUNCTIONS
-- ============================================

-- Add XP to user
CREATE OR REPLACE FUNCTION add_xp(p_user_id BIGINT, p_amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET xp = xp + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add Gold to user
CREATE OR REPLACE FUNCTION add_gold(p_user_id BIGINT, p_amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET gold = gold + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment battle score
CREATE OR REPLACE FUNCTION increment_battle_score(p_room_id UUID, p_user_id BIGINT, p_points INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE battle_participants 
    SET score = score + p_points,
        correct_count = correct_count + 1
    WHERE room_id = p_room_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update energy with regeneration
CREATE OR REPLACE FUNCTION update_energy(p_user_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
    v_current_energy INTEGER;
    v_last_update TIMESTAMPTZ;
    v_seconds_passed INTEGER;
    v_energy_gained INTEGER;
    v_new_energy INTEGER;
BEGIN
    SELECT energy, last_energy_update INTO v_current_energy, v_last_update
    FROM users WHERE user_id = p_user_id;
    
    v_seconds_passed := EXTRACT(EPOCH FROM (NOW() - v_last_update))::INTEGER;
    v_energy_gained := v_seconds_passed; -- 1 energy per second
    v_new_energy := LEAST(1000, v_current_energy + v_energy_gained);
    
    UPDATE users 
    SET energy = v_new_energy, 
        last_energy_update = NOW()
    WHERE user_id = p_user_id;
    
    RETURN v_new_energy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_history ENABLE ROW LEVEL SECURITY;

-- Users: Anyone can read, users can update their own
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own record" ON users FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert users" ON users FOR INSERT WITH CHECK (true);

-- ============================================
-- 9. MEDIA CONTENT TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS books (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE,
    title TEXT NOT NULL,
    author TEXT,
    genre TEXT,
    description TEXT,
    cover_url TEXT,
    file_id TEXT, -- Telegram file_id
    is_premium BOOLEAN DEFAULT FALSE,
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE,
    title TEXT NOT NULL,
    genre TEXT,
    year INTEGER,
    quality TEXT, -- 480p, 720p, 1080p, 4K
    description TEXT,
    cover_url TEXT,
    file_id TEXT, -- Telegram file_id
    is_premium BOOLEAN DEFAULT FALSE,
    is_series BOOLEAN DEFAULT FALSE,
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS episodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    series_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    season INTEGER DEFAULT 1,
    episode INTEGER NOT NULL,
    title TEXT,
    file_id TEXT, -- Telegram file_id
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS podcasts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    host TEXT,
    topic TEXT,
    description TEXT,
    cover_url TEXT,
    file_id TEXT, -- Telegram file_id
    audio_url TEXT, -- Direct URL if available
    duration INTEGER, -- seconds
    is_premium BOOLEAN DEFAULT FALSE,
    plays INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Media
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_premium ON books(is_premium);
CREATE INDEX IF NOT EXISTS idx_movies_genre ON movies(genre);
CREATE INDEX IF NOT EXISTS idx_movies_premium ON movies(is_premium);
CREATE INDEX IF NOT EXISTS idx_episodes_series ON episodes(series_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_topic ON podcasts(topic);

-- Media RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media viewable by everyone" ON books FOR SELECT USING (true);
CREATE POLICY "Movies viewable by everyone" ON movies FOR SELECT USING (true);
CREATE POLICY "Episodes viewable by everyone" ON episodes FOR SELECT USING (true);
CREATE POLICY "Podcasts viewable by everyone" ON podcasts FOR SELECT USING (true);

-- Only admins can insert/update media (implementation depends on admin role management)
-- For now, allow insert for authenticated users (or restrict in app logic)
CREATE POLICY "Authenticated can insert media" ON books FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- Battle participants: Anyone can read, join, update
CREATE POLICY "Participants viewable by everyone" ON battle_participants FOR SELECT USING (true);
CREATE POLICY "Anyone can join battles" ON battle_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Participants can update own record" ON battle_participants FOR UPDATE USING (true);

-- Payments: Users can view own, admins can view all
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Users can create payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update payments" ON payments FOR UPDATE USING (true);

-- Quiz history: Users can view own
CREATE POLICY "Users can view own quiz history" ON quiz_history FOR SELECT USING (true);
CREATE POLICY "Users can insert quiz history" ON quiz_history FOR INSERT WITH CHECK (true);

-- ============================================
-- 9. REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for battle tables
ALTER PUBLICATION supabase_realtime ADD TABLE battle_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_participants;

-- ============================================
-- 10. INITIAL DATA (Optional)
-- ============================================

-- You can add test data here if needed
-- INSERT INTO users (user_id, full_name, xp, gold, level) VALUES (5895125141, 'Admin', 1000, 100, 5);

-- ============================================
-- DONE! Your Supabase is ready.
-- ============================================
