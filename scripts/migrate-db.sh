#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  printf '%s\n' 'DATABASE_URL must be set before running migrations.' >&2
  exit 1
fi

case "$DATABASE_URL" in
  postgres://*|postgresql://*) ;;
  *)
    printf '%s\n' 'DATABASE_URL must use postgres:// or postgresql://.' >&2
    exit 1
    ;;
esac

# Drizzle records applied migrations in its own journal table and applies
# migrations transactionally. Secrets are inherited by npm but never printed.
exec npm run db:migrate
