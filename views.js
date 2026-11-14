/* Kinetik — vues */
const NAV = [
  ['today', 'home', "Aujourd'hui", 'Accueil'], ['program', 'program', 'Programme', 'Plan'], ['progress', 'chart', 'Progrès', 'Progrès'],
  ['timer', 'timer', 'Minuteur', 'Timer'], ['nutrition', 'nutrition', 'Nutrition', 'Nutrition'], ['library', 'library', 'Exercices', 'Exos'], ['settings', 'settings', 'Réglages', 'Réglages']
];
const CW = () => document.documentElement.classList.contains('mobile') ? 340 : 520;
let VIEW = 'today', PROG_DAY = null, PROG_EX = null, PROG_MODE = 'sessions', LIB_Q = '', LIB_CAT = 'all', OPEN_HIST = null, EXSEL = null;

function renderSide() {
  const g = goal(), wk = weekDone().length;
  $('#side').innerHTML = `
    <div class="brand"><div class="logo">${ic('bolt')}</div><span>Kinetik</span></div>
    ${NAV.map(([k, i, l, s]) => `<button class="nav ${VIEW === k ? 'on' : ''}" data-act="go" data-v="${k}">${ic(i)}<span class="l-full">${l}</span><span class="l-short">${s}</span></button>`).join('')}
    <div class="side-foot">
      <div class="chip-goal">${ic(g.icon)} ${g.name}</div>
      <div class="row"><span>Cette semaine</span><b>${wk}/${S.prefs.days.length}</b></div>
      <div class="row"><span>Série</span><b>${streak()} 🔥</b></div>
    </div>`;
}
function go(v) { VIEW = v; render(); $('#main').scrollTop = 0; }
function render() {
  setAccent(); renderSide();
  const el = $('#view'); const f = VIEWS[VIEW] || VIEWS.today;
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  el.innerHTML = f();
}

