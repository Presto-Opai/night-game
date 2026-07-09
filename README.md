# Objectif 40 000 € en 6 mois — trois pistes, un dépôt

Ce dépôt contient **trois activités complémentaires**, chacune avec son outil
et son plan d'affaires. Elles partagent la même clientèle et se renforcent
mutuellement (un client site devient client contenu, les articles SEO font
vivre la boutique de cartes du ciel, etc.).

| Piste | Quoi | Outils | Plan |
|---|---|---|---|
| 1. Sites locaux | Vendre des sites aux artisans, restaurants et gîtes du bocage | [`agency/`](./agency/index.html) (vitrine), [`factory/`](./factory/build.js) (fabrique), [`demos/`](./demos/index.html) | [`PLAN.md`](./PLAN.md) |
| 2. Rédaction web | Passer des articles « au mot » aux abonnements de contenu SEO | [`redaction/index.html`](./redaction/index.html) (offre), [`redaction/studio.html`](./redaction/studio.html) (Studio SEO privé) | [`PLAN-REDACTION.md`](./PLAN-REDACTION.md) |
| 3. Cartes du ciel | Produit cadeau : l'affiche du vrai ciel d'une nuit précise | [`etoiles/index.html`](./etoiles/index.html) (générateur, `node etoiles/build.js` pour régénérer) | [`PLAN-ETOILES.md`](./PLAN-ETOILES.md) |

La piste 2 s'appuie sur l'activité existante de micro-entrepreneur en
rédaction web (rien à créer administrativement). La piste 3 est la plus
risquée mais vise la saison des cadeaux (octobre–décembre) ; sa production
par commande est quasi nulle. Tous les outils sont autonomes : aucun
`npm install`, aucune requête externe, tout fonctionne hors ligne.

---

## Piste 1 — Bocage Web, fabrique de sites pour artisans et commerces

Tout ce qu'il faut pour vendre et livrer des sites internet à des artisans,
restaurants et gîtes du bocage normand en quelques heures de travail par
client :

1. **`agency/`** — la vitrine de l'activité elle-même (« Bocage Web »), la
   page qui sert à vendre l'offre aux prospects.
2. **`factory/`** — un générateur de sites statiques (zéro dépendance npm)
   qui transforme un fichier de configuration JSON en site complet et
   autonome, livré dans `demos/`.
3. **`demos/`** — les sites générés, y compris trois exemples fictifs mais
   réalistes utilisés comme démonstrations commerciales.

Pour le plan d'affaires complet (objectifs financiers, script de
prospection, cadre légal), voir **[`PLAN.md`](./PLAN.md)**.

## L'offre

| Prestation | Prix | Contenu |
|---|---|---|
| Site « Essentiel » | 990 € | Site vitrine 1 page longue : présentation, services, avis, horaires, contact, mentions légales, référencement local de base |
| Site « Pro » | 1 490 € | Essentiel + galerie photos, formulaire de demande de devis, page par service, suivi statistiques |
| Maintenance & hébergement | 49 €/mois | Hébergement, nom de domaine, modifications mineures (2/mois), sauvegardes |
| Fiche Google Business | 290 € | Création/optimisation de la fiche Google Maps + stratégie d'avis clients |

## Démarrage rapide

Aucune installation n'est nécessaire : le générateur n'utilise que les
modules natifs de Node.js (`fs`, `path`), aucun `npm install` requis.

```bash
node factory/build.js
```

Le script :

- lit chaque fichier `factory/clients/*.json` ;
- génère un site complet et autonome dans `demos/<slug>/index.html` (HTML +
  CSS inline, aucune requête externe) ;
- génère `demos/index.html`, une page listant toutes les démonstrations ;
- affiche un résumé de ce qui a été généré ;
- s'arrête avec un code de sortie différent de zéro et un message d'erreur
  en français si une configuration est invalide (champ manquant, thème
  inconnu, JSON illisible, etc.).

Le site de l'agence (`agency/index.html`) n'est pas généré : c'est un fichier
HTML autonome à modifier directement (voir plus bas les valeurs à
personnaliser).

## Ajouter un nouveau client

1. Copier un fichier existant dans `factory/clients/` (par exemple
   `factory/clients/plomberie-lecomte.json`) comme point de départ.
2. Remplir les champs avec les informations du client (voir le schéma
   détaillé ci-dessous).
3. Lancer `node factory/build.js`.
4. Vérifier le rendu dans `demos/<slug>/index.html` (ouvrir le fichier dans
   un navigateur).
5. Déployer (voir la section « Déploiement »).

### Schéma de configuration

