<div align="center">

[🇺🇸 EN](README.en.md) · [🇨🇳 简中](README.zh-CN.md) · [🇯🇵 日本語](README.ja.md) · [🇰🇷 한국어](README.ko.md) · [**🇫🇷 FR**](README.fr.md) · [🇧🇷 PT-BR](README.pt-BR.md) · [🇹🇷 TR](README.tr.md) · [🇮🇩 ID](README.id.md)

# 🎬 Stickman Video Director

**Transformez n’importe quel script en vidéos d’animation stickman virales, dans des styles variés, pour les chaînes YouTube sans visage. Entièrement open source.**

[![Étoiles GitHub](https://img.shields.io/github/stars/kaomei/stickman-video-director?style=flat-square)](https://github.com/kaomei/stickman-video-director/stargazers)
![Licence MIT](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)

Donnez un sujet, un article ou un lien : les visuels, la voix off, les sous-titres, les effets sonores et les micro-animations sont créés automatiquement pour livrer une vidéo stickman complète. **Créez une chaîne YouTube à l’identité reconnaissable, sans montrer votre visage.**

Retrouvez les styles stickman populaires sur le web dans une collection open source, régulièrement enrichie et mise à jour. Elle se prête à de nombreux formats : **vulgarisation, psychologie et motivation, éducation et sensibilisation, récits réconfortants, histoires du moment et bien plus encore.**

</div>

<table width="100%">
<tr>
<td width="50%" align="center">
<strong>Noir et blanc classique</strong><br>
<a href="#a1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="Animation stickman en noir et blanc : traits blancs sur fond noir pour expliquer un concept" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>Pop moderne</strong><br>
<a href="#a2"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="Animation stickman pop moderne : personnage au bonnet rouge et effets lumineux technologiques" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>Préhistoire et cavernes</strong><br>
<a href="#a3"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="Animation stickman préhistorique : une histoire de caverne avec une chute inattendue" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>Histoires réconfortantes</strong><br>
<a href="#a4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="Animation stickman chaleureuse : décor coloré et émotions du quotidien" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>Cartoon historique</strong><br>
<a href="#style-5"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan-hero.gif" alt="Animation stickman historique : la vie d’un samouraï dans le Japon d’Edo" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>Dessin à la main minimaliste</strong><br>
<a href="#b1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="Vidéo stickman dessinée à la main : personnages expressifs, mots-clés et micro-animations" width="90%"></a>
</td>
</tr>
</table>

<div align="center">

**6 styles · 8 variantes visuelles · Des exemples testés · Gratuit et open source**

⭐ **De nouveaux styles arrivent régulièrement. Ajoutez une étoile pour retrouver le projet et suivre la suite.**

[Bien démarrer](#quick-start) · [Styles A](#a-styles) · [Styles B](#b-styles) · [FAQ](#faq)

</div>

<a id="creation-modes"></a>

## Deux façons de créer vos vidéos

**Pour maîtriser chaque plan, choisissez A · Director Mode. Pour produire une vidéo longue sans assembler les séquences à la main, choisissez B · Autopilot Mode.** Un seul projet, deux méthodes de production.

|  | <div align="center">A · Director Mode</div> | <div align="center">B · Autopilot Mode</div> |
|:---:|:---|:---|
| **Principe** | **Vous gardez la main, l’IA prépare la mise en scène** : elle crée le découpage et les prompts ; vous contrôlez la génération des séquences et le montage. | **Donnez un sujet ou un objectif, récupérez une vidéo** : illustrations, voix off, sous-titres, micro-animations et assemblage sont automatisés. |
| **Durée** | **Idéal pour les formats courts**, par exemple de 30 secondes à 3 minutes. Les formats plus longs se construisent séquence par séquence. | **Pensé pour les formats longs**, notamment les vidéos avec voix off de **10 minutes et plus**. Convient aussi aux formats courts et aux séries narratives. |
| **Outils** | Un assistant IA compatible avec les Skills pour préparer la proposition, **Google Flow** ou un outil similaire pour générer les séquences, puis **CapCut** ou un autre logiciel pour le montage. | Un agent de développement IA comme **Codex ou Claude Code**, capable de lire et d’écrire des fichiers, d’appeler des outils et d’exécuter des commandes, pour relier génération des médias et assemblage local. |
| **Rendu** | **Séquences animées générées une par une** : gestes, mise en scène et interactions entre personnages. | **Illustrations de storyboard + micro-animations** : changements de plan, zooms et panoramiques accompagnent la narration, sans générer une animation complète pour chaque séquence. |
| **Livrable** | Proposition de réalisation, storyboard, prompts vidéo par séquence et indications sonores. | **Un fichier vidéo complet avec voix off, sous-titres et micro-animations.** |
| **Démarrer** | <div align="center"><a href="#director-start">Utiliser Director</a></div> | <div align="center"><a href="#autopilot-start">Utiliser Autopilot</a></div> |

Les deux modes peuvent partir d’**un sujet, d’un texte ou d’un scénario complet**. **Les séries A et B ont leur propre numérotation et leurs propres visuels ; styles et exemples sont mis à jour séparément.** Choisissez le format, la langue de narration et la voix selon vos besoins. Les durées ci-dessus sont des repères, pas des limites.

Autopilot nécessite des services de génération d’images et de voix disponibles, ainsi qu’un environnement local d’assemblage vidéo. Une simple fenêtre de chat ne remplace pas cet environnement. Le Skill est gratuit et open source ; les services utilisés peuvent être payants.

<a id="quick-start"></a>

## Bien démarrer

Envoyez ce message à un assistant IA compatible avec les Skills. Après l’installation, il vous expliquera **ce que font les deux modes et comment démarrer**, avec des exemples à reprendre tels quels.

```text
Installe ce Skill pour moi :
https://github.com/kaomei/stickman-video-director

Une fois l’installation réussie, lis immédiatement le fichier SKILL.md installé.
Explique simplement les livrables, les outils nécessaires et le déroulement des deux modes.
Donne-moi des exemples de demandes prêts à l’emploi.
Selon mon projet, indique ce qui manque encore et la prochaine étape concrète.
```

<a id="director-start"></a>

### A · Director Mode : des prompts de storyboard, séquence par séquence

Après l’installation, envoyez ce message à l’assistant IA en remplaçant le sujet par le vôtre :

```text
Utilise Director / le mode A pour transformer le sujet, le texte ou le besoin ci-dessous
en vidéo stickman :
[Indique le sujet, colle ton texte ou décris directement ton besoin]

Format : paysage 16:9, style A3 « Préhistoire et cavernes », 30 secondes pour commencer.
Présente-moi d’abord une proposition de réalisation.
Après ma validation, fournis les prompts vidéo de chaque séquence.
```

**Parcours : sujet et besoins → scénario → validation des trois vues du personnage si nécessaire → prompts de storyboard détaillés → génération des séquences et montage manuels**

La proposition comprend la structure du récit, la voix off par séquence, les actions, les plans et le travail sonore. Copiez ensuite les prompts un par un dans [Google Flow](https://flow.google.com/) ou un autre outil de génération vidéo, puis ajoutez les sous-titres et finalisez le montage dans CapCut ou un logiciel similaire.

Pour votre premier essai, suivez le [tutoriel complet de production (en chinois)](https://x.com/CrazyKaomei/status/2102311241046008268).

<a id="autopilot-start"></a>

### B · Autopilot Mode : d’une demande à une vidéo longue

Après l’installation dans Codex, Claude Code ou un environnement capable de gérer des fichiers et d’exécuter des commandes, formulez votre demande ainsi :

```text
Utilise Autopilot / le mode B pour transformer le sujet, l’article, le post,
l’actualité ou le besoin ci-dessous en une vidéo accrocheuse pour YouTube :
[Colle le contenu ou le lien, ou décris ton objectif de promotion]

Format : 5 à 10 minutes, paysage 16:9, style B1 « Dessin à la main minimaliste »,
avec voix off, sous-titres et effets sonores.

Vérifie d’abord la configuration de la génération d’images, de la voix et de l’assemblage vidéo.
Propose ensuite un scénario et un aperçu vidéo de 20 secondes avec le son.
Après ma validation, réalise automatiquement la vidéo complète en calant les visuels
sur le rythme de la voix off. Livre le fichier vidéo final, sans assemblage manuel de ma part.
```

**Parcours : sujet, contenu ou objectif → validation du scénario → validation d’un aperçu vidéo de 20 secondes avec le son → production automatique → livraison de la vidéo complète**

L’assistant IA adapte le storyboard au contenu, génère les visuels et la narration, ajoute les sous-titres et les effets sonores, puis assemble le tout au rythme de la voix off. Votre rôle consiste surtout à valider le scénario et l’aperçu, sans générer et assembler chaque séquence vous-même.

Au premier lancement, il vérifie la configuration requise et vous explique étape par étape ce qui manque et comment le compléter. Si une image ou une voix ne vous convient pas, vous pouvez ne retoucher que la séquence concernée et conserver ce qui est déjà validé.

<a id="style-gallery"></a>

<a id="a-styles"></a>

## A · Director Mode : les styles disponibles

Les styles sont numérotés A1, A2, A3… Chaque fiche présente ses exemples animés.

<a id="a1"></a>

### A1 : Noir et blanc classique

Expliquer un concept avec un minimum de traits. Sur un fond blanc ou noir, les personnages, les objets et quelques touches de couleur portent l’information : un bon choix pour des explications au rythme soutenu.

- **Identité visuelle** : têtes rondes, membres en traits et épaisseur de ligne uniforme, avec quelques expressions simples. Trois couleurs d’accent vives au maximum distinguent émotions, risques ou actions. Les notions abstraites deviennent visuelles : une cage pour l’anxiété, une barre de progression pour l’attention.
- **Idéal pour** : vulgarisation scientifique, psychologie, motivation, organisation personnelle, décryptage économique et explication de concepts.
- **Comment choisir** : le noir sur blanc est clair et direct, adapté aux tutoriels et à la vulgarisation du quotidien. Le blanc sur noir accentue les contrastes pour le suspense, les conflits et les émotions.

| A1.1 · Personnages noirs sur fond blanc | A1.2 · Personnages blancs sur fond noir |
|:---:|:---:|
| <!-- demo:light:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/light-theme-demo.gif" alt="A1.1 : animation de personnages noirs sur fond blanc" width="360"><!-- demo:light:end --> | <!-- demo:dark:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="A1.2 : animation de personnages blancs sur fond noir" width="360"><!-- demo:dark:end --> |
| Fond blanc uni · Personnages noirs | Fond noir uni · Personnages blancs |

---

<a id="a2"></a>

### A2 : Pop moderne

Un bonnet rouge et un t-shirt jaune : deux repères qui rendent ce personnage immédiatement reconnaissable. Il peut présenter un produit dans un univers technologique épuré ou vivre une aventure dans une chambre, dans la rue ou en pleine nature.

- **Identité visuelle** : un personnage minimaliste au bonnet rouge et au t-shirt jaune, dans deux types d’univers. La variante Tech minimaliste mêle espace blanc, quadrillage discret, interfaces vitrées flottantes et lueurs cyan. La variante Récit en couleurs s’appuie sur les décors, la lumière et la profondeur pour installer l’histoire.
- **Idéal pour** : outils IA, produits technologiques, tutoriels et démonstrations avec la variante Tech ; parcours personnels, vie quotidienne, aventures et récits motivants avec la variante en couleurs.
- **Comment choisir** : pour expliquer un outil ou une méthode, choisissez Tech minimaliste. Pour suivre un personnage à travers une expérience, choisissez Récit en couleurs.

| A2.1 · Tech minimaliste | A2.2 · Récit en couleurs |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="A2.1 : démonstration du style Tech minimaliste" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2b-demo.gif" alt="A2.2 : démonstration du style Récit en couleurs" width="360"> |
| Espace blanc · Quadrillage discret · Lueurs cyan | Décors colorés · Lumière cinématographique · Ambiance narrative |

---

<a id="a3"></a>

### A3 : Préhistoire et cavernes

Transportez les tracas d’aujourd’hui dans un monde sans smartphone ni bureau. Cavernes, peaux de bêtes, feux de camp et expressions exagérées transforment les absurdités du travail et de la vie en petites histoires à chute.

- **Identité visuelle** : traits dessinés à la main bien marqués, têtes blanches pleines, membres foncés, vêtements en peau et décors terreux. Les interactions, les réactions et les silences comiques font avancer le récit. Les personnages sont conçus pour chaque histoire : femmes, hommes, enfants et personnes âgées peuvent apparaître sans partager tous le même visage.
- **Idéal pour** : délires préhistoriques, satire du travail, observation des comportements humains, humour noir, fables et histoires en anglais pour enfants.
- **Comment choisir** : pour raconter une petite scène qui se termine par « tout s’explique » ou « mais comment en est-on arrivé là ? ». Les relations modernes transposées dans une tribu primitive créent des gags à la fois familiers et inattendus.

| Exemple 1 : Comment le premier emploi a-t-il été inventé ? | Exemple 2 : La découverte du feu |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="Aperçu animé : comment le premier emploi a été inventé" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-community-fire.gif" alt="La découverte du feu : création de la communauté" width="360"> |
| Récit préhistorique · Chute sur le monde du travail | Découverte du feu · Création de la communauté |

---

<a id="a4"></a>

### A4 : Histoires réconfortantes

Une tasse que l’on n’ose pas utiliser, un message auquel on répond trop vite, un après-midi enfin gardé pour soi. Des personnages épurés évoluent dans un quotidien coloré ; leurs gestes, leurs expressions et les plans racontent ces petits moments dans lesquels on se reconnaît.

- **Identité visuelle** : têtes rondes blanches pleines, corps allongés, membres fins et foncés, expressions discrètes et décors complets de dessin animé 2D. Les plans larges situent l’action, les gros plans captent l’hésitation ou le soulagement, et les travellings accompagnent le personnage.
- **Idéal pour** : récits du quotidien, psychologie, relations humaines, histoires chaleureuses, nouvelles habitudes et contenus en anglais pour enfants.
- **Comment choisir** : pour que le public se reconnaisse dans une situation concrète. Les couleurs et la lumière s’adaptent au sujet : chaleur, mais aussi anxiété, fatigue et nouveau départ.

| Exemple 1 : L’angoisse des messages dans les transports | Exemple 2 : S’accorder du temps |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-station.gif" alt="Histoires réconfortantes : l’angoisse des messages dans une station de métro" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="Histoires réconfortantes : une pause à la terrasse d’un café" width="360"> |
| Station de métro · Suivi du personnage · Gros plans émotionnels | Terrasse de café · Lumière chaude et ombres des arbres · Gestes du quotidien |

---

<a id="style-5"></a>
<a id="a5"></a>

### A5 : Cartoon historique

Faites entrer les stickmen dans l’Histoire : samouraïs dans les rues d’Edo, chats noirs dans les temples égyptiens, soldats dans les camps romains. Costumes d’époque, décors colorés et petits décalages donnent vie aux connaissances historiques.

- **Identité visuelle** : têtes rondes blanches pleines, yeux ovales noirs, contours épais et membres fins, associés à des costumes d’époque, des ombres douces de type cel-shading et des décors peints colorés. Changez les vêtements, l’architecture, les objets et la musique selon le pays et l’époque, tout en conservant la même façon de dessiner les personnages.
- **Idéal pour** : histoire du monde, anecdotes sur les civilisations, vie quotidienne autrefois, portraits et courts métrages historiques humoristiques.
- **Comment choisir** : pour transformer une information en une scène vécue par un personnage du passé. Réactions et retournements donnent envie de suivre l’histoire, même lorsqu’elle part d’un simple détail.

| Exemple 1 : Japon d’Edo · Le quotidien d’un samouraï | Exemple 2 : Égypte antique · Chats et momies |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan.gif" alt="Cartoon historique : un samouraï dans les rues du Japon d’Edo" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-egypt.gif" alt="Cartoon historique : temple égyptien, chat noir et momie" width="360"> |
| Rues d’Edo · Tenues de samouraï · Décalages du quotidien | Temple coloré · Chat noir · Anecdotes historiques |

Contribution au style et aux prompts : [Lawal Ridwan / @leksautomate](https://github.com/leksautomate).

---

<a id="b-styles"></a>

## B · Autopilot Mode : les styles disponibles

Les styles sont numérotés B1, B2, B3… Chaque fiche présente ses vidéos à base d’illustrations et de micro-animations. Cette série est maintenue séparément des styles A.

<a id="b1"></a>

### B1 : Dessin à la main minimaliste

L’image suit la voix off. Des stickmen expressifs, des objets colorés dessinés à la main et des mots-clés bien visibles rendent un sujet, une histoire ou les atouts d’un produit clairs et vivants.

- **Identité visuelle** : fond papier presque blanc, quadrillage à peine visible, traits noirs dessinés à la main et quelques objets colorés. Expressions, micro-animations locales, transitions fluides et effets sonores rythment les images ; le texte à l’écran souligne l’essentiel, les sous-titres accompagnent la voix off.
- **Idéal pour** : vidéos explicatives YouTube, psychologie, récits du travail, vulgarisation et présentation de produits.
- **Comment choisir** : pour transformer un sujet, un texte ou un scénario en une vidéo complète avec voix off et sous-titres. Les visuels sont calés sur la parole, ce qui convient aux explications suivies et aux récits longs.

Cliquez sur un aperçu animé pour regarder ou télécharger l’extrait vidéo avec le son.

<table width="100%">
  <tr>
    <th width="50%" align="center">Exemple 1 : Créer sur YouTube sans montrer son visage</th>
    <th width="50%" align="center">Exemple 2 : Pourquoi personne ne regarde ?</th>
  </tr>
  <tr>
    <td width="50%" align="center"><a href="assets/readme/b1-minimal-handdrawn.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="B1, exemple 1 : regarder ou télécharger l’extrait vidéo avec le son sur la création de vidéos YouTube sans montrer son visage" width="360"></a></td>
    <td width="50%" align="center"><a href="skills/directing-stickman-videos/assets/b1/approved-2026-10-23.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@61e202ccecf9d9926cf76e13f3284181297729b8/assets/readme/previews/b1-minimal-handdrawn-2026-10-23.gif" alt="B1, exemple 2 : regarder ou télécharger l’extrait vidéo avec le son, la voix Bodi, les sous-titres, les personnages dessinés à la main et les micro-animations" width="360"></a></td>
  </tr>
  <tr>
    <td align="center">Personnages dessinés à la main · Mots-clés · Micro-animations</td>
    <td align="center">Voix off Bodi · Expressions vivantes · Micro-animations</td>
  </tr>
</table>

---

<a id="b2"></a>

### B2 : À venir…

La présentation du style, ses propres exemples et les demandes types seront ajoutés ici.

<!-- readme:reliability -->

<a id="faq"></a>

## Questions fréquentes

### Q1. Peut-on créer une vidéo sans avoir de scénario ?

Oui. Donnez un sujet, un article, un lien ou un besoin précis : l’assistant IA commencera par en faire un scénario vidéo. Vous pouvez aussi lui fournir un scénario déjà rédigé. Précisez si possible le public visé, la plateforme et la durée souhaitée.

### Q2. Peut-on automatiser entièrement les styles Director ? Pourquoi conserver ce mode ?

Les styles de la série A suivent pour l’instant un processus de production distinct, mais vous pouvez demander à l’assistant IA de vous aider à combiner votre style A préféré avec le processus de la série B pour créer votre propre adaptation.

Conserver le mode Director permet surtout de maîtriser le coût de la génération vidéo et des essais : pour une vidéo de plus de dix minutes, une seule passe de génération complète peut coûter **quelques dizaines de dollars américains**, et les reprises alourdissent encore la facture. Director conserve donc la génération et la vérification séquence par séquence, ainsi que le montage manuel. Vous gardez la main sur chaque plan et pouvez vérifier le résultat avant de décider de poursuivre.

### Q3. Que faire si les personnages changent d’une séquence à l’autre dans Director ?

Demandez à l’assistant IA : « Conçois d’abord un personnage stickman adapté au style choisi. Fais-moi valider ses trois vues — face, profil et dos — avant de préparer les prompts de storyboard. » C’est aussi une bonne façon de créer un personnage propre à votre chaîne. Réutilisez vos références déjà validées ; si vous n’avez pas besoin d’un personnage personnalisé, cette étape reste facultative.

Dans un outil vidéo qui accepte les images de référence, **joignez les vues validées à chaque séquence générée**. Elles servent d’aide supplémentaire : elles ne remplacent pas les prompts de storyboard et ne modifient pas les règles du style choisi. Vérifiez tout de même la cohérence des personnages entre les séquences.

### Q4. Faut-il obligatoirement utiliser Codex ?

Non. Director fonctionne dans les assistants IA qui permettent d’installer et d’utiliser des Skills.

Autopilot nécessite un environnement comme Codex ou Claude Code, capable de lire et d’écrire des fichiers et d’exécuter des commandes, ainsi que les services de génération d’images et de voix et les dépendances locales nécessaires.

<!-- readme:platforms -->

### Q5. Comment rendre un article ou une source plus accrocheur en vidéo ?

Indiquez à l’assistant IA qui vous souhaitez toucher, le message essentiel et ce que vous aimeriez que le public fasse après la vidéo. Il pourra en tirer un angle, une accroche d’ouverture, une progression narrative et un appel à l’action, puis préparer le découpage.

Vous pouvez également partager une vidéo de référence et préciser ce qui vous plaît : son rythme, son ton ou sa structure. Inspirez-vous de la méthode tout en gardant votre point de vue et votre expression. Vérifiez les faits historiques, économiques ou scientifiques avant publication.

### Q6. Est-ce payant ?

Le Skill est gratuit et open source. La génération d’images, de voix et de vidéos dépend des tarifs de vos plateformes et de vos offres. Un abonnement à un service n’inclut pas forcément des crédits pour son API.

### Q7. Faut-il tout refaire si une image ou une voix ne convient pas ?

Non. Validez d’abord le scénario et le plan de production, puis un court aperçu vidéo avec le son pour vérifier le style, les personnages, la voix, les sous-titres et le rythme, avant de lancer la vidéo complète.

Si une seule séquence pose problème, retouchez-la en priorité et réutilisez les voix off et les médias déjà validés. Cela limite les reprises et les dépenses inutiles.

### Q8. Peut-on publier les vidéos sur YouTube ou les utiliser dans un projet commercial ?

Le projet est sous licence MIT, qui autorise l’usage commercial. Les images, musiques, effets sonores et services de voix tiers restent soumis à leurs propres conditions. L’accès à la monétisation YouTube dépend de l’examen de votre chaîne et de vos contenus par la plateforme.

<!-- readme:contribute -->

## En route vers 10,000 Stars et un écosystème de créateurs

**Chaque étoile alimente la prochaine nouveauté !** Ensemble, nous construisons un studio 100 % gratuit et open source pour aider les créateurs solo à gérer des chaînes sans montrer leur visage, sans abonnement SaaS à 50 $/mois.

- [x] **1,000 Stars** : lancement du mode Director + 5 styles visuels de base
- [x] **3,000 Stars** : lancement du mode AutoPilot pour générer des vidéos en un clic
- [ ] **🔥 5,000 Stars** :
  - 5–10 nouveaux styles visuels
  - Éditeur par lots en un clic pour YouTube Shorts et TikTok
- [ ] **7,500 Stars** :
  - Bibliothèque de plus de 1,000 prompts de scripts YouTube viraux
  - Plus de 200 effets sonores et transitions libres de redevances et sans risque Content ID
- [ ] **10,000 Stars** : lancement du Web Studio officiel tout-en-un

<div align="center">
<a href="https://www.star-history.com/?repos=kaomei%2Fstickman-video-director&amp;type=date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date&amp;theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date">
    <img src="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date" alt="Évolution des étoiles GitHub du projet kaomei/stickman-video-director" width="800">
  </picture>
</a>
</div>

<a id="whats-next"></a>

## Styles visuels prévus

Nous entraînons de nouveaux moteurs spécialisés pour les niches YouTube sans visage les plus demandées :

- **Histoire et légendes façon OverSimplified** — Petits personnages historiques, flèches de conquête et cartes de bataille satiriques
- **Combats de stickmen et lignes de vitesse** — Combats dynamiques façon Alan Becker, arts martiaux et images d’impact
- **Psychologie sombre et noir stoïcien** — Silhouettes sombres, yeux lumineux et récits façon Les 48 lois du pouvoir
- **Parodies de Wall Street et de la Silicon Valley** — Stickmen en costume-cravate, graphiques en chute libre et satire d’entreprise
- **Podcast à deux micros et stand-up** — Comédie dialoguée rythmée, réutilisation d’interviews et échanges entre personnages
- **Mystères d’Internet et légendes urbaines** — Croquis au crayon inquiétants, parasites analogiques et récits mystérieux de Reddit

## Communauté et contributions

Vous voulez proposer un style ou faire découvrir votre chaîne ? Contactez **[@CrazyKaomei](https://t.me/CrazyKaomei)** sur Telegram :

- **Proposer un style** : envoyez un lien de référence visuelle + la niche que vous souhaitez traiter.
- **Présenter votre travail** : vous avez créé une vidéo avec cet outil ? Envoyez votre lien pour la présenter dans ce README et sur notre chaîne YouTube officielle !

🔔 *Suivez **[@CrazyKaomei](https://x.com/CrazyKaomei)** sur X pour des workflows vidéo quotidiens, des outils d’automatisation et des procédures de croissance de chaîne.*

## Licence

Ce projet est distribué sous [licence MIT](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE). Vous pouvez l’utiliser, le modifier, le distribuer et l’exploiter commercialement. Conservez la mention de droit d’auteur et la licence lorsque vous distribuez le projet ou une partie substantielle de celui-ci.

Le projet est fourni « en l’état », sans garantie. Consultez le fichier [LICENSE](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE) pour les conditions complètes.
