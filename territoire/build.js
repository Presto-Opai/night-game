#!/usr/bin/env node
'use strict';

/**
 * territoire/build.js
 * --------------------
 * Générateur du « Guide de la Suisse Normande » — zéro dépendance npm.
 *
 * Lit les fichiers de données JSON (territoire/data/lieux.json,
 * activites.json, pros.json), les valide, puis génère cinq pages HTML
 * autonomes (aucune requête réseau, polices système) : index.html,
 * decouvrir.html, bouger.html, dormir-manger.html, pros.html.
 *
 * Usage : node territoire/build.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const SITE_URL = 'https://presto-opai.github.io/night-game/territoire/';

// ---------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------

function fail(message) {
  console.error('✖ ' + message);
  process.exit(1);
}

function readJson(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    fail(`Impossible de lire ${fileName} (${filePath}) : ${err.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    fail(`JSON invalide dans ${fileName} : ${err.message}`);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Applique la typographie française de base (espaces insécables avant
// ; : ! ? et à l'intérieur des guillemets « »), après échappement HTML.
function typo(str) {
  let s = escapeHtml(str);
  s = s.replace(/\s*([;:!?])(?!\w)/g, ' $1');
  s = s.replace(/«\s*/g, '« ');
  s = s.replace(/\s*»/g, ' »');
  return s;
}

function slugCheck(id, label) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    fail(`Identifiant invalide dans ${label} : "${id}" (attendu : minuscules, chiffres, tirets).`);
  }
}

// ---------------------------------------------------------------------
// Validation des données
// ---------------------------------------------------------------------

const LIEU_CATEGORIES = ['nature', 'village', 'panorama'];
const PRO_TYPES = ['gite', 'chambres', 'camping', 'restaurant'];
const PRO_TIERS = ['basique', 'mise-en-avant', 'page-dediee'];

function validateLieux(data) {
  if (!Array.isArray(data) || data.length === 0) {
    fail('lieux.json doit contenir un tableau non vide de lieux.');
  }
  const seen = new Set();
  data.forEach((l, i) => {
    const label = `lieux.json[${i}]`;
    ['id', 'name', 'commune', 'category', 'lat', 'lon', 'description', 'conseils'].forEach((f) => {
      if (l[f] === undefined || l[f] === null || l[f] === '') {
        fail(`${label} : champ "${f}" manquant ou vide.`);
      }
    });
    slugCheck(l.id, label);
    if (seen.has(l.id)) fail(`${label} : identifiant "${l.id}" en double.`);
    seen.add(l.id);
    if (!LIEU_CATEGORIES.includes(l.category)) {
      fail(`${label} : catégorie "${l.category}" invalide (attendu : ${LIEU_CATEGORIES.join(', ')}).`);
    }
    if (typeof l.lat !== 'number' || typeof l.lon !== 'number') {
      fail(`${label} : lat/lon doivent être des nombres.`);
    }
    if (!Array.isArray(l.conseils) || l.conseils.length === 0) {
      fail(`${label} : "conseils" doit être un tableau non vide.`);
    }
    if (typeof l.verifie !== 'boolean') {
      fail(`${label} : "verifie" doit être un booléen.`);
    }
  });
}

function validateActivites(data) {
  if (!Array.isArray(data) || data.length === 0) {
    fail('activites.json doit contenir un tableau non vide d\'activités.');
  }
  const seen = new Set();
  data.forEach((a, i) => {
    const label = `activites.json[${i}]`;
    ['id', 'name', 'description', 'où', 'saison'].forEach((f) => {
      if (a[f] === undefined || a[f] === null || a[f] === '') {
        fail(`${label} : champ "${f}" manquant ou vide.`);
      }
    });
    slugCheck(a.id, label);
    if (seen.has(a.id)) fail(`${label} : identifiant "${a.id}" en double.`);
    seen.add(a.id);
    if (typeof a.verifie !== 'boolean') {
      fail(`${label} : "verifie" doit être un booléen.`);
    }
  });
}

function validatePros(data) {
  if (!Array.isArray(data) || data.length === 0) {
    fail('pros.json doit contenir un tableau non vide de professionnels.');
  }
  const seen = new Set();
  data.forEach((p, i) => {
    const label = `pros.json[${i}]`;
    ['id', 'name', 'type', 'commune', 'description', 'tier', 'telephone'].forEach((f) => {
      if (p[f] === undefined || p[f] === null || p[f] === '') {
        fail(`${label} : champ "${f}" manquant ou vide.`);
      }
    });
    slugCheck(p.id, label);
    if (seen.has(p.id)) fail(`${label} : identifiant "${p.id}" en double.`);
    seen.add(p.id);
    if (!PRO_TYPES.includes(p.type)) {
      fail(`${label} : type "${p.type}" invalide (attendu : ${PRO_TYPES.join(', ')}).`);
    }
    if (!PRO_TIERS.includes(p.tier)) {
      fail(`${label} : palier "${p.tier}" invalide (attendu : ${PRO_TIERS.join(', ')}).`);
    }
    if (!p.capacite && !p.specialite) {
      fail(`${label} : il faut au moins un champ "capacite" ou "specialite".`);
    }
    if (typeof p.exemple !== 'boolean') {
      fail(`${label} : "exemple" doit être un booléen.`);
    }
  });
}

// ---------------------------------------------------------------------
// CSS partagé — défini une seule fois
// ---------------------------------------------------------------------

