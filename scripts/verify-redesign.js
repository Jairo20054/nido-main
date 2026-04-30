#!/usr/bin/env node

/**
 * Script de verificación del rediseño Home/Landing
 * Verifica que todos los archivos fueron actualizados correctamente
 */

const fs = require('fs');
const path = require('path');

const files = [
  'src/features/home/HomePage.jsx',
  'src/components/layout/SiteHeader.jsx',
  'src/components/layout/SiteFooter.jsx',
  'src/styles/app.css',
];

const checks = {
  'src/features/home/HomePage.jsx': [
    'home-page',
    'home-hero__title',
    'home-search-bar',
    'home-filter-chip',
    'home-property-card',
  ],
  'src/components/layout/SiteHeader.jsx': [
    'site-header__search',
    'brand__mark',
  ],
  'src/components/layout/SiteFooter.jsx': [
    'site-footer__cities',
  ],
  'src/styles/app.css': [
    '.home-page {',
    '.home-hero__title {',
    '.home-search-bar {',
    '.home-property-card {',
  ],
};

console.log('🔍 Verificando rediseño Home/Landing...\n');

let allGood = true;

files.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const patterns = checks[file] || [];
    
    console.log(`✅ ${file}`);
    
    patterns.forEach((pattern) => {
      if (content.includes(pattern)) {
        console.log(`   ✓ "${pattern}"`);
      } else {
        console.log(`   ✗ "${pattern}" - NO ENCONTRADO`);
        allGood = false;
      }
    });
  } catch (error) {
    console.log(`❌ ${file} - ${error.message}`);
    allGood = false;
  }
  
  console.log();
});

if (allGood) {
  console.log('✨ ¡Rediseño completado exitosamente!\n');
  console.log('Para ver los cambios:');
  console.log('1. npm run dev:client');
  console.log('2. Abre http://localhost:5173');
  process.exit(0);
} else {
  console.log('⚠️  Algunos archivos no se actualizaron correctamente');
  process.exit(1);
}
