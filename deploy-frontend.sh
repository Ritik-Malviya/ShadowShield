#!/bin/bash
# Script to deploy the Frontend to Vercel

# Navigate to Frontend directory
cd "$(dirname "$0")/Frontend"

# Install dependencies if needed
if [ "$1" == "--install" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the project
echo "Building project..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel --prod

echo "Deployment complete!"