const SHARED_CSS = `
  :root {
    --fern-dark: #0f3327;
    --fern: #1f4d3a;
    --fern-light: #4b8267;
    --granite: #565a52;
    --granite-light: #8a8d82;
    --river: #2f6f8e;
    --river-light: #6fa9c4;
    --amber: #a97a2e;
    --amber-light: #c9994f;
    --stone: #f3f4ee;
    --paper: #ffffff;
    --ink: #1b231d;
    --ink-muted: #545f52;
    --line: #dde1d5;
    --radius: 10px;
    --radius-lg: 18px;
    --max: 1120px;
    --serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif;
    --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    background: var(--stone);
    color: var(--ink);
    font-family: var(--sans);
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
  }
  a { color: var(--river); }
  a:hover, a:focus { color: var(--fern); }
  img, svg { max-width: 100%; }
  h1, h2, h3, h4 {
    font-family: var(--serif);
    font-weight: 700;
    line-height: 1.18;
    color: var(--fern-dark);
    margin: 0 0 0.55em;
  }
  h1 { font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem); }
  h2 { font-size: clamp(1.5rem, 1.2rem + 1.3vw, 2.05rem); }
  h3 { font-size: 1.2rem; }
  p { margin: 0 0 1em; }
  ul { margin: 0; padding: 0; }
  .container { max-width: var(--max); margin: 0 auto; padding: 0 1.4rem; }
  .section { padding: 4rem 0; }
  .section + .section { border-top: 1px solid var(--line); }
  .section-head { max-width: 680px; margin: 0 auto 2.5rem; text-align: center; }
  .section-head p { color: var(--ink-muted); font-size: 1.03rem; }
  .eyebrow {
    display: inline-block;
    font-size: 0.76rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--river);
    background: rgba(47,111,142,0.10);
    padding: 0.35em 0.9em;
    border-radius: 999px;
    margin-bottom: 0.9em;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.85em 1.6em;
    border-radius: 999px;
    text-decoration: none;
    font-weight: 700;
    font-size: 0.98rem;
    border: 2px solid transparent;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    cursor: pointer;
  }
  .btn:hover { transform: translateY(-2px); }
  .btn-primary { background: var(--fern); color: #fff; }
  .btn-primary:hover { background: var(--fern-dark); color: #fff; box-shadow: 0 12px 26px -12px rgba(15,51,39,0.55); }
  .btn-outline { background: transparent; color: var(--fern); border-color: var(--fern); }
  .btn-outline:hover { background: var(--fern); color: #fff; }
  .btn-ghost { background: rgba(255,255,255,0.14); color: #fff; border-color: rgba(255,255,255,0.5); }
  .btn-ghost:hover { background: rgba(255,255,255,0.24); color: #fff; }

  /* ---- Navigation ---- */
  .topbar {
    position: sticky;
    top: 0;
    z-index: 30;
    background: rgba(243,244,238,0.94);
    backdrop-filter: blur(6px);
    border-bottom: 1px solid var(--line);
  }
  .topbar .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 0.85rem;
    padding-bottom: 0.85rem;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 0.55em;
    font-family: var(--serif);
    font-weight: 700;
    font-size: 1.12rem;
    color: var(--fern-dark);
    text-decoration: none;
  }
  .brand-mark {
    width: 2.1rem; height: 2.1rem;
    border-radius: 8px;
    background: linear-gradient(155deg, var(--fern), var(--river));
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
  }
  .topnav { display: flex; flex-wrap: wrap; gap: 1.3rem; align-items: center; }
  .topnav a {
    text-decoration: none;
    color: var(--ink);
    font-weight: 600;
    font-size: 0.92rem;
    padding-bottom: 0.2em;
    border-bottom: 2px solid transparent;
  }
  .topnav a:hover { color: var(--fern); }
  .topnav a.active { color: var(--fern); border-bottom-color: var(--amber); }

  /* ---- Hero ---- */
  .hero {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(ellipse 60% 55% at 90% 0%, rgba(111,169,196,0.35), transparent 60%),
      radial-gradient(ellipse 55% 60% at 5% 100%, rgba(75,130,103,0.30), transparent 55%),
      linear-gradient(160deg, var(--fern-dark), var(--fern) 60%, var(--fern-light) 140%);
    color: #fff;
  }
  .hero .container { padding: 4.5rem 0 4rem; }
  .hero .eyebrow { background: rgba(255,255,255,0.16); color: #fff; }
  .hero h1 { color: #fff; max-width: 18ch; }
  .hero .lede { font-size: clamp(1.05rem, 1rem + 0.4vw, 1.25rem); color: rgba(255,255,255,0.92); max-width: 58ch; margin-bottom: 1.8rem; }
  .hero-actions { display: flex; flex-wrap: wrap; gap: 0.9rem; }
  .hero-note { margin-top: 1.4rem; font-size: 0.86rem; color: rgba(255,255,255,0.72); }
  .page-hero { padding: 3.2rem 0 2.6rem; }
  .page-hero .lede { color: rgba(255,255,255,0.92); max-width: 68ch; margin-bottom: 0; }

  /* ---- Cards génériques ---- */
  .grid { display: grid; gap: 1.5rem; grid-template-columns: 1fr; }
  @media (min-width: 700px) { .grid-2 { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 720px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }
  .card {
    background: var(--paper);
    border-radius: var(--radius);
    padding: 1.7rem 1.6rem;
    border: 1px solid var(--line);
    box-shadow: 0 14px 28px -22px rgba(15,51,39,0.45);
  }
  .card .meta { font-size: 0.85rem; color: var(--river); font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 0.6em; }
  .card p:last-child { margin-bottom: 0; }
  .card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }

  .badge {
    display: inline-block;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.25em 0.65em;
    border-radius: 999px;
    white-space: nowrap;
  }
  .badge-unverified { background: rgba(169,122,46,0.15); color: var(--amber); border: 1px solid rgba(169,122,46,0.35); }
  .badge-exemple { background: rgba(47,111,142,0.12); color: var(--river); border: 1px solid rgba(47,111,142,0.3); }

  .conseils {
    margin-top: 0.9em;
    padding-top: 0.9em;
    border-top: 1px dashed var(--line);
  }
  .conseils strong { display: block; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--granite); margin-bottom: 0.4em; }
  .conseils ul { list-style: none; }
  .conseils li { position: relative; padding-left: 1.2em; font-size: 0.92rem; color: var(--ink-muted); margin-bottom: 0.35em; }
  .conseils li::before { content: "→"; position: absolute; left: 0; color: var(--river); }

  /* ---- Carte interactive ---- */
  .map-wrap {
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 1.4rem;
    box-shadow: 0 20px 40px -28px rgba(15,51,39,0.5);
  }
  .map-svg { display: block; width: 100%; height: auto; border-radius: var(--radius); background: #eaf0e6; }
  .map-river { fill: none; stroke: var(--river-light); stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; opacity: 0.65; }
  .map-place {
    font-family: var(--sans);
    font-size: 13px;
    font-weight: 700;
    fill: var(--granite);
    letter-spacing: 0.02em;
  }
  .marker circle { stroke: #fff; stroke-width: 2; transition: r 0.15s ease; cursor: pointer; }
  .marker:hover circle { r: 10; }
  .marker-nature circle { fill: var(--fern); }
  .marker-village circle { fill: var(--river); }
  .marker-panorama circle { fill: var(--amber); }
  .map-legend { display: flex; flex-wrap: wrap; gap: 1.3rem; margin-top: 1.1rem; padding-top: 1.1rem; border-top: 1px solid var(--line); font-size: 0.88rem; color: var(--ink-muted); }
  .map-legend span { display: inline-flex; align-items: center; gap: 0.5em; }
  .map-legend i { width: 0.85em; height: 0.85em; border-radius: 50%; display: inline-block; }
  .map-caption { margin-top: 1rem; font-size: 0.88rem; color: var(--ink-muted); }

  /* ---- Bannière pros ---- */
  .pros-banner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    background: var(--paper);
    border: 1px dashed var(--river-light);
    border-radius: var(--radius-lg);
    padding: 1.6rem 1.8rem;
  }
  .pros-banner p { margin: 0; color: var(--ink-muted); }
  .pros-banner strong { color: var(--fern-dark); }

  /* ---- Tarifs ---- */
  .pricing-grid { display: grid; gap: 1.5rem; grid-template-columns: 1fr; }
  @media (min-width: 640px) { .pricing-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1020px) { .pricing-grid { grid-template-columns: repeat(4, 1fr); } }
  .price-card {
    background: var(--paper);
    border-radius: var(--radius);
    padding: 1.8rem 1.5rem;
    border: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .price-card.featured { border-color: var(--amber); box-shadow: 0 18px 34px -18px rgba(169,122,46,0.45); position: relative; }
  .price-card.featured::before {
    content: "Le plus choisi";
    position: absolute; top: -0.8em; left: 1.4rem;
    background: var(--amber); color: #fff;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
    padding: 0.3em 0.8em; border-radius: 999px;
  }
  .price-card h3 { font-size: 1.05rem; margin-bottom: 0.1em; }
  .price-amount { font-size: 1.8rem; font-weight: 800; color: var(--fern-dark); font-family: var(--serif); }
  .price-amount small { font-size: 0.9rem; font-weight: 600; color: var(--ink-muted); font-family: var(--sans); }
  .price-card p.price-desc { color: var(--ink-muted); font-size: 0.92rem; flex-grow: 1; }

  /* ---- Annuaire dormir & manger ---- */
  .pro-card-lg {
    background: var(--paper);
    border-radius: var(--radius-lg);
    border: 1px solid var(--line);
    padding: 2rem;
    box-shadow: 0 20px 38px -26px rgba(15,51,39,0.5);
  }
  .pro-card-lg .type-tag, .pro-card-md .type-tag {
    display: inline-block;
    font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--river); background: rgba(47,111,142,0.1);
    padding: 0.25em 0.7em; border-radius: 999px; margin-bottom: 0.7em;
  }
  .pro-card-md {
    background: var(--paper);
    border-radius: var(--radius);
    border: 1px solid var(--line);
    padding: 1.5rem 1.6rem;
  }
  .pro-list { list-style: none; border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; background: var(--paper); }
  .pro-list li {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.6rem;
    padding: 0.85rem 1.3rem; border-bottom: 1px solid var(--line); font-size: 0.94rem;
  }
  .pro-list li:last-child { border-bottom: none; }
  .pro-list .pro-name { font-weight: 700; color: var(--ink); }
  .pro-list .pro-meta { color: var(--ink-muted); font-size: 0.88rem; }

  /* ---- FAQ / arguments ---- */
  .argu-grid { display: grid; gap: 1.6rem; grid-template-columns: 1fr; }
  @media (min-width: 760px) { .argu-grid { grid-template-columns: repeat(3, 1fr); } }
  .argu-card .num { font-family: var(--serif); font-size: 1.9rem; color: var(--amber); margin-bottom: 0.3em; }

  /* ---- Cross-sell ---- */
  .crosssell-grid { display: grid; gap: 1.4rem; grid-template-columns: 1fr; }
  @media (min-width: 720px) { .crosssell-grid { grid-template-columns: repeat(3, 1fr); } }
  .crosssell-card { display: block; text-decoration: none; color: inherit; }
  .crosssell-card .card { height: 100%; }
  .crosssell-card h3 { color: var(--fern-dark); }
  .crosssell-card .go { color: var(--river); font-weight: 700; font-size: 0.9rem; }

  /* ---- Contact ---- */
  .contact-card {
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 2rem;
    display: grid;
    gap: 1.3rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 600px) { .contact-card { grid-template-columns: 1fr 1fr; } }
  .contact-card strong { display: block; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--granite); margin-bottom: 0.3em; }
  .contact-card a { font-weight: 700; font-size: 1.02rem; text-decoration: none; }
  .placeholder-tag {
    display: inline-block;
    font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
    background: var(--amber); color: #fff;
    padding: 0.15em 0.55em; border-radius: 5px; margin-left: 0.5em; vertical-align: middle;
  }

  /* ---- Pied de page ---- */
  .site-footer { background: var(--fern-dark); color: rgba(255,255,255,0.78); padding: 2.75rem 0 2rem; }
  .footer-grid { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2rem; margin-bottom: 2rem; }
  .footer-brand { max-width: 360px; }
  .footer-brand .brand { color: #fff; margin-bottom: 0.6em; }
  .footer-brand p { color: rgba(255,255,255,0.62); font-size: 0.9rem; }
  .footer-links { display: flex; flex-wrap: wrap; gap: 2.5rem; }
  .footer-links h4 { font-family: var(--sans); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.85); margin-bottom: 0.8em; }
  .footer-links ul { display: flex; flex-direction: column; gap: 0.5rem; }
  .footer-links a { color: rgba(255,255,255,0.65); text-decoration: none; font-size: 0.9rem; }
  .footer-links a:hover { color: #fff; }
  .footer-legal { border-top: 1px solid rgba(255,255,255,0.14); padding-top: 1.5rem; font-size: 0.8rem; color: rgba(255,255,255,0.55); }
  .footer-legal p { margin-bottom: 0.4em; }
`;

