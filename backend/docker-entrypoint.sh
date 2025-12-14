#!/usr/bin/env bash
set -euo pipefail

echo "[entrypoint] SafeClinic API starting…"

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "[entrypoint] Waiting for Postgres…"

  HOST=$(echo "$DATABASE_URL" | sed -E 's#^postgres(ql)?://([^@]+@)?([^:/]+).*#\3#' || true)
  PORT=$(echo "$DATABASE_URL" | sed -E 's#^postgres(ql)?://([^@]+@)?[^:/]+:([0-9]+).*#\3#' || true)
  HOST=${HOST:-db}
  PORT=${PORT:-5432}

  for i in $(seq 1 60); do
    if pg_isready -h "$HOST" -p "$PORT" > /dev/null 2>&1; then
      echo "[entrypoint] Postgres ready."
      break
    fi

    if [[ "$i" -eq 60 ]]; then
      echo "[entrypoint] ERROR: Postgres no responde a tiempo." >&2
      exit 1
    fi

    sleep 1
  done
else
  echo "[entrypoint] WARNING: DATABASE_URL no está definido" >&2
fi

echo "[entrypoint] Applying schema (prisma db push)…"
npx prisma db push

echo "[entrypoint] Seeding demo data…"
node prisma/seed.js

echo "[entrypoint] Launching: $*"
exec "$@"
