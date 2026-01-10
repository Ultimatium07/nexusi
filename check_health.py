import asyncio
import os
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def check_health():
    print("🏥 NEXUS BOT HEALTH CHECK")
    print("=" * 30)

    # 1. Check Files
    print("\n📂 1. Checking Critical Files...")
    required_files = [
        "nexus_media_bot.py",
        "megabook_utils.py",
        "nexus-ultimate-v2.html",
        "nexus-ultimate-v2.js"
    ]
    
    missing_files = []
    for filename in required_files:
        if os.path.exists(filename):
            print(f"  ✅ Found: {filename}")
        else:
            print(f"  ❌ MISSING: {filename}")
            missing_files.append(filename)
            
    if missing_files:
        print(f"⚠️ Warning: {len(missing_files)} file(s) missing. Some features may not work.")

    # 2. Check Database
    print("\n🗄️ 2. Checking Database...")
    try:
        from nexus_media_bot import DatabaseManager, Config
        
        # Ensure data directories exist
        Config.setup_dirs()
        
        db_path = os.path.join(Config.DATA_DIR, "nexus.db")
        print(f"  📍 Database path: {db_path}")
        
        db = DatabaseManager(db_path)
        
        # Run initialization/migration
        print("  🔄 Running database migrations...")
        await db.init_db()
        print("  ✅ Database initialized successfully.")
        
        # Verify Payment Schema
        async with db.connect() as conn:
            print("  🔍 Verifying 'payment_requests' table...")
            cursor = await conn.execute("PRAGMA table_info(payment_requests)")
            columns = [col[1] for col in await cursor.fetchall()]
            
            if 'payment_id' in columns:
                print("  ✅ Column 'payment_id' exists (Critical for payments).")
            else:
                print("  ❌ CRITICAL: Column 'payment_id' is MISSING in 'payment_requests'!")
                
    except ImportError as e:
        print(f"  ❌ Error importing bot modules: {e}")
        print("  Make sure you are running this script from the project root.")
    except Exception as e:
        print(f"  ❌ Database check failed: {e}")

    print("\n✅ Health check complete!")

if __name__ == "__main__":
    try:
        asyncio.run(check_health())
    except KeyboardInterrupt:
        print("\n🛑 Check interrupted.")
