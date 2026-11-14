/* Kinetik — séance guidée, minuteurs, assistants, actions */
let SES = null, TIM = null, tickId = null;
const mult = () => S.prefs.restMult || 1;

/* ---------- Construction des étapes ---------- */
function buildSteps(day) {
  const steps = [];
  if (S.prefs.warmup) day.warm.forEach((w, i) => steps.push({ k: 'warm', ex: w.ex, bi: -1, set: i + 1, sets: day.warm.length, time: w.time, rest: 5, auto: true }));
  if (day.circuit) {
    const rounds = day.blocks[0].sets;
    for (let r = 1; r <= rounds; r++) day.blocks.forEach((b, bi) => {
      const last = bi === day.blocks.length - 1;
      steps.push({ k: 'main', ex: b.ex, bi, set: r, sets: rounds, round: r, rounds, reps: b.reps || null, time: b.time || null, rest: last ? (r === rounds ? 0 : 45) : b.rest, ovKey: b.ovKey, circuit: true, auto: !!b.time });
    });
  } else {
    day.blocks.forEach((b, bi) => { for (let s = 1; s <= b.sets; s++) steps.push({ k: 'main', ex: b.ex, bi, set: s, sets: b.sets, reps: b.reps || null, time: b.time || null, rest: Math.round(b.rest * mult()), ovKey: b.ovKey, explosive: b.explosive }); });
  }
  if (day.finisher) {
    const f = day.finisher, ex = K.X[f.exId];
    for (let s = 1; s <= f.sets; s++) steps.push({ k: 'fin', ex, bi: 99, set: s, sets: f.sets, time: f.time, rest: f.rest, auto: true });
  }
  if (steps.length) steps[steps.length - 1].rest = steps[steps.length - 1].rest; // conservé, ignoré à la fin
  day.cool.forEach((w, i) => steps.push({ k: 'cool', ex: w.ex, bi: -2, set: i + 1, sets: day.cool.length, time: w.time, rest: 5, auto: true }));
  steps[steps.length - 1].rest = 0;
  return steps;
}

function startSession(day, dayIdx) {
  if (SES || TIM) return;
  const steps = buildSteps(day);
  SES = { day, dayIdx, steps, i: 0, phase: 'work', t0: Date.now(), logs: [], val: 0, deadline: 0, paused: false, pauseAt: 0, runStart: 0, swapped: false, prepEnd: 0, totalPause: 0 };
  if (S.prefs.awake && window.native) window.native.awake(true);
  $('#overlay').classList.add('on');
  enterStep();
  clearInterval(tickId); tickId = setInterval(tick, 100);
  document.documentElement.classList.add('in-ses');
}

function curStep() { return SES.steps[SES.i]; }
function defaultVal(st) {
  const last = lastOf(st.ex.id);
  if (st.reps) { const lv = last && last[st.set - 1]; return Math.max(1, Math.min(60, lv || st.reps[1])); }
  return st.time;
}
function enterStep() {
  const st = curStep();
  SES.val = defaultVal(st); SES.extra = 0;
  if (st.time) {
    const auto = st.auto && (st.k !== 'main' || S.prefs.autoStart || st.circuit);
    if (auto) { SES.phase = 'prep'; SES.deadline = Date.now() + 3000; SES.cnt = 4; sfx.tick(); }
    else { SES.phase = 'idle'; }
  } else SES.phase = 'work';
  renderSes();
}
function startRun() {
  const st = curStep(); SES.phase = 'run'; SES.deadline = Date.now() + st.time * 1000; SES.runStart = Date.now(); SES.cnt = 99; sfx.go(); renderSes();
}
function completeStep(v) {
  const st = curStep();
  if (st.k === 'main' || st.k === 'fin') SES.logs.push({ bi: st.bi, k: st.k, ex: st.ex, v: Math.round(v), set: st.set, target: st.reps ? st.reps : st.time, type: st.time ? 'time' : 'reps', ovKey: st.ovKey });
  sfx.ok();
  if (SES.i >= SES.steps.length - 1) return finishSession();
  if (st.rest > 0) { SES.phase = 'rest'; SES.deadline = Date.now() + st.rest * 1000; SES.cnt = 99; renderSes(); }
  else { SES.i++; enterStep(); }
}
function skipRest() { SES.i++; sfx.go(); enterStep(); }
function skipStep() { if (SES.i >= SES.steps.length - 1) return finishSession(); SES.i++; enterStep(); }

function tick() {
  if (TIM) return timTick();
  if (!SES || SES.paused) return;
  const now = Date.now(), el = $('#ses-clock'); if (el) el.textContent = fmtTime((now - SES.t0 - SES.totalPause) / 1000);
  const ph = SES.phase;
  if (ph === 'prep' || ph === 'run' || ph === 'rest') {
    const rem = (SES.deadline - now) / 1000, sec = Math.ceil(rem);
    if (rem <= 3.05 && sec >= 1 && SES.cnt !== sec && ph !== 'prep') { SES.cnt = sec; sfx.tick(); }
    if (ph === 'prep' && SES.cnt !== sec) { SES.cnt = sec; if (sec >= 1) sfx.tick(); }
    updateTimerUI(rem);
    if (rem <= 0) {
      if (ph === 'prep') startRun();
      else if (ph === 'run') { sfx.done(); completeStep(curStep().time); }
      else { sfx.go(); if (window.native) window.native.flash(); skipRest(); }
    }
  }
}
function updateTimerUI(rem) {
  const t = $('#big-t'), r = $('#ring-bar'); if (!t) return;
  const ph = SES.phase, st = curStep();
  const total = ph === 'prep' ? 3 : ph === 'run' ? st.time : st.rest + (SES.extra || 0);
  t.textContent = ph === 'prep' ? Math.max(1, Math.ceil(rem)) : fmtTime(Math.ceil(Math.max(0, rem)));
  if (r) { const c = parseFloat(r.getAttribute('stroke-dasharray')); r.style.transition = 'none'; r.setAttribute('stroke-dashoffset', c * (1 - Math.max(0, Math.min(1, rem / total)))); }
}

