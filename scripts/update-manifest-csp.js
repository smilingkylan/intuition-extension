const fs = require('fs');
const path = require('path');

/**
 * Updates the Content Security Policy in the manifest based on environment
 * This script should be run after Plasmo build but before packaging
 */

const env = process.argv[2] || 'development';

// Define CSP for different environments
const cspConfigs = {
  development: {
    extension_pages: "script-src 'self' http://localhost; object-src 'self';"
  },
  beta: {
    extension_pages: "script-src 'self'; object-src 'self';"
  },
  prod: {
    extension_pages: "script-src 'self'; object-src 'self';"
  }
};

// Find the manifest.json in the build directory
const buildDirs = [
  'build/chrome-mv3-prod',
  'build/chrome-mv3-dev',
  'build/chrome-mv3',
  'build'
];

let manifestPath = null;
for (const dir of buildDirs) {
  const fullPath = path.join(__dirname, '..', dir, 'manifest.json');
  if (fs.existsSync(fullPath)) {
    manifestPath = fullPath;
    break;
  }
}

if (!manifestPath) {
  console.error('Could not find manifest.json in build directory');
  process.exit(1);
}

try {
  // Read manifest
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Update CSP
  if (cspConfigs[env]) {
    manifest.content_security_policy = cspConfigs[env];
    console.log(`Updated CSP for ${env} environment`);
  } else {
    console.log(`No CSP configuration for environment: ${env}`);
  }
  
  // Write updated manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Manifest updated successfully');
  
} catch (error) {
  console.error('Error updating manifest:', error);
  process.exit(1);
}
