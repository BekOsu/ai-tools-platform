#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Running startup checks...\n');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found');
  process.exit(1);
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('⚠️  node_modules not found. Run: npm install');
} else {
  console.log('✅ node_modules found');
}

// Check key dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['next', 'react', 'react-dom', 'tailwindcss'];

console.log('\n📦 Checking dependencies:');
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - missing`);
  }
});

// Check key files
const requiredFiles = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/components/AIFeatures.tsx',
  'src/components/LoadingSpinner.tsx',
  'src/lib/utils.ts',
  'tailwind.config.js',
  'next.config.js'
];

console.log('\n📁 Checking key files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - missing`);
  }
});

// Check for common issues
console.log('\n🔍 Common issue checks:');

// Check if .next exists (might need cleaning)
if (fs.existsSync('.next')) {
  console.log('ℹ️  .next folder exists (run: rm -rf .next if having cache issues)');
}

// Check port availability (simplified)
console.log('ℹ️  Default ports: 3000 (frontend), 8002 (codegen service)');

console.log('\n✅ Startup checks complete!');
console.log('\n🚀 To start the application:');
console.log('   npm run dev');
console.log('\n🔧 If you have issues:');
console.log('   1. rm -rf .next && npm run dev');
console.log('   2. rm -rf node_modules && npm install');
console.log('   3. Check the codegen service is running on port 8002');