#!/usr/bin/env node
'use strict';

/**
 * factory/build.js
 * -----------------
 * Générateur de sites statiques — zéro dépendance npm.
 *
 * Lit chaque fichier factory/clients/*.json et génère un site autonome
 * (HTML + CSS inline, aucune requête externe) dans demos/<slug>/index.html.
 * Génère aussi demos/index.html, une page listant toutes les démos.
 *
 * Usage : node factory/build.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CLIENTS_DIR = path.join(__dirname, 'clients');
const DEMOS_DIR = path.join(ROOT_DIR, 'demos');

// ----------------------------------------------------------------------
// Utilitaires texte / HTML
// ----------------------------------------------------------------------

/** Échappe les caractères spéciaux HTML. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Applique une typographie française basique : espace insécable avant
 * : ; ! ? et à l'intérieur des « guillemets ».
 * Doit être appliqué AVANT l'échappement HTML (sur du texte brut).
 */
function frenchTypography(str) {
  return String(str)
    .replace(/\s*([;:!?])/g, ' $1')
    .replace(/«\s*/g, '« ')
    .replace(/\s*»/g, ' »');
}

/** Texte affichable : typographie FR + échappement HTML. */
function t(str) {
  return escapeHtml(frenchTypography(str));
}

/** Tronque un texte à `maxLength` caractères, sur une frontière de mot, avec une ellipse. */
function truncate(str, maxLength) {
  const clean = String(str).trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  const safeCut = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return `${safeCut.replace(/[,;:.\s]+$/, '')}…`;
}

/** Échappe une chaîne pour l'insérer dans un bloc <script type="application/ld+json">. */
function safeJsonLd(obj) {
  return JSON.stringify(obj, null, 2).replace(/</g, '\\u003c');
}

// ----------------------------------------------------------------------
// Validation de configuration
// ----------------------------------------------------------------------

const VALID_THEMES = ['artisan', 'gourmand', 'sejour'];

class ConfigError extends Error {}

function validateConfig(config, fileName) {
  const errors = [];

  const requireField = (field, type) => {
    const value = config[field];
    if (value === undefined || value === null || value === '') {
      errors.push(`le champ "${field}" est requis`);
      return;
    }
    if (type === 'string' && typeof value !== 'string') {
      errors.push(`le champ "${field}" doit être une chaîne de caractères`);
    }
    if (type === 'array' && !Array.isArray(value)) {
      errors.push(`le champ "${field}" doit être un tableau`);
    }
  };

  requireField('businessName', 'string');
  requireField('slug', 'string');
  requireField('metier', 'string');
  requireField('theme', 'string');
  requireField('tagline', 'string');
  requireField('town', 'string');
  requireField('phone', 'string');
  requireField('email', 'string');
  requireField('address', 'string');
  requireField('description');
  requireField('services', 'array');
  requireField('openingHours', 'array');
  requireField('testimonials', 'array');
  requireField('siret', 'string');

  if (config.description !== undefined) {
    const okString = typeof config.description === 'string';
    const okArray = Array.isArray(config.description) && config.description.every((p) => typeof p === 'string');
    if (!okString && !okArray) {
      errors.push('le champ "description" doit être une chaîne de caractères ou un tableau de chaînes');
    }
  }

  if (typeof config.slug === 'string' && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(config.slug)) {
    errors.push('le champ "slug" doit être en minuscules sans espaces ni accents, avec des tirets (ex. "plomberie-lecomte")');
  }

  if (typeof config.theme === 'string' && !VALID_THEMES.includes(config.theme)) {
    errors.push(`le champ "theme" doit être l'un de : ${VALID_THEMES.join(', ')} (reçu : "${config.theme}")`);
  }

  if (typeof config.email === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
    errors.push('le champ "email" ne ressemble pas à une adresse e-mail valide');
  }

  if (Array.isArray(config.services)) {
    if (config.services.length === 0) {
      errors.push('le champ "services" ne doit pas être vide (au moins un service)');
    }
    config.services.forEach((s, i) => {
      if (!s || typeof s.name !== 'string' || typeof s.description !== 'string') {
        errors.push(`services[${i}] doit contenir "name" et "description" (chaînes de caractères)`);
      }
    });
  }

  if (Array.isArray(config.testimonials)) {
    if (config.testimonials.length === 0) {
      errors.push('le champ "testimonials" ne doit pas être vide (au moins un avis client)');
    }
    config.testimonials.forEach((tm, i) => {
      if (!tm || typeof tm.author !== 'string' || typeof tm.text !== 'string') {
        errors.push(`testimonials[${i}] doit contenir "author" et "text" (chaînes de caractères)`);
      }
    });
  }

  if (Array.isArray(config.openingHours)) {
    if (config.openingHours.length === 0) {
      errors.push('le champ "openingHours" ne doit pas être vide');
    }
    config.openingHours.forEach((h, i) => {
      if (typeof h !== 'string') {
        errors.push(`openingHours[${i}] doit être une chaîne de caractères`);
      }
    });
  }

  if (config.colors !== undefined) {
    if (typeof config.colors !== 'object' || Array.isArray(config.colors) || config.colors === null) {
      errors.push('le champ "colors" doit être un objet de la forme { "primary": "#RRGGBB", "accent": "#RRGGBB" }');
    } else {
      ['primary', 'accent'].forEach((key) => {
        if (config.colors[key] !== undefined && typeof config.colors[key] !== 'string') {
          errors.push(`colors.${key} doit être une chaîne de caractères (code couleur CSS)`);
        }
      });
    }
  }

  if (errors.length > 0) {
    const message = [`Configuration invalide dans "${fileName}" :`]
      .concat(errors.map((e) => `  - ${e}`))
      .join('\n');
    throw new ConfigError(message);
  }
}

