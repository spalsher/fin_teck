#!/bin/bash

# iTecknologi Logo Setup Script
echo "Setting up iTecknologi logo..."

# Create public directory if it doesn't exist
mkdir -p public

# Copy the logo
cp ../images/"We Make It Possible_01.png" public/iteck-logo.png

echo "✅ Logo copied to public/iteck-logo.png"
echo "Logo is now available at /iteck-logo.png in the app"
