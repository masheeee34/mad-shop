const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const standalonePath = path.join(root, '.next', 'standalone');

if (fs.existsSync(standalonePath)) {
  console.log('Préparation du dossier standalone pour Hostinger...');

  // 1. Copier /public
  const publicSrc = path.join(root, 'public');
  const publicDest = path.join(standalonePath, 'public');
  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
    console.log('✅ /public copié');
  }

  // 2. Copier /.next/static
  const staticSrc = path.join(root, '.next', 'static');
  const staticDest = path.join(standalonePath, '.next', 'static');
  if (fs.existsSync(staticSrc)) {
    // Il faut créer .next dans standalone s'il n'existe pas
    const dotNextDest = path.join(standalonePath, '.next');
    if (!fs.existsSync(dotNextDest)) fs.mkdirSync(dotNextDest, { recursive: true });
    fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
    console.log('✅ /.next/static copié');
  }
} else {
  console.log('⚠️ Dossier standalone introuvable. Avez-vous activé output: "standalone" ?');
}
