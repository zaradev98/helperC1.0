-- Admin Chat jadvali
-- Bu jadval foydalanuvchilar va admin o'rtasidagi chatlarni saqlaydi

CREATE TABLE IF NOT EXISTS admin_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'voice', 'image')),
  message_text TEXT,
  voice_url TEXT,
  voice_duration INTEGER,
  image_url TEXT,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexlar tezlik uchun
CREATE INDEX IF NOT EXISTS idx_admin_chats_user_id ON admin_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_chats_created_at ON admin_chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_chats_sender_type ON admin_chats(sender_type);
CREATE INDEX IF NOT EXISTS idx_admin_chats_is_read ON admin_chats(is_read) WHERE is_read = FALSE;

-- Row Level Security (RLS) yoqish
ALTER TABLE admin_chats ENABLE ROW LEVEL SECURITY;

-- Foydalanuvchilar faqat o'z xabarlarini ko'rishi mumkin
CREATE POLICY "Users can view their own admin chats"
  ON admin_chats
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    sender_type = 'admin'
  );

-- Foydalanuvchilar faqat o'z xabarlarini yaratishi mumkin
CREATE POLICY "Users can insert their own admin messages"
  ON admin_chats
  FOR INSERT
  WITH CHECK (
    sender_type = 'user' AND
    user_id = auth.uid()
  );

-- Foydalanuvchilar faqat o'z xabarlarini o'chirishi mumkin
CREATE POLICY "Users can delete their own admin messages"
  ON admin_chats
  FOR DELETE
  USING (
    sender_type = 'user' AND
    user_id = auth.uid()
  );

-- Adminlar barcha xabarlarni ko'rishi va yaratishi mumkin
-- Bu policy admin panel uchun kerak bo'ladi

-- Trigger: updated_at ni avtomatik yangilash
CREATE OR REPLACE FUNCTION update_admin_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_chats_updated_at
  BEFORE UPDATE ON admin_chats
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_chats_updated_at();

-- Helper function: Foydalanuvchining o'qilmagan admin xabarlar sonini olish
CREATE OR REPLACE FUNCTION get_unread_admin_messages_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM admin_chats
    WHERE user_id = p_user_id
      AND sender_type = 'admin'
      AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Admin xabarlarini o'qilgan qilish
CREATE OR REPLACE FUNCTION mark_admin_messages_as_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE admin_chats
  SET is_read = TRUE
  WHERE user_id = p_user_id
    AND sender_type = 'admin'
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE admin_chats IS 'Foydalanuvchilar va admin o''rtasidagi chatlar';
COMMENT ON COLUMN admin_chats.user_id IS 'Foydalanuvchi ID si';
COMMENT ON COLUMN admin_chats.message_type IS 'Xabar turi: text, voice, yoki image';
COMMENT ON COLUMN admin_chats.sender_type IS 'Yuboruvchi: user yoki admin';
COMMENT ON COLUMN admin_chats.is_read IS 'Xabar o''qilganmi';
