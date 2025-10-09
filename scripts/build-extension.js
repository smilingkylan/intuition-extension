const fs = require('fs');
const path = require('path');

// Get environment from command line argument or environment variable
const env = process.argv[2] || process.env.BUILD_ENV || 'development';

console.log(`Building for environment: ${env}`);

// Read base package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const basePackage = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Save original package.json
const originalPackageJson = JSON.stringify(basePackage, null, 2);

try {
  // Try to read environment-specific package configuration
  const envConfigPath = path.join(__dirname, `../package.${env}.json`);
  
  if (fs.existsSync(envConfigPath)) {
    const envPackage = JSON.parse(fs.readFileSync(envConfigPath, 'utf8'));
    
    // Merge configurations
    const finalPackage = {
      ...basePackage,
      ...envPackage,
      manifest: {
        ...basePackage.manifest,
        ...envPackage.manifest
      }
    };

    // Write merged package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(finalPackage, null, 2));
    console.log(`Applied ${env} configuration to package.json`);
  } else {
    console.log(`No environment-specific configuration found for: ${env}`);
    console.log('Using base package.json configuration');
  }
} catch (error) {
  console.error('Error during build configuration:', error);
  // Restore original package.json on error
  fs.writeFileSync(packageJsonPath, originalPackageJson);
  process.exit(1);
}

// Register cleanup handler to restore original package.json
process.on('exit', () => {
  try {
    // Restore original package.json after build
    fs.writeFileSync(packageJsonPath, originalPackageJson);
    console.log('Restored original package.json');
  } catch (error) {
    console.error('Error restoring package.json:', error);
  }
});

// Handle interruption signals
process.on('SIGINT', () => {
  console.log('\nBuild interrupted, cleaning up...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nBuild terminated, cleaning up...');
  process.exit(0);
});
