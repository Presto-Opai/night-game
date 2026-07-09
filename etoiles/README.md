# La Carte de Votre Ciel

Générateur d'affiches personnalisées du ciel étoilé : à partir d'une date,
d'une heure et d'un lieu, l'application calcule la position réelle de
chaque étoile visible à l'œil nu (jusqu'à magnitude 6) et produit une
affiche prête à imprimer — cadeau de naissance, de mariage, de rencontre…

## Utilisation

Ouvrez simplement `etoiles/index.html` dans un navigateur (double-clic,
aucun serveur requis). L'application est entièrement autonome : toutes les
données (catalogue d'étoiles, lignes de constellations, CSS, JavaScript)
sont intégrées dans ce seul fichier, sans aucune requête réseau.

## Reconstruire `index.html` après une modification

`index.html` est un fichier **généré**. Ne le modifiez jamais directement :
vos changements seraient perdus au prochain build. Modifiez plutôt
`etoiles/app.template.html`, puis régénérez :

```bash
node etoiles/build.js
```

Le script lit `etoiles/app.template.html`, injecte le contenu de
`etoiles/data/stars.6.json` et `etoiles/data/constellations.lines.json` à la
place des marqueurs `/*__STARS_JSON__*/` et `/*__CONSTELLATIONS_JSON__*/`,
et écrit `etoiles/index.html`. Aucune dépendance npm n'est nécessaire (Node
natif uniquement : `fs`, `path`).

## Vérifier le moteur astronomique

Les formules (temps sidéral, coordonnées horizontales, projection) sont
dupliquées dans `etoiles/test-astro.js` pour pouvoir être testées sans
navigateur :

```bash
node etoiles/test-astro.js
```

Ce script vérifie notamment que :

- Polaris reste, vue de 48,8° N, à une altitude proche de la latitude du
  lieu (~48–49,5°) et à un azimut proche du nord, quelle que soit l'heure ;
- Vega, vue d'Athis-Val-de-Rouvre le 2000-07-01 à 00h00 UTC, est haute dans
  le ciel (altitude > 50°) ;
- une étoile de déclinaison -60° ne se lève jamais vue de 48,8° N.

**Important** : les fonctions astronomiques existent à deux endroits
(`etoiles/app.template.html`, section « Astronomie », et
`etoiles/test-astro.js`). Si vous corrigez une formule, reportez le
changement dans les deux fichiers.

## Provenance des données

- `etoiles/data/stars.6.json` — catalogue d'environ 5 000 étoiles jusqu'à
  magnitude 6 (position, magnitude, indice de couleur B−V), au format
  GeoJSON.
- `etoiles/data/constellations.lines.json` — tracé des lignes de
  constellations, au format GeoJSON (MultiLineString).

Ces deux fichiers proviennent du projet [d3-celestial](https://github.com/ofrohn/d3-celestial),
qui les dérive lui-même de la base **HYG** (Hipparcos, Yale Bright Star
Catalog, Gliese). La base HYG est publiée sous licence **CC BY-SA 2.5** —
une ligne d'attribution discrète figure au pied de l'application et sur
chaque affiche générée (« Données étoiles : catalogue HYG (CC BY-SA 2.5)
via d3-celestial »). Conservez cette mention si vous redistribuez le
produit.

Convention de coordonnées : l'ascension droite (RA) de ces fichiers est
exprimée en degrés, parfois négative (`[-180, 180]`, convention
d3-celestial). Le code la normalise systématiquement vers `[0, 360)` avant
tout calcul (`if (ra < 0) ra += 360`).

## Ajouter un lieu prédéfini

Dans `etoiles/app.template.html`, repérez le tableau `PLACES` (section
« Lieux prédéfinis ») dans le `<script>` :

```js
var PLACES = [
  { name: "Athis-Val-de-Rouvre", lat: 48.81, lon: -0.50 },
  { name: "Flers", lat: 48.7500, lon: -0.5667 },
  // ...
  { name: "Votre Ville", lat: 00.0000, lon: 0.0000 },
];
```

Ajoutez une entrée `{ name, lat, lon }` (longitude Est positive), puis
relancez `node etoiles/build.js`. Le nouveau lieu apparaît automatiquement
dans le menu déroulant « Lieu », et pré-remplit latitude, longitude et
libellé (modifiables ensuite à la main).

## Recommandations d'impression

- **Format** : le viewBox de l'affiche est en ratio portrait 3:4
  (1500 × 2000), compatible A2 (420 × 594 mm), A3 (297 × 420 mm) ou tout
  format proche de ce ratio.
- **Résolution** : préférez l'export **SVG** pour toute impression
  professionnelle (vectoriel, net à n'importe quelle taille). L'export
  **PNG** (3000 × 4000 px) convient pour une impression A2 à ~180 dpi ou
  A3 à ~250 dpi ; pour du 300 dpi sur A2, l'export SVG reste le choix le
  plus sûr.
- **Papier** : un papier **mat** (type « musée » ou « archive ») évite les
  reflets sur le fond sombre et restitue mieux les nuances subtiles des
  thèmes « Nuit profonde » et « Noir & or ».
- **Profil couleur** : conservez un flux sRGB jusqu'à l'imprimeur ; les
  fonds très sombres sont sensibles aux conversions CMJN mal calibrées
  (préférer un imprimeur habitué aux aplats noirs profonds).

## Approximations connues

- La réfraction atmosphérique n'est pas prise en compte (négligeable pour
  un objet-affiche, sensible uniquement très près de l'horizon).
- Pas de correction de nutation/aberration/parallaxe annuelle : suffisant
  pour un rendu visuel fidèle sur toute la période couverte par le
  catalogue HYG.
- Le redimensionnement automatique du titre/sous-titre/ligne d'info selon
  leur longueur est une heuristique par paliers (pas un habillage de texte
  multi-lignes) : au-delà d'une soixantaine de caractères, préférez un
  message plus court pour un rendu optimal.
