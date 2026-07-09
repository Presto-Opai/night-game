# Piste 3 : « La Carte de Votre Ciel » — vendre l'émerveillement

> L'angle qui n'a rien à voir : un **produit**, pas une prestation. On vend un
> objet-cadeau personnalisé : l'image exacte du ciel étoilé au-dessus d'un lieu,
> une nuit précise — une naissance, un mariage, une rencontre. Le générateur de
> ce dépôt (`etoiles/`) calcule le vrai ciel à partir d'un catalogue de plus de
> 5 000 étoiles visibles à l'œil nu, et produit un fichier prêt à imprimer.

## 1. Pourquoi ce créneau

- **Marché prouvé** : les cartes du ciel personnalisées sont un best-seller
  mondial du cadeau (naissances, mariages, Saint-Valentin). Des acteurs comme
  Under Lucky Stars en vivent très bien. Le marché français est servi surtout
  par des sites étrangers : il y a une place pour une marque française,
  imprimée en France.
- **Calendrier idéal** : lancé en été, le projet arrive à maturité pour
  **octobre–décembre**, la haute saison du cadeau (Noël représente souvent
  40–50 % du CA annuel de ce type de produit).
- **Marge** : un poster A2 imprimé à la demande coûte ~8–15 € (impression +
  livraison via Gelato/Printful, production en France) et se vend 45–60 €
  encadré ou 39–49 € nu. Version numérique (fichier HD) : 19 €, marge ~100 %.
- **Vos armes existantes** : votre métier de rédacteur web = le contenu SEO
  (« cadeau naissance personnalisé », « cadeau 1 an de couple »…) qui fait vivre
  ce genre de boutique sans budget publicitaire massif.

## 2. L'offre

| Produit | Prix | Coût estimé | Marge |
|---|---|---|---|
| Fichier numérique HD (impression libre) | 19 € | ~0 € | ~19 € |
| Poster A3 | 39 € | ~10 € | ~29 € |
| Poster A2 | 49 € | ~13 € | ~36 € |
| Poster A2 encadré | 79 € | ~30 € | ~49 € |

Personnalisation : date, heure, lieu (n'importe où sur Terre), titre, message,
3 styles (nuit profonde, bleu minuit, noir & or), constellations et grille en option.

## 3. Canaux de vente

1. **Etsy** (dès la semaine 2) : la place de marché du cadeau personnalisé.
   Commissions ~10 % mais trafic immédiat. 10–15 annonces (déclinaisons :
   naissance, mariage, couple, « le ciel de nos 10 ans »…).
2. **Boutique propre** (mois 2) : page produit + paiement Stripe/PayPal,
   alimentée par vos articles SEO. Zéro commission.
3. **Marchés de Noël & boutiques locales** (nov.–déc.) : stands en Normandie
   (Flers, Caen, Bagnoles-de-l'Orne — forte affluence thermale/touristique),
   dépôt-vente chez fleuristes et boutiques de créateurs. Quelques posters
   d'exemple encadrés + prise de commande sur place avec l'appli.
4. **Instagram/Pinterest** : le produit est très visuel ; Pinterest est le
   moteur de recherche du cadeau.

## 4. Le chemin vers ~40 000 € (piste seule — scénario volontariste)

| Mois | Ventes (nb) | Panier moyen | CA | Cumul |
|---|---|---|---|---|
| 1 (juil.) | 5 | 35 € | 175 € | 175 € |
| 2 (août) | 20 | 38 € | 760 € | 935 € |
| 3 (sept.) | 45 | 40 € | 1 800 € | 2 735 € |
| 4 (oct.) | 90 | 42 € | 3 780 € | 6 515 € |
| 5 (nov.) | 250 | 45 € | 11 250 € | 17 765 € |
| 6 (déc.) | 480 | 46 € | 22 080 € | **39 845 €** |

**Honnêteté totale : c'est la piste la plus risquée des trois.** La courbe
ci-dessus suppose de percer sur Etsy avant Noël (annonces bien référencées,
~30–40 avis positifs accumulés, un peu de publicité Etsy ~5–10 €/jour à partir
d'octobre) et 2–3 bons week-ends de marchés de Noël (un stand qui tourne fait
30–60 ventes/week-end en décembre). Si la traction Etsy ne vient pas, un
atterrissage réaliste est plutôt 8 000–15 000 € — c'est pourquoi cette piste se
mène **en parallèle** des pistes 1 et 2 (production quasi nulle par commande :
générer le fichier prend 2 minutes).

## 5. Ce que fait déjà le générateur (`etoiles/index.html`)

- Calcul astronomique réel : position de chaque étoile (catalogue ≤ magnitude 6,
  données d3-celestial/HYG) pour une date, une heure et des coordonnées données —
  temps sidéral, coordonnées horizontales, projection azimutale.
- Tracé des constellations, échelle de magnitudes, couleurs des étoiles (indice B–V).
- Habillage poster : titre, sous-titre, date, lieu, coordonnées.
- Export **SVG** (vectoriel, imprimable à toute taille) et **PNG haute résolution**.

## 6. À faire vous-même (non-code)

- [ ] Choisir la marque (ex. « Ciel de Naissance », « La Nuit Exacte »…) + déposer le nom de domaine
- [ ] Créer la boutique Etsy (statut micro-entrepreneur existant : ajout d'activité
      de vente à déclarer — vente de biens = seuils micro différents des services,
      **vérifiez auprès de l'URSSAF**)
- [ ] Compte Gelato ou Printful, commander 3 posters tests (contrôle qualité réel)
- [ ] 10 annonces Etsy avec visuels d'ambiance (poster en situation : chambre bébé, salon)
- [ ] 6 articles SEO cadeaux (votre métier !) pointant vers la boutique
- [ ] Réserver les stands des marchés de Noël **dès septembre** (les places partent vite)
