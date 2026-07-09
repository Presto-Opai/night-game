# Objectif : 40 000 € en 6 mois — plan d'exécution

> Soyons honnêtes : aucun logiciel ne « génère » 40 000 €. Ce sont les clients qui paient.
> Ce dépôt vous donne trois choses : une **offre claire**, un **outil qui réduit chaque
> livraison à quelques heures**, et un **plan de prospection**. Le reste, c'est de la
> régularité commerciale (~15–20 contacts par semaine).

## 1. L'offre

| Prestation | Prix | Contenu |
|---|---|---|
| Site « Essentiel » | **990 €** | Site vitrine 1 page longue : présentation, services, avis, horaires, contact, mentions légales, référencement local de base |
| Site « Pro » | **1 490 €** | Essentiel + galerie photos, formulaire de demande de devis, page par service, suivi statistiques |
| Maintenance & hébergement | **49 €/mois** | Hébergement, nom de domaine, modifications mineures (2/mois), sauvegardes |
| Fiche Google Business | **290 €** | Création/optimisation de la fiche Google Maps + stratégie d'avis clients |

Cible : artisans (plombiers, menuisiers, couvreurs, électriciens), restaurants,
boulangeries, gîtes et chambres d'hôtes dans un rayon de ~40 km autour
d'Athis-Val-de-Rouvre : Flers, Condé-en-Normandie, La Ferté-Macé, Briouze,
Putanges, Falaise, Domfront, Vire.

**Argument de vente unique : « Votre site en ligne en 7 jours, sinon remboursé. »**
La « fabrique de sites » de ce dépôt rend cette promesse tenable : un site = un
fichier de configuration + les photos du client.

## 2. Le chemin vers 40 000 €

| Mois | Sites signés | CA sites | Abonnements actifs | CA récurrent | Extras (Google, options) | Cumul |
|---|---|---|---|---|---|---|
| 1 | 2 | 2 200 € | 2 | 100 € | 300 € | 2 600 € |
| 2 | 4 | 4 600 € | 6 | 300 € | 600 € | 8 100 € |
| 3 | 5 | 5 800 € | 11 | 550 € | 600 € | 15 050 € |
| 4 | 6 | 7 000 € | 17 | 850 € | 900 € | 23 800 € |
| 5 | 6 | 7 000 € | 23 | 1 150 € | 900 € | 32 850 € |
| 6 | 6 | 7 000 € | 29 | 1 450 € | 900 € | **42 200 €** |

Hypothèses : panier moyen ~1 160 € (mélange Essentiel/Pro), taux de signature
~1 client pour 8–10 prospects réellement contactés. C'est **exigeant mais pas
irréaliste** : 29 clients en 6 mois, soit ~1,2 par semaine, dans une zone où la
majorité des artisans n'ont aucun site. Le risque principal n'est pas technique,
c'est la constance de la prospection.

En fin de mois 6, les 29 abonnements = **~17 000 €/an de revenu récurrent** acquis.

## 3. Prospection — la routine hebdomadaire

- **Lundi matin (2 h)** : constituer la liste de la semaine. Sur Google Maps,
  chercher « plombier Flers », « restaurant Condé-en-Normandie », etc. Noter ceux
  **sans site** ou avec un site cassé/illisible sur mobile. Objectif : 20 noms.
- **Mardi–jeudi** : 5 visites ou appels par jour. Le porte-à-porte fonctionne très
  bien en zone rurale — les artisans se joignent tôt (7h30–9h) ou en fin de journée.
- **Vendredi** : relances (un prospect signe en moyenne à la 2ᵉ ou 3ᵉ relance) +
  production des sites vendus.
