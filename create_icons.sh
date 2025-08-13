#!/bin/bash

# Create Icons for Chrome Extension
# This script creates simple placeholder icons for the extension

# Create icons directory if it doesn't exist
mkdir -p icons

# Check if ImageMagick is available
if command -v convert >/dev/null 2>&1; then
    echo "Creating icons using ImageMagick..."
    
    # Create a simple shield icon with "B" for Blocker
    # 16x16 icon
    convert -size 16x16 xc:transparent \
        -fill "#dc2626" -draw "roundrectangle 1,1 15,15 3,3" \
        -fill "white" -pointsize 10 -gravity center -annotate +0+0 "B" \
        icons/icon16.png
    
    # 32x32 icon  
    convert -size 32x32 xc:transparent \
        -fill "#dc2626" -draw "roundrectangle 2,2 30,30 6,6" \
        -fill "white" -pointsize 20 -gravity center -annotate +0+0 "B" \
        icons/icon32.png
    
    # 48x48 icon
    convert -size 48x48 xc:transparent \
        -fill "#dc2626" -draw "roundrectangle 3,3 45,45 9,9" \
        -fill "white" -pointsize 30 -gravity center -annotate +0+0 "B" \
        icons/icon48.png
    
    # 128x128 icon
    convert -size 128x128 xc:transparent \
        -fill "#dc2626" -draw "roundrectangle 8,8 120,120 24,24" \
        -fill "white" -pointsize 80 -gravity center -annotate +0+0 "B" \
        icons/icon128.png
    
    echo "✅ Icons created successfully!"
    
elif command -v python3 >/dev/null 2>&1; then
    echo "Creating icons using Python/Pillow..."
    
    # Create icons using Python
    python3 << 'EOF'
try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    def create_icon(size, filename):
        # Create a new image with transparency
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw red rounded rectangle background
        margin = max(1, size // 16)
        corner = max(2, size // 8)
        draw.rounded_rectangle(
            [margin, margin, size-margin, size-margin], 
            corner, 
            fill='#dc2626'
        )
        
        # Draw white "B" text
        try:
            # Try to use a system font
            font_size = max(10, size // 2)
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
            except:
                font = ImageFont.load_default()
        
        # Calculate text position to center it
        bbox = draw.textbbox((0, 0), "B", font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        
        draw.text((x, y), "B", fill='white', font=font)
        
        # Save the icon
        img.save(f'icons/{filename}')
        print(f"Created {filename}")
    
    # Create all icon sizes
    create_icon(16, 'icon16.png')
    create_icon(32, 'icon32.png')
    create_icon(48, 'icon48.png')
    create_icon(128, 'icon128.png')
    
    print("✅ Icons created successfully using Python!")
    
except ImportError:
    print("❌ Pillow (PIL) not available. Install with: pip install pillow")
    exit(1)
except Exception as e:
    print(f"❌ Error creating icons: {e}")
    exit(1)
EOF

else
    echo "❌ Neither ImageMagick nor Python3 with Pillow available."
    echo ""
    echo "To create icons manually, you need 4 PNG files in the icons/ directory:"
    echo "  - icons/icon16.png (16x16 pixels)"
    echo "  - icons/icon32.png (32x32 pixels)"  
    echo "  - icons/icon48.png (48x48 pixels)"
    echo "  - icons/icon128.png (128x128 pixels)"
    echo ""
    echo "You can:"
    echo "  1. Install ImageMagick: brew install imagemagick (macOS) or apt-get install imagemagick (Ubuntu)"
    echo "  2. Install Python Pillow: pip install pillow"
    echo "  3. Create the icons manually using any image editor"
    echo "  4. Download free icons from https://icons8.com or https://www.flaticon.com"
    exit 1
fi

echo ""
echo "Icon files created:"
ls -la icons/
echo ""
echo "You can now load the extension in Chrome!"
