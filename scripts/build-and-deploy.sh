#!/bin/bash

# Build and Deploy Script for Journey App
# This script builds the app and prepares it for distribution

echo "🚀 Starting Journey App Build Process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Running type checks..."
npm run type-check || echo "⚠️ Type check warnings found"

# Run linting
echo "🔧 Running linting..."
npm run lint || echo "⚠️ Lint warnings found"

# Build the application
echo "🏗️ Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Create distribution folder
echo "📁 Creating distribution folder..."
mkdir -p dist

# Copy build artifacts
echo "📋 Copying build artifacts..."
cp -r .next dist/
cp -r public dist/
cp package.json dist/
cp package-lock.json dist/

# Create deployment info
echo "📝 Creating deployment info..."
cat > dist/DEPLOYMENT_INFO.json << EOF
{
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "$(node -p "require('./package.json').version")",
  "environment": "production",
  "features": {
    "gamification": true,
    "mobileResponsive": true,
    "imageUploads": true,
    "readingPlans": true,
    "community": true,
    "leaderboard": true
  },
  "buildTools": {
    "next": "$(node -p "require('./package.json').dependencies.next")",
    "react": "$(node -p "require('./package.json').dependencies.react")",
    "tailwind": "$(node -p "require('./package.json').devDependencies.tailwindcss")"
  }
}
EOF

# Create .env.production template
echo "🔧 Creating environment template..."
cat > dist/.env.production.template << EOF
# Environment Variables for Production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=your_app_url
EOF

# Create deployment instructions
echo "📖 Creating deployment instructions..."
cat > dist/README_DEPLOYMENT.md << EOF
# Journey App Deployment Instructions

## Quick Start
1. Install dependencies: \`npm install\`
2. Set environment variables: Copy \`.env.production.template\` to \`.env.production\`
3. Start production server: \`npm start\`

## Environment Variables Required
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_APP_URL

## Database Setup
Run these SQL scripts in order:
1. create-image-uploads.sql
2. create-storage-policies.sql
3. fix-user-profile-policies.sql
4. create-100-reading-plans.sql

## Features Included
- ✅ Gamified UI with animations
- ✅ Mobile-first responsive design
- ✅ Image upload functionality
- ✅ 100 reading plans
- ✅ User profiles and leaderboards
- ✅ Community features
- ✅ Progress tracking

## Build Information
See \`DEPLOYMENT_INFO.json\` for build details.
EOF

# Optimize for production
echo "⚡ Optimizing for production..."
cd dist
npm ci --only=production

# Create start script
echo "🚀 Creating start script..."
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Journey App..."
NODE_ENV=production npm start
EOF
chmod +x start.sh

echo "✅ Distribution build complete!"
echo "📦 Location: ./dist"
echo "🚀 To start: cd dist && ./start.sh"
echo "📖 See README_DEPLOYMENT.md for instructions"
