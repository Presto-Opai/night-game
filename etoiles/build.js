#!/usr/bin/env node
'use strict';

/**
 * etoiles/build.js
 * -----------------
 * Générateur du fichier « La Carte de Votre Ciel » — zéro dépendance npm.
 *
 * Lit etoiles/app.template.html et injecte le contenu des deux fichiers de
 * données (etoiles/data/stars.6.json, etoiles/data/constellations.lines.json)
 * à la place des marqueurs /*__STARS_JSON__*​/ et /*__CONSTELLATIONS_JSON__*​/,
 * puis écrit le résultat autonome dans etoiles/index.html (aucune requête
 * réseau, fonctionne en double-clic depuis file://).
 *
 * Usage : node etoiles/build.js
 */

const fs = require('fs');
const path = require('path');

const ETOILES_DIR = __dirname;
const TEMPLATE_PATH = path.join(ETOILES_DIR, 'app.template.html');
const OUTPUT_PATH = path.join(ETOILES_DIR, 'index.html');
const STARS_PATH = path.join(ETOILES_DIR, 'data', 'stars.6.json');
const CONSTELLATIONS_PATH = path.join(ETOILES_DIR, 'data', 'constellations.lines.json');

const STAR_MARKER = '/*__STARS_JSON__*/';
const CONSTELLATIONS_MARKER = '/*__CONSTELLATIONS_JSON__*/';

function fail(message) {
  console.error('✖ ' + message);
  process.exit(1);
}

function readJson(filePath, label) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    fail(`Impossible de lire ${label} (${filePath}) : ${err.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    fail(`JSON invalide dans ${label} (${filePath}) : ${err.message}`);
  }
}

function main() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    fail(`Modèle introuvable : ${TEMPLATE_PATH}`);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  const starsData = readJson(STARS_PATH, 'le catalogue d’étoiles');
  const constellationsData = readJson(CONSTELLATIONS_PATH, 'les lignes de constellations');

  if (!starsData || !Array.isArray(starsData.features)) {
    fail('Le fichier stars.6.json ne contient pas de tableau "features" valide.');
  }
  if (!constellationsData || !Array.isArray(constellationsData.features)) {
    fail('Le fichier constellations.lines.json ne contient pas de tableau "features" valide.');
  }

  if (!template.includes(STAR_MARKER)) {
    fail(`Marqueur ${STAR_MARKER} introuvable dans le modèle.`);
  }
  if (!template.includes(CONSTELLATIONS_MARKER)) {
    fail(`Marqueur ${CONSTELLATIONS_MARKER} introuvable dans le modèle.`);
  }

  const starsJson = JSON.stringify(starsData);
  const constellationsJson = JSON.stringify(constellationsData);

  // Remplacement via une fonction de callback : évite toute interprétation
  // des motifs spéciaux ($&, $$, etc.) que String.prototype.replace
  // appliquerait si le remplacement était passé comme simple chaîne.
  let output = template.replace(STAR_MARKER, () => starsJson);
  output = output.replace(CONSTELLATIONS_MARKER, () => constellationsJson);

  fs.writeFileSync(OUTPUT_PATH, output, 'utf8');

  const sizeKb = (Buffer.byteLength(output, 'utf8') / 1024).toFixed(0);
  console.log('✓ Carte du ciel générée avec succès.');
  console.log(`  Étoiles injectées       : ${starsData.features.length}`);
  console.log(`  Constellations injectées : ${constellationsData.features.length}`);
  console.log(`  Fichier écrit            : ${path.relative(process.cwd(), OUTPUT_PATH)} (${sizeKb} Ko)`);
  console.log('  Ouvrez ce fichier directement dans un navigateur (aucun serveur requis).');
}

main();
