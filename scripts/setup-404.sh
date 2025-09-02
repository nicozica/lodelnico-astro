#!/bin/bash

# Post-build script to set up 404 page correctly
echo "Setting up 404 page for Apache..."

# Apache will serve 404.html directly, no need for directory structure
if [ -f "dist/404.html" ]; then
    echo "✅ 404.html is ready for Apache"
else
    echo "❌ 404.html not found!"
    exit 1
fi

echo "✅ 404 page setup complete!"