// ---------------------------------------------------------------------
// Fragments partagés : tête de page, navigation, pied de page
// ---------------------------------------------------------------------

const PAGES = [
  { file: 'index.html', label: 'Accueil' },
  { file: 'decouvrir.html', label: 'Découvrir' },
  { file: 'bouger.html', label: 'Bouger' },
  { file: 'dormir-manger.html', label: 'Dormir & manger' },
  { file: 'pros.html', label: 'Côté pros' },
];

function head(title, description, extraLd) {
  const ld = extraLd ? `\n<script type="application/ld+json">${JSON.stringify(extraLd)}</script>` : '';
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="index, follow">
<link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2214%22%20fill%3D%22%230f3327%22%2F%3E%3Ctext%20x%3D%2232%22%20y%3D%2242%22%20font-size%3D%2230%22%20text-anchor%3D%22middle%22%3E%F0%9F%8F%9E%EF%B8%8F%3C%2Ftext%3E%3C%2Fsvg%3E">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:site_name" content="Le Guide de la Suisse Normande">
<style>${SHARED_CSS}</style>${ld}
</head>
<body>
`;
}

function nav(activeFile) {
  const links = PAGES.map(
    (p) => `<a href="${p.file}"${p.file === activeFile ? ' class="active"' : ''}>${escapeHtml(p.label)}</a>`
  ).join('\n      ');
  return `<header class="topbar">
  <div class="container">
    <a class="brand" href="index.html">
      <span class="brand-mark" aria-hidden="true">🏞️</span>
      Le Guide de la Suisse Normande
    </a>
    <nav class="topnav" aria-label="Navigation principale">
      ${links}
    </nav>
  </div>
</header>
`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="index.html">
          <span class="brand-mark" aria-hidden="true">🏞️</span>
          Le Guide de la Suisse Normande
        </a>
        <p>Guide indépendant, écrit et vérifié sur le terrain par un habitant d'Athis-Val-de-Rouvre, au cœur de la Suisse Normande.</p>
      </div>
      <div class="footer-links">
        <div>
          <h4>Le guide</h4>
          <ul>
            <li><a href="decouvrir.html">Découvrir</a></li>
            <li><a href="bouger.html">Bouger</a></li>
            <li><a href="dormir-manger.html">Dormir &amp; manger</a></li>
            <li><a href="pros.html">Côté pros</a></li>
          </ul>
        </div>
        <div>
          <h4>Autres activités</h4>
          <ul>
            <li><a href="../agency/index.html">Bocage Web — sites internet</a></li>
            <li><a href="../redaction/index.html">Mots d'Orne — rédaction SEO</a></li>
            <li><a href="../etoiles/index.html">La Carte de Votre Ciel</a></li>
            <li><a href="index.html">Le Guide de la Suisse Normande</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-legal">
      <p><strong>Mentions légales</strong> — Le Guide de la Suisse Normande, entreprise individuelle (micro-entreprise) en cours d'immatriculation. Adresse&nbsp;: à compléter, Athis-Val-de-Rouvre (61430). SIRET&nbsp;: à compléter dès l'immatriculation. Directeur de la publication&nbsp;: à compléter. Hébergement&nbsp;: à compléter lors de la mise en ligne.</p>
      <p>© 2026 Le Guide de la Suisse Normande. Tous droits réservés.</p>
    </div>
  </div>
</footer>
</body>
</html>
`;
}