// ----------------------------------------------------------------------
// Thèmes visuels
// ----------------------------------------------------------------------

const THEMES = {
  artisan: {
    label: 'Artisan',
    schemaType: 'HomeAndConstructionBusiness',
    fontHeading: "'Segoe UI', Arial, 'Helvetica Neue', sans-serif",
    fontBody: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
    headingWeight: '800',
    headingTransform: 'uppercase',
    letterSpacing: '0.02em',
    primary: '#1f2d3d',
    primaryDark: '#131c26',
    accent: '#e8622c',
    background: '#f2f4f6',
    surface: '#ffffff',
    text: '#1f2d3d',
    textMuted: '#4c5a68',
    heroText: '#ffffff',
    radius: '4px',
    radiusLg: '6px',
    cardBorder: '3px solid var(--primary)',
    heroPattern:
      'repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 18px, rgba(255,255,255,0) 18px 36px), linear-gradient(160deg, var(--primary-dark), var(--primary))',
    emoji: '🔧',
    serviceIcons: ['🔧', '🛠️', '🚰', '🔩', '⚙️', '🧰'],
  },
  gourmand: {
    label: 'Gourmand',
    schemaType: 'FoodEstablishment',
    fontHeading: "Georgia, 'Times New Roman', serif",
    fontBody: "Georgia, 'Times New Roman', serif",
    headingWeight: '700',
    headingTransform: 'none',
    letterSpacing: '0.01em',
    primary: '#6b1f2a',
    primaryDark: '#4b141c',
    accent: '#c8952a',
    background: '#fbf3e7',
    surface: '#fffaf1',
    text: '#3a2418',
    textMuted: '#6b5544',
    heroText: '#fff8ec',
    radius: '18px',
    radiusLg: '28px',
    cardBorder: '1px solid rgba(107,31,42,0.15)',
    heroPattern:
      'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.10) 0, rgba(255,255,255,0.10) 2px, transparent 3px), radial-gradient(circle at 85% 70%, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 2px, transparent 3px), linear-gradient(150deg, var(--primary-dark), var(--primary))',
    emoji: '🥖',
    serviceIcons: ['🥖', '🥐', '🍰', '🧁', '🍞', '🥧'],
  },
  sejour: {
    label: 'Séjour',
    schemaType: 'LodgingBusiness',
    fontHeading: "'Helvetica Neue', Arial, sans-serif",
    fontBody: "'Helvetica Neue', Arial, sans-serif",
    headingWeight: '500',
    headingTransform: 'none',
    letterSpacing: '0.03em',
    primary: '#4b7a52',
    primaryDark: '#345638',
    accent: '#d9c48f',
    background: '#f6f4ee',
    surface: '#ffffff',
    text: '#33402f',
    textMuted: '#5c6b56',
    heroText: '#ffffff',
    radius: '24px',
    radiusLg: '32px',
    cardBorder: '1px solid rgba(75,122,82,0.18)',
    heroPattern:
      'radial-gradient(ellipse at 20% 100%, rgba(255,255,255,0.12), transparent 55%), radial-gradient(ellipse at 90% 0%, rgba(255,255,255,0.10), transparent 50%), linear-gradient(160deg, var(--primary-dark), var(--primary))',
    emoji: '🌿',
    serviceIcons: ['🌿', '🛏️', '🚲', '🧺', '🌳', '🚣'],
  },
};