/* ---------- Rendu de la séance ---------- */
function stepTitle(st) {
  if (st.k === 'warm') return `Échauffement · ${st.set}/${st.sets}`;
  if (st.k === 'cool') return `Retour au calme · ${st.set}/${st.sets}`;
  if (st.k === 'fin') return `Finisher · tour ${st.set}/${st.sets}`;
  if (st.circuit) return `Circuit · tour ${st.round}/${st.rounds}`;
  return `${SES.day.name} · série ${st.set}/${st.sets}`;
}
function queueHtml() {
  const out = []; let seen = {};
  SES.steps.forEach((st, i) => {
    const key = st.k === 'main' && !st.circuit ? 'b' + st.bi : st.k === 'main' ? 'c' + st.bi : st.k;
    if (st.k === 'warm' || st.k === 'cool' || st.k === 'fin' || st.circuit) {
      const g = st.k === 'main' ? 'circ' + st.bi : st.k;
      if (!seen[g]) { seen[g] = { name: st.k === 'warm' ? 'Échauffement' : st.k === 'cool' ? 'Retour au calme' : st.k === 'fin' ? 'Finisher' : st.ex.name, a: i, n: 0, d: 0 }; out.push(seen[g]); }
      seen[g].n++; if (i < SES.i) seen[g].d++; seen[g].b = i;
    } else {
      if (!seen[key]) { seen[key] = { name: st.ex.name, a: i, n: 0, d: 0 }; out.push(seen[key]); }
      seen[key].n++; if (i < SES.i) seen[key].d++; seen[key].b = i;
    }
  });
  return out.map((g, i) => { const done = SES.i > g.b, cur = SES.i >= g.a && SES.i <= g.b; return `<div class="q-item ${done ? 'done' : ''} ${cur ? 'cur' : ''}"><span class="qn">${i + 1}</span><span>${esc(g.name)}</span><span class="qs">${Math.min(g.d + (cur ? 1 : 0), g.n)}/${g.n}</span></div>`; }).join('');
}
function renderSes() {
  if (!SES) return;
  const st = curStep(), ph = SES.phase, pct = SES.i / SES.steps.length;
  const e = st.ex;
  let stage = '', foot = '';
  const tgt = st.reps ? `${st.reps[0]}–${st.reps[1]} reps` : `${st.time} s`;
  const last = lastOf(e.id);
  const prevH = st.k === 'main' && last ? `<div class="prev">Dernière fois : <b>${last.join(' · ')}${st.time ? ' s' : ''}</b></div>` : '';
  const canE = st.k === 'main' && !!K.variant(e.id, -1, eq()), canH = st.k === 'main' && !!K.variant(e.id, 1, eq());
  const demo = `<button class="btn sm ghost" data-act="lesson" data-id="${e.id}">${ic('info')} Voir le cours</button>`;
  const variantBtns = `<button class="btn ghost" data-act="sesVar" data-d="-1" ${canE ? '' : 'disabled'}>${ic('down')} Plus facile</button>`;
  const variantBtnsH = `<button class="btn ghost" data-act="sesVar" data-d="1" ${canH ? '' : 'disabled'}>Plus dur ${ic('up')}</button>`;
  if (ph === 'rest') {
    const nx = SES.steps[SES.i + 1];
    SES.extra = SES.extra || 0;
    stage = `<div class="ses-phase" style="color:var(--blue)">Repos</div>
      <div class="ring rest-ring">${ringSvg(1, 300, 14, 'id="ring-bar" style="stroke:var(--blue)"')}<div class="c"><div class="big-time" id="big-t" style="font-size:80px">0:00</div></div></div>
      <div class="fig-xs" style="width:130px">${FIG.figSvg(nx.ex.id)}</div><div class="prev">Ensuite : <b>${esc(nx.ex.name)}</b> · ${stepTitle(nx).split('·').pop().trim()}${nx.reps ? ' · ' + nx.reps[0] + '–' + nx.reps[1] + ' reps' : ' · ' + nx.time + ' s'}</div>
      <div class="ses-cue" style="font-size:14px">${esc(nx.ex.cue)}</div>`;
    foot = `<button class="btn ghost" data-act="restAdd" data-d="-15">${ic('minus')} 15 s</button><button class="btn primary lg" data-act="skipRest">Passer le repos ${ic('skip')}</button><button class="btn ghost" data-act="restAdd" data-d="15">${ic('plus')} 15 s</button>`;
  } else if (st.time) {
    const run = ph === 'run', prep = ph === 'prep';
    stage = `<div class="ses-phase">${stepTitle(st)}</div><div class="fig-wrap" style="width:min(250px,60%)">${FIG.figSvg(e.id)}</div><div class="ses-name" style="font-size:clamp(24px,3.4vw,40px)">${esc(e.name)}</div><div class="ses-cue">${esc(e.cue)}</div>
      <div class="ring rest-ring" style="margin:6px 0">${ringSvg(prep || run ? 1 : 1, 300, 14, 'id="ring-bar"')}<div class="c"><div class="big-time ${prep ? 'pulse' : ''}" id="big-t">${prep ? 3 : fmtTime(st.time)}</div><div class="sub" style="margin-top:4px">${prep ? 'Préparez-vous' : run ? 'Tenez !' : 'objectif'}</div></div></div>
      ${prevH}<div>${demo}</div>`;
    foot = run ? `<button class="btn ghost" data-act="skipStep">${ic('skip')} Passer</button><button class="btn primary lg" data-act="endHold">${ic('check')} Terminé</button>`
      : prep ? `<button class="btn ghost" data-act="skipStep">${ic('skip')} Passer</button><button class="btn lg" data-act="startRun">Go maintenant</button>`
      : `${st.k === 'main' ? variantBtns : ''}<button class="btn ghost" data-act="skipStep">${ic('skip')} Passer</button><button class="btn primary lg" data-act="startRun">${ic('play')} Démarrer</button>${st.k === 'main' ? variantBtnsH : ''}`;
  } else {
    stage = `<div class="ses-phase">${stepTitle(st)}</div><div class="fig-wrap">${FIG.figSvg(e.id)}</div><div class="ses-name" style="font-size:clamp(26px,3.6vw,44px)">${esc(e.name)}</div>
      <div class="ses-cue">${esc(e.cue)}${st.explosive ? ' <b style="color:var(--accent)">Explosif !</b>' : ''}</div>
      <div class="ses-tgt"><span class="pill a">Objectif ${tgt}</span><span class="pill">${esc(e.muscles)}</span><span class="pill">Repos ${st.rest} s</span>${(window.LESSONS[e.id] || {}).side ? '<span class="pill a">Par côté</span>' : ''}</div>
      <div class="stepper"><button class="sb" data-act="valAdd" data-d="-1">${ic('minus')}</button><div class="val num" id="val">${SES.val}<small>répétitions</small></div><button class="sb" data-act="valAdd" data-d="1">${ic('plus')}</button></div>
      ${prevH}<div>${demo}</div>`;
    foot = `${variantBtns}<button class="btn ghost" data-act="skipStep">${ic('skip')} Passer</button><button class="btn primary lg" data-act="doneSet">${ic('check')} Valider la série</button>${variantBtnsH}`;
  }
  $('#overlay').innerHTML = `<div class="ses">
    <div class="ses-top"><button class="icon-btn" data-act="sesMenu" title="Pause (Échap)">${ic('pause')}</button>
      <div class="ses-bar"><div style="flex:1;height:5px;border-radius:5px;background:var(--panel3);overflow:hidden"><div style="height:100%;width:${pct * 100}%;background:var(--accent);transition:width .5s var(--ease)"></div></div></div>
      <span class="num sub" id="ses-clock" style="min-width:54px;text-align:right">${fmtTime((Date.now() - SES.t0 - SES.totalPause) / 1000)}</span>
      <button class="icon-btn" data-act="toggle" data-k="sound" title="Son">${ic(S.prefs.sound ? 'vol' : 'mute')}</button></div>
    <div class="ses-body"><div class="ses-stage">${stage}</div><div class="ses-side"><div class="eyebrow" style="margin:4px 6px 8px">${esc(SES.day.name)} · ${SES.steps.length} étapes</div>${queueHtml()}</div></div>
    <div class="ses-foot">${foot}</div></div>`;
  if (ph === 'rest' || ph === 'run' || ph === 'prep') updateTimerUI((SES.deadline - Date.now()) / 1000);
}

