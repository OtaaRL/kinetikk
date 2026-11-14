/* Kinetik — noyau : état, utilitaires, icônes, graphiques */
const K = window.KD;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Icônes ---------- */
const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  program: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
  nutrition: '<path d="M12 7c-2-3-7-2-7 3 0 5 3 10 7 10s7-5 7-10c0-5-5-6-7-3z"/><path d="M12 7c0-2 1-4 3-5"/>',
  library: '<path d="M4 4h5v16H4zM11 4h5v16h-5zM18 6l3 1-4 13-3-1z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
  play: '<path d="M7 4.5v15l13-7.5z" fill="currentColor"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-4-9 0 4-4 6-4 12 0 4 3 8 7 8z"/>',
  trend: '<path d="M3 17l6-6 4 4 8-9"/><path d="M15 6h6v6"/>',
  video: '<rect x="3" y="5" width="13" height="14" rx="3"/><path d="M16 10l5-3v10l-5-3z"/>',
  skip: '<path d="M5 5l9 7-9 7zM19 5v14"/>',
  vol: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 010 7"/>',
  mute: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
  left: '<path d="M15 6l-6 6 6 6"/>', right: '<path d="M9 6l6 6-6 6"/>',
  cal: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  upload: '<path d="M12 15V3M7 8l5-5 5 5M4 21h16"/>',
  ring: '<circle cx="12" cy="12" r="9"/>',
  bell: '<path d="M6 16V11a6 6 0 1112 0v5l2 2H4zM10 21h4"/>'
};
const ic = (n, c = '') => `<svg class="i ${c}" viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;

/* ---------- Dates ---------- */
const pad = n => String(n).padStart(2, '0');
const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfWeek = (d = new Date()) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const wd = (x.getDay() + 6) % 7; x.setDate(x.getDate() - wd); return x; };
const DOW = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DOWL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const fmtDate = s => { const d = parseYmd(s); return `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const fmtTime = sec => { sec = Math.max(0, Math.round(sec)); return `${Math.floor(sec / 60)}:${pad(sec % 60)}`; };
const fmtDur = sec => { const m = Math.round(sec / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${pad(m % 60)}` : `${m} min`; };
const fmtNum = n => Math.round(n).toLocaleString('fr-FR');

/* ---------- État ---------- */
const DEFAULT = () => ({
  v: 1, onboarded: false,
  profile: { name: '', sex: 'h', age: 25, height: 175, weight: 72, activity: 1.55 },
  prefs: { goal: 'masse', level: 'debutant', days: [1, 2, 4, 5, 6], eq: { bar: true, dipbars: false }, sound: true, awake: true, restMult: 1, autoStart: true, warmup: true, reminder: '', reminderOn: false },
  over: {}, hold: {}, cursor: 0, sessions: [], weights: [], created: ''
});
let S = DEFAULT();
let saveT = null;
const LS = 'kinetik-data';
function createdDate() { return S.created || (S.sessions[0] ? S.sessions.reduce((m, s) => s.date < m ? s.date : m, '9999') : ymd()); }
async function loadState() {
  let d = null;
  try { d = window.native ? await window.native.load() : JSON.parse(localStorage.getItem(LS) || 'null'); } catch (e) {}
  if (d && d.v) {
    const base = DEFAULT();
    S = { ...base, ...d, profile: { ...base.profile, ...d.profile }, prefs: { ...base.prefs, ...d.prefs, eq: { ...base.prefs.eq, ...(d.prefs && d.prefs.eq) } } };
  }
}
function save(now) {
  clearTimeout(saveT);
  const run = () => { try { window.native ? window.native.save(S) : localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} };
  if (now) run(); else saveT = setTimeout(run, 250);
}
window.addEventListener('beforeunload', () => save(true));

/* ---------- Programme courant ---------- */
function eq() { return S.prefs.eq; }
function nDays() { return Math.max(3, Math.min(6, S.prefs.days.length)); }
function program() { return K.buildProgram(S.prefs.goal, S.prefs.level, nDays(), eq(), S.over); }
function applyHold(day) {
  day.blocks.forEach(b => { if (b.time && !day.circuit && S.hold[b.ex.id] && b.kind !== 'warm') b.time = Math.max(b.time, S.hold[b.ex.id]); });
  return day;
}
function dayAt(i) { const p = program(); return applyHold(p[((i % p.length) + p.length) % p.length]); }
function goal() { return K.GOALS[S.prefs.goal]; }
function accent() { return goal().color; }
function setAccent() {
  const c = accent(), r = document.documentElement.style;
  r.setProperty('--accent', c);
  r.setProperty('--accent-soft', c + '1f');
  r.setProperty('--accent-line', c + '59');
}

/* ---------- Stats ---------- */
const sessionsOn = d => S.sessions.filter(s => s.date === d);
function weekDone(ref = new Date()) {
  const a = ymd(startOfWeek(ref)), b = ymd(addDays(startOfWeek(ref), 6));
  return S.sessions.filter(s => s.date >= a && s.date <= b);
}
function totalVolume(ss) { return ss.reduce((a, s) => a + (s.volume || 0), 0); }
function streak() {
  // séances consécutives sans jour prévu manqué
  const days = S.prefs.days, done = new Set(S.sessions.map(s => s.date));
  let d = new Date(), n = 0;
  if (!done.has(ymd(d))) d = addDays(d, -1);
  for (let i = 0; i < 400; i++) {
    const k = ymd(d);
    if (done.has(k)) n++;
    else if (days.includes(d.getDay())) break;
    d = addDays(d, -1);
    if (ymd(d) < createdDate()) break;
  }
  return n;
}
function bestOf(exId, before) {
  let best = 0;
  S.sessions.forEach(s => { if (before && s.ts >= before) return; s.entries.forEach(e => { if (e.id === exId) e.sets.forEach(x => { if (x.v > best) best = x.v; }); }); });
  return best;
}
function lastOf(exId) {
  for (let i = S.sessions.length - 1; i >= 0; i--) { const e = S.sessions[i].entries.find(x => x.id === exId); if (e) return e.sets.map(x => x.v); }
  return null;
}

/* ---------- Modales / toasts ---------- */
function modal(html, cls = '', onClose) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-bg" data-act="modalBg"><div class="modal ${cls}">${html}</div></div>`;
  root._onClose = onClose;
}
function closeModal() { const r = $('#modal-root'); const f = r._onClose; r.innerHTML = ''; r._onClose = null; if (f) f(); }
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => { t.style.transition = '.3s'; t.style.opacity = 0; setTimeout(() => t.remove(), 300); }, 2400);
}