// ----------------------------------------------------------------------
// Aides diverses
// ----------------------------------------------------------------------

function toTelHref(phone) {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return `tel:${digits}`;
  if (digits.startsWith('0')) return `tel:+33${digits.slice(1)}`;
  return `tel:${digits}`;
}

function toMailtoHref(email) {
  return `mailto:${email}`;
}

function descriptionParagraphs(description) {
  return Array.isArray(description) ? description : [description];
}

function faviconDataUri(theme) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="12" fill="${theme.primary}"/>` +
    `<text x="32" y="42" font-size="32" text-anchor="middle">${theme.emoji}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ----------------------------------------------------------------------
// Génération du CSS (par thème)
// ----------------------------------------------------------------------

function buildCss(theme) {
  return `
    :root {
      --primary: ${theme.primary};
      --primary-dark: ${theme.primaryDark};
      --accent: ${theme.accent};
      --background: ${theme.background};
      --surface: ${theme.surface};
      --text: ${theme.text};
      --text-muted: ${theme.textMuted};
      --hero-text: ${theme.heroText};
      --radius: ${theme.radius};
      --radius-lg: ${theme.radiusLg};
      --font-heading: ${theme.fontHeading};
      --font-body: ${theme.fontBody};
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: var(--font-body);
      color: var(--text);
      background: var(--background);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    img { max-width: 100%; display: block; }
    a { color: var(--primary); }
    h1, h2, h3 {
      font-family: var(--font-heading);
      font-weight: ${theme.headingWeight};
      text-transform: ${theme.headingTransform};
      letter-spacing: ${theme.letterSpacing};
      color: var(--text);
      margin: 0 0 0.6em;
      line-height: 1.2;
    }
    h2 { font-size: clamp(1.5rem, 1.1rem + 1.6vw, 2.1rem); margin-bottom: 1em; }
    h3 { font-size: 1.15rem; }
    p { margin: 0 0 1em; }
    .section { padding: 3.5rem 1.25rem; max-width: 1080px; margin: 0 auto; }
    .section > h2 { text-align: center; }
    .visually-hidden {
      position: absolute; width: 1px; height: 1px; overflow: hidden;
      clip: rect(0,0,0,0); white-space: nowrap;
    }

    /* ---- En-tête / hero ---- */
    .hero {
      background: ${theme.heroPattern};
      color: var(--hero-text);
      text-align: center;
    }
    .hero-inner { padding: 4.5rem 1.25rem 3rem; max-width: 780px; margin: 0 auto; }
    .hero-eyebrow {
      display: inline-block;
      font-size: 0.85rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(255,255,255,0.14);
      padding: 0.35em 0.9em;
      border-radius: 999px;
      margin-bottom: 1.4em;
    }
    .hero h1 {
      color: var(--hero-text);
      font-size: clamp(2rem, 1.5rem + 2.5vw, 3.1rem);
      margin-bottom: 0.35em;
    }
    .hero-tagline {
      font-size: clamp(1.05rem, 1rem + 0.5vw, 1.35rem);
      opacity: 0.92;
      max-width: 46ch;
      margin: 0 auto 2em;
    }
    .hero-cta { display: flex; flex-wrap: wrap; gap: 0.85rem; justify-content: center; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5em;
      padding: 0.85em 1.6em;
      border-radius: var(--radius);
      text-decoration: none;
      font-weight: 700;
      font-family: var(--font-body);
      font-size: 1rem;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      border: 2px solid transparent;
    }
    .btn:hover { transform: translateY(-2px); }
    .btn-primary { background: var(--accent); color: #1a1108; }
    .btn-primary:hover { box-shadow: 0 10px 24px -8px rgba(0,0,0,0.45); }
    .btn-ghost { background: transparent; color: var(--hero-text); border-color: rgba(255,255,255,0.55); }
    .btn-ghost:hover { background: rgba(255,255,255,0.12); }

    .hero-nav {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.4rem 1.4rem;
      background: rgba(0,0,0,0.16);
      padding: 0.9rem 1rem;
    }
    .hero-nav a {
      color: var(--hero-text);
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 600;
      opacity: 0.9;
      padding: 0.2em 0.1em;
      border-bottom: 2px solid transparent;
    }
    .hero-nav a:hover { opacity: 1; border-bottom-color: var(--accent); }

    /* ---- Grilles génériques ---- */
    .grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: 1fr;
    }
    @media (min-width: 640px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 960px) {
      .grid-services { grid-template-columns: repeat(3, 1fr); }
    }

    /* ---- Services ---- */
    .services { background: var(--surface); border-radius: var(--radius-lg); }
    .card {
      background: var(--background);
      border: ${theme.cardBorder};
      border-radius: var(--radius);
      padding: 1.6rem;
    }
    .card-icon { font-size: 1.8rem; margin-bottom: 0.5rem; }
    .card h3 { margin-bottom: 0.4em; }
    .card p { color: var(--text-muted); margin-bottom: 0; }

    /* ---- À propos ---- */
    .about { text-align: center; }
    .about-copy { max-width: 68ch; margin: 0 auto; text-align: left; }
    .about-copy p { color: var(--text-muted); }

    /* ---- Avis clients ---- */
    .testimonials { background: var(--surface); border-radius: var(--radius-lg); }
    .testimonial {
      margin: 0;
      background: var(--background);
      border-radius: var(--radius);
      padding: 1.6rem;
      border: ${theme.cardBorder};
    }
    .testimonial p { font-style: italic; color: var(--text); margin-bottom: 0.75em; }
    .testimonial p::before { content: '\\201C'; }
    .testimonial p::after { content: '\\201D'; }
    .testimonial cite { font-style: normal; font-weight: 700; color: var(--primary); font-size: 0.95rem; }

    /* ---- Horaires ---- */
    .hours-list {
      list-style: none;
      margin: 0 auto;
      padding: 0;
      max-width: 560px;
      display: grid;
      gap: 0.6rem;
    }
    .hours-list li {
      background: var(--surface);
      border-radius: var(--radius);
      border: ${theme.cardBorder};
      padding: 0.85em 1.2em;
      font-weight: 600;
    }

    /* ---- Contact ---- */
    .contact-grid {
      display: grid;
      gap: 2rem;
      grid-template-columns: 1fr;
      align-items: center;
    }
    @media (min-width: 720px) {
      .contact-grid { grid-template-columns: 1.2fr 1fr; }
    }
    .contact-grid a { color: var(--primary); text-decoration: none; font-weight: 700; }
    .contact-grid a:hover { text-decoration: underline; }
    .contact-grid strong { display: block; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 0.2em; }
    .contact-card {
      background: var(--surface);
      border: ${theme.cardBorder};
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      display: grid;
      gap: 1.25rem;
    }
    .contact-visual {
      aspect-ratio: 4 / 3;
      border-radius: var(--radius-lg);
      background: ${theme.heroPattern};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
    }

    /* ---- Pied de page ---- */
    .site-footer {
      background: var(--primary-dark);
      color: rgba(255,255,255,0.85);
      padding: 2.5rem 1.25rem 1.75rem;
    }
    .footer-legal {
      max-width: 780px;
      margin: 0 auto;
      font-size: 0.85rem;
      border-top: 1px solid rgba(255,255,255,0.18);
      padding-top: 1.5rem;
    }
    .footer-legal h2 {
      color: rgba(255,255,255,0.9);
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .footer-legal p { color: rgba(255,255,255,0.65); margin-bottom: 0; }
    .footer-credit {
      text-align: center;
      max-width: 780px;
      margin: 1.5rem auto 0;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.5);
    }
    .footer-credit a { color: rgba(255,255,255,0.7); }
  `.trim();
}