/* ---------- Fin de séance ---------- */
function finishSession(partial) {
  if (!SES) return;
  const ses = SES;
  const mainLogs = ses.logs;
  const dur = Math.max(60, Math.round((Date.now() - ses.t0 - ses.totalPause) / 1000));
  cleanupSes();
  if (!mainLogs.some(l => l.k === 'main')) { render(); toast('Séance non enregistrée (aucune série validée)'); return; }
  // entrées groupées
  const map = new Map();
  mainLogs.forEach(l => { const key = l.k + l.bi + l.ex.id; if (!map.has(key)) map.set(key, { id: l.ex.id, name: l.ex.name, type: l.type, k: l.k, bi: l.bi, ovKey: l.ovKey, target: l.target, sets: [] }); map.get(key).sets.push({ v: l.v }); });
  const entries = [...map.values()];
  const ts = Date.now(), vol = mainLogs.reduce((a, l) => a + l.v, 0);
  // records
  const prs = [];
  entries.forEach(e => { if (e.k !== 'main') return; const mx = Math.max(...e.sets.map(x => x.v)), prior = bestOf(e.id, ts); if (prior > 0 && mx > prior && !prs.find(p => p.id === e.id)) prs.push({ id: e.id, name: e.name, v: mx, type: e.type, prior }); });
  // progression
  const prog = [];
  if (!ses.day.circuit) entries.forEach(e => {
    if (e.k !== 'main' || !e.ovKey) return;
    const exObj = K.X[e.id], full = e.sets.length >= (ses.steps.find(s => s.bi === e.bi && s.k === 'main')?.sets || 99);
    if (!full) return;
    if (e.type === 'reps' && Array.isArray(e.target)) {
      const hi = e.target[1], lo = e.target[0];
      if (e.sets.every(x => x.v >= hi)) { const nv = K.variant(e.id, 1, eq()); if (nv) { S.over[e.ovKey] = (S.over[e.ovKey] || 0) + 1; prog.push({ up: true, text: `${e.name} → ${nv.name}` }); } else prog.push({ up: true, text: `${e.name} : niveau maximal atteint 🏆` }); }
      else if (e.sets.filter(x => x.v < lo).length >= Math.ceil(e.sets.length / 2)) { const pv = K.variant(e.id, -1, eq()); if (pv) { S.over[e.ovKey] = (S.over[e.ovKey] || 0) - 1; prog.push({ up: false, text: `${e.name} → ${pv.name} (pour mieux consolider)` }); } }
    } else if (e.type === 'time' && typeof e.target === 'number') {
      if (e.sets.every(x => x.v >= e.target)) { const nt = Math.min(120, e.target + 5); S.hold[e.id] = nt; prog.push({ up: true, text: `${e.name} : tenue de ${nt} s la prochaine fois` }); }
    }
  });
  const rec = { id: 's' + ts, ts, date: ymd(), dayName: ses.day.name, dayKey: ses.day.key, goal: S.prefs.goal, level: S.prefs.level, dur, sets: mainLogs.length, volume: vol, entries, feel: 0 };
  S.sessions.push(rec);
  if (!partial || ses.dayIdx != null) S.cursor = (ses.dayIdx + 1) % K.SPLITS[nDays()].length;
  save(true); setAccent();
  sfx.done();
  showSummary(rec, prs, prog);
}
function showSummary(rec, prs, prog) {
  const g = goal();
  modal(`<div class="eyebrow">Séance terminée</div><h1 style="margin:4px 0 2px">Bien joué ! 🔥</h1><p class="sub">${esc(rec.dayName)} · ${g.name}</p>
    <div class="sum-grid"><div class="card stat"><span class="v">${fmtDur(rec.dur)}</span><span class="l">Durée</span></div><div class="card stat"><span class="v">${rec.sets}</span><span class="l">Séries</span></div><div class="card stat"><span class="v">${fmtNum(rec.volume)}</span><span class="l">Volume</span></div><div class="card stat"><span class="v">${prs.length}</span><span class="l">Record${prs.length > 1 ? 's' : ''}</span></div></div>
    ${prs.map(p => `<div class="prog-line">${ic('trophy')}<span><b>Record !</b> ${esc(p.name)} : ${p.v}${p.type === 'time' ? ' s' : ' reps'} <span class="sub">(avant : ${p.prior})</span></span></div>`).join('')}
    ${prog.map(p => `<div class="prog-line"><span class="tag ${p.up ? 'ok' : ''}">${p.up ? 'PROGRESSION' : 'AJUSTEMENT'}</span><span>${esc(p.text)}</span></div>`).join('')}
    <div class="eyebrow" style="margin:16px 0 8px">Comment c'était ?</div>
    <div class="feel">${[[1, 'Facile'], [2, 'Bien'], [3, 'Dur']].map(([v, l]) => `<button data-act="feel" data-v="${v}" data-id="${rec.id}">${l}</button>`).join('')}</div>
    <div class="row between"><span class="sub" style="font-size:13px">Pensez à vous hydrater et à manger des protéines.</span><button class="btn primary" data-act="closeSummary">Terminer</button></div>`, '', () => { go('today'); });
}
function cleanupSes() {
  SES = null; clearInterval(tickId); tickId = null;
  if (window.native) window.native.awake(false);
  $('#overlay').classList.remove('on'); $('#overlay').innerHTML = '';
  document.documentElement.classList.remove('in-ses');
}
function sesMenu() {
  if (!SES || SES.paused) return;
  SES.paused = true; SES.pauseAt = Date.now();
  modal(`<h2 style="margin-bottom:4px">Séance en pause</h2><p class="sub" style="margin-bottom:20px">Le chrono est arrêté.</p>
    <div class="grid" style="gap:10px"><button class="btn primary lg" data-act="resume">${ic('play')} Reprendre</button>
    <button class="btn" data-act="saveQuit">${ic('check')} Terminer et enregistrer</button>
    <button class="btn danger" data-act="quitSes">${ic('x')} Quitter sans enregistrer</button></div>`, 'sm', () => { if (SES && SES.paused) resume(true); });
}
function resume(fromClose) {
  if (!SES || !SES.paused) return;
  const d = Date.now() - SES.pauseAt; SES.paused = false; SES.totalPause += d; if (SES.deadline) SES.deadline += d;
  if (!fromClose) { const r = $('#modal-root'); r._onClose = null; r.innerHTML = ''; }
}

