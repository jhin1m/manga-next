#!/usr/bin/env node

/**
 * Script to generate icon sizes matching manifest.ts requirements
 * This script creates PNG icons from the base SVG icon for PWA compatibility
 *
 * Generated icons match src/app/manifest.ts specifications:
 * - icon-192.png (192x192, maskable)
 * - icon-512.png (512x512, maskable)
 * - apple-icon.png (180x180, any)
 * - Additional favicon sizes for browser compatibility
 *
 * Usage: node scripts/generate-icons.js
 *
 * Requirements:
 * - Install sharp: pnpm add sharp
 * - Have src/app/icon.svg as base icon
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes to generate - matching manifest.ts requirements
const iconSizes = [
  // Required by manifest.ts
  { size: 192, name: 'icon-192.png', purpose: 'maskable' },
  { size: 512, name: 'icon-512.png', purpose: 'maskable' },
  { size: 180, name: 'apple-icon.png', purpose: 'any' },

  // Additional common favicon sizes
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
];

async function generateIcons() {
  const svgPath = path.join(__dirname, '../src/app/icon.svg');
  const publicDir = path.join(__dirname, '../public');
  
  // Check if SVG exists
  if (!fs.existsSync(svgPath)) {
    console.error('❌ SVG icon not found at:', svgPath);
    console.log('Please create src/app/icon.svg first');
    return;
  }

  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('🎨 Generating icons from SVG...');

  try {
    // Generate all icons
    for (const { size, name, purpose } of iconSizes) {
      const outputPath = path.join(publicDir, name);
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      const purposeText = purpose ? ` (${purpose})` : '';
      const iconType = name.includes('apple') ? '🍎' : '✅';
      console.log(`${iconType} Generated ${name} (${size}x${size})${purposeText}`);
    }

    // Generate ICO file (requires to-ico package)
    try {
      const toIco = require('to-ico');
      const pngBuffer = await sharp(svgPath)
        .resize(32, 32)
        .png()
        .toBuffer();

      const icoBuffer = await toIco([pngBuffer]);
      fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
      console.log('✅ Generated favicon.ico');
    } catch (error) {
      console.log('⚠️  Could not generate ICO file (install to-ico for ICO support)');
      console.log('Error:', error.message);
    }

    console.log('\n🎉 All icons generated successfully!');
    console.log('\nGenerated files matching manifest.ts:');
    console.log('- icon-192.png (192x192) - maskable');
    console.log('- icon-512.png (512x512) - maskable');
    console.log('- apple-icon.png (180x180) - any');
    console.log('- Additional favicon sizes: 16x16, 32x32, 48x48');
    console.log('- favicon.ico');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

// Check if sharp is installed
try {
  require('sharp');
  generateIcons();
} catch (error) {
  console.error('❌ Sharp is not installed. Please run:');
  console.log('npm install sharp');
  console.log('or');
  console.log('pnpm add sharp');
}
