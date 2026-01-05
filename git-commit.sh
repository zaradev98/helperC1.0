#!/bin/bash

# Git lock muammosini hal qilish va commit qilish scripti

echo "🔍 Git processlarni to'xtatish..."
ps aux | grep -i git | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null
sleep 1

echo "🗑️  Lock faylni o'chirish..."
rm -f .git/index.lock
rm -f .git/index

echo "✅ Tozalandi!"
echo ""

echo "📦 Fayllarni git ga qo'shish..."
git add .gitignore App.js app.json package.json package-lock.json eas.json
git add README.md COLORS_UPDATED.md PRICE_NEGOTIATION.md .env.example
git add database/
git add src/

echo ""
echo "📊 Git status:"
git status --short

echo ""
echo "✨ Tayyor! Endi commit qilishingiz mumkin:"
echo "   git commit -m 'Update Helper 1.0 with Supabase integration'"
