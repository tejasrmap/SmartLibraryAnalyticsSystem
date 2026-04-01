import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import sys

def migrate():
    if len(sys.argv) < 2:
        print("Usage: python migrate_to_cloud.py <RAILWAY_POSTGRES_URL>")
        return

    cloud_url = sys.argv[1]
    local_db = "backend/library.db"

    print(f"\n--- 🚀 Booklytics: Cloud Migration Phase ---")
    print(f"Target: Railway Cloud Infrastructure")
    
    try:
        # Connect to Local SQLite
        local_conn = sqlite3.connect(local_db)
        local_cur = local_conn.cursor()

        # Connect to Railway Postgres
        cloud_conn = psycopg2.connect(cloud_url)
        cloud_cur = cloud_conn.cursor()

        # TABLES TO MIGRATE
        tables = ['books', 'transactions', 'members']

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

            # Insert into Cloud using fast execution
            print(f"   💾 Uploading {len(rows)} records...")
            insert_query = f"INSERT INTO {table} ({col_names}) VALUES %s"
            
            # Clear Cloud Table first to avoid duplicates
            cloud_cur.execute(f"TRUNCATE TABLE {table} CASCADE")
            
            execute_values(cloud_cur, insert_query, rows)
            
            print(f"   ✅ Sector {table} synchronization verified.")

        cloud_conn.commit()
        print(f"\n" + "="*40)
        print("🏆 MIGRATION COMPLETE: Booklytics is now fully cloud-integrated!")
        print("="*40)

    except Exception as e:
        print(f"\n❌ CRITICAL FAILURE: {e}")
        print("Please verify your Railway 'External Connection URL'.")
    finally:
        if 'local_conn' in locals(): local_conn.close()
        if 'cloud_conn' in locals(): cloud_conn.close()

if __name__ == "__main__":
    migrate()
