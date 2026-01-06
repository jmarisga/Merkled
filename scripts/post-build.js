import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('📦 Post-build processing for browser extension...\n');

// Copy manifest.json to dist
const manifestSrc = path.join(publicDir, 'manifest.json');
const manifestDest = path.join(distDir, 'manifest.json');

if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, manifestDest);
  console.log('✅ Copied manifest.json to dist/');
} else {
  console.error('❌ manifest.json not found in public/');
  process.exit(1);
}

// Copy icons folder to dist
const iconsSrc = path.join(publicDir, 'icons');
const iconsDest = path.join(distDir, 'icons');

if (fs.existsSync(iconsSrc)) {
  if (!fs.existsSync(iconsDest)) {
    fs.mkdirSync(iconsDest, { recursive: true });
  }
  
  const iconFiles = fs.readdirSync(iconsSrc);
  iconFiles.forEach(file => {
    if (file.endsWith('.png')) {
      fs.copyFileSync(
        path.join(iconsSrc, file),
        path.join(iconsDest, file)
      );
      console.log(`✅ Copied ${file} to dist/icons/`);
    }
  });
} else {
  console.warn('⚠️  icons folder not found in public/');
}

console.log('\n✨ Extension build complete!');
console.log('\n📍 Next steps:');
console.log('1. Add icon files to public/icons/ (icon16.png, icon48.png, icon128.png)');
console.log('2. Open Chrome and go to chrome://extensions/');
console.log('3. Enable "Developer mode"');
console.log('4. Click "Load unpacked" and select the "dist" folder');
console.log('\n🎉 Your extension will be ready to use!\n');
