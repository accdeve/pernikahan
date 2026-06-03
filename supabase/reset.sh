#!/bin/bash
# Reset all Supabase Docker data (local development only!)
# WARNING: This destroys all database data and storage files.
# Run from project root OR from this directory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE="$SCRIPT_DIR/../.env"
COMPOSE_OPTS="-f supabase.yml --env-file $ENV_FILE"

echo "Stopping all Supabase containers..."
docker compose $COMPOSE_OPTS down -v --remove-orphans 2>/dev/null || true

echo "Removing persistent volumes..."
rm -rf ./volumes/db/data
rm -rf ./volumes/storage/*
rm -rf ./volumes/functions/.cache

echo "Starting fresh Supabase stack..."
docker compose $COMPOSE_OPTS up -d

echo "Waiting for database to be healthy..."
until docker compose $COMPOSE_OPTS exec -T db pg_isready -U postgres 2>/dev/null; do
  sleep 2
done
echo "Database is ready!"

echo "Reset complete!"
echo ""
echo "Supabase Studio: http://localhost:8000"
echo "  Login: admin / supabase-admin"
echo ""
echo "Direct API endpoint: http://localhost:8000"
echo "Mailpit UI: http://localhost:54324"
echo ""
echo "NOTE: Seed data (migrations) are applied automatically via docker-entrypoint."