// ---------------------------------------------------------------------
// Carte interactive SVG (index.html)
// ---------------------------------------------------------------------

const MAP_BOUNDS = { latMin: 48.70, latMax: 49.05, lonMin: -0.65, lonMax: -0.25 };
const MAP_WIDTH = 800;
const MAP_HEIGHT = 700;

function project(lat, lon) {
  const x = ((lon - MAP_BOUNDS.lonMin) / (MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin)) * MAP_WIDTH;
  const y = ((MAP_BOUNDS.latMax - lat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * MAP_HEIGHT;
  return { x, y };
}

function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} `;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    d += `Q ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)} `;
  }
  const last = points[points.length - 1];
  d += `L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

const CATEGORY_LABELS = {
  nature: 'Espace naturel',
  village: 'Village / bourg',
  panorama: 'Panorama',
};

function buildMap(lieux) {
  const orne = [
    { lat: 49.05, lon: -0.45 },
    { lat: 49.04, lon: -0.472 },
    { lat: 48.90, lon: -0.478 },
    { lat: 48.855, lon: -0.406 },
    { lat: 48.802, lon: -0.352 },
    { lat: 48.70, lon: -0.30 },
  ].map((p) => project(p.lat, p.lon));

  const rouvre = [
    { lat: 48.70, lon: -0.44 },
    { lat: 48.748, lon: -0.383 },
    { lat: 48.742, lon: -0.374 },
    { lat: 48.757, lon: -0.396 },
    { lat: 48.855, lon: -0.406 },
  ].map((p) => project(p.lat, p.lon));

  const markers = lieux
    .map((l) => {
      const { x, y } = project(l.lat, l.lon);
      return `<a class="marker marker-${l.category}" href="decouvrir.html#${l.id}">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7"></circle>
        <title>${escapeHtml(l.name)} — ${escapeHtml(CATEGORY_LABELS[l.category])}</title>
      </a>`;
    })
    .join('\n      ');

  const edgeLabels = [
    { name: 'Flers', lat: 48.75, lon: -0.62, dx: 0, dy: -12 },
    { name: 'Athis-Val-de-Rouvre', lat: 48.735, lon: -0.42, dx: 0, dy: 20 },
    { name: 'Putanges-le-Lac', lat: 48.805, lon: -0.345, dx: 10, dy: -12 },
    { name: 'Pont-d\'Ouilly', lat: 48.855, lon: -0.406, dx: 12, dy: 22 },
    { name: 'Clécy', lat: 48.900, lon: -0.478, dx: -14, dy: -14 },
    { name: 'Thury-Harcourt', lat: 49.04, lon: -0.472, dx: 12, dy: -6 },
  ]
    .map((p) => {
      const { x, y } = project(p.lat, p.lon);
      return `<text class="map-place" x="${(x + p.dx).toFixed(1)}" y="${(y + p.dy).toFixed(1)}">${escapeHtml(p.name)}</text>`;
    })
    .join('\n      ');

  return `<div class="map-wrap">
    <svg class="map-svg" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" role="img" aria-label="Carte interactive de la Suisse Normande">
      <path class="map-river" d="${smoothPath(orne)}"></path>
      <path class="map-river" d="${smoothPath(rouvre)}"></path>
      ${edgeLabels}
      ${markers}
    </svg>
    <div class="map-legend">
      <span><i style="background:var(--fern)"></i> Espaces naturels</span>
      <span><i style="background:var(--river)"></i> Villages &amp; bourgs</span>
      <span><i style="background:var(--amber)"></i> Panoramas</span>
    </div>
    <p class="map-caption">Survolez un point pour son nom, cliquez pour sa fiche complète sur la page « Découvrir ». Les traits bleutés représentent, de façon stylisée, l'Orne et la Rouvre.</p>
  </div>`;
}