/* ---------- Minuteurs ---------- */
function startTimer(cfg) {
  if (SES || TIM) return;
  TIM = { cfg, round: 1, phase: cfg.prep ? 'prep' : (cfg.work ? 'work' : 'rest'), deadline: 0, paused: false, cnt: 99, t0: Date.now() };
  TIM.deadline = Date.now() + (TIM.phase === 'prep' ? cfg.prep : TIM.phase === 'work' ? cfg.work : cfg.rest) * 1000;
  $('#overlay').classList.add('on'); if (S.prefs.awake && window.native) window.native.awake(true);
  clearInterval(tickId); tickId = setInterval(tick, 100); sfx.go(); renderTim();
}
function timLen() { const c = TIM.cfg; return TIM.phase === 'prep' ? c.prep : TIM.phase === 'work' ? c.work : c.rest; }
function renderTim() {
  const c = TIM.cfg, ph = TIM.phase;
  const color = ph === 'work' ? 'var(--accent)' : ph === 'rest' ? 'var(--blue)' : 'var(--warn)';
  $('#overlay').innerHTML = `<div class="ses"><div class="ses-top"><button class="icon-btn" data-act="stopTimer" title="Arrêter">${ic('x')}</button><div class="ses-bar"></div><button class="icon-btn" data-act="toggle" data-k="sound">${ic(S.prefs.sound ? 'vol' : 'mute')}</button></div>
    <div class="ses-body" style="grid-template-columns:1fr"><div class="ses-stage"><div class="ses-phase" style="color:${color}">${ph === 'prep' ? 'Préparation' : ph === 'work' ? 'Effort' : 'Repos'}</div>
      <div class="ring tring" style="width:min(340px,78vw);height:min(340px,78vw)">${ringSvg(1, 340, 16, `id="ring-bar" style="stroke:${color}"`)}<div class="c"><div class="big-time" id="big-t">0:00</div><div class="sub" style="margin-top:6px">${c.rest_only ? '' : `Tour ${TIM.round} / ${c.rounds}`}</div></div></div></div></div>
    <div class="ses-foot"><button class="btn" data-act="timPause">${ic(TIM.paused ? 'play' : 'pause')} ${TIM.paused ? 'Reprendre' : 'Pause'}</button><button class="btn ghost" data-act="timSkip">${ic('skip')} Passer</button></div></div>`;
  timUI((TIM.deadline - Date.now()) / 1000);
}
function timUI(rem) {
  const t = $('#big-t'), r = $('#ring-bar'); if (!t) return;
  t.textContent = fmtTime(Math.ceil(Math.max(0, rem)));
  const total = timLen() || 1;
  if (r) { const c = parseFloat(r.getAttribute('stroke-dasharray')); r.style.transition = 'none'; r.setAttribute('stroke-dashoffset', c * (1 - Math.max(0, Math.min(1, rem / total)))); }
}
function timTick() {
  if (!TIM || TIM.paused) return;
  const rem = (TIM.deadline - Date.now()) / 1000, sec = Math.ceil(rem);
  if (rem <= 3.05 && sec >= 1 && TIM.cnt !== sec) { TIM.cnt = sec; sfx.tick(); }
  timUI(rem); if (rem <= 0) timNext();
}
function timNext() {
  const c = TIM.cfg; TIM.cnt = 99;
  const go = ph => { TIM.phase = ph; TIM.deadline = Date.now() + timLen() * 1000; renderTim(); };
  if (TIM.phase === 'prep') { sfx.go(); return go(c.work ? 'work' : 'rest'); }
  if (TIM.phase === 'work') { if (c.rest) { sfx.done(); return go('rest'); } }
  // fin du repos ou effort sans repos : tour suivant
  if (TIM.round >= c.rounds) { sfx.done(); stopTimer(true); return; }
  TIM.round++; sfx.go(); go(c.work ? 'work' : 'rest');
}
function stopTimer(done) {
  TIM = null; clearInterval(tickId); tickId = null; if (window.native) window.native.awake(false);
  $('#overlay').classList.remove('on'); $('#overlay').innerHTML = ''; if (done) toast('Minuteur terminé ✅');
}

