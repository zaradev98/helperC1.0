-- Migration: Device Tracking va Last Login
-- Created: 2025-12-13
-- Description: Users jadvaliga device_id, device_info va last_login ustunlarini qo'shish

-- ESLATMA: Mavjud userlar uchun bu ustunlar NULL bo'ladi.
-- Ular keyingi login paytida avtomatik to'ldiriladi.

-- 1. device_id ustunini qo'shish (qurilma unikal identifikatori)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS device_id TEXT DEFAULT NULL;

-- 2. device_info ustunini qo'shish (qurilma haqida ma'lumot: model, OS, version)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS device_info JSONB DEFAULT NULL;

-- 3. last_login ustunini qo'shish (oxirgi kirish vaqti)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ DEFAULT NULL;

-- 4. device_id uchun index yaratish (tez qidirish uchun)
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);

-- 5. last_login uchun index yaratish (vaqt bo'yicha qidirish uchun)
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- 6. Eslatma: Mavjud userlar uchun last_login ni hozirgi vaqtga o'rnatish (optional)
-- UPDATE users SET last_login = NOW() WHERE last_login IS NULL;

-- 7. Comment qo'shish
COMMENT ON COLUMN users.device_id IS 'Foydalanuvchining qurilma unikal ID si (Android ID yoki iOS Vendor ID)';
COMMENT ON COLUMN users.device_info IS 'Qurilma haqida ma''lumot: {name, model, os, osVersion}';
COMMENT ON COLUMN users.last_login IS 'Foydalanuvchining oxirgi kirish vaqti (3 oy tekshirish uchun)';
