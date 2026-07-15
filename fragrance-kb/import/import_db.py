"""
Direct loader into PostgreSQL / Supabase using psycopg (v3).

Usage:
    pip install "psycopg[binary]"
    export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
    python import/import_db.py           # applies schema then seeds

For Supabase, use the connection string from Project Settings -> Database
(the "Session"/direct connection, or the pooler for serverless).

This is a thin, transactional wrapper: it runs schema/schema.sql, then executes
the generated seed/load.sql. Everything is idempotent (upserts on slug ids), so
re-running after a rebuild simply updates changed rows.
"""
from __future__ import annotations

import os
import subprocess
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _read(rel):
    with open(os.path.join(HERE, rel), encoding="utf-8") as fh:
        return fh.read()


def main():
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        sys.exit("Set DATABASE_URL to your PostgreSQL/Supabase connection string.")

    # Ensure load.sql is fresh.
    subprocess.run([sys.executable, os.path.join(HERE, "import", "generate_sql.py")],
                   cwd=HERE, check=True)

    try:
        import psycopg  # psycopg 3
    except ImportError:
        sys.exit('psycopg not installed. Run: pip install "psycopg[binary]"\n'
                 'Or apply the SQL directly:\n'
                 '  psql "$DATABASE_URL" -f schema/schema.sql\n'
                 '  psql "$DATABASE_URL" -f seed/load.sql')

    schema_sql = _read("schema/schema.sql")
    load_sql = _read("seed/load.sql")

    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(schema_sql)
            cur.execute(load_sql)
        conn.commit()
    print("Import complete: schema applied and seed data loaded.")


if __name__ == "__main__":
    main()
