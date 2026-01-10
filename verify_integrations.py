import os
import asyncio
from dotenv import load_dotenv
from pathlib import Path
import aiohttp
from openai import OpenAI

# Load .env
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

async def verify_supabase():
    print(f"Checking Supabase connection to {SUPABASE_URL}...")
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Missing Supabase URL or Key in .env")
        return False
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Try to fetch users (or just check health if no table access)
    # We'll try to read from a table or just ping the REST API root
    async with aiohttp.ClientSession() as session:
        try:
            # Just checking if we can reach the endpoint. 
            # Usually /rest/v1/ is the entry point.
            async with session.get(f"{SUPABASE_URL}/rest/v1/", headers=headers) as resp:
                # 200 OK or 404 (if root not found but auth ok) or 401 (auth failed)
                if resp.status in [200, 404]: # 404 might mean no table specified but server reached
                     print("✅ Supabase REST endpoint reachable.")
                else:
                    print(f"⚠️ Supabase REST endpoint returned status {resp.status}")

            # Check 'mining_data' table
            async with session.get(f"{SUPABASE_URL}/rest/v1/mining_data?select=count", headers=headers) as resp:
                 if resp.status == 200:
                     print("✅ Supabase 'mining_data' table access successful.")
                 elif resp.status == 404:
                     print("⚠️ 'mining_data' table not found (WebApp mining features might fail).")
                 else:
                     print(f"❌ Supabase 'mining_data' table access failed: {resp.status}")

        except Exception as e:
            print(f"❌ Supabase connection error: {e}")
            return False
    return True

async def verify_openai():
    print("Checking OpenAI connection...")
    if not OPENAI_API_KEY:
        print("❌ Missing OpenAI API Key in .env")
        return False
    
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        # Simple models list call to verify auth
        client.models.list()
        print("✅ OpenAI API connection successful.")
        return True
    except Exception as e:
        print(f"❌ OpenAI connection error: {e}")
        return False

async def main():
    print("=== INTEGRATION VERIFICATION ===")
    await verify_supabase()
    print("--------------------------------")
    await verify_openai()
    print("================================")

if __name__ == "__main__":
    asyncio.run(main())
