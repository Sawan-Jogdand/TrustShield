import os
from PIL import Image, ImageDraw

def create_shield_icon(size):
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale coordinates based on size
    scale = size / 128.0
    
    # Shield shape coordinates
    top_y = 15 * scale
    mid_y = 20 * scale
    bottom_y = 115 * scale
    left_x = 15 * scale
    right_x = 113 * scale
    center_x = 64 * scale
    
    shield_pts = [
        (center_x, mid_y),
        (right_x, top_y),
        (right_x, 70 * scale),
        (center_x, bottom_y),
        (left_x, 70 * scale),
        (left_x, top_y),
    ]
    
    # Draw Shield shadow / outer border
    draw.polygon(shield_pts, fill=(15, 23, 42, 255)) # Dark slate base
    
    # Draw Inner Shield
    inner_scale = 0.88
    inner_pts = [
        (center_x, mid_y + 8 * scale),
        (center_x + (right_x - center_x) * inner_scale, top_y + 7 * scale),
        (center_x + (right_x - center_x) * inner_scale, 70 * scale),
        (center_x, bottom_y - 8 * scale),
        (center_x - (center_x - left_x) * inner_scale, 70 * scale),
        (center_x - (center_x - left_x) * inner_scale, top_y + 7 * scale),
    ]
    
    # Fill inner shield with a beautiful deep sky blue
    draw.polygon(inner_pts, fill=(2, 132, 199, 255)) # Sky Blue (#0284c7)
    
    # Add a glowing accent border
    draw.polygon(inner_pts, outline=(56, 189, 248, 255), width=max(1, int(3 * scale))) # Cyan border
    
    # Draw alert symbol in the center
    tri_top = (center_x, 38 * scale)
    tri_br = (center_x + 22 * scale, 82 * scale)
    tri_bl = (center_x - 22 * scale, 82 * scale)
    
    draw.polygon([tri_top, tri_br, tri_bl], fill=(254, 240, 138, 255), outline=(234, 179, 8, 255), width=max(1, int(2 * scale))) # Yellow warning sign
    
    # Exclamation mark inside the triangle
    draw.line([(center_x, 48 * scale), (center_x, 68 * scale)], fill=(15, 23, 42, 255), width=max(1, int(4 * scale)))
    
    dot_radius = 3.5 * scale
    draw.ellipse(
        [
            (center_x - dot_radius, 73 * scale),
            (center_x + dot_radius, 80 * scale)
        ],
        fill=(15, 23, 42, 255)
    )
    
    return img

def main():
    out_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(out_dir, exist_ok=True)
    
    sizes = [16, 48, 128]
    for s in sizes:
        img = create_shield_icon(s)
        filename = f"icon{s}.png"
        filepath = os.path.join(out_dir, filename)
        img.save(filepath, "PNG")
        print(f"Generated icon: {filepath} ({s}x{s})")

if __name__ == "__main__":
    main()