/* =============== AUJOURD'HUI =============== */
function hello() { const h = new Date().getHours(); const n = S.profile.name ? ' ' + S.profile.name : ''; return (h < 5 ? 'Bonne nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir') + n; }
function weekPlan() {
  // retourne 7 jours (lun→dim) avec état
  const start = startOfWeek(), today = ymd(), days = [...S.prefs.days];
  const N = program().length; let cur = S.cursor, out = [];
  const doneToday = sessionsOn(today).length > 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i), k = ymd(d), dow = d.getDay();
    const ss = sessionsOn(k), sched = days.includes(dow);
    let st = 'rest', label = 'Repos';
    if (ss.length) { st = 'done'; label = ss[0].dayName; }
    else if (sched && k >= today) { st = 'plan'; label = dayAt(cur).name; cur++; }
    else if (sched && k >= createdDate()) { st = 'miss'; label = 'Manquée'; }
    out.push({ d, k, dow, st, label, isToday: k === today });
  }
  return out;
}
const VIEWS = {};
VIEWS.today = function () {
  const g = goal(), today = ymd(), todays = sessionsOn(today), dow = new Date().getDay();
  const sched = S.prefs.days.includes(dow), next = dayAt(S.cursor), wk = weekDone(), plan = weekPlan();
  const goalN = S.prefs.days.length, pct = Math.min(1, wk.length / goalN);
  let hero; const inst = window.INSTALL ? INSTALL.banner() : '';
  if (todays.length) {
    const s = todays[todays.length - 1];
    hero = `<div class="card hero"><div class="eyebrow">Séance terminée</div><h1>Bravo, c'est fait 💪</h1><p class="sub">${esc(s.dayName)} · ${fmtDur(s.dur)} · ${fmtNum(s.volume)} reps/sec cumulés</p>
      <div class="meta"><span class="pill a">${ic('check')} ${s.sets} séries</span><span class="pill">${ic('clock')} ${fmtDur(s.dur)}</span></div>
      <p class="sub" style="margin-bottom:18px">Prochaine séance : <b style="color:var(--text)">${esc(next.name)}</b>. Récupérez bien : le muscle se construit pendant le repos.</p>
      <div class="row wrap"><button class="btn" data-act="startNext">${ic('play')} Séance bonus : ${esc(next.name)}</button></div></div>`;
  } else if (sched) {
    hero = `<div class="card hero"><div class="eyebrow">${hello()} · Séance du jour</div><h1>${esc(next.name)}</h1><p class="sub">${esc(next.focus)}</p>
      <div class="meta"><span class="pill a">${ic('clock')} ~${next.estMin} min</span><span class="pill">${next.blocks.length} exercices</span><span class="pill">${ic(g.icon)} ${g.name}</span></div>
      <div class="row wrap"><button class="btn primary lg" data-act="startNext">${ic('play')} Commencer la séance</button><button class="btn ghost" data-act="go" data-v="program">Voir le détail</button></div></div>`;
  } else {
    hero = `<div class="card hero"><div class="eyebrow">${hello()} · Jour de repos</div><h1>Récupération</h1><p class="sub">Pas de séance prévue aujourd'hui. Dormez bien, hydratez-vous, marchez un peu.</p>
      <div class="meta"><span class="pill a">Prochaine : ${esc(next.name)}</span></div>
      <div class="row wrap"><button class="btn" data-act="startNext">${ic('play')} S'entraîner quand même</button><button class="btn ghost" data-act="go" data-v="timer">Mobilité & timers</button></div></div>`;
  }
  const monthStart = ymd(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const month = S.sessions.filter(s => s.date >= monthStart);
  const lastW = S.weights[S.weights.length - 1];
  return `
  ${inst}<div class="page-head"><div><div class="eyebrow">${DOWL[dow]} ${new Date().getDate()} ${MONTHS[new Date().getMonth()]}</div><h1>${hello()}</h1></div>
    <div class="ring"><div style="width:0;height:0"></div></div></div>
  <div class="grid g-hero">
    ${hero}
    <div class="card"><div class="card-t"><h2>Objectif de la semaine</h2></div>
      <div class="row" style="gap:22px"><div class="ring">${ringSvg(pct, 116, 11)}<div class="c"><div style="font-size:26px;font-weight:740">${wk.length}<span class="sub" style="font-size:16px">/${goalN}</span></div><div class="sub" style="font-size:12px">séances</div></div></div>
      <div class="stat" style="gap:12px"><div class="stat"><span class="v">${streak()}</span><span class="l">séances de suite</span></div></div></div>
    </div>
  </div>
  <div class="card" style="margin-top:16px"><div class="card-t"><h2>Ma semaine</h2><span class="sub" style="font-size:13px">Programme ${g.name.toLowerCase()} · ${K.LEVELS[S.prefs.level].name.toLowerCase()}</span></div>
    <div class="week">${plan.map(p => `<div class="day ${p.st} ${p.isToday ? 'today' : ''}"><span class="dn">${DOW[p.dow]}</span><span class="dd">${p.st === 'done' ? ic('check') : p.st === 'plan' ? ic('dumbbell') : p.st === 'miss' ? '–' : ''}</span><span class="lb">${esc(p.label)}</span></div>`).join('')}</div></div>
  <div class="grid g4" style="margin-top:16px">
    <div class="card stat"><span class="l">Séances ce mois</span><span class="v">${month.length}</span></div>
    <div class="card stat"><span class="l">Temps d'entraînement</span><span class="v">${fmtDur(month.reduce((a, s) => a + s.dur, 0))}</span></div>
    <div class="card stat"><span class="l">Volume du mois</span><span class="v">${fmtNum(totalVolume(month))}</span><span class="l" style="font-size:12px">reps + secondes</span></div>
    <div class="card stat"><span class="l">Poids actuel</span><span class="v">${lastW ? String(lastW.kg).replace('.', ',') + ' kg' : '—'}</span><button class="btn sm ghost" style="width:fit-content;margin-top:4px" data-act="addWeight">${ic('plus')} Peser</button></div>
  </div>
  ${tipCard()}`;
};
function tipCard() {
  const tips = {
    masse: ['Mangez en léger surplus et visez ~' + Math.round(S.profile.weight * goal().prot) + ' g de protéines par jour.', 'Descendez lentement (3 s) : la tension fait la croissance.', 'Dormez 7 à 9 h : c\'est là que vous construisez le muscle.'],
    puissance: ['Reposez-vous 2 min entre les séries : la qualité prime sur la fatigue.', 'Arrêtez la série quand la vitesse baisse, pas à l\'échec.', 'Poignets et épaules : échauffez-les toujours avant les variantes difficiles.'],
    seche: ['Gardez les protéines hautes (~' + Math.round(S.profile.weight * goal().prot) + ' g) pour protéger le muscle.', 'Un déficit modéré vaut mieux qu\'un régime extrême.', 'Marchez 8 000 à 10 000 pas : ça aide sans fatiguer.'],
    perte: ['Un déficit de 300 à 500 kcal/jour suffit pour perdre du gras durablement.', 'Marchez tous les jours : c\'est la dépense la plus facile à tenir.', 'Pesez-vous 1 à 2 fois par semaine, regardez la tendance, pas le jour.']
  }[S.prefs.goal];
  const t = tips[new Date().getDate() % tips.length];
  return `<div class="card" style="margin-top:16px;display:flex;gap:14px;align-items:center"><div class="ex-n" style="background:var(--accent-soft);color:var(--accent)">${ic('info')}</div><div><div class="eyebrow">Conseil du jour</div><div>${t}</div></div></div>`;
}

/* =============== PROGRAMME =============== */
VIEWS.program = function () {
  const prog = program(), g = goal();
  if (PROG_DAY === null || PROG_DAY >= prog.length) PROG_DAY = S.cursor % prog.length;
  const d = applyHold(prog[PROG_DAY]);
  const warm = d.warm.map(w => w.ex.name).join(' · ');
  return `
  <div class="page-head"><div><div class="eyebrow">${g.name} · ${K.LEVELS[S.prefs.level].name} · ${S.prefs.days.length} séances / semaine</div><h1>Mon programme</h1></div>
    <button class="btn" data-act="editProgram">${ic('settings')} Modifier</button></div>
  <p class="sub" style="margin:-10px 0 18px;max-width:720px">${g.desc}</p>
  <div class="tabs" style="margin-bottom:18px">${prog.map((p, i) => `<button class="tab ${i === PROG_DAY ? 'on' : ''}" data-act="progDay" data-i="${i}">${i + 1}. ${esc(p.name)}</button>`).join('')}</div>
  <div class="grid g-hero">
    <div class="card">
      <div class="card-t"><div><h2>${esc(d.name)}</h2><div class="sub">${esc(d.focus)}</div></div><span class="pill a">${ic('clock')} ~${d.estMin} min</span></div>
      <div class="eyebrow" style="margin:6px 0 2px">Échauffement · 4 min</div><div class="sub" style="font-size:13px;margin-bottom:8px">${warm}</div>
      ${d.blocks.map((b, i) => exRow(b, i, d)).join('')}
      ${d.finisher ? `<div class="ex-row"><div class="ex-n" style="background:var(--accent-soft);color:var(--accent)">${ic('flame')}</div><div class="ex-main"><div class="ex-name">${d.finisher.name}</div><div class="ex-meta">${d.finisher.desc}</div></div></div>` : ''}
      ${d.circuit ? `<div class="sub" style="font-size:13px;margin-top:10px">Format circuit : enchaînez les exercices dans l'ordre, ${d.blocks[0].sets} tours, ${d.blocks[0].rest} s de repos.</div>` : ''}
      <div class="row wrap" style="margin-top:18px"><button class="btn primary" data-act="startDay" data-i="${PROG_DAY}">${ic('play')} Lancer cette séance</button></div>
    </div>
    <div class="card"><h2 style="margin-bottom:12px">Conseils du coach · ${g.name}</h2>
      ${g.tips.map(t => `<div class="set-row"><div class="d" style="font-size:14px;color:var(--text)">${esc(t)}</div></div>`).join('')}
      <h2 style="margin:22px 0 12px">Comment ça marche</h2>
      <div class="set-row"><div><b>Progression automatique</b><div class="d">Quand vous atteignez le haut de la fourchette sur toutes les séries, l'app propose une variante plus difficile. Les tenues gagnent +5 s.</div></div></div>
      <div class="set-row"><div><b>Ajuster à la volée</b><div class="d">Trop dur ou trop facile ? Changez la variante d'un exercice avec les flèches, ou pendant la séance.</div></div></div>
      <div class="set-row"><div><b>Rythme flexible</b><div class="d">Les séances s'enchaînent dans l'ordre : si vous manquez un jour, vous ne perdez aucune séance.</div></div></div>
      <div class="set-row"><div><b>Tempo</b><div class="d">${g.tempo}.</div></div></div>
    </div>
  </div>`;
};
function fmtTarget(b) {
  if (b.time) return `${b.sets} × ${b.time} s`;
  return `${b.sets} × ${b.reps[0]}–${b.reps[1]}`;
}
function exRow(b, i, d) {
  const e = b.ex;
  const canEasier = !!K.variant(e.id, -1, eq()), canHarder = !!K.variant(e.id, +1, eq());
  const exp = PROG_EX === d.idx + '-' + i;
  return `<div class="ex-row" style="flex-wrap:wrap"><div class="ex-n">${i + 1}</div>
    <div class="ex-main"><div class="ex-name">${esc(e.name)} ${b.explosive ? '<span class="tag">EXPLOSIF</span>' : ''}</div><div class="ex-meta">${esc(e.muscles)} · repos ${b.rest} s${(window.LESSONS[e.id] || {}).side ? ' · par côté' : ''}</div></div>
    <div class="ex-tgt">${fmtTarget(b)}</div>
    <div class="row" style="gap:2px">
      ${e.ladder ? `<button class="icon-btn" title="Variante plus facile" data-act="varEx" data-k="${b.ovKey}" data-d="-1" ${canEasier ? '' : 'disabled style="opacity:.25"'}>${ic('down')}</button><button class="icon-btn" title="Variante plus difficile" data-act="varEx" data-k="${b.ovKey}" data-d="1" ${canHarder ? '' : 'disabled style="opacity:.25"'}>${ic('up')}</button>` : ''}
      <button class="icon-btn" title="Voir le cours" data-act="lesson" data-id="${e.id}">${ic('video')}</button>
      <button class="icon-btn" title="Conseils" data-act="toggleEx" data-k="${d.idx}-${i}">${ic('info')}</button></div>
    ${exp ? `<div style="flex-basis:100%;padding:4px 4px 10px 44px;display:flex;gap:14px;align-items:flex-start" class="sub"><div class="fig-sm" style="width:150px">${FIG.figSvg(e.id)}</div><div>${esc(e.cue)}${b.explosive ? ' Poussez/tirez le plus vite possible.' : ''}${laddr(e)}</div></div>` : ''}
  </div>`;
}
function laddr(e) {
  if (!e.ladder) return '';
  const arr = K.L[e.ladder].filter(x => !x.req || eq()[x.req]);
  return `<div class="ladder">${arr.map((x, i) => `${i ? '<em>›</em>' : ''}<span class="${x.id === e.id ? 'me' : ''}">${esc(x.name)}</span>`).join('')}</div>`;
}

/* =============== PROGRÈS =============== */
VIEWS.progress = function () {
  const ss = S.sessions;
  if (!ss.length && !S.weights.length) {
    return `<div class="page-head"><h1>Progrès</h1></div><div class="card empty">${ic('chart')}<h2>Vos stats apparaîtront ici</h2><p>Terminez votre première séance pour voir vos courbes, records et votre régularité.</p><button class="btn primary" data-act="startNext">${ic('play')} Lancer une séance</button></div>`;
  }
  // 8 dernières semaines
  const labels = [], vals = [], vol = [];
  for (let i = 7; i >= 0; i--) {
    const a = addDays(startOfWeek(), -7 * i), b = addDays(a, 6), A = ymd(a), B = ymd(b);
    const w = ss.filter(s => s.date >= A && s.date <= B);
    labels.push(`${a.getDate()}/${a.getMonth() + 1}`); vals.push(w.length); vol.push(totalVolume(w));
  }
  const total = ss.length, time = ss.reduce((a, s) => a + s.dur, 0);
  // records
  const prs = {};
  ss.forEach(s => s.entries.forEach(e => e.sets.forEach(x => { if (!prs[e.id] || x.v > prs[e.id].v) prs[e.id] = { v: x.v, name: e.name, type: e.type, date: s.date }; })));
  const prList = Object.values(prs).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  // exercices suivis
  const tracked = {}; ss.forEach(s => s.entries.forEach(e => { tracked[e.id] = e.name; }));
  const ids = Object.keys(tracked);
  if (!EXSEL || !tracked[EXSEL]) EXSEL = ids[0] || null;
  let exChart = '<div class="sub">Pas encore de données.</div>';
  if (EXSEL) {
    const pts = []; let isT = false;
    ss.forEach(s => { const e = s.entries.find(x => x.id === EXSEL); if (e) { isT = e.type === 'time'; pts.push({ x: fmtDate(s.date).split(' ').slice(1).join(' '), y: Math.max(...e.sets.map(x => x.v)) }); } });
    exChart = lineChart(pts.slice(-14), CW(), 190, isT ? ' s' : ' reps');
  }
  const wpts = S.weights.slice(-20).map(w => ({ x: fmtDate(w.date).split(' ').slice(1).join(' '), y: w.kg }));
  const hist = [...ss].reverse().slice(0, 30);
  const mode = PROG_MODE;
  return `
  <div class="page-head"><div><div class="eyebrow">Vue d'ensemble</div><h1>Progrès</h1></div></div>
  <div class="grid g4">
    <div class="card stat"><span class="l">Séances totales</span><span class="v">${total}</span></div>
    <div class="card stat"><span class="l">Temps total</span><span class="v">${fmtDur(time)}</span></div>
    <div class="card stat"><span class="l">Série en cours</span><span class="v">${streak()}</span></div>
    <div class="card stat"><span class="l">Volume total</span><span class="v">${fmtNum(totalVolume(ss))}</span></div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><div class="card-t"><h2>Régularité</h2><div class="tabs"><button class="tab ${mode === 'sessions' ? 'on' : ''}" data-act="progMode" data-m="sessions">Séances</button><button class="tab ${mode === 'volume' ? 'on' : ''}" data-act="progMode" data-m="volume">Volume</button></div></div>
      ${barChart(mode === 'sessions' ? vals : vol, labels, CW(), 190, v => mode === 'sessions' ? Math.round(v) : (v >= 1000 ? Math.round(v / 100) / 10 + 'k' : Math.round(v)), mode === 'sessions' ? 4 : 1)}
      <div class="sub" style="font-size:12px;margin-top:6px">8 dernières semaines</div></div>
    <div class="card"><div class="card-t"><h2>Poids</h2><button class="btn sm" data-act="addWeight">${ic('plus')} Ajouter</button></div>
      ${wpts.length ? lineChart(wpts, CW(), 190, ' kg') : `<div class="empty" style="padding:30px">Enregistrez votre poids pour suivre la tendance.</div>`}</div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><div class="card-t"><h2>Évolution par exercice</h2>
      <select class="inp" style="width:auto;max-width:230px" data-bind="exsel">${ids.map(id => `<option value="${id}" ${id === EXSEL ? 'selected' : ''}>${esc(tracked[id])}</option>`).join('')}</select></div>
      ${exChart}<div class="sub" style="font-size:12px;margin-top:6px">Meilleure série de chaque séance</div></div>
    <div class="card"><div class="card-t"><h2>Records personnels</h2>${ic('trophy')}</div>
      ${prList.map(p => `<div class="ex-row"><div class="ex-main"><div class="ex-name">${esc(p.name)}</div><div class="ex-meta">${fmtDate(p.date)}</div></div><div class="ex-tgt">${p.v}${p.type === 'time' ? ' s' : ' reps'}</div></div>`).join('') || '<div class="sub">Aucun record pour l\'instant.</div>'}</div>
  </div>
  <div class="card" style="margin-top:16px"><div class="card-t"><h2>Calendrier</h2><span class="sub" style="font-size:13px">16 dernières semaines</span></div>${heatmap(16)}</div>
  <div class="card" style="margin-top:16px"><div class="card-t"><h2>Historique</h2></div>
    ${hist.map(s => {
      const open = OPEN_HIST === s.id;
      return `<div class="ex-row" style="flex-wrap:wrap;cursor:pointer" data-act="histOpen" data-id="${s.id}"><div class="ex-n">${ic('check')}</div><div class="ex-main"><div class="ex-name">${esc(s.dayName)}</div><div class="ex-meta">${fmtDate(s.date)} · ${fmtDur(s.dur)} · ${s.sets} séries${s.feel ? ' · ' + ({ 1: 'facile', 2: 'bien', 3: 'dur' })[s.feel] : ''}</div></div><div class="ex-tgt">${fmtNum(s.volume)}</div>
        ${open ? `<div style="flex-basis:100%;padding:6px 4px 10px 44px">${s.entries.map(e => `<div class="row between" style="padding:4px 0;font-size:14px"><span>${esc(e.name)}</span><span class="sub num">${e.sets.map(x => x.v).join(' · ')}${e.type === 'time' ? ' s' : ''}</span></div>`).join('')}<button class="btn sm danger" style="margin-top:10px" data-act="delSession" data-id="${s.id}">${ic('trash')} Supprimer</button></div>` : ''}</div>`;
    }).join('')}</div>`;
};

/* =============== MINUTEUR =============== */
const TIMERS = [
  { n: 'Tabata', d: '20 s effort / 10 s repos × 8', work: 20, rest: 10, rounds: 8 },
  { n: 'HIIT 40/20', d: '40 s effort / 20 s repos × 8', work: 40, rest: 20, rounds: 8 },
  { n: 'EMOM 10', d: '1 minute pour réaliser votre tâche × 10', work: 60, rest: 0, rounds: 10 },
  { n: 'Gainage 5 × 45', d: '45 s tenue / 20 s repos × 5', work: 45, rest: 20, rounds: 5 },
  { n: 'Repos 1 min', d: 'Compte à rebours', work: 0, rest: 60, rounds: 1, rest_only: true },
  { n: 'Repos 90 s', d: 'Compte à rebours', work: 0, rest: 90, rounds: 1, rest_only: true },
  { n: 'Repos 2 min', d: 'Compte à rebours', work: 0, rest: 120, rounds: 1, rest_only: true },
  { n: 'Repos 3 min', d: 'Compte à rebours', work: 0, rest: 180, rounds: 1, rest_only: true }
];
let CUSTOM = { work: 30, rest: 15, rounds: 6, prep: 5 };
VIEWS.timer = function () {
  return `<div class="page-head"><div><div class="eyebrow">Outils</div><h1>Minuteurs</h1></div></div>
  <div class="grid g4">${TIMERS.map((t, i) => `<button class="card hover" style="text-align:left" data-act="runTimer" data-i="${i}"><div class="row between"><h3>${t.n}</h3>${ic('play')}</div><div class="sub" style="font-size:13px;margin-top:6px">${t.d}</div></button>`).join('')}</div>
  <div class="card" style="margin-top:16px"><div class="card-t"><h2>Minuteur personnalisé</h2></div>
    <div class="grid g4">
      <div class="field"><label>Effort (s)</label><input class="inp" type="number" min="0" max="600" value="${CUSTOM.work}" data-bind="cwork"></div>
      <div class="field"><label>Repos (s)</label><input class="inp" type="number" min="0" max="600" value="${CUSTOM.rest}" data-bind="crest"></div>
      <div class="field"><label>Tours</label><input class="inp" type="number" min="1" max="99" value="${CUSTOM.rounds}" data-bind="crounds"></div>
      <div class="field"><label>Préparation (s)</label><input class="inp" type="number" min="0" max="60" value="${CUSTOM.prep}" data-bind="cprep"></div>
    </div>
    <div class="row" style="margin-top:16px"><button class="btn primary" data-act="runCustom">${ic('play')} Démarrer</button><span class="sub" style="font-size:13px">Durée totale : ${fmtTime(CUSTOM.prep + CUSTOM.rounds * (CUSTOM.work + CUSTOM.rest))}</span></div></div>`;
};

/* =============== NUTRITION =============== */
function calcNutri() {
  const p = S.profile, g = goal();
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === 'h' ? 5 : -161);
  const tdee = bmr * p.activity, kcal = tdee * (1 + g.kcal);
  const prot = p.weight * g.prot, fat = p.weight * 0.9, carb = Math.max(0, (kcal - prot * 4 - fat * 9) / 4);
  const water = p.weight * 0.035 + 0.5;
  const bmi = p.weight / Math.pow(p.height / 100, 2);
  return { bmr, tdee, kcal, prot, fat, carb, water, bmi };
}
VIEWS.nutrition = function () {
  const p = S.profile, g = goal(), c = calcNutri();
  const tot = c.prot * 4 + c.fat * 9 + c.carb * 4;
  const delta = Math.round(g.kcal * 100);
  return `<div class="page-head"><div><div class="eyebrow">Calcul personnalisé</div><h1>Nutrition</h1></div></div>
  <div class="grid g2">
    <div class="card"><div class="card-t"><h2>Mon profil</h2></div>
      <div class="grid g2" style="gap:12px">
        <div class="field"><label>Sexe</label><select class="inp" data-bind="p.sex"><option value="h" ${p.sex === 'h' ? 'selected' : ''}>Homme</option><option value="f" ${p.sex === 'f' ? 'selected' : ''}>Femme</option></select></div>
        <div class="field"><label>Âge</label><input class="inp" type="number" min="14" max="90" value="${p.age}" data-bind="p.age"></div>
        <div class="field"><label>Taille (cm)</label><input class="inp" type="number" min="120" max="230" value="${p.height}" data-bind="p.height"></div>
        <div class="field"><label>Poids (kg)</label><input class="inp" type="number" min="30" max="250" step="0.1" value="${p.weight}" data-bind="p.weight"></div>
        <div class="field" style="grid-column:1/-1"><label>Activité (hors séances)</label><select class="inp" data-bind="p.activity">
          ${[[1.2, 'Sédentaire (bureau, peu de marche)'], [1.375, 'Légère (1–3 séances / semaine)'], [1.55, 'Modérée (3–5 séances / semaine)'], [1.725, 'Élevée (6+ séances, métier physique)']].map(([v, l]) => `<option value="${v}" ${p.activity === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      </div>
      <div class="sub" style="font-size:12px;margin-top:14px">Formule de Mifflin-St Jeor. Ce sont des estimations : ajustez selon l'évolution de votre poids sur 2 à 3 semaines.</div></div>
    <div class="card"><div class="card-t"><h2>Cible pour ${g.name.toLowerCase()}</h2><span class="pill a">${delta > 0 ? '+' : ''}${delta} %</span></div>
      <div class="stat"><span class="v" style="font-size:46px">${fmtNum(c.kcal)} <span class="sub" style="font-size:18px">kcal / jour</span></span><span class="l">Maintien estimé : ${fmtNum(c.tdee)} kcal · métabolisme de base ${fmtNum(c.bmr)} kcal</span></div>
      <div class="macro" style="margin:20px 0 14px"><i style="width:${c.prot * 4 / tot * 100}%;background:var(--accent)"></i><i style="width:${c.carb * 4 / tot * 100}%;background:var(--blue)"></i><i style="width:${c.fat * 9 / tot * 100}%;background:var(--warn)"></i></div>
      <div class="grid g3" style="gap:10px">
        <div><div class="row" style="gap:6px"><span style="width:9px;height:9px;border-radius:3px;background:var(--accent)"></span><span class="sub">Protéines</span></div><b style="font-size:22px">${fmtNum(c.prot)} g</b></div>
        <div><div class="row" style="gap:6px"><span style="width:9px;height:9px;border-radius:3px;background:var(--blue)"></span><span class="sub">Glucides</span></div><b style="font-size:22px">${fmtNum(c.carb)} g</b></div>
        <div><div class="row" style="gap:6px"><span style="width:9px;height:9px;border-radius:3px;background:var(--warn)"></span><span class="sub">Lipides</span></div><b style="font-size:22px">${fmtNum(c.fat)} g</b></div>
      </div></div>
  </div>
  <div class="grid g3" style="margin-top:16px">
    <div class="card stat"><span class="l">Eau conseillée</span><span class="v">${(Math.round(c.water * 10) / 10).toString().replace('.', ',')} L</span><span class="l" style="font-size:12px">+ 0,5 L les jours d'entraînement</span></div>
    <div class="card stat"><span class="l">IMC</span><span class="v">${(Math.round(c.bmi * 10) / 10).toString().replace('.', ',')}</span><span class="l" style="font-size:12px">${c.bmi < 18.5 ? 'Sous la norme' : c.bmi < 25 ? 'Dans la norme' : c.bmi < 30 ? 'Surpoids' : 'Obésité'} · indicateur limité si vous êtes musclé</span></div>
    <div class="card stat"><span class="l">Protéines par repas (4 repas)</span><span class="v">${fmtNum(c.prot / 4)} g</span><span class="l" style="font-size:12px">≈ ${Math.round(c.prot / 4 / 0.2)} g de viande, poisson ou tofu</span></div>
  </div>`;
};

/* =============== EXERCICES =============== */
const CATS = { all: 'Tous', push: 'Poussée', pull: 'Tirage', legs: 'Jambes', core: 'Core', cardio: 'Cardio', mob: 'Mobilité' };
function catOf(e) {
  if (['push', 'vpush', 'dips', 'plyoPush'].includes(e.ladder)) return 'push';
  if (['vpull', 'vpullNB', 'row'].includes(e.ladder)) return 'pull';
  if (['squat', 'lunge', 'hinge', 'calf', 'plyoLegs'].includes(e.ladder)) return 'legs';
  if (['coreS', 'coreD'].includes(e.ladder)) return 'core';
  if (e.ladder === 'cardio') return 'cardio';
  return 'mob';
}
VIEWS.library = function () {
  const q = LIB_Q.toLowerCase(), list = Object.values(K.X).filter(e => (LIB_CAT === 'all' || catOf(e) === LIB_CAT) && (!q || e.name.toLowerCase().includes(q) || e.muscles.toLowerCase().includes(q)));
  return `<div class="page-head"><div><div class="eyebrow">${Object.keys(K.X).length} exercices</div><h1>Bibliothèque</h1></div>
    <input class="inp" style="width:260px" placeholder="Rechercher…" value="${esc(LIB_Q)}" data-bind="libq" id="libq"></div>
  <div class="tabs" style="margin-bottom:18px">${Object.entries(CATS).map(([k, l]) => `<button class="tab ${LIB_CAT === k ? 'on' : ''}" data-act="libCat" data-c="${k}">${l}</button>`).join('')}</div>
  <div class="grid g2">${list.map(e => `<div class="lib-item"><div class="row" style="align-items:flex-start;gap:14px"><div class="fig-sm">${FIG.figSvg(e.id)}</div><div style="flex:1;min-width:0"><div class="row between"><div><b>${esc(e.name)}</b><div class="sub" style="font-size:13px">${esc(e.muscles)}</div></div><button class="icon-btn" title="Voir le cours" data-act="lesson" data-id="${e.id}">${ic('video')}</button></div><div class="sub" style="font-size:14px;margin-top:8px">${esc(e.cue)}</div></div></div>${laddr(e)}</div>`).join('') || '<div class="empty">Aucun exercice trouvé.</div>'}</div>`;
};

/* =============== RÉGLAGES =============== */
const sw = (k, on) => `<button class="sw ${on ? 'on' : ''}" data-act="toggle" data-k="${k}" role="switch" aria-checked="${on}"></button>`;
VIEWS.settings = function () {
  const P = S.prefs, p = S.profile;
  return `<div class="page-head"><div><div class="eyebrow">Personnalisation</div><h1>Réglages</h1></div></div>
  <div class="grid g2">
    ${window.INSTALL && !INSTALL.standalone() ? `<div class="card"><div class="card-t"><h2>Application</h2></div><div class="set-row"><div><b>Installer sur le téléphone</b><div class="d">Icône d'accueil, plein écran, hors ligne.</div></div><button class="btn sm primary" data-act="install">Installer</button></div></div>` : ''}
    <div class="card"><div class="card-t"><h2>Profil</h2></div>
      <div class="field"><label>Prénom</label><input class="inp" value="${esc(p.name)}" data-bind="p.name" placeholder="Votre prénom"></div>
      <div class="set-row"><div><b>Programme actuel</b><div class="d">${goal().name} · ${K.LEVELS[P.level].name} · ${P.days.map(d => DOW[d]).join(', ')}</div></div><button class="btn sm" data-act="editProgram">Modifier</button></div></div>
    <div class="card"><div class="card-t"><h2>Séance</h2></div>
      <div class="set-row"><div><b>Sons & bips</b><div class="d">Décompte, fin de repos, fin de séance.</div></div>${sw('sound', P.sound)}</div>
      <div class="set-row"><div><b>Garder l'écran allumé</b><div class="d">Pendant une séance.</div></div>${sw('awake', P.awake)}</div>
      <div class="set-row"><div><b>Échauffement guidé</b><div class="d">Ajoute 4 minutes de mobilité avant la séance.</div></div>${sw('warmup', P.warmup)}</div>
      <div class="set-row"><div><b>Démarrage auto des tenues</b><div class="d">Lance le chrono des gainages après le repos.</div></div>${sw('autoStart', P.autoStart)}</div>
      <div class="set-row"><div><b>Durée des repos</b><div class="d">Multiplicateur appliqué à tous les repos.</div></div>
        <div class="seg">${[[0.75, '−25 %'], [1, 'Normal'], [1.25, '+25 %'], [1.5, '+50 %']].map(([v, l]) => `<button class="opt ${P.restMult === v ? 'on' : ''}" data-act="restMult" data-v="${v}">${l}</button>`).join('')}</div></div></div>
    <div class="card desk-only"><div class="card-t"><h2>Rappel</h2></div>
      <div class="set-row"><div><b>Rappel de séance</b><div class="d">Notification les jours d'entraînement (l'app doit être ouverte, même réduite).</div></div>${sw('reminderOn', P.reminderOn)}</div>
      <div class="set-row"><div><b>Heure</b></div><input class="inp" type="time" style="width:130px" value="${P.reminder || '18:00'}" data-bind="reminder"></div></div>
    <div class="card"><div class="card-t"><h2>Données</h2></div>
      <div class="set-row"><div><b>Exporter</b><div class="d">Sauvegarde complète en fichier JSON.</div></div><button class="btn sm" data-act="exportData">${ic('download')} Exporter</button></div>
      <div class="set-row"><div><b>Importer</b><div class="d">Restaurer une sauvegarde (remplace les données actuelles).</div></div><button class="btn sm" data-act="importData">${ic('upload')} Importer</button></div>
      <div class="set-row"><div><b>Tout effacer</b><div class="d">Supprime séances, poids et réglages.</div></div><button class="btn sm danger" data-act="resetAll">${ic('trash')} Effacer</button></div>
      <div class="sub" style="font-size:12px;margin-top:10px">Vos données restent sur cet appareil, rien n'est envoyé sur internet.</div></div>
  </div>`;
};

/* =============== COURS (leçon d'un exercice) =============== */
function lessonHtml(id) {
  const e = K.X[id], L = window.LESSONS[id]; if (!e || !L) return '';
  return `<div class="row between" style="margin-bottom:12px"><div><div class="eyebrow">Cours · ${esc(e.muscles)}</div><h2 style="margin:2px 0 0">${esc(e.name)}</h2></div><button class="icon-btn" data-act="modalClose">${ic('x')}</button></div>
  <div class="fig-wrap" style="width:min(340px,100%);margin-bottom:14px">${FIG.figSvg(id)}</div>
  ${L.side ? '<div class="pill a" style="margin-bottom:12px">À faire de chaque côté</div>' : ''}
  <div class="eyebrow" style="margin:6px 0">Exécution</div>
  ${L.steps.map((s, i) => `<div class="lesson-step"><span class="qn">${i + 1}</span><span>${esc(s)}</span></div>`).join('')}
  <div class="eyebrow" style="margin:16px 0 6px;color:var(--red,#ff6b6b)">Erreurs à éviter</div>
  ${L.errors.map(s => `<div class="lesson-step err"><span class="qn">!</span><span>${esc(s)}</span></div>`).join('')}
  <div class="eyebrow" style="margin:16px 0 6px">Rythme & respiration</div><div class="sub" style="font-size:14px">${esc(L.tempo)}</div>
  ${laddr(e)}
  <div class="row" style="margin-top:16px;justify-content:center"><button class="btn sm ghost" data-act="video" data-id="${id}">${ic('video')} Vidéo en ligne (optionnel)</button></div>`;
}