Chaque fichier `factory/clients/*.json` doit être un objet JSON avec les
champs suivants.

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `businessName` | chaîne | oui | Nom de l'entreprise, tel qu'il doit apparaître partout sur le site. |
| `slug` | chaîne | oui | Identifiant d'URL, en minuscules, avec des tirets, sans accents (ex. `"plomberie-lecomte"`). Détermine le dossier de sortie `demos/<slug>/`. |
| `metier` | chaîne | oui | Intitulé du métier, utilisé dans le `<title>` de la page (« *Entreprise — métier à ville* »). |
| `theme` | chaîne | oui | L'un des trois thèmes visuels : `"artisan"`, `"gourmand"` ou `"sejour"` (voir description ci-dessous). |
| `tagline` | chaîne | oui | Phrase d'accroche affichée dans le hero, sous le nom de l'entreprise. |
| `town` | chaîne | oui | Ville principale d'activité (affichée dans le hero et utilisée dans le `<title>` et les données structurées). |
| `phone` | chaîne | oui | Numéro de téléphone au format lisible (ex. `"02 33 64 12 47"`). Converti automatiquement en lien `tel:+33...` cliquable. |
| `email` | chaîne | oui | Adresse e-mail de contact. Convertie automatiquement en lien `mailto:`. |
| `address` | chaîne | oui | Adresse postale complète (rue, code postal, ville), utilisée dans la section contact, les mentions légales et les données structurées Schema.org. |
| `description` | chaîne **ou** tableau de chaînes | oui | Un ou plusieurs paragraphes de présentation de l'activité, affichés dans la section « À propos ». Le premier paragraphe sert aussi de méta-description SEO. |
| `services` | tableau de `{ "name": string, "description": string }` | oui | Liste des prestations proposées (au moins une). Chacune est affichée sous forme de carte avec une icône thématique. |
| `openingHours` | tableau de chaînes | oui | Une ligne par plage horaire, au format libre (ex. `"Lundi – Vendredi : 8h00 – 18h00"`). |
| `testimonials` | tableau de `{ "author": string, "text": string }` | oui | Avis clients (au moins un), affichés sous forme de citations. |
| `siret` | chaîne | oui | Numéro SIRET (ou placeholder en attendant l'immatriculation), affiché dans les mentions légales du pied de page. |
| `colors` | objet `{ "primary"?: string, "accent"?: string }` | non | Permet de surcharger les couleurs principale et d'accent du thème choisi avec des codes CSS (ex. `"#1f2d3d"`), pour ajuster la charte à l'identité du client sans changer de thème. |

### Les trois thèmes

- **`artisan`** — sturdy et rassurant : couleurs franches (bleu ardoise +
  accent orange), typographie sans-serif en gras, coins nets. Adapté aux
  plombiers, électriciens, menuisiers, couvreurs.
- **`gourmand`** — chaleureux, esprit restaurant/boulangerie : crème,
  bordeaux et or, typographie serif (Georgia), coins arrondis élégants.
  Adapté aux restaurants, boulangeries, commerces de bouche.
- **`sejour`** — calme et aéré, esprit gîte/chambre d'hôtes : verts doux et
  sable, grands espacements, coins très arrondis. Adapté aux hébergements
  touristiques.

### Exemple minimal

```json
{
  "businessName": "Menuiserie Dupont",
  "slug": "menuiserie-dupont",
  "metier": "Menuisier-agenceur",
  "theme": "artisan",
  "tagline": "Du sur-mesure en bois massif, depuis 1998",
  "town": "Domfront",
  "phone": "02 33 00 00 00",
  "email": "contact@menuiserie-dupont.fr",
  "address": "5 rue des Artisans, 61700 Domfront",
  "siret": "000 000 000 00000",
  "description": "Menuiserie Dupont conçoit et pose des agencements sur mesure...",
  "services": [
    { "name": "Cuisines sur mesure", "description": "Conception et pose de cuisines en bois massif." }
  ],
  "openingHours": ["Lundi – Vendredi : 8h00 – 18h00"],
  "testimonials": [
    { "author": "Client satisfait, Domfront", "text": "Travail impeccable et dans les délais." }
  ]
}
```

## Déploiement gratuit (Netlify ou GitHub Pages)

Le dépôt entier (`agency/` + `demos/`) peut être déployé gratuitement, sans
serveur à gérer.

### Option A — Netlify (recommandé, le plus simple)

1. Créer un compte gratuit sur [netlify.com](https://www.netlify.com).
2. Glisser-déposer le dossier du dépôt sur l'interface Netlify (« Deploy
   manually »), ou connecter le dépôt Git pour un déploiement automatique à
   chaque modification.
3. Netlify sert par défaut le contenu à la racine. Pour distinguer l'agence
   des démos, deux approches possibles :
   - **Un site Netlify par client livré** : déployer uniquement le contenu
     de `demos/<slug>/` (un fichier `index.html` autonome) comme site
     indépendant pour ce client, avec son propre sous-domaine ou domaine.
   - **Un site unique pour la vitrine + les démos** : déployer la racine du
     dépôt telle quelle, avec `agency/index.html` comme page d'accueil (à
     configurer dans Netlify via une redirection `/ -> /agency/index.html`,
     ou en copiant ce fichier à la racine avant déploiement).
