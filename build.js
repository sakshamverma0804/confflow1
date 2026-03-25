/**
 * ConfFlow Build Script
 * Handles pre-deployment tasks: asset optimization, env injection
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = './dist';
const SRC_FILES = [
  'index.html',
  'app.js',
  'firebase.js',
  'main.css',
  'nav.css',
  'home.css',
  'dashboard.css'
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`  ✓ ${src} → ${dest}`);
}

function injectEnvVars(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const envVars = {
    '__FIREBASE_API_KEY__': process.env.VITE_FIREBASE_API_KEY || '',
    '__FIREBASE_AUTH_DOMAIN__': process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    '__FIREBASE_PROJECT_ID__': process.env.VITE_FIREBASE_PROJECT_ID || '',
    '__FIREBASE_STORAGE_BUCKET__': process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    '__FIREBASE_MESSAGING_SENDER_ID__': process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    '__FIREBASE_APP_ID__': process.env.VITE_FIREBASE_APP_ID || '',
    '__FIREBASE_MEASUREMENT_ID__': process.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  };
  Object.entries(envVars).forEach(([key, val]) => {
    content = content.replace(new RegExp(key, 'g'), val);
  });
  fs.writeFileSync(filePath, content);
}

async function build() {
  console.log('\n🚀 ConfFlow Build Starting...\n');
  ensureDir(BUILD_DIR);

  SRC_FILES.forEach(src => {
    if (!fs.existsSync(src)) return;
    const dest = path.join(BUILD_DIR, src);
    copyFile(src, dest);
  });

  const firebaseFile = path.join(BUILD_DIR, 'firebase.js');
  if (fs.existsSync(firebaseFile)) injectEnvVars(firebaseFile);

  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  console.log(`\n✅ Build complete — ConfFlow v${pkg.version}`);
  console.log(`📁 Output: ${BUILD_DIR}/`);
  console.log(`🌐 Deploy: vercel --prod\n`);
}

build().catch(console.error);
