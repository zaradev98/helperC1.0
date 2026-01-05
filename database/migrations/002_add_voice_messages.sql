-- Migration: Voice Messages Support
-- Created: 2024-12-24
-- Description: Chat jadvaliga voice message uchun ustunlar qo'shish va send_chat_message funksiyasini yangilash

-- 1. chat_messages jadvaliga voice_url ustunini qo'shish
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS voice_url TEXT DEFAULT NULL;

-- 2. chat_messages jadvaliga voice_duration ustunini qo'shish (soniyalarda)
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS voice_duration INTEGER DEFAULT NULL;

-- 3. Comment qo'shish
COMMENT ON COLUMN chat_messages.voice_url IS 'Ovozli xabar fayli URL manzili (Supabase Storage)';
COMMENT ON COLUMN chat_messages.voice_duration IS 'Ovozli xabar davomiyligi (soniyalarda)';

-- 4. Eski send_chat_message funksiyalarini o'chirish (barcha versiyalar)
DROP FUNCTION IF EXISTS send_chat_message(UUID, VARCHAR(10), UUID, VARCHAR(10), TEXT);
DROP FUNCTION IF EXISTS send_chat_message(UUID, TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS send_chat_message(UUID, VARCHAR, UUID, VARCHAR, TEXT);
DROP FUNCTION IF EXISTS send_chat_message(UUID, TEXT, UUID, TEXT, TEXT, TEXT, INTEGER);

-- 5. Yangi send_chat_message funksiyasini yaratish (voice message parametrlari bilan)
CREATE FUNCTION send_chat_message(
  p_room_id UUID,
  p_sender_type TEXT,
  p_sender_id UUID,
  p_message_type TEXT DEFAULT 'text',
  p_message_text TEXT DEFAULT NULL,
  p_voice_url TEXT DEFAULT NULL,
  p_voice_duration INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  room_id UUID,
  sender_type TEXT,
  sender_id UUID,
  message_type TEXT,
  message_text TEXT,
  voice_url TEXT,
  voice_duration INTEGER,
  created_at TIMESTAMPTZ,
  is_read BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO chat_messages (
    room_id,
    sender_type,
    sender_id,
    message_type,
    message_text,
    voice_url,
    voice_duration,
    is_read
  ) VALUES (
    p_room_id,
    p_sender_type,
    p_sender_id,
    p_message_type,
    p_message_text,
    p_voice_url,
    p_voice_duration,
    false
  )
  RETURNING
    chat_messages.id,
    chat_messages.room_id,
    chat_messages.sender_type::TEXT,
    chat_messages.sender_id,
    chat_messages.message_type::TEXT,
    chat_messages.message_text,
    chat_messages.voice_url,
    chat_messages.voice_duration,
    chat_messages.created_at,
    chat_messages.is_read;
END;
$$;

-- 6. Eski get_chat_messages funksiyasini o'chirish
DROP FUNCTION IF EXISTS get_chat_messages(UUID);

-- 7. Yangi get_chat_messages funksiyasini yaratish (voice fields bilan)
CREATE FUNCTION get_chat_messages(p_room_id UUID)
RETURNS TABLE (
  id UUID,
  room_id UUID,
  sender_type TEXT,
  sender_id UUID,
  message_type TEXT,
  message_text TEXT,
  voice_url TEXT,
  voice_duration INTEGER,
  created_at TIMESTAMPTZ,
  is_read BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chat_messages.id,
    chat_messages.room_id,
    chat_messages.sender_type::TEXT,
    chat_messages.sender_id,
    chat_messages.message_type::TEXT,
    chat_messages.message_text,
    chat_messages.voice_url,
    chat_messages.voice_duration,
    chat_messages.created_at,
    chat_messages.is_read
  FROM chat_messages
  WHERE chat_messages.room_id = p_room_id
  ORDER BY chat_messages.created_at ASC;
END;
$$;
