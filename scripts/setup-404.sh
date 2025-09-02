#!/bin/bash

# Post-build script to set up 404 page correctly
echo "Setting up 404 page for Apache..."

# Create 404 directory if it doesn't exist
mkdir -p dist/404

# Copy 404.html to both formats for maximum compatibility
if [ -f "dist/404.html" ]; then
    # Copy to directory format for Apache ErrorDocument
    cp dist/404.html dist/404/index.html
    echo "✓ Created dist/404/index.html"
else
    echo "❌ 404.html not found in dist/"
    exit 1
fi

echo "✅ 404 page setup complete!"