// ---------------------------------------------------------------------
// Page : index.html
// ---------------------------------------------------------------------

function buildIndex(lieux, activites, pros) {
  const byId = (id) => lieux.find((l) => l.id === id);
  const highlights = [
    { id: 'roche-doetre', icon: '⛰️' },
    { id: 'clecy-village', icon: '🏘️' },
    { id: 'lac-rabodanges', icon: '🌊' },
  ];

  const highlightCards = highlights
    .map((h) => {
      const l = byId(h.id);
      return `<article class="card">
          <div class="card-head">
            <h3>${h.icon} ${typo(l.name)}</h3>
          </div>
          <p class="meta">${typo(l.commune)}</p>
          <p>${typo(l.description)}</p>
          <p><a href="decouvrir.html#${l.id}">Voir la fiche complète →</a></p>
        </article>`;
    })
    .join('\n        ');

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: 'La Suisse Normande',
    description:
      "Guide indépendant de la Suisse Normande (Orne, Normandie) : sites naturels, gorges de la Rouvre, activités de plein air et annuaire des hébergements et restaurants du territoire.",
    url: SITE_URL,
    geo: { '@type': 'GeoCoordinates', latitude: 48.86, longitude: -0.44 },
    includesAttraction: lieux.map((l) => ({
      '@type': 'TouristAttraction',
      name: l.name,
      url: `${SITE_URL}decouvrir.html#${l.id}`,
      address: l.commune,
    })),
  };

  return (
    head(
      'Le Guide de la Suisse Normande — sites naturels, activités et bonnes adresses',
      "Guide indépendant et gratuit de la Suisse Normande (Orne) : Roche d'Oëtre, gorges de la Rouvre, Clécy, lac de Rabodanges. Carte interactive, activités de plein air et annuaire des hébergements.",
      ld
    ) +
    nav('index.html') +
    `<main>
  <section class="hero">
    <div class="container">
      <p class="eyebrow">Guide indépendant de la Suisse Normande</p>
      <h1>La Suisse Normande, grandeur nature</h1>
      <p class="lede">Entre Flers, Thury-Harcourt et Putanges, l'Orne et la Rouvre ont creusé des gorges, des escarpements de granit et des méandres qui n'ont rien à envier à un relief de moyenne montagne — d'où le surnom donné à ce coin de Normandie. Un guide écrit sur place, mis à jour au fil des visites, pour découvrir le territoire sans détour marketing.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="decouvrir.html">Découvrir les sites naturels</a>
        <a class="btn btn-ghost" href="bouger.html">Voir les activités</a>
      </div>
      <p class="hero-note">${lieux.length} lieux référencés · ${activites.length} activités · annuaire de ${pros.length} hébergements et restaurants</p>
    </div>
  </section>

  <section class="section" id="carte">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">La carte du territoire</p>
        <h2>Repérez les sites d'un coup d'œil</h2>
        <p>Une carte stylisée de la Suisse Normande, entre Flers et Thury-Harcourt, le long de l'Orne et de la Rouvre.</p>
      </div>
      ${buildMap(lieux)}
    </div>
  </section>

  <section class="section" id="incontournables">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Incontournables</p>
        <h2>Trois lieux pour commencer</h2>
        <p>Le point de départ classique d'une découverte de la Suisse Normande — le reste du territoire s'explore sur la page « Découvrir ».</p>
      </div>
      <div class="grid grid-3">
        ${highlightCards}
      </div>
    </div>
  </section>

  <section class="section" id="explorer">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Explorer le guide</p>
        <h2>Trois pages, un territoire</h2>
      </div>
      <div class="grid grid-3">
        <a class="crosssell-card" href="decouvrir.html">
          <article class="card">
            <h3>🌿 Découvrir</h3>
            <p>Sites naturels, panoramas et villages : ${lieux.length} fiches détaillées, avec conseils pratiques et carte des accès.</p>
            <span class="go">Voir les lieux →</span>
          </article>
        </a>
        <a class="crosssell-card" href="bouger.html">
          <article class="card">
            <h3>🚵 Bouger</h3>
            <p>Randonnée, canoë, escalade, vélo&nbsp;: les activités de plein air du territoire et où les pratiquer.</p>
            <span class="go">Voir les activités →</span>
          </article>
        </a>
        <a class="crosssell-card" href="dormir-manger.html">
          <article class="card">
            <h3>🛏️ Dormir &amp; manger</h3>
            <p>Gîtes, chambres d'hôtes, campings et restaurants du territoire, classés par mise en avant.</p>
            <span class="go">Voir l'annuaire →</span>
          </article>
        </a>
      </div>
    </div>
  </section>

  <section class="section" id="pros">
    <div class="container">
      <div class="pros-banner">
        <p><strong>Vous êtes hébergeur, restaurateur ou professionnel du tourisme&nbsp;?</strong><br>Une fiche annuaire gratuite, une mise en avant à 29&nbsp;€/mois, ou une page dédiée rédigée par un professionnel.</p>
        <a class="btn btn-outline" href="pros.html">Être référencé →</a>
      </div>
    </div>
  </section>
</main>

` +
    footer()
  );
}