// ----------------------------------------------------------------------
// Génération du HTML
// ----------------------------------------------------------------------

function renderServices(services, theme) {
  const cards = services
    .map((s, i) => {
      const icon = theme.serviceIcons[i % theme.serviceIcons.length];
      return `
        <article class="card">
          <div class="card-icon" aria-hidden="true">${icon}</div>
          <h3>${t(s.name)}</h3>
          <p>${t(s.description)}</p>
        </article>`;
    })
    .join('\n');
  return `
    <section id="services" class="section services">
      <h2>Nos services</h2>
      <div class="grid grid-services">
        ${cards}
      </div>
    </section>`;
}

function renderAbout(description, businessName) {
  const paragraphs = descriptionParagraphs(description)
    .map((p) => `<p>${t(p)}</p>`)
    .join('\n');
  return `
    <section id="apropos" class="section about">
      <h2>À propos de ${t(businessName)}</h2>
      <div class="about-copy">
        ${paragraphs}
      </div>
    </section>`;
}

function renderTestimonials(testimonials) {
  const items = testimonials
    .map(
      (tm) => `
        <blockquote class="testimonial">
          <p>${t(tm.text)}</p>
          <cite>— ${t(tm.author)}</cite>
        </blockquote>`
    )
    .join('\n');
  return `
    <section id="avis" class="section testimonials">
      <h2>Ils nous font confiance</h2>
      <div class="grid">
        ${items}
      </div>
    </section>`;
}

