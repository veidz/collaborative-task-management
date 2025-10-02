#!/bin/sh
set -e

echo "🔄 Running database migrations..."
pnpm migration:run

echo "🚀 Starting auth-service..."
exec "$@"