- **Chaque site livré** : demander 2 recommandations (« Vous connaissez un collègue
  qui n'a pas de site ? ») et un avis Google. Après ~10 clients, le bouche-à-oreille
  prend le relais.

Autres canaux : marchés locaux, groupes Facebook (« Tu sais que tu es de Flers
quand… », groupes d'artisans de l'Orne), Chambre de Métiers et de l'Artisanat de
l'Orne (ateliers numérique), affichettes chez les fournisseurs de matériaux.

### Script d'approche (en personne / téléphone)

> « Bonjour, je suis [prénom], je fais des sites internet pour les artisans du
> coin, j'habite à Athis. J'ai vu que vous n'aviez pas de site — aujourd'hui les
> gens cherchent "plombier Flers" sur leur téléphone et ils appellent le premier
> qui sort. Je vous fais un site professionnel en 7 jours pour 990 €, tout compris.
> Je peux vous montrer deux exemples en 2 minutes ? » *(montrer les démos sur téléphone)*

### E-mail / message de relance

> Objet : Votre site internet — exemple pour [métier] à [ville]
>
> Bonjour [Nom], suite à notre échange, voici un exemple de ce que je vous propose :
> [lien démo]. Site en ligne en 7 jours, 990 € tout compris, hébergement 49 €/mois.
> Sans engagement au-delà. Je passe vous voir [jour] ou préférez-vous que je vous appelle ?

### Objections courantes

- **« J'ai déjà assez de travail »** → « Justement : un site sert aussi à choisir
  ses chantiers et à afficher vos avis pour vendre plus cher. Et le jour où ça
  ralentit, il est déjà là. »
- **« C'est trop cher »** → « C'est le prix d'une demi-journée de votre travail,
  une seule fois. Un seul chantier gagné le rembourse. »
- **« Mon neveu peut le faire »** → « Très bien ! S'il ne l'a pas fait d'ici un
  mois, rappelez-moi. » *(noter, relancer dans 5 semaines)*

## 4. Livraison — pourquoi c'est tenable

Chaque vente suit le même déroulé (~2 à 3 h de travail au total) :

1. **RDV photos + infos (45 min)** : photos au téléphone, horaires, liste des
   services, 2–3 avis clients à recopier.
2. **Config (30 min)** : remplir un fichier JSON dans `factory/clients/` (voir README).
3. **Génération (1 min)** : `node factory/build.js` → site complet.
4. **Mise en ligne (30 min)** : Netlify/GitHub Pages (gratuit) + nom de domaine (~10 €/an).
5. **Validation client + facture.**

À 6 sites/mois, la production occupe ~4 jours/mois. Le reste du temps = prospection.

## 5. Cadre légal (à vérifier, chiffres indicatifs)

- Statut **micro-entrepreneur** (création gratuite en ligne sur autoentrepreneur.urssaf.fr,
  activité : « création de sites internet », BNC ou BIC selon qualification).
- Cotisations sociales ≈ 21–26 % du CA encaissé. Sur 40 000 €, comptez ~9 000 €
  de cotisations : le net est plutôt ~30 000 €. Budgétez-le dès le départ.
- **Franchise de TVA** : au-delà d'un seuil (de l'ordre de 37 000 € de CA pour les
  prestations de services — les seuils ont bougé récemment, **vérifiez auprès de
  l'URSSAF/votre CMA**), vous facturez la TVA. Anticipez-le au mois 5–6.
- Assurance RC professionnelle (~150 €/an), mentions légales et CGV sur vos devis.
- Compte bancaire dédié dès que le CA dépasse 10 000 €/an.

## 6. Semaine 1 — checklist de démarrage

- [ ] Créer la micro-entreprise (48 h, gratuit)
- [ ] Choisir le nom (le dépôt utilise « Bocage Web » en attendant) + acheter le domaine
- [ ] Déployer `agency/` (votre vitrine) et les 3 démos sur Netlify
- [ ] Créer votre propre fiche Google Business « création de sites internet Flers/Athis »
- [ ] Imprimer 100 cartes de visite (Vistaprint, ~20 €)
- [ ] Lister les 20 premiers prospects sur Google Maps
- [ ] Premier rendez-vous : proposez le site à **-50 % au tout premier client** contre
      un avis Google et le droit d'utiliser son site comme référence