// ---------------------------------------------------------------------
// Page : decouvrir.html
// ---------------------------------------------------------------------

const CATEGORY_ORDER = ['panorama', 'nature', 'village'];
const CATEGORY_SECTION_LABELS = {
  panorama: 'Panoramas & points de vue',
  nature: 'Espaces naturels & itinéraires',
  village: 'Villages & bourgs',
};

function lieuCard(l) {
  const badge = !l.verifie
    ? '<span class="badge badge-unverified">Informations à confirmer sur place</span>'
    : '';
  const conseils = l.conseils.map((c) => `<li>${typo(c)}</li>`).join('\n            ');
  return `<article class="card" id="${l.id}">
          <div class="card-head">
            <h3>${typo(l.name)}</h3>
            ${badge}
          </div>
          <p class="meta">${typo(l.commune)}</p>
          <p>${typo(l.description)}</p>
          <div class="conseils">
            <strong>Conseils pratiques</strong>
            <ul>
              ${conseils}
            </ul>
          </div>
        </article>`;
}

function buildDecouvrir(lieux) {
  const sections = CATEGORY_ORDER.map((cat) => {
    const items = lieux.filter((l) => l.category === cat);
    if (items.length === 0) return '';
    const cards = items.map(lieuCard).join('\n        ');
    return `<div class="cat-section">
        <h2>${CATEGORY_SECTION_LABELS[cat]}</h2>
        <div class="grid grid-2">
          ${cards}
        </div>
      </div>`;
  }).join('\n\n      ');

  return (
    head(
      'Découvrir la Suisse Normande — sites naturels, panoramas et villages',
      "Tous les sites naturels, panoramas et villages de la Suisse Normande : Roche d'Oëtre, gorges de la Rouvre, Clécy, Pont-d'Ouilly, lac de Rabodanges, Thury-Harcourt et plus encore.",
      null
    ) +
    nav('decouvrir.html') +
    `<main>
  <section class="hero page-hero">
    <div class="container">
      <p class="eyebrow">Découvrir</p>
      <h1>Les sites naturels de la Suisse Normande</h1>
      <p class="lede">Panoramas, gorges, villages de pierre et méandres de l'Orne : voici les lieux qui font la réputation du territoire, décrits par quelqu'un qui les visite régulièrement. Les fiches marquées « à confirmer sur place » seront vérifiées et complétées au fil des reportages.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      ${sections}
    </div>
  </section>
</main>

` +
    footer()
  );
}

// ---------------------------------------------------------------------
// Page : bouger.html
// ---------------------------------------------------------------------

function activiteCard(a) {
  const badge = !a.verifie
    ? '<span class="badge badge-unverified">Informations à confirmer sur place</span>'
    : '';
  return `<article class="card">
          <div class="card-head">
            <h3>${typo(a.name)}</h3>
            ${badge}
          </div>
          <p class="meta">${typo(a['où'])} · ${typo(a.saison)}</p>
          <p>${typo(a.description)}</p>
        </article>`;
}

function buildBouger(activites) {
  const cards = activites.map(activiteCard).join('\n        ');
  return (
    head(
      'Bouger en Suisse Normande — randonnée, canoë, escalade, vélo',
      "Les activités de plein air de la Suisse Normande : canoë-kayak sur l'Orne, escalade, randonnée sur le GR de Pays, VTT, pêche, Vélo Francette et Voie Verte Flers–Domfront.",
      null
    ) +
    nav('bouger.html') +
    `<main>
  <section class="hero page-hero">
    <div class="container">
      <p class="eyebrow">Bouger</p>
      <h1>Les activités de plein air du territoire</h1>
      <p class="lede">Le relief de la Suisse Normande, rare en Normandie, permet une palette d'activités inhabituelle pour la région : eau vive, escalade sur granit, vol libre et un réseau de sentiers et de voies cyclables qui relient les principaux sites.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="grid grid-2">
        ${cards}
      </div>
    </div>
  </section>
</main>

` +
    footer()
  );
}

// ---------------------------------------------------------------------
// Page : dormir-manger.html
// ---------------------------------------------------------------------

const PRO_TYPE_LABELS = {
  gite: 'Gîte',
  chambres: 'Chambres d\'hôtes',
  camping: 'Camping',
  restaurant: 'Restaurant',
};

function proCapaciteOrSpecialite(p) {
  return p.capacite ? p.capacite : p.specialite;
}

function exempleTag(p) {
  return p.exemple ? '<span class="badge badge-exemple">Fiche exemple</span>' : '';
}

