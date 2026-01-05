# Admin Chat Database Migration

## Admin Chat Funksiyasi

Bu migration admin va foydalanuvchilar o'rtasidagi chatni amalga oshirish uchun yaratilgan.

### Asosiy xususiyatlari:

- **Alohida jadval**: `admin_chats` - ustalar bilan chat (`chat_messages`) dan ajratilgan
- **Oddiy struktura**: UUID kerak emas, `room_id` yo'q
- **User-based**: Har bir foydalanuvchining admin bilan alohida chati bor
- **Real-time**: Supabase Realtime orqali jonli yangilanishlar

## Migration qilish

### 1. Supabase SQL Editor'ga kiring

1. Supabase Dashboard'ga o'ting: https://supabase.com/dashboard
2. Loyihangizni tanlang
3. SQL Editor'ga o'ting

### 2. Migration faylini ishga tushiring

`admin_chats_migration.sql` faylining barcha kodni nusxalang va SQL Editor'ga joylashtiring, keyin Run tugmasini bosing.

### 3. Tekshirish

Migration muvaffaqiyatli amalga oshirilganini tekshirish uchun:

```sql
-- Jadval yaratilganini tekshirish
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'admin_chats';

-- RLS (Row Level Security) yoqilganini tekshirish
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'admin_chats';

-- Funksiyalar yaratilganini tekshirish
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('mark_admin_messages_as_read', 'get_unread_admin_messages_count');
```

## Jadval strukturasi

```sql
admin_chats:
  - id (UUID, Primary Key)
  - user_id (UUID, Foreign Key -> users.id)
  - message_type (TEXT: 'text', 'voice', 'image')
  - message_text (TEXT, nullable)
  - voice_url (TEXT, nullable)
  - voice_duration (INTEGER, nullable)
  - image_url (TEXT, nullable)
  - sender_type (TEXT: 'user', 'admin')
  - is_read (BOOLEAN, default: false)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

## Helper Functions

### 1. `mark_admin_messages_as_read(p_user_id UUID)`

Admin tomonidan yuborilgan xabarlarni o'qilgan qilish.

```sql
SELECT mark_admin_messages_as_read('user-uuid-here');
```

### 2. `get_unread_admin_messages_count(p_user_id UUID)`

Foydalanuvchining o'qilmagan admin xabarlari sonini olish.

```sql
SELECT get_unread_admin_messages_count('user-uuid-here');
```

## Dasturda qanday ishlaydi

### Foydalanuvchi tomoni (Mobile App)

1. **Profile → Admin bilan bog'lanish**
2. Chat ochiladi (`admin_chats` jadvalidan)
3. Xabar yuborish:
   ```javascript
   INSERT INTO admin_chats (user_id, sender_type, message_type, message_text)
   VALUES (current_user_id, 'user', 'text', 'Salom admin!')
   ```

### Admin tomoni (Admin Panel - kelgusida)

Admin panel orqali barcha foydalanuvchilar bilan chatlarni ko'rish:

```sql
-- Barcha foydalanuvchilar ro'yxati (admin chat borlar)
SELECT DISTINCT
  user_id,
  (SELECT full_name FROM users WHERE id = admin_chats.user_id) as user_name,
  (SELECT phone FROM users WHERE id = admin_chats.user_id) as phone,
  COUNT(*) as total_messages,
  SUM(CASE WHEN sender_type = 'user' AND is_read = false THEN 1 ELSE 0 END) as unread_count,
  MAX(created_at) as last_message_at
FROM admin_chats
GROUP BY user_id
ORDER BY last_message_at DESC;

-- Ma'lum bir foydalanuvchi bilan chatni ko'rish
SELECT * FROM admin_chats
WHERE user_id = 'user-uuid-here'
ORDER BY created_at ASC;

-- Admin tomonidan javob yuborish
INSERT INTO admin_chats (user_id, sender_type, message_type, message_text)
VALUES ('user-uuid-here', 'admin', 'text', 'Assalomu alaykum! Qanday yordam bera olaman?');
```

## RLS (Row Level Security) Policies

Xavfsizlik uchun quyidagi policies qo'llanilgan:

1. **SELECT**: Foydalanuvchilar faqat o'z xabarlarini ko'rishi mumkin
2. **INSERT**: Foydalanuvchilar faqat o'z nomidan xabar yuborishi mumkin
3. **DELETE**: Foydalanuvchilar faqat o'z xabarlarini o'chirishi mumkin
4. **Admin**: Adminlar uchun alohida policy kerak (admin panel orqali)

## Test qilish

```sql
-- Test xabar qo'shish (foydalanuvchi tomonidan)
INSERT INTO admin_chats (user_id, sender_type, message_type, message_text)
VALUES ('your-user-uuid', 'user', 'text', 'Test xabar');

-- Test xabar qo'shish (admin tomonidan)
INSERT INTO admin_chats (user_id, sender_type, message_type, message_text)
VALUES ('your-user-uuid', 'admin', 'text', 'Admin javobi');

-- Xabarlarni ko'rish
SELECT * FROM admin_chats WHERE user_id = 'your-user-uuid';

-- O'qilgan qilish
SELECT mark_admin_messages_as_read('your-user-uuid');

-- O'qilmagan xabarlar soni
SELECT get_unread_admin_messages_count('your-user-uuid');
```

## Troubleshooting

### Migration xatosi: "relation already exists"

Agar jadval allaqachon mavjud bo'lsa, avval o'chirish kerak:

```sql
DROP TABLE IF EXISTS admin_chats CASCADE;
```

Keyin qaytadan migration'ni ishga tushiring.

### RLS xatosi: "new row violates row-level security policy"

Auth context to'g'ri sozlanganini tekshiring:

```sql
-- Current user ID ni ko'rish
SELECT auth.uid();
```

### Realtime ishlamayapti

Supabase Dashboard'da Realtime'ni yoqish:

1. Database → Replication
2. `admin_chats` jadvalini tanlang va "Enable Replication" bosing
