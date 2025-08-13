#!/bin/bash

# Icon Optimization Script for Chrome Extension
# This script optimizes PNG icons to reduce file size while maintaining quality

echo "🖼️  Optimizing Chrome Extension Icons..."

# Check if optimization tools are available
OPTIPNG_AVAILABLE=false
PNGCRUSH_AVAILABLE=false
IMAGEOPTIM_AVAILABLE=false

if command -v optipng &> /dev/null; then
    OPTIPNG_AVAILABLE=true
    echo "✅ optipng found"
fi

if command -v pngcrush &> /dev/null; then
    PNGCRUSH_AVAILABLE=true
    echo "✅ pngcrush found"
fi

if command -v imageoptim &> /dev/null; then
    IMAGEOPTIM_AVAILABLE=true
    echo "✅ ImageOptim CLI found"
fi

# Create backup directory
mkdir -p icons/originals

# Function to optimize with optipng
optimize_with_optipng() {
    local file=$1
    echo "🔧 Optimizing $file with optipng..."
    cp "$file" "icons/originals/$(basename $file)"
    optipng -o7 "$file"
}

# Function to optimize with pngcrush
optimize_with_pngcrush() {
    local file=$1
    echo "🔧 Optimizing $file with pngcrush..."
    cp "$file" "icons/originals/$(basename $file)"
    pngcrush -rem alla -brute "$file" "${file}.tmp" && mv "${file}.tmp" "$file"
}

# Function to optimize with ImageOptim CLI
optimize_with_imageoptim() {
    local file=$1
    echo "🔧 Optimizing $file with ImageOptim..."
    cp "$file" "icons/originals/$(basename $file)"
    imageoptim "$file"
}

# Get original file sizes
echo "📊 Original file sizes:"
du -h icons/icon*.png

# Optimize icons
for icon in icons/icon*.png; do
    if [ -f "$icon" ]; then
        if $OPTIPNG_AVAILABLE; then
            optimize_with_optipng "$icon"
        elif $PNGCRUSH_AVAILABLE; then
            optimize_with_pngcrush "$icon"
        elif $IMAGEOPTIM_AVAILABLE; then
            optimize_with_imageoptim "$icon"
        else
            echo "⚠️  No optimization tools found. Install one of:"
            echo "   - optipng: brew install optipng"
            echo "   - pngcrush: brew install pngcrush"
            echo "   - ImageOptim CLI: brew install imageoptim-cli"
            exit 1
        fi
    fi
done

# Show results
echo ""
echo "📊 Optimized file sizes:"
du -h icons/icon*.png

echo ""
echo "✅ Icon optimization complete!"
echo "   Original icons backed up to: icons/originals/"

# Verify icon integrity
echo ""
echo "🔍 Verifying icon integrity:"
for icon in icons/icon*.png; do
    if file "$icon" | grep -q "PNG image data"; then
        echo "✅ $icon - OK"
    else
        echo "❌ $icon - CORRUPTED"
    fi
done

echo ""
echo "📝 Installation commands for optimization tools:"
echo "   macOS (Homebrew): brew install optipng pngcrush imageoptim-cli"
echo "   Ubuntu/Debian:    sudo apt-get install optipng pngcrush"
echo "   CentOS/RHEL:      sudo yum install optipng pngcrush"
