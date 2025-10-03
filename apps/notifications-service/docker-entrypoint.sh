#!/bin/sh
set -e

echo "🔄 Running database migrations..."
pnpm migration:run

echo "✅ Migrations completed successfully"

echo "🚀 Starting notifications-service..."
exec "$@"
