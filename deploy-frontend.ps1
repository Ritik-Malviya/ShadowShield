# Script to deploy the Frontend to Vercel

# Navigate to Frontend directory
Set-Location -Path $PSScriptRoot\Frontend

# Install dependencies if needed
if ($args[0] -eq "--install") {
    Write-Host "Installing dependencies..."
    npm install
}

# Build the project
Write-Host "Building project..."
npm run vercel-build

# Deploy to Vercel
Write-Host "Deploying to Vercel..."
npx vercel --prod

Write-Host "Deployment complete!"
