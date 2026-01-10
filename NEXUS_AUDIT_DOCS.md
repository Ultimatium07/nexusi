# NEXUS MEDIA BOT + WEBAPP - TO'LIQ AUDIT HUJJATI
# Yaratilgan: 2026-01-09
# ================================================================

## 1. UMUMIY MA'LUMOT

### Bot
- **Fayl:** `nexus_media_bot.py`
- **Token:** `7483264783:AAGuaeeWXCYNx-NZe_0sFwcbHpBiJImapJM`
- **Admin IDs:** `[5895125141]`
- **Database:** `mega_bot.db` (SQLite)

### WebApp
- **URL:** `https://ultimatium07.github.io/nexus/nexus-ultimate-v2.html`
- **Fayllar:** `nexus-ultimate-v2.html`, `nexus-ultimate-v2.js`, `nexus-ultimate-v2.css`

### Supabase
- **URL:** `https://slmynfgspupncsijhzpd.supabase.co`
- **Anon Key:** (maxfiy)

---

## 2. PREMIUM NARXLAR

| Tarif | Muddat | Narx (UZS) |
|-------|--------|------------|
| Premium | 1 hafta | 12,990 |
| Premium | 1 oy | 34,990 |
| Exclusive | 1 hafta | 14,990 |
| Exclusive | 1 oy | 34,990 |

**To'lov kartasi:** `9860 1766 2113 5019`
**Karta egasi:** `Asadbek O'sarov`

---

## 3. BAJARILGAN O'ZGARISHLAR

### 3.1 Xatolar tuzatildi

#### TypeError in handle_achievements_menu
- **Muammo:** `string indices must be integers, not 'str'`
- **Sabab:** `db.get_user_achievements()` list yoki dict qaytarishi mumkin
- **Yechim:** Har ikkala formatni ham qo'llab-quvvatlash

#### TelegramBadRequest in handle_accept_trial/handle_decline_trial
- **Muammo:** `there is no text in the message to edit`
- **Sabab:** Video xabardagi matnni tahrirlashga urinish
- **Yechim:** `edit_text` o'rniga `delete()` + `answer()` ishlatish

### 3.2 Yangi funksiyalar

#### WebApp tugmasi
- Asosiy menyuga "🚀 SuperApp" tugmasi qo'shildi
- `Keyboards.main_menu()` da WebAppInfo bilan

#### Til o'zgartirish
- "🌐 Til / Lang" tugmasi qo'shildi
- `/lang` komandasi
- `set_lang_uz`, `set_lang_ru`, `set_lang_en` callback'lari
- `handle_change_language()` va `handle_set_language()` handler'lari

#### Guruh funksiyalari
- `/quiz` - Quiz menyusi
- `/book [nom]` - Kitob qidirish
- `/share` - Referral link
- `/battle` - Live Battle Quiz

#### Premium sotib olish oqimi
- WebApp'dan to'lov ma'lumotlari ko'rsatish
- Chek yuborish funksiyasi
- Admin tasdiqlash tizimi

---

## 4. WEBAPP KONFIGURATSIYA

```javascript
const CONFIG = {
    SUPABASE_URL: 'https://slmynfgspupncsijhzpd.supabase.co',
    SUPABASE_ANON_KEY: '...', // maxfiy
    BOT_USERNAME: 'PolWay_bot',
    PREMIUM_PRICES: {
        premium_week: 12990,
        premium_month: 34990,
        exclusive_week: 14990,
        exclusive_month: 34990
    },
    PAYMENT_CARD: '9860 1766 2113 5019',
    PAYMENT_HOLDER: "Asadbek O'sarov"
};
```

---

## 5. BOT KONFIGURATSIYA

```python
class Config:
    WEBAPP_URL = "https://ultimatium07.github.io/nexus/nexus-ultimate-v2.html"
    PRICE_PREMIUM = 24990      # Eski narx
    PRICE_EXCLUSIVE = 34990
    PAYMENT_CARD = "9860 1766 2113 5019"
    PAYMENT_CARD_NAME = "Asadbek"
```

---

## 6. ASOSIY HANDLER'LAR RO'YXATI

### Komandalar
- `/start` - Boshlanish
- `/language`, `/lang` - Til o'zgartirish
- `/premium` - Premium menyu
- `/promo` - Promo kod
- `/quiz` - Quiz (guruh va shaxsiy)
- `/book` - Kitob qidirish
- `/share` - Ulashish
- `/battle` - Live Battle

### Callback'lar
- `main_menu` - Asosiy menyu
- `library_menu` - Kutubxona
- `cinema_menu` - Kinoteatr
- `premium_menu` - Premium
- `change_language` - Til tanlash
- `set_lang_uz/ru/en` - Til o'rnatish
- `accept_trial` - Trial qabul
- `decline_trial` - Trial rad
- `gamification_hub` - Gamification
- `referral_dashboard` - Referral
- `daily_challenge` - Kunlik vazifa

### Xabar handler'lari
- "🚀 SuperApp" - WebApp
- "📚 Kutubxona" - Kitoblar
- "🎬 Kinoteatr" - Filmlar
- "🎓 Kurslar" - Kurslar
- "🎧 Podcastlar" - Podcastlar
- "🧠 AI Quiz" - Quiz
- "🤖 AI Mentor" - AI
- "🎮 Gamification" - O'yinlar
- "👤 Profil" - Profil
- "💎 Premium" - Premium
- "🌐 Til / Lang" - Til

---

## 7. SUPABASE JADVALLAR

### users
- user_id (INTEGER, PRIMARY KEY)
- full_name (TEXT)
- username (TEXT)
- xp (INTEGER)
- gold (INTEGER)
- level (INTEGER)
- language (TEXT, default 'uz')
- is_premium (BOOLEAN)
- premium_type (TEXT)
- subscription_type (INTEGER)
- subscription_expires (TIMESTAMP)
- referral_code (TEXT)
- referrals_count (INTEGER)
- dark_matter (INTEGER)

### payments
- id (INTEGER, PRIMARY KEY)
- user_id (INTEGER)
- amount (INTEGER)
- plan_type (TEXT)
- status (TEXT)
- receipt_file_id (TEXT)
- created_at (TIMESTAMP)

---

## 8. TEKSHIRISH RO'YXATI

### WebApp
- [ ] 7 sekundlik timeout olib tashlash
- [ ] Supabase ulanishi to'g'ri
- [ ] Premium to'lov oqimi ishlaydi
- [ ] Telegram WebApp API to'g'ri ishlatilgan

### Bot
- [ ] Barcha callback handler'lar mavjud
- [ ] Barcha state'lar aniq
- [ ] WebApp URL to'g'ri
- [ ] Premium narxlar to'g'ri
- [ ] Til o'zgartirish ishlaydi
- [ ] Guruh funksiyalari ishlaydi

---

## 9. XATOLAR VA YECHIMLAR LOG

| Sana | Xato | Yechim | Status |
|------|------|--------|--------|
| 2026-01-09 | TypeError in achievements | List/dict handling | ✅ |
| 2026-01-09 | TelegramBadRequest trial | delete() + answer() | ✅ |
| 2026-01-09 | WebApp 7s timeout | Optimization needed | ⏳ |

---

## 10. KEYINGI QADAMLAR

1. WebApp yuklanish tezligini optimallashtirish
2. Supabase sync to'liq sozlash
3. Barcha til tarjimalarini to'ldirish
4. End-to-end testing
5. Production deployment
