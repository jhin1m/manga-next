#!/usr/bin/env node

/**
 * Script to generate various icon sizes for the manga website
 * This script creates PNG icons from the base SVG icon
 * 
 * Usage: node scripts/generate-icons.js
 * 
 * Requirements:
 * - Install sharp: npm install sharp
 * - Have src/app/icon.svg as base icon
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes to generate
const iconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 96, name: 'favicon-96x96.png' },
  { size: 144, name: 'favicon-144x144.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 256, name: 'icon-256.png' },
  { size: 384, name: 'icon-384.png' },
  { size: 512, name: 'icon-512.png' },
];

// Apple touch icon sizes
const appleIconSizes = [
  { size: 57, name: 'apple-touch-icon-57x57.png' },
  { size: 60, name: 'apple-touch-icon-60x60.png' },
  { size: 72, name: 'apple-touch-icon-72x72.png' },
  { size: 76, name: 'apple-touch-icon-76x76.png' },
  { size: 114, name: 'apple-touch-icon-114x114.png' },
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 144, name: 'apple-touch-icon-144x144.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
  { size: 180, name: 'apple-icon.png' },
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
    // Generate regular icons
    for (const { size, name } of iconSizes) {
      const outputPath = path.join(publicDir, name);
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    // Generate Apple touch icons
    for (const { size, name } of appleIconSizes) {
      const outputPath = path.join(publicDir, name);
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`🍎 Generated ${name} (${size}x${size})`);
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
    console.log('\nGenerated files:');
    console.log('- Regular icons: favicon-*.png, icon-*.png');
    console.log('- Apple icons: apple-touch-icon-*.png');
    console.log('- ICO file: favicon.ico');
    
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
