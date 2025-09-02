#!/bin/bash

# Simple check that 404.html was built correctly
echo "Checking 404 page..."

if [ -f "dist/404.html" ]; then
    echo "✅ 404.html ready for Apache"
else
    echo "❌ 404.html not found!"
    exit 1
fi

echo "✅ All set!"