function buildDormirManger(pros) {
  const pageDediee = pros.filter((p) => p.tier === 'page-dediee');
  const miseEnAvant = pros.filter((p) => p.tier === 'mise-en-avant');
  const basique = pros.filter((p) => p.tier === 'basique');

  const pageDedieeHtml = pageDediee
    .map(
      (p) => `<article class="pro-card-lg" id="${p.id}">
          <span class="type-tag">${PRO_TYPE_LABELS[p.type]}</span>
          ${exempleTag(p)}
          <h3>${typo(p.name)}</h3>
          <p class="meta">${typo(p.commune)}</p>
          <p>${typo(p.description)}</p>
          <p><strong>${typo(proCapaciteOrSpecialite(p))}</strong> · <a href="tel:${p.telephone.replace(/\s/g, '')}">${p.telephone}</a></p>
        </article>`
    )
    .join('\n        ');

  const miseEnAvantHtml = miseEnAvant
    .map(
      (p) => `<article class="pro-card-md" id="${p.id}">
          <span class="type-tag">${PRO_TYPE_LABELS[p.type]}</span>
          ${exempleTag(p)}
          <h3>${typo(p.name)}</h3>
          <p class="meta">${typo(p.commune)}</p>
          <p>${typo(p.description)}</p>
          <p>${typo(proCapaciteOrSpecialite(p))} · <a href="tel:${p.telephone.replace(/\s/g, '')}">${p.telephone}</a></p>
        </article>`
    )
    .join('\n        ');

  const basiqueHtml = basique
    .map(
      (p) => `<li id="${p.id}">
          <span class="pro-name">${typo(p.name)} <span class="pro-meta">(${PRO_TYPE_LABELS[p.type]})</span> ${exempleTag(p)}</span>
          <span class="pro-meta">${typo(p.commune)} · <a href="tel:${p.telephone.replace(/\s/g, '')}">${p.telephone}</a></span>
        </li>`
    )
    .join('\n        ');

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Annuaire des hébergements et restaurants de la Suisse Normande',
    itemListElement: pros.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${SITE_URL}dormir-manger.html#${p.id}`,
    })),
  };

  return (
    head(
      'Dormir & manger en Suisse Normande — gîtes, chambres d\'hôtes, campings, restaurants',
      "L'annuaire des hébergements et restaurants de la Suisse Normande : gîtes, chambres d'hôtes, campings et restaurants, classés par mise en avant.",
      ld
    ) +
    nav('dormir-manger.html') +
    `<main>
  <section class="hero page-hero">
    <div class="container">
      <p class="eyebrow">Dormir &amp; manger</p>
      <h1>L'annuaire du territoire</h1>
      <p class="lede">Gîtes, chambres d'hôtes, campings et restaurants de la Suisse Normande. L'annuaire est volontairement exhaustif&nbsp;: une fiche gratuite pour chaque professionnel, avec des mises en avant pour ceux qui souhaitent davantage de visibilité.</p>
      <p class="hero-note" style="margin-top:1rem;">Les fiches marquées « fiche exemple » illustrent le fonctionnement de l'annuaire en attendant les premières inscriptions réelles. <a href="pros.html" style="color:#fff; text-decoration:underline;">Vous êtes hébergeur ou restaurateur&nbsp;? Référencez-vous →</a></p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head" style="text-align:left; margin:0 0 1.5rem;">
        <p class="eyebrow">Page dédiée + reportage</p>
      </div>
      <div class="grid grid-2">
        ${pageDedieeHtml}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head" style="text-align:left; margin:0 0 1.5rem;">
        <p class="eyebrow">Mise en avant</p>
      </div>
      <div class="grid grid-2">
        ${miseEnAvantHtml}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head" style="text-align:left; margin:0 0 1.5rem;">
        <p class="eyebrow">Fiches basiques</p>
      </div>
      <ul class="pro-list">
        ${basiqueHtml}
      </ul>
    </div>
  </section>
</main>

` +
    footer()
  );
}

// ---------------------------------------------------------------------
// Page : pros.html
// ---------------------------------------------------------------------

