#!/usr/bin/env node
'use strict';

/**
 * etoiles/test-astro.js
 * ----------------------
 * Vérifications de cohérence du moteur astronomique utilisé par
 * etoiles/app.template.html (temps sidéral, coordonnées horizontales).
 *
 * Les fonctions ci-dessous sont une copie volontaire de celles du modèle
 * (etoiles/app.template.html, section « Astronomie ») afin de pouvoir les
 * exécuter avec Node sans navigateur ni étape de build. Si vous modifiez la
 * formule dans l'un des deux fichiers, reportez le changement dans l'autre.
 *
 * Usage : node etoiles/test-astro.js
 * Sortie non nulle si un test échoue.
 */

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }
function norm360(deg) { let d = deg % 360; if (d < 0) d += 360; return d; }

function julianDate(utcMillis) {
  return utcMillis / 86400000 + 2440587.5;
}

function gmstDeg(jd) {
  const T = (jd - 2451545.0) / 36525;
  const g = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T - (T * T * T) / 38710000;
  return norm360(g);
}

function lstDeg(gDeg, lonDeg) {
  return norm360(gDeg + lonDeg);
}

function horizontal(raDeg, decDeg, lstD, latDeg) {
  let H = norm360(lstD - raDeg);
  if (H > 180) H -= 360;
  const Hrad = toRad(H);
  const decRad = toRad(decDeg);
  const latRad = toRad(latDeg);
  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(Hrad);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const y = Math.sin(Hrad);
  const x = Math.cos(Hrad) * Math.sin(latRad) - Math.tan(decRad) * Math.cos(latRad);
  const az = norm360(toDeg(Math.atan2(y, x)) + 180);
  return { alt: toDeg(alt), az };
}

function altAz(raDeg, decDeg, utcMillis, latDeg, lonDeg) {
  const jd = julianDate(utcMillis);
  const g = gmstDeg(jd);
  const l = lstDeg(g, lonDeg);
  return horizontal(raDeg, decDeg, l, latDeg);
}

// ----------------------------------------------------------------------
// Vérifications
// ----------------------------------------------------------------------

let failures = 0;

function check(label, condition, detail) {
  if (condition) {
    console.log(`✓ ${label} — ${detail}`);
  } else {
    console.error(`✖ ${label} — ${detail}`);
    failures++;
  }
}

console.log('--- Vérification 1 : Polaris depuis 48,8° N (RA 37,95°, Dec +89,26°) ---');
const polaris = { ra: 37.95, dec: 89.26 };
const lat48 = 48.8;
const polarisMoments = [
  ['2000-01-01 00:00 UTC, lon 0°', Date.UTC(2000, 0, 1, 0, 0), 0],
  ['2000-07-01 12:00 UTC, lon 0°', Date.UTC(2000, 6, 1, 12, 0), 0],
  ['2024-02-14 21:30 UTC, lon -0.50°', Date.UTC(2024, 1, 14, 21, 30), -0.5],
  ['2010-09-23 06:15 UTC, lon 2.35°', Date.UTC(2010, 8, 23, 6, 15), 2.35]
];
for (const [label, utc, lon] of polarisMoments) {
  const { alt, az } = altAz(polaris.ra, polaris.dec, utc, lat48, lon);
  const azFromNorth = Math.min(az, 360 - az);
  console.log(`  ${label} -> alt=${alt.toFixed(2)}°, az=${az.toFixed(2)}°`);
  check('  altitude Polaris dans la plage attendue (48.0-49.6°)', alt > 48.0 && alt < 49.6, `alt=${alt.toFixed(2)}°`);
  check('  azimut Polaris proche du nord (<5°)', azFromNorth < 5, `az=${az.toFixed(2)}°`);
}

console.log('');
console.log('--- Vérification 2 : Vega depuis Athis (48,81° N, -0,50° E), 2000-07-01 00:00 UTC ---');
const vega = { ra: 279.23, dec: 38.78 };
const vegaResult = altAz(vega.ra, vega.dec, Date.UTC(2000, 6, 1, 0, 0), 48.81, -0.50);
console.log(`  alt=${vegaResult.alt.toFixed(2)}°, az=${vegaResult.az.toFixed(2)}°`);
check('  Vega haute dans le ciel (alt > 50°)', vegaResult.alt > 50, `alt=${vegaResult.alt.toFixed(2)}°`);

console.log('');
console.log('--- Vérification 3 : étoile à dec=-60° depuis 48,8° N ne doit jamais se lever ---');
let maxAlt = -999;
let maxAltHour = null;
for (let h = 0; h < 24; h++) {
  for (const m of [0, 15, 30, 45]) {
    const utc = Date.UTC(2024, 5, 15, h, m);
    const { alt } = altAz(100, -60, utc, lat48, 0);
    if (alt > maxAlt) { maxAlt = alt; maxAltHour = `${h}h${m}`; }
  }
}
console.log(`  altitude maximale observée sur 24h (pas de 15 min) = ${maxAlt.toFixed(2)}° (à ${maxAltHour} UTC)`);
check('  étoile toujours sous l’horizon (alt < 0 en permanence)', maxAlt < 0, `max alt=${maxAlt.toFixed(2)}°`);

console.log('');
if (failures > 0) {
  console.error(`${failures} vérification(s) ont échoué.`);
  process.exit(1);
} else {
  console.log('Toutes les vérifications astronomiques ont réussi.');
}
