# Mise en ligne & encaissement — guide pas à pas

## Étape 1 — Mettre tout en ligne (aujourd'hui, ~5 minutes)

Le dépôt contient un workflow GitHub Actions (`.github/workflows/deploy.yml`)
qui publie l'intégralité du site sur **GitHub Pages** (gratuit, sans serveur)
à chaque modification de la branche `main`.

1. **Fusionnez la pull request** proposée depuis la branche de travail vers
   `main` (bouton « Merge pull request » sur GitHub).
2. Le workflow se lance tout seul (onglet **Actions** du dépôt). Il régénère
   les sites, vérifie les calculs astronomiques, active Pages si besoin et
   publie.
3. Deux à trois minutes plus tard, tout est en ligne :

| Page | URL |
|---|---|
| Tableau de bord (privé, non indexé) | `https://presto-opai.github.io/night-game/` |
| Vitrine Bocage Web (sites locaux) | `https://presto-opai.github.io/night-game/agency/` |
| Démos clients | `https://presto-opai.github.io/night-game/demos/` |
| Offre rédaction SEO | `https://presto-opai.github.io/night-game/redaction/index.html` |
| Studio SEO (outil perso) | `https://presto-opai.github.io/night-game/redaction/studio.html` |
| Générateur de cartes du ciel | `https://presto-opai.github.io/night-game/etoiles/` |

Si le workflow échoue à l'étape « Configuration de GitHub Pages » : dans le
dépôt, **Settings → Pages → Source : « GitHub Actions »**, puis relancez le
workflow (Actions → Déploiement GitHub Pages → « Run workflow »).

> ⚠️ **Le dépôt est public** : les plans d'affaires (PLAN*.md) sont donc
> lisibles par n'importe qui. Ils ne contiennent aucune donnée personnelle,
> mais si cela vous gêne, déplacez-les hors du dépôt (ou passez le dépôt en
> privé et utilisez Netlify, voir ci-dessous).

## Étape 2 — Remplacer les coordonnées factices (avant le premier prospect)

Cherchez les étiquettes « à remplacer » / « à compléter » :

- `agency/index.html` : téléphone, e-mail, mentions légales (SIRET).
- `redaction/index.html` : e-mail, téléphone, SIRET.
- Marque : « Bocage Web », « Mots d'Orne » et « La Carte de Votre Ciel » sont
  des noms provisoires — gardez-les ou renommez-les, mais décidez vite pour
  imprimer les cartes de visite.

Modifiez directement sur GitHub (crayon ✏️ sur le fichier) ou en local, puis
poussez sur `main` : le site se redéploie tout seul.

## Étape 3 — Des URL professionnelles (semaine 1, ~15 €/an par domaine)

`presto-opai.github.io/night-game/agency/` ne fait pas sérieux sur une carte
de visite. Deux options :

- **Option simple (un domaine, redirections)** : achetez un domaine (OVH ou
  Gandi, ~10–15 €/an), configurez-le comme domaine personnalisé GitHub Pages
  (Settings → Pages → Custom domain + enregistrement DNS `CNAME` →
  `presto-opai.github.io`). Le site entier devient `https://votredomaine.fr/…`.