/* ---------- Assistant programme / onboarding ---------- */
let WZ = null;
function suggestLevel(p, pu) { if (pu >= 8 && p >= 35) return 'avance'; if (p >= 12 || pu >= 3) return 'inter'; return 'debutant'; }
function openWizard(onboarding) {
  const P = S.prefs, pr = S.profile;
  WZ = { onb: onboarding, step: onboarding ? 0 : 1, goal: P.goal, level: P.level, days: [...P.days], eq: { ...P.eq }, name: pr.name, sex: pr.sex, age: pr.age, height: pr.height, weight: pr.weight, push: '', pull: '' };
  renderWizard();
}
function renderWizard() {
  const w = WZ, steps = w.onb ? 4 : 3, idx = w.onb ? w.step : w.step - 1;
  let body = '';
  if (w.step === 0) body = `<h1>Bienvenue sur Kinetik 👋</h1><p class="sub" style="margin:6px 0 22px">Votre coach de calisthenics, 100 % local. Quelques questions pour créer votre programme.</p>
    <div class="grid g2" style="gap:14px"><div class="field" style="grid-column:1/-1"><label>Prénom</label><input class="inp" data-wz="name" value="${esc(w.name)}" placeholder="Votre prénom"></div>
    <div class="field"><label>Sexe</label><select class="inp" data-wz="sex"><option value="h" ${w.sex === 'h' ? 'selected' : ''}>Homme</option><option value="f" ${w.sex === 'f' ? 'selected' : ''}>Femme</option></select></div>
    <div class="field"><label>Âge</label><input class="inp" type="number" data-wz="age" value="${w.age}"></div>
    <div class="field"><label>Taille (cm)</label><input class="inp" type="number" data-wz="height" value="${w.height}"></div>
    <div class="field"><label>Poids (kg)</label><input class="inp" type="number" step="0.1" data-wz="weight" value="${w.weight}"></div></div>`;
  else if (w.step === 1) body = `<h1>Votre objectif</h1><p class="sub" style="margin:6px 0 20px">Il détermine les séries, répétitions, repos et le type d'exercices.</p>
    <div class="grid g2">${Object.values(K.GOALS).map(g => `<button class="goal-card ${w.goal === g.key ? 'on' : ''}" style="--gc:${g.color}" data-act="wzGoal" data-v="${g.key}"><div class="gi">${ic(g.icon)}</div><b>${g.name}</b><span>${g.desc}</span></button>`).join('')}</div>`;
  else if (w.step === 2) body = `<h1>Votre niveau</h1><p class="sub" style="margin:6px 0 16px">Répondez pour qu'on le suggère, ou choisissez directement.</p>
    <div class="grid g2" style="gap:14px;margin-bottom:16px"><div class="field"><label>Pompes d'affilée</label><input class="inp" type="number" min="0" data-wz="push" value="${w.push}" placeholder="ex. 15"></div><div class="field"><label>Tractions d'affilée</label><input class="inp" type="number" min="0" data-wz="pull" value="${w.pull}" placeholder="0 si pas de barre"></div></div>
    <div class="seg" style="margin-bottom:22px">${Object.entries(K.LEVELS).map(([k, l]) => `<button class="opt ${w.level === k ? 'on' : ''}" data-act="wzLevel" data-v="${k}">${l.name}</button>`).join('')}</div>
    <div class="eyebrow" style="margin-bottom:10px">Matériel</div>
    <div class="set-row"><div><b>Barre de traction</b><div class="d">Sinon, rowings sous une table et serviette.</div></div><button class="sw ${w.eq.bar ? 'on' : ''}" data-act="wzEq" data-k="bar"></button></div>
    <div class="set-row"><div><b>Barres parallèles / dips</b><div class="d">Sinon, dips sur chaise.</div></div><button class="sw ${w.eq.dipbars ? 'on' : ''}" data-act="wzEq" data-k="dipbars"></button></div>`;
  else body = `<h1>Vos jours d'entraînement</h1><p class="sub" style="margin:6px 0 18px">Choisissez de 3 à 6 jours. Avec 5 jours : push, pull, jambes, haut du corps, bras & core, et 2 jours de repos.</p>
    <div class="wd">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button class="${w.days.includes(d) ? 'on' : ''}" data-act="wzDay" data-d="${d}">${DOW[d]}</button>`).join('')}</div>
    <div class="row" style="margin-top:16px;gap:8px;flex-wrap:wrap"><span class="sub">Raccourcis :</span>${[[3, [1, 3, 5]], [4, [1, 2, 4, 5]], [5, [1, 2, 4, 5, 6]], [6, [1, 2, 3, 4, 5, 6]]].map(([n, d]) => `<button class="opt" data-act="wzPreset" data-d="${d.join(',')}">${n} jours</button>`).join('')}</div>
    <p class="sub" style="margin-top:14px;font-size:13px">${w.days.length < 3 ? '⚠️ Sélectionnez au moins 3 jours.' : w.days.length > 6 ? '⚠️ Maximum 6 jours : prévoyez un jour de repos.' : `${w.days.length} séances par semaine · ${7 - w.days.length} jour${7 - w.days.length > 1 ? 's' : ''} de repos.`}</p>`;
  const ok = w.step !== 3 || (w.days.length >= 3 && w.days.length <= 6);
  modal(`<div class="steps">${Array.from({ length: steps }, (_, i) => `<i class="${i <= idx ? 'on' : ''}"></i>`).join('')}</div>${body}
    <div class="row between" style="margin-top:26px">${w.step > (w.onb ? 0 : 1) ? `<button class="btn ghost" data-act="wzBack">${ic('left')} Retour</button>` : (w.onb ? '<span></span>' : '<button class="btn ghost" data-act="modalClose">Annuler</button>')}
    <button class="btn primary ${ok ? '' : ''}" ${ok ? '' : 'disabled'} data-act="wzNext">${w.step === 3 ? 'Créer mon programme' : 'Continuer'} ${ic(w.step === 3 ? 'check' : 'right')}</button></div>`, '');
}
function wzApplyLevelSuggestion() {
  if (WZ.push !== '' || WZ.pull !== '') WZ.level = suggestLevel(parseInt(WZ.push) || 0, parseInt(WZ.pull) || 0);
}
function wizardFinish() {
  const w = WZ, P = S.prefs;
  if (w.onb) { Object.assign(S.profile, { name: w.name.trim(), sex: w.sex, age: +w.age || 25, height: +w.height || 175, weight: +w.weight || 72 }); S.weights.push({ date: ymd(), kg: +w.weight || 72 }); }
  const changed = P.goal !== w.goal || P.level !== w.level || P.days.length !== w.days.length || P.eq.bar !== w.eq.bar || P.eq.dipbars !== w.eq.dipbars;
  P.goal = w.goal; P.level = w.level; P.days = [...w.days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)); P.eq = { ...w.eq };
  if (changed) { S.over = {}; S.hold = {}; S.cursor = 0; }
  if (!S.created) S.created = ymd(); S.onboarded = true; PROG_DAY = null; save(true); closeModal(); setAccent(); render();
  toast(w.onb ? 'Programme créé ✨' : 'Programme mis à jour');
}

/* ---------- Poids ---------- */
function weightModal() {
  const last = S.weights[S.weights.length - 1];
  modal(`<h2 style="margin-bottom:16px">Enregistrer mon poids</h2><div class="grid g2" style="gap:12px"><div class="field"><label>Poids (kg)</label><input class="inp" id="w-kg" type="number" step="0.1" value="${last ? last.kg : S.profile.weight}"></div><div class="field"><label>Date</label><input class="inp" id="w-d" type="date" value="${ymd()}"></div></div>
    <div class="row between" style="margin-top:22px"><button class="btn ghost" data-act="modalClose">Annuler</button><button class="btn primary" data-act="saveWeight">${ic('check')} Enregistrer</button></div>`, 'sm');
  setTimeout(() => { const i = $('#w-kg'); if (i) { i.focus(); i.select(); } }, 50);
}

/* ---------- Actions ---------- */
const ACT = {
  go: el => go(el.dataset.v),
  modalBg: (el, e) => { if (e.target === el && (!SES || el.dataset.lesson)) closeModal(); },
  modalClose: () => closeModal(),
  startNext: () => startSession(dayAt(S.cursor), S.cursor % program().length),
  startDay: el => { const i = +el.dataset.i; startSession(dayAt(i), i); },
  progDay: el => { PROG_DAY = +el.dataset.i; render(); },
  toggleEx: el => { PROG_EX = PROG_EX === el.dataset.k ? null : el.dataset.k; render(); },
  varEx: el => {
    const k = el.dataset.k, d = +el.dataset.d; const prog = program();
    S.over[k] = (S.over[k] || 0) + d;
    const np = program(); // vérifier que ça change réellement
    const a = JSON.stringify(prog.map(x => x.blocks.map(b => b.ex.id))), b = JSON.stringify(np.map(x => x.blocks.map(b => b.ex.id)));
    if (a === b) { S.over[k] -= d; toast('Pas de variante dans cette direction'); } else save();
    render();
  },
  lesson: el => { modal(lessonHtml(el.dataset.id), ''); const bg = document.querySelector('.modal-bg'); if (bg) bg.dataset.lesson = 1; },
  video: el => { if (window.native) window.native.demo(K.X[el.dataset.id].q); },
  editProgram: () => openWizard(false),
  wzGoal: el => { WZ.goal = el.dataset.v; renderWizard(); },
  wzLevel: el => { WZ.level = el.dataset.v; renderWizard(); },
  wzEq: el => { WZ.eq[el.dataset.k] = !WZ.eq[el.dataset.k]; renderWizard(); },
  wzDay: el => { const d = +el.dataset.d, i = WZ.days.indexOf(d); if (i >= 0) WZ.days.splice(i, 1); else WZ.days.push(d); renderWizard(); },
  wzPreset: el => { WZ.days = el.dataset.d.split(',').map(Number); renderWizard(); },
  wzBack: () => { WZ.step--; renderWizard(); },
  wzNext: () => { if (WZ.step === 2) wzApplyLevelSuggestion(); if (WZ.step === 3) return wizardFinish(); WZ.step++; renderWizard(); },
  progMode: el => { PROG_MODE = el.dataset.m; render(); },
  histOpen: el => { OPEN_HIST = OPEN_HIST === el.dataset.id ? null : el.dataset.id; render(); },
  delSession: (el, e) => { e.stopPropagation(); const id = el.dataset.id; S.sessions = S.sessions.filter(s => s.id !== id); save(true); OPEN_HIST = null; render(); toast('Séance supprimée'); },
  addWeight: () => weightModal(),
  saveWeight: () => {
    const kg = parseFloat($('#w-kg').value), d = $('#w-d').value || ymd();
    if (!(kg > 25 && kg < 300)) return toast('Poids invalide');
    S.weights = S.weights.filter(w => w.date !== d); S.weights.push({ date: d, kg: Math.round(kg * 10) / 10 }); S.weights.sort((a, b) => a.date.localeCompare(b.date));
    S.profile.weight = S.weights[S.weights.length - 1].kg; save(true); closeModal(); render(); toast('Poids enregistré');
  },
  runTimer: el => { const t = TIMERS[+el.dataset.i]; startTimer({ work: t.work, rest: t.rest, rounds: t.rounds, prep: 5, rest_only: t.rest_only }); },
  runCustom: () => startTimer({ ...CUSTOM }),
  timPause: () => { if (!TIM) return; if (TIM.paused) { TIM.paused = false; TIM.deadline = Date.now() + TIM.rem * 1000; } else { TIM.paused = true; TIM.rem = (TIM.deadline - Date.now()) / 1000; } renderTim(); },
  timSkip: () => timNext(),
  stopTimer: () => stopTimer(false),
  toggle: el => { const k = el.dataset.k; S.prefs[k] = !S.prefs[k]; save(); if (SES) renderSes(); else if (TIM) renderTim(); else render(); },
  restMult: el => { S.prefs.restMult = +el.dataset.v; save(); render(); },
  libCat: el => { LIB_CAT = el.dataset.c; render(); },
  exportData: async () => { const r = await window.native.exportData(S); if (r) toast(r === 'clipboard' ? 'Sauvegarde copiée : collez-la dans une note' : 'Sauvegarde exportée'); },
  importData: async () => {
    const d = await window.native.importData(); if (!d) return;
    if (d.__error || !d.v || !Array.isArray(d.sessions)) return toast('Fichier invalide');
    const base = DEFAULT(); S = { ...base, ...d, profile: { ...base.profile, ...d.profile }, prefs: { ...base.prefs, ...d.prefs, eq: { ...base.prefs.eq, ...(d.prefs || {}).eq } } };
    save(true); render(); toast('Données importées');
  },
  resetAll: () => modal(`<h2>Tout effacer ?</h2><p class="sub" style="margin:8px 0 22px">Séances, poids et réglages seront supprimés définitivement. Pensez à exporter d'abord.</p><div class="row between"><button class="btn ghost" data-act="modalClose">Annuler</button><button class="btn danger" data-act="doReset">${ic('trash')} Effacer</button></div>`, 'sm'),
  doReset: () => { S = DEFAULT(); save(true); closeModal(); render(); openWizard(true); },
  /* séance */
  sesMenu: () => sesMenu(), resume: () => { resume(); },
  saveQuit: () => { const r = $('#modal-root'); r._onClose = null; r.innerHTML = ''; SES.paused = false; SES.totalPause += Date.now() - SES.pauseAt; finishSession(true); },
  quitSes: () => { const r = $('#modal-root'); r._onClose = null; r.innerHTML = ''; cleanupSes(); render(); },
  valAdd: el => { SES.val = Math.max(0, Math.min(200, SES.val + +el.dataset.d)); const v = $('#val'); if (v) v.firstChild.nodeValue = SES.val; },
  doneSet: () => completeStep(SES.val),
  skipStep: () => skipStep(), skipRest: () => skipRest(), startRun: () => startRun(),
  endHold: () => { const el = (Date.now() - SES.runStart) / 1000; completeStep(Math.min(curStep().time, Math.max(1, el))); },
  restAdd: el => { SES.deadline += +el.dataset.d * 1000; SES.extra = (SES.extra || 0) + +el.dataset.d; if ((SES.deadline - Date.now()) < 1000) skipRest(); else updateTimerUI((SES.deadline - Date.now()) / 1000); },
  sesVar: el => {
    const d = +el.dataset.d, st = curStep(), nv = K.variant(st.ex.id, d, eq()); if (!nv) return;
    for (let j = SES.i; j < SES.steps.length; j++) {
      const s = SES.steps[j]; if (s.bi !== st.bi || s.k !== 'main') continue;
      s.ex = nv; if (nv.type === 'time' && !s.time) { s.time = 30; s.reps = null; } else if (nv.type === 'reps' && !s.reps) { s.reps = goal().reps; s.time = null; }
    }
    if (st.ovKey) S.over[st.ovKey] = (S.over[st.ovKey] || 0) + d;
    save(); SES.val = defaultVal(curStep()); toast(d > 0 ? 'Variante plus difficile' : 'Variante plus facile'); renderSes();
  },
  feel: el => { const s = S.sessions.find(x => x.id === el.dataset.id); if (s) { s.feel = +el.dataset.v; save(true); } $$('.feel button').forEach(b => b.classList.toggle('on', b === el)); },
  closeSummary: () => closeModal()
};

