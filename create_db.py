import MySQLdb, sys

try:
    conn = MySQLdb.connect(host="127.0.0.1",
                           user="root",
                           passwd="")          # ubah jika pakai password
    cur  = conn.cursor()
    cur.execute(
        "CREATE DATABASE IF NOT EXISTS capstone "
        "CHARACTER SET utf8mb4 "
        "COLLATE utf8mb4_general_ci;"
    )
    print("✅  Database `capstone` siap.")
except Exception as e:
    print("❌  Gagal membuat DB:", e)
    sys.exit(1)
finally:
    if 'cur' in locals(): cur.close()
    if 'conn' in locals(): conn.close()