function renderHours(openingHours) {
  const items = openingHours.map((h) => `<li>${t(h)}</li>`).join('\n');
  return `
    <section id="horaires" class="section hours">
      <h2>Horaires d'ouverture</h2>
      <ul class="hours-list">
        ${items}
      </ul>
    </section>`;
}

function renderContact(config, theme, telHref, mailtoHref) {
  return `
    <section id="contact" class="section contact">
      <h2>Contact</h2>
      <div class="contact-grid">
        <div class="contact-card">
          <div>
            <strong>Adresse</strong>
            ${t(config.address)}
          </div>
          <div>
            <strong>Téléphone</strong>
            <a href="${telHref}">${t(config.phone)}</a>
          </div>
          <div>
            <strong>E-mail</strong>
            <a href="${mailtoHref}">${t(config.email)}</a>
          </div>
        </div>
        <div class="contact-visual" aria-hidden="true">${theme.emoji}</div>
      </div>
    </section>`;
}

function renderFooter(config) {
  return `
    <footer class="site-footer">
      <div class="footer-legal">
        <h2>Mentions légales</h2>
        <p>
          ${t(config.businessName)} — ${t(config.address)}<br>
          SIRET : ${t(config.siret)}<br>
          Hébergement : à compléter lors de la mise en ligne (ex. Netlify Ireland / France).
        </p>
      </div>
      <p class="footer-credit">Site conçu par <a href="../../agency/">Bocage Web</a></p>
    </footer>`;
}

