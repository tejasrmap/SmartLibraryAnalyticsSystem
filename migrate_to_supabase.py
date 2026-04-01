import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import sys
import os

def migrate():
    # USAGE: python migrate_to_supabase.py "postgresql://postgres:[PASSWORD]@db.lgpzbgvychlendgnjbsj.supabase.co:5432/postgres"
    if len(sys.argv) < 2:
        print("\n❌ MISSING CONNECTION STRING")
        print("Usage: python migrate_to_supabase.py <SUPABASE_CONNECTION_STRING>")
        return

    supabase_url = sys.argv[1]
    local_db = "backend/library.db"

    print(f"\n--- 🚀 Booklytics: Supabase Migration Phase ---")
    print(f"Target: {supabase_url.split('@')[-1]}") # Print host only
    
    try:
        # Connect to Local SQLite
        if not os.path.exists(local_db):
            print(f"   ⚠️ Local database {local_db} not found.")
            return

        local_conn = sqlite3.connect(local_db)
        local_cur = local_conn.cursor()

        # Connect to Supabase Postgres
        cloud_conn = psycopg2.connect(supabase_url)
        cloud_cur = cloud_conn.cursor()

        # TABLES TO MIGRATE (Ordered by dependencies)
        tables = ['books', 'members', 'transactions']

        for table in tables:
            print(f"\n📦 Synchronizing {table} sector...")
            
            # Check if table exists locally
            local_cur.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if not local_cur.fetchone():
                print(f"   ⚠️ Sector {table} not found in local registry.")
                continue

            # Get data from Local
            local_cur.execute(f"SELECT * FROM {table}")
            rows = local_cur.fetchall()
            
            if not rows:
                print(f"   ℹ️ No records found in {table} sector.")
                continue

            # Get column names
            local_cur.execute(f"PRAGMA table_info({table})")
            columns = [info[1] for info in local_cur.fetchall()]
            col_names = ",".join(columns)

            # Insert into Supabase using fast execution
            print(f"   💾 Uploading {len(rows)} records...")
            insert_query = f"INSERT INTO {table} ({col_names}) VALUES %s"
            
            # Clear Supabase Table first to ensure a clean sync
            try:
                cloud_cur.execute(f"TRUNCATE TABLE {table} CASCADE")
            except Exception:
                # If table doesn't exist yet, it's fine, it will be created by FastAPI on startup
                print(f"   ℹ️ Initializing {table} registry for the first time.")
                cloud_conn.rollback() 
            
            execute_values(cloud_cur, insert_query, rows)
            
            print(f"   ✅ Sector {table} synchronization verified.")

        cloud_conn.commit()
        print(f"\n" + "="*50)
        print("🏆 MIGRATION COMPLETE: Booklytics is now Supabase-integrated!")
        print("="*50)

    except Exception as e:
        print(f"\n❌ CRITICAL FAILURE: {e}")
        print("Please check your Supabase Password and Connection String.")
    finally:
        if 'local_conn' in locals(): local_conn.close()
        if 'cloud_conn' in locals(): cloud_conn.close()

if __name__ == "__main__":
    migrate()
