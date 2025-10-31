const fs = require('fs');
const path = require('path');

// Create placeholder SVG images for products
const imageDir = path.join(__dirname, '../public/images/products');

// Ensure directory exists
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Colors for different jewelry types
const colors = [
  '#FFD700', // Gold
  '#C0C0C0', // Silver
  '#E6E6FA', // Lavender (for gemstones)
  '#FFC0CB', // Pink (for rose gold)
  '#87CEEB', // Sky blue (for sapphires)
  '#90EE90', // Light green (for emeralds)
  '#FFB6C1', // Light pink (for pink diamonds)
  '#DDA0DD', // Plum (for amethyst)
];

// Create placeholder images for products 1-120, each with 1-4 image variants
for (let productId = 1; productId <= 120; productId++) {
  const imageCount = Math.floor(Math.random() * 4) + 1; // 1-4 images per product
  
  for (let imageIndex = 1; imageIndex <= imageCount; imageIndex++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const darkColor = adjustColor(color, -40);
    
    const svgContent = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${productId}-${imageIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${darkColor};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow${productId}-${imageIndex}">
      <dropShadow dx="2" dy="2" stdDeviation="3" flood-color="#00000030"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="400" fill="#f8f9fa"/>
  
  <!-- Main jewelry piece -->
  <circle cx="200" cy="180" r="60" fill="url(#grad${productId}-${imageIndex})" filter="url(#shadow${productId}-${imageIndex})"/>
  
  <!-- Decorative elements (gems/stones) -->
  <circle cx="180" cy="160" r="8" fill="#ffffff" opacity="0.8"/>
  <circle cx="220" cy="160" r="8" fill="#ffffff" opacity="0.8"/>
  <circle cx="200" cy="200" r="12" fill="#ffffff" opacity="0.9"/>
  
  <!-- Product number -->
  <text x="200" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#666">
    Product #${productId}
  </text>
  <text x="200" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#999">
    View ${imageIndex}
  </text>
  
  <!-- Decorative border -->
  <rect x="10" y="10" width="380" height="380" fill="none" stroke="#e9ecef" stroke-width="2" rx="8"/>
</svg>`.trim();

    const fileName = `product-${productId}-${imageIndex}.jpg`;
    const filePath = path.join(imageDir, fileName);
    
    // Save as SVG first (we'll convert to JPG-looking SVG)
    const finalSvg = svgContent.replace(/\n\s+/g, ' ');
    fs.writeFileSync(filePath.replace('.jpg', '.svg'), finalSvg);
    
    console.log(`Created ${fileName.replace('.jpg', '.svg')}`);
  }
}

// Helper function to darken/lighten color
function adjustColor(color, amount) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * amount);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}

console.log('Placeholder images generated successfully!');