function buildJsonLd(config, theme, telHref) {
  const data = {
    '@context': 'https://schema.org',
    '@type': theme.schemaType,
    name: config.businessName,
    description: descriptionParagraphs(config.description).join(' '),
    telephone: telHref.replace('tel:', ''),
    email: config.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.address,
      addressLocality: config.town,
      addressCountry: 'FR',
    },
    areaServed: config.town,
  };
  return safeJsonLd(data);
}

function renderPage(config) {
  const theme = THEMES[config.theme];
  const telHref = toTelHref(config.phone);
  const mailtoHref = toMailtoHref(config.email);
  const title = `${config.businessName} — ${config.metier} à ${config.town}`;
  const metaDescription = frenchTypography(
    truncate(descriptionParagraphs(config.description)[0], 155)
  );
  const jsonLd = buildJsonLd(config, theme, telHref);
  const css = buildCss(theme);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaDescription)}">
<meta name="robots" content="index, follow">
<link rel="icon" href="${faviconDataUri(theme)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(metaDescription)}">
<meta property="og:site_name" content="${escapeHtml(config.businessName)}">
<script type="application/ld+json">
${jsonLd}
</script>
<style>
${css}
</style>
</head>
<body data-theme="${config.theme}">
<header class="hero">
  <div class="hero-inner">
    <p class="hero-eyebrow">📍 ${t(config.town)}</p>
    <h1>${t(config.businessName)}</h1>
    <p class="hero-tagline">${t(config.tagline)}</p>
    <div class="hero-cta">
      <a class="btn btn-primary" href="${telHref}">📞 Appeler — ${t(config.phone)}</a>
      <a class="btn btn-ghost" href="#contact">Nous contacter</a>
    </div>
  </div>
  <nav class="hero-nav" aria-label="Navigation principale">
    <a href="#services">Services</a>
    <a href="#apropos">À propos</a>
    <a href="#avis">Avis</a>
    <a href="#horaires">Horaires</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
<main>
${renderServices(config.services, theme)}
${renderAbout(config.description, config.businessName)}
${renderTestimonials(config.testimonials)}
${renderHours(config.openingHours)}
${renderContact(config, theme, telHref, mailtoHref)}
</main>
${renderFooter(config)}
</body>
</html>
`;
}

// ----------------------------------------------------------------------
// Page d'index des démos
// ----------------------------------------------------------------------

function renderDemosIndex(sites) {
  const cards = sites
    .map((site) => {
      const theme = THEMES[site.theme];
      return `
        <a class="demo-card" href="./${site.slug}/" style="--accent:${theme.accent};--primary:${theme.primary};">
          <span class="demo-badge">${theme.label}</span>
          <h2>${t(site.businessName)}</h2>
          <p>${t(site.metier)} · ${t(site.town)}</p>
        </a>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Démos — Bocage Web</title>