4. Une fois en ligne, Netlify fournit une URL `*.netlify.app` immédiatement
   utilisable pour montrer le site à un prospect.

### Option B — GitHub Pages

1. Pousser le dépôt sur GitHub.
2. Dans les paramètres du dépôt, activer **Pages** en pointant vers la
   branche principale (racine, ou dossier `docs/` si vous préférez copier le
   contenu généré à cet endroit).
3. Le site est servi sous `https://<utilisateur>.github.io/<depot>/`.

Dans les deux cas, comme chaque page générée est **autonome** (HTML + CSS
inline, aucune requête externe), il n'y a ni étape de build ni dépendance à
installer côté hébergeur : il suffit de servir les fichiers tels quels.

## Nom de domaine personnalisé

Une fois qu'un client valide son site :

1. Acheter un nom de domaine (ex. `plomberie-lecomte.fr`, ~10 €/an chez un
   registrar comme OVH, Gandi ou Namecheap).
2. Dans les paramètres du site Netlify ou GitHub Pages, ajouter le domaine
   personnalisé.
3. Configurer les enregistrements DNS chez le registrar selon les
   instructions fournies par l'hébergeur (généralement un enregistrement
   `CNAME` ou `A`).
4. Le certificat HTTPS est généralement généré automatiquement et
   gratuitement par l'hébergeur (Let's Encrypt).

## Avant de livrer un site

- Remplacer le SIRET placeholder (`000 000 000 00000`) par le vrai numéro du
  client dans son fichier de configuration.
- Vérifier que `agency/index.html` a bien été personnalisé avec vos
  véritables coordonnées avant toute mise en ligne (voir « Placeholders à
  personnaliser » ci-dessous).
- Remplacer la ligne « Hébergement : à compléter... » du pied de page par le
  nom réel de l'hébergeur une fois le site déployé.

## Placeholders à personnaliser dans `agency/index.html`

Le fichier `agency/index.html` utilise le nom de marque provisoire
**« Bocage Web »** et des coordonnées de contact factices, clairement
signalées dans la page par une étiquette « à remplacer ». Avant la mise en
ligne, personnaliser :

- le nom de marque (« Bocage Web ») si vous en choisissez un autre ;
- le numéro de téléphone et l'adresse e-mail de la section Contact ;
- l'adresse postale et le SIRET dans les mentions légales du pied de page ;
- la ligne « Hébergement » du pied de page, une fois l'hébergeur choisi.

## Structure du dépôt

```
.
├── PLAN.md                  # Plan d'affaires piste 1 (sites locaux)
├── PLAN-REDACTION.md         # Plan d'affaires piste 2 (abonnements contenus SEO)
├── PLAN-ETOILES.md           # Plan d'affaires piste 3 (cartes du ciel)
├── README.md                 # Ce fichier
├── agency/
│   └── index.html             # Vitrine de l'activité Bocage Web
├── demos/                     # Généré par factory/build.js — ne pas éditer à la main
│   ├── index.html
│   ├── plomberie-lecomte/index.html
│   ├── aux-delices-du-bocage/index.html
│   └── gite-de-la-rouvre/index.html
├── factory/
│   ├── build.js                # Générateur de sites (zéro dépendance)
│   └── clients/                 # Un fichier JSON par client
│       ├── plomberie-lecomte.json
│       ├── aux-delices-du-bocage.json
│       └── gite-de-la-rouvre.json
├── redaction/
│   ├── index.html              # Page d'offre rédaction SEO (abonnements)
│   └── studio.html             # Studio SEO : brief, analyse, métadonnées (100 % local)
└── etoiles/
    ├── index.html              # Générateur de cartes du ciel (généré, autonome)
    ├── app.template.html       # Source de l'application (à éditer, puis rebuild)
    ├── build.js                # Injecte les données -> index.html
    ├── test-astro.js           # Vérifications astronomiques
    ├── README.md               # Doc dédiée (rebuild, données, impression)
    └── data/                   # Catalogue d'étoiles + constellations (CC BY-SA)
```
