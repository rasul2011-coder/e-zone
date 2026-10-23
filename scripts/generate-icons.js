// Simple script to create placeholder PNG icons
// In production, use a proper tool like @pwa-asset-generator or Figma

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');

// Create simple colored squares as placeholders
// In production, replace with actual logo
sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size / 4}" fill="#0f1d35"/>
  <text x="50%" y="40%" font-family="Arial" font-size="${size / 6}" font-weight="900" text-anchor="middle" fill="white">English</text>
  <text x="50%" y="65%" font-family="Arial" font-size="${size / 6}" font-weight="900" text-anchor="middle" fill="#f97316">Zone</text>
</svg>`;
  
  const filename = `icon-${size}x${size}.png`;
  const svgPath = path.join(publicDir, filename.replace('.png', '.svg'));
  
  fs.writeFileSync(svgPath, svg);
  console.log(`Created ${filename.replace('.png', '.svg')}`);
});

console.log('\nNote: SVG icons created. For production, convert to PNG using a tool like:');
console.log('- sharp-cli: npx sharp -i icon.svg -o icon-512x512.png resize 512');
console.log('- @pwa-asset-generator');
console.log('- Online tool: https://realfavicongenerator.net/');
