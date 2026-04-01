#!/bin/bash

# Setup development environment for all apps and services

set -e

echo "🚀 Setting up development environment..."

# 🌐 Apps
for app in apps/parent-app apps/driver-app apps/admin-web; do
    echo "📦 Installing dependencies for $app..."
    (cd $app && pnpm install --no-frozen-lockfile)
done

# 🏗️ Libraries
echo "🏗️ Building shared libraries..."
(cd libs && ./gradlew build)

# 🧪 Services
echo "🧪 Building microservices..."
(cd services && ./gradlew build -x test) # Skip tests for initial setup

echo "✅ Environment setup complete! Use 'docker-compose up' to start everything."