- **Option pro (un domaine par activité, recommandé à terme)** : créez un
  compte [Netlify](https://www.netlify.com) gratuit et déployez chaque dossier
  comme site séparé (glisser-déposer) : `bocageweb.fr`, `motsdorne.fr`,
  `cartedevotreciel.fr`. Chaque site est un simple dossier de fichiers
  statiques, aucune configuration serveur.

Pour les **sites clients** livrés (piste 1) : un site Netlify par client à
partir de `demos/<slug>/` + le domaine du client — c'est compris dans votre
forfait maintenance à 49 €/mois.

## Étape 4 — Encaisser l'argent

### Pistes 1 & 2 (prestations de services)

Les artisans et agences paient sur **devis puis facture**, par virement —
pas besoin de paiement en ligne pour démarrer.

1. Outil de devis/factures conformes micro-entreprise (mentions légales,
   numérotation) : [Facture.net](https://www.facture.net) (gratuit),
   Freebe ou Abby (payants, plus complets). Henrri est aussi une option gratuite.
2. Acompte de 30–50 % à la commande (à écrire dans le devis), solde à la
   livraison. C'est votre meilleure protection contre les impayés.
3. Pour encaisser par carte sans site marchand : **Stripe Payment Links** —
   créez un lien « Acompte site Essentiel — 495 € » en 2 minutes et
   envoyez-le par SMS/e-mail. Frais ~1,5 % + 0,25 € par transaction
   européenne. PayPal professionnel fonctionne aussi.
4. Abonnements (maintenance 49 €/mois, packs contenus) : Stripe Payment
   Links gère aussi les paiements récurrents — un lien par formule suffit,
   pas une ligne de code.
5. Déclarez le CA encaissé chaque mois/trimestre sur autoentrepreneur.urssaf.fr.

### Piste 3 (cartes du ciel — produits)

1. **Etsy** : créez la boutique (compte pro, ~0,18 € de frais de mise en
   ligne par annonce, ~10 % de commissions au total). Commencez par la
   **version numérique** (19 €, livraison automatique du fichier par Etsy —
   zéro logistique) : vous générez le PNG 3000 px avec `etoiles/index.html`
   et l'envoyez à la personnalisation.
2. **Posters physiques** : compte [Gelato](https://www.gelato.com) ou
   Printful (impression en France, expédition directe au client). Flux :
   commande Etsy → vous générez le fichier → vous le poussez chez Gelato
   avec l'adresse du client. Commandez d'abord **3 posters tests** pour
   valider la qualité papier/encre.
3. **Marchés de Noël** : encaissement par carte sur place avec SumUp
   (lecteur ~39 €, ~1,75 % par transaction) + génération des commandes en
   direct sur votre téléphone/portable avec le générateur.
4. Vente de **biens** ≠ vente de services : les seuils et taux micro sont
   différents (12,3 % de cotisations sur les ventes de marchandises,
   seuils de CA plus hauts). Déclarez l'adjonction d'activité sur le site
   de l'URSSAF (gratuit, en ligne).

## Étape 5 — Être trouvable (semaine 1–2)

- **Fiche Google Business** pour votre activité (« création de sites
  internet », zone Flers/Athis) — gratuit, c'est votre premier canal local.
  Demandez un avis Google à chaque client livré.
- E-mail professionnel : une adresse `contact@votredomaine.fr` (incluse chez
  la plupart des registrars, ou via Zoho Mail gratuit) — plus crédible
  qu'une adresse Gmail.
- Pinterest/Instagram pour les cartes du ciel : 2–3 visuels d'ambiance par
  semaine (poster dans une chambre de bébé, au-dessus d'un canapé…).

## Récapitulatif de la première semaine

| Jour | Action |
|---|---|
| J1 | Fusionner la PR → tout est en ligne. Remplacer les coordonnées factices |
| J1 | Créer la fiche Google Business + compte Facture.net |
| J2 | Acheter le(s) domaine(s), brancher au moins la vitrine principale |
| J2 | Créer les liens de paiement Stripe (acomptes + abonnements) |
| J3 | Boutique Etsy : 3 annonces numériques de cartes du ciel |
| J3 | Commander les 3 posters tests chez Gelato |
| J4 | Lister 20 prospects sites (Google Maps) + 30 agences (sous-traitance rédaction) |
| J5 | Premières visites terrain + 10 candidatures agences envoyées |

Ensuite, suivez les routines hebdomadaires de `PLAN.md` (prospection),
`PLAN-REDACTION.md` (agences + abonnements) et `PLAN-ETOILES.md` (Etsy,
puis réservation des marchés de Noël dès septembre).
