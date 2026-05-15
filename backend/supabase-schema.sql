-- ============================================================
-- Supabase SQL Schema for anon-message
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension (usually enabled by default on Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================
-- USERS TABLE
-- ========================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  public_key TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- ========================
-- MESSAGES TABLE
-- ========================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ========================
-- AUTO-UPDATE updated_at
-- ========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================
-- RPC: upsert user by email (single query — avoids free-tier cold-start timeout)
-- ========================
CREATE OR REPLACE FUNCTION upsert_user_by_email(
  p_email VARCHAR,
  p_username VARCHAR,
  p_google_id VARCHAR,
  p_public_key TEXT,
  p_encrypted_private_key TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Try to find existing user
  SELECT id, username, email, public_key
  INTO v_user
  FROM users
  WHERE email = p_email;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'id', v_user.id,
      'username', v_user.username,
      'email', v_user.email,
      'public_key', v_user.public_key,
      'is_new', false
    );
  END IF;

  -- Insert new user
  INSERT INTO users (username, email, google_id, public_key, encrypted_private_key)
  VALUES (p_username, p_email, p_google_id, p_public_key, p_encrypted_private_key)
  RETURNING id, username, email, public_key
  INTO v_user;

  RETURN jsonb_build_object(
    'id', v_user.id,
    'username', v_user.username,
    'email', v_user.email,
    'public_key', v_user.public_key,
    'is_new', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================
-- ROW LEVEL SECURITY (RLS)
-- ========================
-- Disable RLS since we're using service role key from backend
-- If you want RLS later, enable it and add policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
