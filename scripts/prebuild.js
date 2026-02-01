const fs = require('fs');
const path = require('path');

console.log('Running pre-build checks...');

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
const reactScriptsPath = path.join(nodeModulesPath, 'react-scripts');

if (!fs.existsSync(reactScriptsPath)) {
  console.log('⚠️  react-scripts not found in node_modules');
  console.log('Installing dependencies...');
  // This is handled by npm ci in build command
} else {
  console.log('✅ react-scripts found');
}

console.log('Pre-build checks complete');