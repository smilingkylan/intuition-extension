#!/bin/bash

# Build script that applies environment-specific configuration before running Plasmo

# Get the environment (beta or prod)
ENV=${1:-development}
COMMAND=${2:-build}

echo "Building for environment: $ENV"
echo "Running command: plasmo $COMMAND"

# Apply environment configuration
node scripts/build-extension.js $ENV

# Run Plasmo command
if [ "$COMMAND" = "package" ]; then
  # For package, we need to build first
  plasmo build --env=$ENV && \
  node scripts/update-manifest-csp.js $ENV && \
  plasmo package
else
  plasmo $COMMAND --env=$ENV
  # Update CSP after build
  if [ "$COMMAND" = "build" ]; then
    node scripts/update-manifest-csp.js $ENV
  fi
fi

# The cleanup is handled by the node script on exit
