# Piste 4 : « Le Guide de la Suisse Normande » — l'avantage que personne ne peut copier

> Les cartes du ciel, les sites vitrines, la rédaction : tout cela peut être
> copié par n'importe qui, n'importe où. Cette piste-ci repose sur trois
> choses que **personne d'autre ne cumule** :
> 1. **Vous habitez le territoire.** Athis-Val-de-Rouvre est au cœur de la
>    Suisse Normande — la Roche d'Oëtre et les gorges de la Rouvre sont dans
>    votre commune. Vous pouvez visiter chaque lieu, photographier, vérifier,
>    rencontrer chaque hébergeur. Une plateforme nationale ne le peut pas.
> 2. **Vous êtes rédacteur professionnel.** Le contenu qui se classe sur
>    Google et qui donne envie, c'est votre métier. Un office de tourisme
>    sous-doté ne le produit pas à ce rythme.
> 3. **Votre coût de production logicielle est quasi nul** (ce dépôt en est
>    la preuve). Un concurrent local devrait payer une agence pour chaque
>    évolution.
>
> C'est une **piste d'actif** : elle rapporte moins vite que les trois autres,
> mais elle devient chaque mois plus difficile à rattraper, et elle alimente
> toutes les autres.

## 1. Le produit

Un guide en ligne de référence du territoire (`territoire/`), généré par la
même logique de fabrique que les sites clients :

- **Découvrir** : les sites naturels et villages (Roche d'Oëtre, gorges de la
  Rouvre, Clécy et le Pain de Sucre, Pont-d'Ouilly, lac de Rabodanges,
  Thury-Harcourt…), avec une carte interactive du territoire.
- **Bouger** : randonnées, canoë sur l'Orne et la Rouvre, escalade, parapente,
  Vélo Francette et Voie Verte.
- **Dormir & manger** : annuaire des gîtes, chambres d'hôtes, campings,
  restaurants — c'est là que vit le modèle économique.
- **Côté pros** : la page qui vend le référencement aux professionnels.

Tout est généré depuis des fichiers de données (`territoire/data/`) : ajouter
un lieu ou un hébergement = ajouter une entrée JSON, `node territoire/build.js`,
et le site se reconstruit.

## 2. Le modèle économique

| Offre | Prix | Contenu |
|---|---|---|
| Fiche annuaire basique | **Gratuit** | Nom, commune, téléphone — l'exhaustivité fait l'audience |
| Fiche « Mise en avant » | **29 €/mois** | Photos, description rédigée, lien direct, position prioritaire |
| Page dédiée + reportage | **49 €/mois** | Page complète rédigée par un pro (votre métier), photos, mise en avant permanente |
| Pack « tout compris » | **sur devis** | Fiche + site internet (piste 1) + contenus (piste 2) |

Pourquoi les pros paieront : les gîtes du secteur dépendent de Booking/Airbnb
(15–20 % de commission par nuitée) et d'annuaires nationaux impersonnels. Une
visibilité locale crédible à 29 €/mois — moins qu'**une seule** commission de
réservation — avec un interlocuteur qui habite à dix minutes, c'est un
argument simple.

## 3. L'effet volant d'inertie (la vraie valeur)

- Chaque hébergeur démarché **sans site internet** → prospect piste 1 (site à 990 €).
- Chaque fiche « Page dédiée » → production rédactionnelle facturée (piste 2).
- Chaque page de lieu → un point de vente naturel des posters « le ciel
  au-dessus de la Roche d'Oëtre » (piste 3) et un argument pour le
  dépôt-vente dans les offices de tourisme.
- Chaque article de guide → autorité SEO qui fait monter *toutes* vos pages.

Le démarchage devient aussi plus facile dans l'autre sens : vous n'êtes plus
« un vendeur de sites », vous êtes « le guide du territoire » — on vous
rappelle.

## 4. Trajectoire réaliste (piste seule, hors effet volant)

| Mois | Fiches payantes | CA récurrent | One-shots (reportages, packs) | Cumul |
|---|---|---|---|---|
| 1 | 0 | 0 € | 0 € | 0 € |
| 2 | 3 | 105 € | 300 € | 405 € |
| 3 | 7 | 245 € | 300 € | 950 € |
| 4 | 12 | 420 € | 600 € | 1 970 € |
| 5 | 18 | 630 € | 600 € | 3 200 € |
| 6 | 25 | 875 € | 600 € | **4 675 €** |

**Soyons clairs : ~5 000 € directs en 6 mois, pas 40 000 €.** Cette piste ne
remplace pas les autres, elle les **verrouille** : au mois 6, 25 fiches
payantes = ~10 500 €/an de récurrent, un actif SEO qui prend de la valeur,
et un flux régulier de prospects qualifiés pour les pistes 1 et 2 (compté
dans leurs plans, pas ici, pour ne rien compter deux fois). C'est aussi la
piste la plus agréable : elle consiste à explorer et raconter l'endroit où
vous vivez.

## 5. Pourquoi pas un concurrent ?

- **Tripadvisor/Booking** : nationaux, impersonnels, commissions élevées —
  ils ne feront jamais du contenu de terrain sur Ségrie-Fontaine.
- **Les offices de tourisme** : partenaires potentiels plus que concurrents
  (leurs moyens éditoriaux sont limités) ; proposez-leur des échanges de
  visibilité, voire la revente des posters (piste 3).
- **Un autre indépendant local** : il lui faudrait vos trois atouts à la
  fois — écriture, outils, présence — plus des mois de contenu à rattraper.

## 6. Démarrage

- [ ] Vérifier sur place chaque information du contenu initial (le générateur
      marque les fiches `"verifie": false` d'un bandeau « à confirmer »)
- [ ] Un reportage photo par semaine (téléphone suffit) : Roche d'Oëtre,
      Clécy, Rabodanges, Pont-d'Ouilly en premier
- [ ] Acheter le domaine (ex. guide-suissenormande.fr) et déployer
- [ ] Rencontrer les 2 offices de tourisme (Flers agglo / Suisse Normande) :
      se présenter, proposer un partenariat de contenu
- [ ] Premier démarchage : les 20 gîtes les plus proches, fiche gratuite
      d'abord (« votre fiche existe déjà, voulez-vous la compléter ? ») —
      la mise en avant payante se vend ensuite, une fois l'audience prouvée
- [ ] Publier 2 articles de fond par mois (votre métier — piste 2) :
      « Les 10 plus belles randonnées de la Suisse Normande », « Que faire
      un week-end de pluie en Suisse Normande »…