/* ---------- Événements ---------- */
function setPath(path, val) { const [a, b] = path.split('.'); if (b) S[a === 'p' ? 'profile' : a][b] = val; }
function onBind(el, ev) {
  const k = el.dataset.bind, v = el.value;
  if (k.startsWith('p.')) { const f = k.slice(2); S.profile[f] = (f === 'sex' || f === 'name') ? v : (parseFloat(v) || 0); if (f === 'weight' && +v > 25) { /* poids profil seulement */ } save(); if (ev.type === 'change' && VIEW === 'nutrition') render(); }
  else if (k === 'exsel') { EXSEL = v; render(); }
  else if (k === 'libq') { LIB_Q = v; render(); const i = $('#libq'); if (i) { i.focus(); i.setSelectionRange(v.length, v.length); } }
  else if (k === 'reminder') { S.prefs.reminder = v; save(); }
  else if (k.startsWith('c') && ev.type === 'change') { const m = { cwork: 'work', crest: 'rest', crounds: 'rounds', cprep: 'prep' }[k]; CUSTOM[m] = Math.max(m === 'rounds' ? 1 : 0, parseInt(v) || 0); render(); }
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  const f = ACT[el.dataset.act]; if (f) f(el, e);
  if ((SES || TIM) && el.blur) el.blur();
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.wz) { WZ[t.dataset.wz] = t.value; return; }
  if (t.dataset.bind && (t.dataset.bind === 'libq' || t.dataset.bind.startsWith('p.name'))) onBind(t, e);
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.wz) { WZ[t.dataset.wz] = t.value; if (t.dataset.wz === 'push' || t.dataset.wz === 'pull') { wzApplyLevelSuggestion(); renderWizard(); } return; }
  if (t.dataset.bind) onBind(t, e);
});
document.addEventListener('keydown', e => {
  if (e.target.matches('input,select,textarea')) return;
  if (SES && !SES.paused && !$('#modal-root').firstChild) {
    const ph = SES.phase;
    if (e.key === 'Escape') { sesMenu(); e.preventDefault(); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (ph === 'work') ACT.doneSet(); else if (ph === 'idle') startRun(); else if (ph === 'rest') skipRest(); else if (ph === 'run') ACT.endHold(); else if (ph === 'prep') startRun(); }
    else if (e.key === 'ArrowRight' && ph === 'work') ACT.valAdd({ dataset: { d: 1 } });
    else if (e.key === 'ArrowLeft' && ph === 'work') ACT.valAdd({ dataset: { d: -1 } });
    else if (e.key.toLowerCase() === 's') { if (ph === 'rest') skipRest(); else skipStep(); }
  } else if (SES && SES.paused && e.key === 'Escape') { ACT.resume(); closeModal(); }
  else if (TIM && e.key === 'Escape') stopTimer(false);
});

/* ---------- Rappel quotidien ---------- */
let lastRemind = '';
setInterval(() => {
  const P = S.prefs; if (!P.reminderOn || !window.native) return;
  const now = new Date(), hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`, key = ymd() + hm;
  if (hm === (P.reminder || '18:00') && key !== lastRemind && P.days.includes(now.getDay()) && !sessionsOn(ymd()).length) {
    lastRemind = key; const d = dayAt(S.cursor); window.native.notify('Kinetik · C\'est l\'heure !', `${d.name} · ~${d.estMin} min`);
  }
}, 20000);

/* ---------- Bouton retour (Android) ---------- */
function handleBack() {
  const mr = $('#modal-root');
  if (SES && SES.paused) { ACT.resume(); closeModal(); return true; }
  if (mr.firstChild) { if (WZ && !WZ.onb) { closeModal(); return true; } if (WZ && WZ.onb && WZ.step > 0) { ACT.wzBack(); return true; } if (SES) return true; closeModal(); return true; }
  if (SES) { sesMenu(); return true; }
  if (TIM) { stopTimer(false); return true; }
  if (VIEW !== 'today') { go('today'); return true; }
  return false;
}
