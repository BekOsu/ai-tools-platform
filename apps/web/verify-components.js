#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying all required components...\n');

// Component dependencies mapping
const componentDeps = {
  'src/app/layout.tsx': [
    'src/components/Sidebar.tsx',
    'src/components/TopNav.tsx', 
    'src/components/Footer.tsx',
    'src/components/ErrorBoundary.tsx',
    'src/contexts/AuthContext.tsx'
  ],
  'src/app/page.tsx': [
    'src/components/AIFeatures.tsx'
  ],
  'src/app/dashboard/page.tsx': [
    'src/contexts/AuthContext.tsx',
    'src/components/LoadingSpinner.tsx'
  ],
  'src/app/playground/page.tsx': [
    'src/components/ui/Button.tsx',
    'src/lib/claude-code.ts'
  ],
  'src/components/ui/Button.tsx': [
    'src/lib/utils.ts'
  ],
  'src/components/ui/Card.tsx': [
    'src/lib/utils.ts'
  ],
  'src/components/ui/Input.tsx': [
    'src/lib/utils.ts'
  ]
};

let allGood = true;

// Check each component and its dependencies
Object.entries(componentDeps).forEach(([component, deps]) => {
  console.log(`📁 Checking ${component}:`);
  
  if (!fs.existsSync(component)) {
    console.log(`  ❌ ${component} - MISSING`);
    allGood = false;
    return;
  }
  
  console.log(`  ✅ ${component} - exists`);
  
  // Check dependencies
  deps.forEach(dep => {
    if (fs.existsSync(dep)) {
      console.log(`    ✅ ${dep}`);
    } else {
      console.log(`    ❌ ${dep} - MISSING`);
      allGood = false;
    }
  });
  
  console.log('');
});

// Check for common missing components
const essentialComponents = [
  'src/lib/api.ts',
  'src/lib/utils.ts', 
  'src/lib/claude-code.ts',
  'src/contexts/AuthContext.tsx',
  'src/hooks/useApi.ts',
  'src/app/globals.css'
];

console.log('🔧 Checking essential files:');
essentialComponents.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
});

// Check package.json dependencies
console.log('\n📦 Checking critical dependencies:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const criticalDeps = ['clsx', 'tailwind-merge', '@monaco-editor/react', 'react-icons'];

criticalDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
    allGood = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All components and dependencies verified!');
  console.log('\n🚀 Try running: npm run dev');
} else {
  console.log('❌ Missing components detected!');
  console.log('\n🔧 Suggested fixes:');
  console.log('  1. Run: npm install');
  console.log('  2. Check for missing imports');
  console.log('  3. Verify file paths are correct');
}
console.log('='.repeat(50));