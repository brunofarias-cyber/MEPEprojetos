#!/bin/sh

# Script to apply database migrations non-interactively
# This script will accept all changes including data loss

echo "🔄 Aplicando migrações do banco de dados..."

# Use yes to automatically confirm all prompts
yes "" | npx drizzle-kit push

echo "✅ Migrações concluídas!"