function buildPros() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Référencement touristique local',
    provider: { '@type': 'Organization', name: 'Le Guide de la Suisse Normande' },
    areaServed: 'Suisse Normande, Orne, Normandie',
  };

  return (
    head(
      'Référencez votre établissement — Le Guide de la Suisse Normande',
      "Faites connaître votre gîte, chambre d'hôtes, camping ou restaurant sur le guide indépendant de la Suisse Normande. Fiche gratuite, mise en avant à 29 €/mois, page dédiée à 49 €/mois.",
      ld
    ) +
    nav('pros.html') +
    `<main>
  <section class="hero page-hero">
    <div class="container">
      <p class="eyebrow">Côté pros</p>
      <h1>Faites connaître votre établissement aux visiteurs du territoire</h1>
      <p class="lede">Le Guide de la Suisse Normande est écrit par un habitant du territoire, pas par une plateforme nationale. Une visibilité locale, crédible, à un prix inférieur à une seule commission de réservation.</p>
      <div class="hero-actions" style="margin-top:1.6rem;">
        <a class="btn btn-primary" href="#tarifs">Voir les tarifs</a>
        <a class="btn btn-ghost" href="#contact">Me contacter</a>
      </div>
    </div>
  </section>

  <section class="section" id="pourquoi">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Pourquoi se référencer ici</p>
        <h2>Moins cher qu'une seule commission Booking</h2>
        <p>Les gîtes et chambres d'hôtes du secteur dépendent souvent de Booking ou d'Airbnb, avec des commissions de 15 à 20&nbsp;% par nuitée, et d'annuaires nationaux impersonnels qui ne connaissent pas le territoire.</p>
      </div>
      <div class="argu-grid">
        <div class="argu-card card">
          <p class="num">01</p>
          <h3>Un interlocuteur qui habite à dix minutes</h3>
          <p>Pas de plateforme, pas de support anonyme à l'étranger&nbsp;: une personne du territoire, joignable directement, qui connaît votre établissement.</p>
        </div>
        <div class="argu-card card">
          <p class="num">02</p>
          <h3>29&nbsp;€/mois, pas 15 à 20&nbsp;% par nuitée</h3>
          <p>La mise en avant coûte moins cher qu'une seule commission de réservation sur les plateformes nationales&nbsp;: au-delà de la première réservation, c'est du bénéfice net.</p>
        </div>
        <div class="argu-card card">
          <p class="num">03</p>
          <h3>Une audience locale et qualifiée</h3>
          <p>Le guide s'adresse à des visiteurs qui préparent activement leur venue en Suisse Normande&nbsp;: une audience plus qualifiée qu'un annuaire généraliste.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="tarifs">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Tarifs</p>
        <h2>Une offre simple, du gratuit au sur-mesure</h2>
        <p>L'exhaustivité de l'annuaire fait son audience&nbsp;: la fiche de base reste gratuite pour tous les professionnels du territoire.</p>
      </div>
      <div class="pricing-grid">
        <article class="price-card">
          <h3>Fiche annuaire basique</h3>
          <p class="price-amount">Gratuit</p>
          <p class="price-desc">Nom, commune, téléphone — l'exhaustivité fait l'audience.</p>
          <a class="btn btn-outline" href="#contact">Demander ma fiche</a>
        </article>
        <article class="price-card featured">
          <h3>Fiche « Mise en avant »</h3>
          <p class="price-amount">29&nbsp;€<small>&nbsp;/ mois</small></p>
          <p class="price-desc">Photos, description rédigée, lien direct, position prioritaire dans l'annuaire.</p>
          <a class="btn btn-primary" href="#contact">Choisir « Mise en avant »</a>
        </article>
        <article class="price-card">
          <h3>Page dédiée + reportage</h3>
          <p class="price-amount">49&nbsp;€<small>&nbsp;/ mois</small></p>
          <p class="price-desc">Page complète rédigée par un professionnel, photos, mise en avant permanente.</p>
          <a class="btn btn-outline" href="#contact">Choisir « Page dédiée »</a>
        </article>
        <article class="price-card">
          <h3>Pack « tout compris »</h3>
          <p class="price-amount">Sur devis</p>
          <p class="price-desc">Fiche annuaire + site internet complet + contenus rédactionnels réguliers.</p>
          <a class="btn btn-outline" href="#contact">Demander un devis</a>
        </article>
      </div>
    </div>
  </section>

  <section class="section" id="complements">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Pour aller plus loin</p>
        <h2>Le pack « tout compris » s'appuie sur trois autres services</h2>
        <p>Chacun de ces services est autonome — vous pouvez ne prendre que la fiche annuaire, ou combiner selon vos besoins.</p>
      </div>
      <div class="crosssell-grid">
        <a class="crosssell-card" href="../agency/index.html">
          <article class="card">
            <h3>🌳 Un site internet complet</h3>
            <p>Un site vitrine sur mesure pour votre établissement, en ligne en 7 jours, par Bocage Web.</p>
            <span class="go">Voir l'offre →</span>
          </article>
        </a>
        <a class="crosssell-card" href="../redaction/index.html">
          <article class="card">
            <h3>✍️ Des contenus réguliers</h3>
            <p>Rédaction SEO et abonnement de contenu pour faire vivre votre site, par Mots d'Orne.</p>
            <span class="go">Voir l'offre →</span>
          </article>
        </a>
        <a class="crosssell-card" href="../etoiles/index.html">
          <article class="card">
            <h3>🌌 Des affiches du ciel en dépôt-vente</h3>
            <p>Les affiches « le ciel au-dessus de la Roche d'Oëtre » : une idée de dépôt-vente en boutique ou à l'accueil.</p>
            <span class="go">Voir l'offre →</span>
          </article>
        </a>
      </div>
    </div>
  </section>

  <section class="section" id="contact">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Contact</p>
        <h2>Parlons de votre établissement</h2>
        <p>Un échange de dix minutes suffit pour démarrer&nbsp;: votre fiche gratuite peut être en ligne dans la semaine.</p>
      </div>
      <div class="contact-card">
        <div>
          <strong>Téléphone</strong>
          <a href="tel:+33600000000">06 00 00 00 00<span class="placeholder-tag">à remplacer</span></a>
        </div>
        <div>
          <strong>E-mail</strong>
          <a href="mailto:contact@guide-suissenormande.fr">contact@guide-suissenormande.fr<span class="placeholder-tag">à remplacer</span></a>
        </div>
        <div>
          <strong>Zone</strong>
          <span style="font-weight:700; font-size:1.02rem;">Suisse Normande et alentours</span>
        </div>
        <div>
          <strong>Réponse</strong>
          <span style="font-weight:700; font-size:1.02rem;">Sous 48h</span>
        </div>
      </div>
    </div>
  </section>
</main>

` +
    footer()
  );
}

// ---------------------------------------------------------------------
// Vérification des liens internes / ancres avant écriture
// ---------------------------------------------------------------------

function checkInternalConsistency(lieux, pros) {
  const knownFiles = new Set(PAGES.map((p) => p.file));
  ['../agency/index.html', '../redaction/index.html', '../etoiles/index.html'].forEach((rel) => {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) {
      fail(`Lien de sortie de piste cassé : ${rel} est introuvable (${p}).`);
    }
  });
  // Les ancres référencées depuis index.html (highlights) doivent exister dans lieux.json.
  ['roche-doetre', 'clecy-village', 'lac-rabodanges'].forEach((id) => {
    if (!lieux.some((l) => l.id === id)) {
      fail(`index.html référence le lieu "${id}" qui n'existe pas dans lieux.json.`);
    }
  });
}

// ---------------------------------------------------------------------
// Exécution
// ---------------------------------------------------------------------

function main() {
  const lieux = readJson('lieux.json');
  const activites = readJson('activites.json');
  const pros = readJson('pros.json');

  validateLieux(lieux);
  validateActivites(activites);
  validatePros(pros);
  checkInternalConsistency(lieux, pros);

  const outputs = {
    'index.html': buildIndex(lieux, activites, pros),
    'decouvrir.html': buildDecouvrir(lieux),
    'bouger.html': buildBouger(activites),
    'dormir-manger.html': buildDormirManger(pros),
    'pros.html': buildPros(),
  };

  let totalKb = 0;
  Object.entries(outputs).forEach(([file, html]) => {
    const outPath = path.join(ROOT, file);
    fs.writeFileSync(outPath, html, 'utf8');
    totalKb += Buffer.byteLength(html, 'utf8') / 1024;
  });

  console.log('✓ Guide de la Suisse Normande généré avec succès.');
  console.log(`  Lieux (decouvrir.html)      : ${lieux.length}`);
  console.log(`  Activités (bouger.html)     : ${activites.length}`);
  console.log(`  Pros (dormir-manger.html)   : ${pros.length}`);
  console.log(`  Pages écrites               : ${Object.keys(outputs).join(', ')}`);
  console.log(`  Taille totale               : ${totalKb.toFixed(0)} Ko`);
  console.log('  Ouvrez territoire/index.html directement dans un navigateur (aucun serveur requis).');
}

main();