/* ---------- Graphiques SVG ---------- */
function ringSvg(pct, size, stroke, extra = '') {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, pct)));
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="trk" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/><circle class="bar" ${extra} cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg>`;
}
function niceMax(v) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
function barChart(vals, labels, w = 520, h = 190, fmt = v => v, minMax = 1) {
  const m = { l: 34, r: 8, t: 12, b: 24 }, iw = w - m.l - m.r, ih = h - m.t - m.b;
  const mx = niceMax(Math.max(...vals, minMax)), bw = iw / vals.length;
  let g = '';
  for (let i = 0; i <= 4; i++) { const y = m.t + ih - ih * i / 4; g += `<line class="grid-l" x1="${m.l}" x2="${w - m.r}" y1="${y}" y2="${y}"/><text x="${m.l - 6}" y="${y + 4}" text-anchor="end">${fmt(mx * i / 4)}</text>`; }
  const bars = vals.map((v, i) => { const bh = ih * v / mx, x = m.l + i * bw + bw * .18, y = m.t + ih - bh; return `<rect x="${x}" y="${y}" width="${bw * .64}" height="${Math.max(bh, v ? 3 : 0)}" rx="6" fill="var(--accent)" opacity="${i === vals.length - 1 ? 1 : .55}"><title>${labels[i]} : ${fmt(v)}</title></rect><text x="${x + bw * .32}" y="${h - 6}" text-anchor="middle">${labels[i]}</text>`; }).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}">${g}${bars}</svg>`;
}
function lineChart(pts, w = 520, h = 190, unit = '') {
  // pts : [{x:label, y:number}]
  if (pts.length < 1) return '';
  const m = { l: 38, r: 14, t: 14, b: 24 }, iw = w - m.l - m.r, ih = h - m.t - m.b;
  let mn = Math.min(...pts.map(p => p.y)), mx = Math.max(...pts.map(p => p.y));
  if (mn === mx) { mn -= 1; mx += 1; }
  const pad_ = (mx - mn) * .15; mn -= pad_; mx += pad_;
  const X = i => m.l + (pts.length === 1 ? iw / 2 : iw * i / (pts.length - 1)), Y = v => m.t + ih - ih * (v - mn) / (mx - mn);
  let g = '';
  for (let i = 0; i <= 3; i++) { const v = mn + (mx - mn) * i / 3, y = Y(v); g += `<line class="grid-l" x1="${m.l}" x2="${w - m.r}" y1="${y}" y2="${y}"/><text x="${m.l - 6}" y="${y + 4}" text-anchor="end">${(Math.round(v * 10) / 10).toString().replace('.', ',')}</text>`; }
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i)},${Y(p.y)}`).join(' ');
  const area = `${d} L${X(pts.length - 1)},${m.t + ih} L${X(0)},${m.t + ih} Z`;
  const step = Math.ceil(pts.length / 6);
  const lbl = pts.map((p, i) => (i % step === 0 || i === pts.length - 1) ? `<text x="${X(i)}" y="${h - 6}" text-anchor="middle">${p.x}</text>` : '').join('');
  const dots = pts.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.y)}" r="4" fill="var(--bg)" stroke="var(--accent)" stroke-width="2.2"><title>${p.x} : ${p.y}${unit}</title></circle>`).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="lg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".28"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>${g}<path d="${area}" fill="url(#lg)"/><path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>${dots}${lbl}</svg>`;
}
function heatmap(weeks = 16) {
  const counts = {}; S.sessions.forEach(s => counts[s.date] = (counts[s.date] || 0) + 1);
  const start = addDays(startOfWeek(), -7 * (weeks - 1)), today = ymd();
  let h = '';
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(start, i), k = ymd(d), c = counts[k] || 0;
    h += `<i class="${k > today ? 'f' : c >= 2 ? 'l3' : c === 1 ? 'l2' : ''}" title="${fmtDate(k)}${c ? ' · ' + c + ' séance' + (c > 1 ? 's' : '') : ''}"></i>`;
  }
  return `<div class="heat">${h}</div>`;
}

/* ---------- Audio ---------- */
let actx = null;
function beep(freq = 880, dur = 0.12, vol = 0.18, type = 'sine') {
  if (!S.prefs.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq; o.connect(g); g.connect(actx.destination);
    const t = actx.currentTime;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  } catch (e) {}
}
const sfx = {
  tick: () => beep(740, 0.09, 0.14),
  go: () => { beep(1046, 0.22, 0.2); },
  done: () => { beep(660, 0.12, 0.18); setTimeout(() => beep(880, 0.12, 0.18), 130); setTimeout(() => beep(1175, 0.28, 0.2), 260); },
  ok: () => beep(990, 0.08, 0.12)
};
