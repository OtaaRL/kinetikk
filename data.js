/* Kinetik — bibliothèque d'exercices et générateur de programmes */
(function () {
  const X = {}; // id -> exercice
  const L = {}; // échelles de progression
  const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // [nom, type, muscles, conseil, matériel requis]
  function ladder(key, rows) {
    L[key] = rows.map(r => {
      const e = { id: slug(r[0]), name: r[0], type: r[1], muscles: r[2], cue: r[3], req: r[4] || null, ladder: key };
      e.q = r[5] || (r[0] + ' exercice technique calisthenics');
      X[e.id] = e; return e;
    });
  }
  function single(rows) {
    rows.forEach(r => {
      const e = { id: slug(r[0]), name: r[0], type: r[1], muscles: r[2], cue: r[3], req: null, ladder: null, q: r[0] + ' exercice technique' };
      X[e.id] = e;
    });
  }

  ladder('push', [
    ['Pompes inclinées', 'reps', 'Pectoraux · Triceps', 'Mains sur un support stable, corps gainé de la tête aux talons, coudes à 45°.'],
    ['Pompes classiques', 'reps', 'Pectoraux · Triceps · Épaules', 'Poitrine au sol, coudes à 45°, abdos et fessiers serrés.'],
    ['Pompes pieds surélevés', 'reps', 'Haut des pectoraux · Épaules', 'Pieds sur une chaise, gardez le bassin aligné, descendez lentement.'],
    ['Pompes diamant', 'reps', 'Triceps · Pectoraux', 'Mains rapprochées sous la poitrine, coudes le long du corps.'],
    ['Pompes archer', 'reps', 'Pectoraux (unilatéral)', 'Un bras travaille, l\'autre reste tendu sur le côté. Alternez.'],
    ['Pompes pseudo planche', 'reps', 'Épaules · Pectoraux · Poignets', 'Mains près des hanches, penchez-vous en avant, coudes serrés.'],
    ['Pompes une main assistées', 'reps', 'Pectoraux · Core', 'Pieds écartés, main libre dans le dos ou sur la hanche, hanches droites.']
  ]);
  ladder('vpush', [
    ['Pompes pike', 'reps', 'Épaules · Triceps', 'Hanches hautes en V, la tête passe entre les bras.'],
    ['Pompes pike pieds surélevés', 'reps', 'Épaules', 'Pieds sur une chaise, le haut du crâne descend vers le sol.'],
    ['Équilibre contre le mur', 'time', 'Épaules · Core', 'Ventre vers le mur, poussez fort dans le sol, corps en ligne.', null, 'handstand contre le mur débutant'],
    ['Pompes verticales négatives', 'reps', 'Épaules · Triceps', 'Au mur, descente contrôlée de 3 à 5 secondes, remontez en aidant.'],
    ['Pompes verticales au mur', 'reps', 'Épaules · Triceps', 'Amplitude complète, gainage fort, poussée verticale.']
  ]);
  ladder('dips', [
    ['Dips sur chaise', 'reps', 'Triceps · Pectoraux', 'Dos proche du support, coudes vers l\'arrière, épaules basses.'],
    ['Dips sur chaise pieds surélevés', 'reps', 'Triceps · Pectoraux', 'Jambes tendues sur une 2e chaise, amplitude contrôlée.'],
    ['Dips sur barres', 'reps', 'Pectoraux · Triceps', 'Buste légèrement penché, épaules sous contrôle, descente à 90°.', 'dipbars'],
    ['Dips sur barres lents', 'reps', 'Triceps · Pectoraux', 'Descente 4 s, pause 1 s en bas, poussée explosive.', 'dipbars']
  ]);
  ladder('vpull', [
    ['Tractions négatives', 'reps', 'Dos · Biceps', 'Sautez en haut, descendez en 4 à 5 secondes.', 'bar', 'tractions négatives débutant'],
    ['Tractions pronation', 'reps', 'Grand dorsal · Biceps', 'Épaules basses, menton au-dessus de la barre, pas d\'élan.', 'bar'],
    ['Tractions supination', 'reps', 'Biceps · Dos', 'Prise serrée paume vers vous, coudes vers les hanches.', 'bar', 'chin up technique'],
    ['Tractions prise large', 'reps', 'Grand dorsal', 'Prise plus large que les épaules, tirez les coudes vers le sol.', 'bar'],
    ['Tractions archer', 'reps', 'Dos (unilatéral)', 'Tirez d\'un côté, l\'autre bras reste tendu. Alternez.', 'bar'],
    ['Tractions explosives', 'reps', 'Dos · Puissance', 'Tirez le plus vite possible jusqu\'à la poitrine à la barre.', 'bar'],
    ['Muscle-up négatif', 'reps', 'Dos · Triceps · Pectoraux', 'Depuis le haut, descendez lentement en passant la transition.', 'bar']
  ]);
  ladder('vpullNB', [
    ['Rowing serviette porte genoux', 'reps', 'Dos · Biceps', 'Serviette coincée dans une porte fermée, penchez-vous en arrière, tirez.', null, 'rowing serviette porte'],
    ['Rowing serviette porte', 'reps', 'Dos · Biceps', 'Corps droit, plus incliné = plus dur.', null, 'rowing serviette porte'],
    ['Superman tenu', 'time', 'Lombaires · Dos', 'Bras et jambes décollés, regard vers le sol, respirez.'],
    ['Superman avec tirage de coudes', 'reps', 'Dos · Épaules', 'Depuis la position superman, tirez les coudes vers les côtes.']
  ]);
  ladder('row', [
    ['Rowing inversé jambes fléchies', 'reps', 'Dos · Biceps', 'Sous une table solide ou une barre basse, genoux pliés, poitrine vers la barre.', null, 'rowing inversé sous table'],
    ['Rowing inversé', 'reps', 'Dos · Biceps', 'Corps gainé en planche, tirez la poitrine, serrez les omoplates.', null, 'australian pull up'],
    ['Rowing inversé pieds surélevés', 'reps', 'Dos · Biceps', 'Pieds sur une chaise, corps horizontal ou plus haut.', null, 'australian pull up pieds surélevés'],
    ['Rowing inversé supination', 'reps', 'Biceps · Dos', 'Paumes vers vous, coudes près du corps.', null, 'rowing inversé supination'],
    ['Rowing inversé archer', 'reps', 'Dos (unilatéral)', 'Un bras tire, l\'autre guide. Alternez.', null, 'archer australian pull up']
  ]);
  ladder('squat', [
    ['Squat sur chaise', 'reps', 'Quadriceps · Fessiers', 'Assis-debout contrôlé, poids sur les talons.'],
    ['Squat', 'reps', 'Jambes · Fessiers', 'Pieds largeur d\'épaules, hanches sous les genoux, dos droit.', null, 'air squat technique'],
    ['Squat tempo lent', 'reps', 'Quadriceps · Fessiers', 'Descente 3 s, pause 1 s en bas, remontée contrôlée.'],
    ['Squat bulgare', 'reps', 'Quadriceps · Fessiers', 'Pied arrière sur une chaise, buste droit, genou avant stable.'],
    ['Pistol squat assisté', 'reps', 'Jambes · Équilibre', 'Tenez-vous à un support, une jambe tendue devant.'],
    ['Pistol squat', 'reps', 'Jambes · Équilibre · Mobilité', 'Descente profonde sur une jambe, talon au sol, jambe libre tendue.']
  ]);
  ladder('lunge', [
    ['Fentes arrière', 'reps', 'Quadriceps · Fessiers', 'Grand pas en arrière, genou avant au-dessus de la cheville.'],
    ['Fentes marchées', 'reps', 'Jambes · Fessiers', 'Pas longs, buste droit, genou arrière frôle le sol.'],
    ['Fentes bulgares', 'reps', 'Quadriceps · Fessiers', 'Pied arrière surélevé, descendez à la verticale.', null, 'bulgarian split squat'],
    ['Fentes sautées', 'reps', 'Jambes · Explosivité', 'Alternez les jambes en l\'air, réception douce.']
  ]);
  ladder('hinge', [
    ['Pont fessier', 'reps', 'Fessiers · Ischios', 'Poussez par les talons, serrez les fessiers 1 s en haut.'],
    ['Pont fessier unilatéral', 'reps', 'Fessiers · Ischios', 'Une jambe tendue, bassin à niveau tout du long.'],
    ['Hip thrust pieds surélevés', 'reps', 'Fessiers · Ischios', 'Épaules sur un support, pieds sur une chaise, extension complète.'],
    ['Nordic curl excentrique', 'reps', 'Ischio-jambiers', 'À genoux, bloquez les pieds, descendez le plus lentement possible.', null, 'nordic curl débutant'],
    ['Nordic curl', 'reps', 'Ischio-jambiers', 'Descente contrôlée et remontée en s\'aidant le moins possible.']
  ]);
  ladder('calf', [
    ['Mollets debout', 'reps', 'Mollets', 'Montez sur la pointe des pieds, pause 1 s en haut, descente lente.'],
    ['Mollets une jambe', 'reps', 'Mollets', 'Sur une marche, amplitude complète, tenez un support.']
  ]);
  ladder('coreS', [
    ['Planche', 'time', 'Core · Épaules', 'Corps aligné, fessiers et abdos serrés, ne creusez pas le dos.'],
    ['Hollow body', 'time', 'Abdos profonds', 'Bas du dos plaqué au sol, bras et jambes tendus et décollés.', null, 'hollow body hold'],
    ['L-sit groupé', 'time', 'Abdos · Triceps', 'Mains au sol ou sur des appuis, genoux serrés contre la poitrine.', null, 'tuck l-sit'],
    ['L-sit', 'time', 'Abdos · Triceps · Hanches', 'Jambes tendues devant, bras verrouillés, épaules basses.', null, 'l-sit technique']
  ]);
  ladder('coreD', [
    ['Crunch inversé', 'reps', 'Bas des abdos', 'Enroulez le bassin vers la poitrine, sans élan.'],
    ['Relevés de jambes allongé', 'reps', 'Abdos · Fléchisseurs', 'Bas du dos au sol, jambes tendues, descente lente.'],
    ['Relevés de genoux suspendu', 'reps', 'Abdos', 'Suspendu à la barre, montez les genoux sans balancer.', 'bar'],
    ['Relevés de jambes suspendu', 'reps', 'Abdos · Hanches', 'Jambes tendues jusqu\'à la barre, contrôle total.', 'bar'],
    ['Dragon flag négatif', 'reps', 'Core complet', 'Allongé sur un banc, corps rigide, descente la plus lente possible.', null, 'dragon flag négatif']
  ]);
  ladder('plyoPush', [
    ['Pompes explosives', 'reps', 'Pectoraux · Puissance', 'Poussez fort pour décoller les mains, réception coudes souples.'],
    ['Pompes claquées', 'reps', 'Pectoraux · Puissance', 'Décollez assez haut pour frapper dans vos mains.', null, 'clap push up']
  ]);
  ladder('plyoLegs', [
    ['Squat sauté', 'reps', 'Jambes · Explosivité', 'Descente rapide, saut maximal, réception silencieuse.'],
    ['Saut en longueur', 'reps', 'Jambes · Explosivité', 'Balancez les bras, sautez loin, stabilisez chaque réception.'],
    ['Sauts sur box', 'reps', 'Jambes · Explosivité', 'Sautez sur une marche solide, redescendez en marchant.', null, 'box jump technique']
  ]);
  ladder('cardio', [
    ['Jumping jacks', 'time', 'Cardio', 'Rythme régulier, réception souple.'],
    ['Mountain climbers', 'time', 'Cardio · Core', 'Mains sous les épaules, genoux vers la poitrine vite.'],
    ['Burpees', 'time', 'Corps entier · Cardio', 'Poitrine au sol, saut en extension, rythme soutenu.', null, 'burpees technique'],
    ['Montées de genoux', 'time', 'Cardio · Jambes', 'Genoux au-dessus des hanches, bras actifs.'],
    ['Sauts de patineur', 'time', 'Cardio · Jambes', 'Grand saut latéral, réception sur une jambe.', null, 'skater jumps']
  ]);

  single([
    // Échauffement
    ['Cercles d\'épaules et de bras', 'time', 'Épaules', 'Grands cercles lents dans les deux sens.'],
    ['Chat-vache', 'time', 'Colonne · Mobilité', 'À quatre pattes, alternez dos rond et dos creux en respirant.'],
    ['Rotation thoracique', 'time', 'Haut du dos', 'À genoux, main derrière la tête, ouvrez le coude vers le plafond.'],
    ['Planche latérale', 'time', 'Obliques', 'Corps en ligne, hanche haute, tenez de chaque côté.'],
    ['Squat profond tenu', 'time', 'Hanches · Chevilles', 'Talons au sol, coudes poussent les genoux vers l\'extérieur.'],
    ['Pompes scapulaires', 'reps', 'Omoplates', 'Bras tendus, enfoncez et écartez les omoplates sans plier les coudes.'],
    ['Dead hang', 'time', 'Avant-bras · Épaules', 'Suspendu bras tendus, épaules actives, respirez.'],
    // Retour au calme
    ['Étirement pectoraux', 'time', 'Pectoraux', 'Avant-bras contre un mur, tournez doucement le buste.'],
    ['Étirement dos (posture de l\'enfant)', 'time', 'Dos · Hanches', 'Assis sur les talons, bras loin devant, relâchez.'],
    ['Étirement fléchisseurs de hanche', 'time', 'Hanches · Quadriceps', 'Fente basse, bassin vers l\'avant, buste droit.'],
    ['Étirement ischios', 'time', 'Ischio-jambiers', 'Jambe tendue devant, buste incliné, dos droit.']
  ]);

  const get = id => X[id];
  const bySlug = slug;

  // ---------- Objectifs ----------
  const GOALS = {
    masse: { key: 'masse', name: 'Prise de masse', icon: 'dumbbell', color: '#c6ff3d', desc: 'Volume, tension lente et surcharge progressive pour construire du muscle.', sets: 4, reps: [8, 12], accReps: [10, 15], coreReps: [12, 20], rest: 75, off: 0, timeS: [35, 50], tempo: 'Descente en 3 s, contrôle total', tips: ['Surcharge progressive : dès que vous faites le haut de la fourchette sur toutes les séries, passez à la variante plus dure.','Visez 2 à 3 répétitions « en réserve » : les 1–2 dernières répétitions doivent être difficiles, pas ratées.','Dormez 7–9 h : c\'est là que le muscle se construit.','Semaine 4 : allégez d\'une série par exercice pour récupérer (semaine de décharge).','Mangez en léger surplus avec 1,6–2,2 g de protéines par kg.'], kcal: +0.12, prot: 1.9 },
    puissance: { key: 'puissance', name: 'Force & puissance', icon: 'bolt', color: '#ff7a45', desc: 'Variantes difficiles, peu de reps, repos longs et exercices explosifs.', sets: 5, reps: [3, 6], accReps: [5, 8], coreReps: [8, 12], rest: 120, off: 1, timeS: [15, 25], tempo: 'Montée explosive, descente contrôlée', tips: ['Qualité avant quantité : arrêtez la série dès que la vitesse ou la technique chute.','Reposez-vous vraiment (2 min) : la force se travaille frais, pas essoufflé.','Échauffez-vous bien avant les exercices explosifs (poignets, épaules, chevilles).','Semaine 4 : divisez le volume par 2 pour décharger le système nerveux.','Gardez un peu de marge : en force, 1–2 reps de réserve donnent de meilleurs progrès que l\'échec.'], kcal: +0.08, prot: 1.8 },
    seche: { key: 'seche', name: 'Sèche', icon: 'flame', color: '#38d9c8', desc: 'Garder le muscle en perdant du gras : séries longues, repos courts, finisher HIIT.', sets: 4, reps: [12, 16], accReps: [12, 16], coreReps: [15, 20], rest: 45, off: 0, timeS: [40, 55], tempo: 'Rythme fluide, peu de pauses', tips: ['Gardez l\'intensité des mouvements lourds : c\'est le signal qui dit au corps de garder le muscle.','Déficit modéré (15–20 %) et protéines hautes (2,0–2,4 g/kg).','Pas de cardio à jeun à l\'excès : 2 à 3 séances courtes suffisent, plus 8–10 000 pas par jour.','Si l\'énergie chute plusieurs jours de suite, faites un repas de recharge ou une semaine de maintenance.','Sommeil et hydratation : la faim et la récupération en dépendent.'], kcal: -0.18, prot: 2.2 },
    perte: { key: 'perte', name: 'Perte de poids', icon: 'trend', color: '#6ea8ff', desc: 'Dépense calorique élevée : circuits dynamiques, cardio intégré, repos très courts.', sets: 3, reps: [15, 20], accReps: [15, 20], coreReps: [15, 25], rest: 30, off: -1, timeS: [40, 60], tempo: 'Enchaînez sans traîner', tips: ['Le déficit calorique fait 80 % du résultat : visez −300 à −500 kcal par jour, pas plus.','Marchez 8–10 000 pas par jour en plus des séances.','Le circuit garde le cœur actif et préserve le muscle : ne le sautez pas.','Pesez-vous le même jour chaque semaine et regardez la tendance sur 3–4 semaines, pas le chiffre du jour.','Protéines à chaque repas pour limiter la faim.'], kcal: -0.22, prot: 1.8 }
  };
  const LEVELS = { debutant: { name: 'Débutant', frac: 0 }, inter: { name: 'Intermédiaire', frac: 0.42 }, avance: { name: 'Avancé', frac: 0.74 } };

  function rung(key, level, off, eq) {
    let arr = L[key].filter(e => !e.req || eq[e.req]);
    if (!arr.length) arr = L[key];
    const i = Math.max(0, Math.min(arr.length - 1, Math.round(LEVELS[level].frac * (arr.length - 1)) + off));
    return { arr, i };
  }
  function pick(key, level, off, eq) {
    if (key === 'vpull' && !eq.bar) key = 'vpullNB';
    const { arr, i } = rung(key, level, off, eq);
    return arr[i];
  }

  // Modèles de jours : [échelle, décalage, rôle]
  const DAYS = {
    push: { name: 'Push', focus: 'Pectoraux · Épaules · Triceps', slots: [['push', 0, 'main'], ['vpush', 0, 'main'], ['dips', 0, 'main'], ['push', -1, 'acc'], ['id', 'planche-laterale', 'core']] },
    pull: { name: 'Pull', focus: 'Dos · Biceps · Core', slots: [['vpull', 0, 'main'], ['row', 0, 'main'], ['vpull', -1, 'acc'], ['row', -1, 'acc'], ['coreS', 0, 'core']] },
    legs: { name: 'Jambes', focus: 'Quadriceps · Fessiers · Ischios · Mollets', slots: [['squat', 0, 'main'], ['lunge', 0, 'main'], ['hinge', 0, 'main'], ['calf', 0, 'acc'], ['coreD', 0, 'core']] },
    upper: { name: 'Haut du corps', focus: 'Pousser + tirer, volume complet', slots: [['push', 0, 'main'], ['row', 0, 'main'], ['vpush', 0, 'acc'], ['vpull', 0, 'acc'], ['coreS', 0, 'core']] },
    fifth: { name: 'Bras & core', focus: 'Triceps, biceps, abdos', slots: [['dips', 0, 'acc'], ['vpull', -1, 'acc'], ['coreS', 0, 'core'], ['coreD', 0, 'core'], ['id', 'planche-laterale', 'core']] },
    power: { name: 'Explosivité', focus: 'Puissance des pectoraux, jambes et dos', slots: [['plyoPush', 0, 'main'], ['plyoLegs', 0, 'main'], ['vpull', 0, 'main'], ['lunge', 1, 'main'], ['coreS', 0, 'core']] },
    hiit: { name: 'Circuit HIIT', focus: 'Corps entier, cardio, 4 tours', circuit: true, slots: [['id', 'burpees', 'time'], ['squat', 0, 'time'], ['push', 0, 'time'], ['id', 'mountain-climbers', 'time'], ['id', 'sauts-de-patineur', 'time'], ['coreS', 0, 'time']] },
    fullA: { name: 'Full body A', focus: 'Corps entier : push, pull, jambes', slots: [['push', 0, 'main'], ['row', 0, 'main'], ['squat', 0, 'main'], ['coreS', 0, 'core']] },
    fullB: { name: 'Full body B', focus: 'Corps entier : épaules, tractions, hanches', slots: [['vpush', 0, 'main'], ['vpull', 0, 'main'], ['hinge', 0, 'main'], ['coreD', 0, 'core']] },
    fullC: { name: 'Full body C', focus: 'Corps entier : dips, rowing, fentes', slots: [['dips', 0, 'main'], ['row', 0, 'main'], ['lunge', 0, 'main'], ['id', 'planche-laterale', 'core']] },
    cardio: { name: 'Cardio & mobilité', focus: 'Récupération active et souplesse', circuit: true, slots: [['id', 'jumping-jacks', 'time'], ['id', 'montees-de-genoux', 'time'], ['id', 'mountain-climbers', 'time'], ['id', 'planche-laterale', 'time']] }
  };

  const SPLITS = {
    3: ['fullA', 'fullB', 'fullC'],
    4: ['push', 'pull', 'legs', 'fifth'],
    5: ['push', 'pull', 'legs', 'upper', 'fifth'],
    6: ['push', 'pull', 'legs', 'push', 'pull', 'cardio']
  };
  // Par objectif, le 6e jour est adapté (pas de jour de cardio en prise de masse ni en force)
  const SPLITS6 = {
    masse: ['push', 'pull', 'legs', 'push', 'pull', 'legs'],
    puissance: ['push', 'pull', 'legs', 'fifth', 'upper', 'legs'],
    seche: ['push', 'pull', 'legs', 'upper', 'legs', 'fifth'],
    perte: ['push', 'pull', 'legs', 'fifth', 'upper', 'cardio']
  };

  function warmup(day, eq) {
    // montée en température générale puis mobilité de ce qui va travailler
    let w = ['cercles-d-epaules-et-de-bras', 'chat-vache', 'rotation-thoracique'];
    const upper = ['push', 'upper', 'fullA', 'fullC', 'power', 'fullB'].includes(day);
    const pull = ['pull', 'upper', 'fullB'].includes(day);
    const lower = ['legs', 'fullA', 'fullB', 'fullC', 'power', 'hiit', 'cardio'].includes(day);
    if (upper || day === 'fifth') w.push('pompes-scapulaires');
    if (pull && eq && eq.bar) w.push('dead-hang');
    if (lower) w.push('squat-profond-tenu');
    if (day === 'hiit' || day === 'cardio') w.push('jumping-jacks');
    return w.map(id => ({ ex: X[id], kind: 'warm', sets: 1, time: 30, rest: 5 }));
  }
  function cooldown(day) {
    // étirements ciblés sur les muscles travaillés
    let c = ['etirement-pectoraux', 'etirement-dos-posture-de-l-enfant', 'etirement-flechisseurs-de-hanche', 'etirement-ischios'];
    if (['legs'].includes(day)) c = ['etirement-flechisseurs-de-hanche', 'etirement-ischios', 'etirement-dos-posture-de-l-enfant', 'etirement-pectoraux'];
    if (['push', 'power'].includes(day)) c = ['etirement-pectoraux', 'etirement-dos-posture-de-l-enfant', 'etirement-ischios', 'etirement-flechisseurs-de-hanche'];
    return c.map(id => ({ ex: X[id], kind: 'cool', sets: 1, time: 30, rest: 5 }));
  }

  // Construit un jour de programme
  function buildDay(dayKey, idx, goalKey, level, eq, over) {
    const G = GOALS[goalKey];
    let dKey = dayKey;
    if (goalKey === 'puissance' && (dayKey === 'fifth')) dKey = 'power';
    if ((goalKey === 'seche' || goalKey === 'perte') && dayKey === 'fifth') dKey = 'hiit';
    if (goalKey === 'perte' && dayKey === 'cardio') dKey = 'cardio';
    const D = DAYS[dKey];
    const blocks = [], used = new Set();
    D.slots.forEach((s, bi) => {
      const [lad, off, role] = s;
      const ovKey = `${goalKey}|${level}|${dayKey}|${bi}`;
      const adj = (over && over[ovKey]) || 0;
      const LEG = ['squat', 'lunge', 'hinge', 'calf'];
      // au poids de corps les jambes sont trop faciles : on monte d'un cran en masse et en force
      const boost = (LEG.includes(lad) && (goalKey === 'masse' || goalKey === 'puissance')) ? 1 : 0;
      const getEx = extra => {
        if (lad.startsWith('core')) { const r = rung(lad, level, off + adj + extra, eq); return r.arr[r.i]; }
        const r = rung(lad === 'vpull' && !eq.bar ? 'vpullNB' : lad, level, off + (role === 'main' || role === 'time' ? G.off : Math.min(0, G.off)) + boost + adj + extra, eq);
        return r.arr[r.i];
      };
      let ex;
      if (lad === 'id') ex = X[off];
      else {
        // si l'exercice est déjà dans la séance, on prend le cran voisin plutôt que de supprimer le bloc
        for (const x of [0, 1, 2, 3, 4, -1, -2]) { ex = getEx(x); if (ex && !used.has(ex.id) && !(ex.id === 'fentes-sautees' && goalKey === 'masse')) break; }
      }
      if (!ex || used.has(ex.id)) return;
      used.add(ex.id);
      const isTime = ex.type === 'time';
      const b = { ex, kind: role, ovKey, idx: bi, ladder: ex.ladder };
      if (D.circuit) {
        const hi = dKey === 'hiit';
        b.sets = hi ? 4 : 3; b.rest = hi ? 20 : 15; b.round = true;
        if (isTime) b.time = hi ? 40 : 45; else b.reps = [10, 15];
      } else if (role === 'main') {
        b.sets = G.sets; b.rest = G.rest;
        if (isTime) b.time = G.timeS[0]; else b.reps = G.reps;
      } else if (role === 'acc') {
        b.sets = Math.max(2, G.sets - 1); b.rest = Math.max(30, G.rest - 15);
        if (isTime) b.time = G.timeS[0]; else b.reps = G.accReps;
      } else {
        b.sets = 3; b.rest = 40;
        if (isTime) b.time = Math.round((G.timeS[0] + 5) / 5) * 5; else b.reps = G.coreReps;
      }
      if (goalKey === 'puissance' && role === 'main' && !isTime) b.explosive = true;
      blocks.push(b);
    });
    // goal finisher
    let finisher = null;
    if ((goalKey === 'seche') && !D.circuit && ['upper', 'fifth', 'legs'].includes(dayKey)) finisher = { name: 'Finisher Tabata', desc: '8 tours de 20 s à fond / 10 s de repos : burpees ou squats sautés.', sets: 8, time: 20, rest: 10, exId: 'burpees' };
    if (goalKey === 'perte' && !D.circuit) finisher = { name: 'Finisher cardio', desc: '3 tours de 40 s : montées de genoux / mountain climbers / jumping jacks.', sets: 3, time: 40, rest: 15, exId: 'mountain-climbers' };
    const day = { idx, key: dayKey, tpl: dKey, name: D.name, focus: D.focus, circuit: !!D.circuit, blocks, finisher };
    // durée estimée (min)
    let sec = 0;
    blocks.forEach(b => { const w = b.time ? b.time : (b.reps ? 40 : 30); sec += b.sets * (w + b.rest); });
    if (finisher) sec += finisher.sets * (finisher.time + finisher.rest);
    sec += 4 * 40 + 4 * 35; // échauffement + retour au calme
    day.estMin = Math.round(sec / 300) * 5;
    day.warm = warmup(dKey, eq); day.cool = cooldown(dKey);
    return day;
  }

  function buildProgram(goalKey, level, nDays, eq, over) {
    const n = Math.max(3, Math.min(6, nDays));
    const split = (n === 6 && SPLITS6[goalKey]) || SPLITS[n];
    return split.map((k, i) => buildDay(k, i, goalKey, level, eq, over));
  }

  // Variantes (plus facile / plus dur) pour un exercice d'une échelle
  function variant(exId, dir, eq) {
    const e = X[exId]; if (!e || !e.ladder) return null;
    const arr = L[e.ladder].filter(x => !x.req || eq[x.req]);
    const i = arr.findIndex(x => x.id === exId);
    const n = arr[i + dir];
    return n || null;
  }

  window.KD = { X, L, GOALS, LEVELS, DAYS, SPLITS, buildProgram, buildDay, variant, get, slug };
})();
