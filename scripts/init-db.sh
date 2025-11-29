#!/bin/sh

# Database initialization script for Render deployment
# This script runs migrations before starting the server

echo "🚀 Starting database initialization..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

echo "✅ DATABASE_URL is configured"

# Run Drizzle migrations to create/update database schema
echo "📊 Running database migrations..."
npx drizzle-kit push

if [ $? -eq 0 ]; then
  echo "✅ Database migrations completed successfully"
else
  echo "❌ Database migrations failed"
  exit 1
fi

echo "🎉 Database initialization complete!"