<meta name="description" content="Exemples de sites internet créés pour des artisans, commerces et gîtes du bocage normand.">
<meta name="robots" content="index, follow">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    background: #f4f5f2;
    color: #223022;
    line-height: 1.6;
  }
  header {
    background: linear-gradient(150deg, #345638, #4b7a52);
    color: #fff;
    padding: 3.5rem 1.25rem;
    text-align: center;
  }
  header h1 { margin: 0 0 0.4em; font-size: clamp(1.8rem, 1.4rem + 2vw, 2.6rem); }
  header p { margin: 0; opacity: 0.9; max-width: 60ch; margin: 0 auto; }
  main { max-width: 1000px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
  .demo-grid { display: grid; gap: 1.5rem; grid-template-columns: 1fr; }
  @media (min-width: 720px) { .demo-grid { grid-template-columns: repeat(3, 1fr); } }
  .demo-card {
    display: block;
    background: #fff;
    border-radius: 14px;
    padding: 1.75rem;
    text-decoration: none;
    color: inherit;
    border-top: 6px solid var(--primary, #345638);
    box-shadow: 0 8px 24px -12px rgba(0,0,0,0.25);
    transition: transform 0.15s ease;
  }
  .demo-card:hover { transform: translateY(-4px); }
  .demo-badge {
    display: inline-block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;
    color: var(--primary, #345638);
    background: #eef1ea;
    padding: 0.25em 0.75em;
    border-radius: 999px;
    margin-bottom: 0.9em;
  }
  .demo-card h2 { margin: 0 0 0.3em; font-size: 1.25rem; }
  .demo-card p { margin: 0; color: #55604f; font-size: 0.95rem; }
  footer { text-align: center; padding: 2rem 1.25rem; color: #778071; font-size: 0.85rem; }
  footer a { color: #345638; }
</style>
</head>
<body>
<header>
  <h1>Nos réalisations</h1>
  <p>Trois exemples de sites générés avec la fabrique Bocage Web, pour un artisan, un commerce gourmand et un gîte du bocage normand.</p>
</header>
<main>
  <div class="demo-grid">
    ${cards}
  </div>
</main>
<footer>
  <p>Envie du même site pour votre activité&nbsp;? <a href="../agency/">Découvrir l'offre Bocage Web</a></p>
</footer>
</body>
</html>
`;
}

// ----------------------------------------------------------------------
// Orchestration
// ----------------------------------------------------------------------

function main() {
  if (!fs.existsSync(CLIENTS_DIR)) {
    console.error(`Erreur : le dossier "${path.relative(ROOT_DIR, CLIENTS_DIR)}" est introuvable.`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(CLIENTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    console.error(`Erreur : aucun fichier de configuration trouvé dans "${path.relative(ROOT_DIR, CLIENTS_DIR)}".`);
    process.exit(1);
  }

  fs.mkdirSync(DEMOS_DIR, { recursive: true });

  const generated = [];
  let hasError = false;

  for (const file of files) {
    const filePath = path.join(CLIENTS_DIR, file);
    let config;

    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      try {
        config = JSON.parse(raw);
      } catch (parseErr) {
        throw new ConfigError(`Configuration invalide dans "${file}" :\n  - JSON illisible (${parseErr.message})`);
      }
      validateConfig(config, file);

      const html = renderPage(config);
      const outDir = path.join(DEMOS_DIR, config.slug);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');

      generated.push({
        file,
        slug: config.slug,
        businessName: config.businessName,
        metier: config.metier,
        town: config.town,
        theme: config.theme,
      });
    } catch (err) {
      hasError = true;
      if (err instanceof ConfigError) {
        console.error(`\n✖ ${err.message}\n`);
      } else {
        console.error(`\n✖ Erreur inattendue lors du traitement de "${file}" : ${err.message}\n`);
      }
    }
  }

  if (generated.length > 0) {
    const indexHtml = renderDemosIndex(generated);
    fs.writeFileSync(path.join(DEMOS_DIR, 'index.html'), indexHtml, 'utf8');
  }

  console.log('--------------------------------------------------');
  console.log(`Fabrique de sites — ${generated.length}/${files.length} site(s) généré(s)`);
  console.log('--------------------------------------------------');
  for (const site of generated) {
    console.log(`  ✔ ${site.businessName} (${site.theme}) → demos/${site.slug}/index.html`);
  }
  if (generated.length > 0) {
    console.log(`  ✔ Index des démos → demos/index.html`);
  }
  console.log('--------------------------------------------------');

  if (hasError) {
    console.error("Le build s'est terminé avec des erreurs de configuration. Corrigez les fichiers signalés ci-dessus.");
    process.exit(1);
  }

  process.exit(0);
}

main();
