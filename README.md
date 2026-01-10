# NEXUS Media Bot - Ultimate Telegram Platform

To'liq funktsional Telegram boti va WebApp - kitoblar, filmlar, podcastlar, AI quiz va to'lov tizimi.

## Xususiyatlari

- 📚 **Kutubxona**: 50,000+ kitob va 15,000+ film
- 🎧 **Podcastlar**: Turli mavzularda podcastlar
- 🤖 **AI Quiz**: Sun'iy intellekt asosida test yaratish
- 💳 **To'lov tizimi**: Telegram Stars, Click, Payme
- 👑 **Premium tariflar**: 4 xil obuna varianti
- 🏆 **Gamifikatsiya**: XP, ballar, reytinglar, ligalar
- 📊 **Admin panel**: To'liq boshqaruv imkoniyati
- 🌐 **WebApp**: Zamonaviy veb-interfeys

## Loyiha tuzilishi

- `nexus_media_bot.py`: Asosiy Telegram bot (580+ handlerlar)
- `nexus-ultimate-v2.html`: WebApp frontend
- `nexus-ultimate-v2.js`: WebApp logikasi
- `megabook_utils.py`: Media qidiruv va yuklash
- `check_health.py`: Sog'liqni tekshirish skripti
- `requirements.txt`: Python dependentsiyalari

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
- A Telegram Bot Token (from @BotFather)
- A Supabase Project (URL & Key)
- An OpenAI API Key (optional, for AI features)

### 2. Backend Setup

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Environment Configuration:**
    - Rename `.env.new.example` to `.env` (or create a new `.env` file).
    - Fill in your credentials:
      ```env
      BOT_TOKEN=your_telegram_bot_token
      SUPABASE_URL=your_supabase_url
      SUPABASE_KEY=your_supabase_service_role_key
      OPENAI_API_KEY=your_openai_api_key
      ADMIN_IDS=123456789,987654321
      SUPPORT_USERNAME=your_support_username
      ```

3.  **Run the Bot:**
    ```bash
    python secure_bot.py
    ```
    The bot will start polling and serve as the secure backend proxy for the WebApp.

### 3. Frontend Setup

1.  **Host the Frontend:**
    - You can host `nexus-ultimate.html`, `nexus-ultimate.js`, and `nexus-ultimate.css` on any static hosting service (GitHub Pages, Netlify, Vercel).
    - Or use a local tunnel (like ngrok) for development.

2.  **Connect WebApp to Bot:**
    - In @BotFather, edit your bot and set the **Menu Button** URL to your hosted `nexus-ultimate.html` link.

### 4. Features

- **Hybrid Mode:** Works online (Supabase sync) and offline (Local Storage).
- **Secure Proxy:** Sensitive API calls (like OpenAI) are routed through `secure_bot.py` to protect keys.
- **Visuals:** 3D Tilt, Particle System, Glitch Effects, and Animated Numbers.
- **Gamification:** Mining, Upgrades, Daily Challenges, Achievements, and Leaderboards.
- **Admin Panel:** User management and broadcasting tools within the WebApp.

## Troubleshooting

- **Supabase Connection Failed:** Ensure `SUPABASE_URL` and `SUPABASE_KEY` are correct in `.env`. The frontend will fallback to Offline Mode if connection fails.
- **Telegram WebApp Not Loading:** Verify the URL in @BotFather is accessible (HTTPS required).
- **Bot Not Responding:** Check the console output of `secure_bot.py` for errors.

## Security Note

- **NEVER** expose your `SUPABASE_KEY` (Service Role) or `OPENAI_API_KEY` in the frontend (`nexus-ultimate.js`).
- The frontend uses `window.env` placeholders which are intended to be replaced during a build process or handled via the secure backend proxy for sensitive operations.

## Operations Cheatsheet

### Run both bots with a single command

```
python run_all.py            # launches secure_bot.py + nexus_media_bot.py
python run_all.py --target secure   # only secure backend
python run_all.py --target main     # only main Telegram bot
```

The launcher keeps both subprocesses alive and auto-terminates them on Ctrl+C.

### Analyze handler coverage

```
python handler_checker.py                     # analyzes nexus_media_bot.py
python handler_checker.py path/to/file.py     # custom target
python system_validator.py                    # summary: handlers + WebApp hooks
```

The report prints:
1. Decorated handler functions (message/callback/etc.).
2. Dispatcher `.add_handler` calls or direct handler instances.
3. State machine classes (inherit `StatesGroup`).
4. Presence of `if __name__ == "__main__"` guard.

Use this tool after large refactors to ensure all ~580+ handlers remain registered.

---
Developed by Cascade for Nexus Media.
