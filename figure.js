/* Kinetik — mannequin humain animé (cinématique inverse, vue de profil) */
(function () {
  const SG = { th: 52, sh: 50, tor: 64, neck: 10, hr: 11.5, ua: 34, fa: 32, ft: 16 };
  const rad = d => d * Math.PI / 180;
  const vec = (a, l) => [Math.cos(rad(a)) * l, -Math.sin(rad(a)) * l];
  const add = (p, v) => [p[0] + v[0], p[1] + v[1]];
  const f1 = n => Math.round(n * 10) / 10;

  function ik(a, t, l1, l2, dir) {
    let dx = t[0] - a[0], dy = t[1] - a[1], d = Math.hypot(dx, dy) || 0.001;
    const mx = l1 + l2 - 0.05, mn = Math.abs(l1 - l2) + 0.5;
    if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
    if (d < mn) d = mn;
    const ux = dx / Math.hypot(dx, dy || 0.0001), uy = dy / Math.hypot(dx || 0.0001, dy);
    const nd = Math.hypot(dx, dy) || 0.001, vx = dx / nd, vy = dy / nd;
    const aa = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - aa * aa));
    const end = [a[0] + vx * d, a[1] + vy * d];
    return { j: [a[0] + vx * aa - vy * h * dir, a[1] + vy * aa + vx * h * dir], e: end };
  }

  function solve(p) {
    const o = {};
    let hip, sho, tor;
    if (p.ank && p.sh) {
      const r = ik(p.ank, p.sh, SG.th + SG.sh, SG.tor, p.hd == null ? 1 : p.hd);
      hip = r.j; sho = r.e; tor = Math.atan2(-(sho[1] - hip[1]), sho[0] - hip[0]) * 180 / Math.PI;
    } else { hip = p.hip; tor = p.tor; sho = add(hip, vec(tor, SG.tor)); }
    o.hip = hip; o.sho = sho; o.tor = tor;
    const ha = tor + (p.na || 0), neck = add(sho, vec(ha, SG.neck)), head = add(neck, vec(ha, SG.hr));
    o.neck = neck; o.head = head; o.ha = ha;
    const foot = p.foot || p.ank, foot2 = p.foot2 || [foot[0] - 9, foot[1] - 2];
    const leg = (t, kd, kn) => {
      if (kn) {
        let v = [kn[0] - hip[0], kn[1] - hip[1]], l = Math.hypot(v[0], v[1]) || 1;
        const knee = [hip[0] + v[0] / l * SG.th, hip[1] + v[1] / l * SG.th];
        v = [t[0] - knee[0], t[1] - knee[1]]; l = Math.hypot(v[0], v[1]) || 1;
        return { k: knee, a: [knee[0] + v[0] / l * SG.sh, knee[1] + v[1] / l * SG.sh] };
      }
      const r = ik(hip, t, SG.th, SG.sh, kd); return { k: r.j, a: r.e };
    };
    const kd = p.kd == null ? -1 : p.kd;
    o.legN = leg(foot, kd, p.knee); o.legF = leg(foot2, p.kd2 == null ? kd : p.kd2, p.knee2);
    o.fa = p.fang == null ? -12 : p.fang; o.fa2 = p.fang2 == null ? o.fa : p.fang2;
    o.toeN = add(o.legN.a, vec(o.fa, SG.ft)); o.toeF = add(o.legF.a, vec(o.fa2, SG.ft));
    const hand = p.hand || [sho[0] + 4, sho[1] + 64], hand2 = p.hand2 || [hand[0] - 7, hand[1] - 2];
    const ed = p.ed == null ? 1 : p.ed;
    const am = (t, d) => { const r = ik(sho, t, SG.ua, SG.fa, d); return { e: r.j, h: r.e }; };
    o.armN = am(hand, ed); o.armF = am(hand2, p.ed2 == null ? ed : p.ed2);
    return o;
  }

  /* ---------- Dessin ---------- */
  const SKIN = '#e3b08d', SKIN_D = '#b88563', SHORT = '#1d2430', SHORT_D = '#141a23', SHOE = '#f1f3f6', HAIR = '#2a2220';
  const cap = (a, b, w, c, extra = '') => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  function lerpPt(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

  function drawProps(props, back) {
    let s = '';
    (props || []).forEach(p => {
      if (!!p.back !== back) return;
      if (p.t === 'box') s += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="5" fill="#242b35" stroke="#323b48" stroke-width="1.5"/>`;
      else if (p.t === 'wall') s += `<rect x="${p.x}" y="-30" width="14" height="270" fill="#1b2029"/><line x1="${p.x}" y1="-30" x2="${p.x}" y2="240" stroke="#2c3441" stroke-width="2"/>`;
      else if (p.t === 'bar') s += `<line x1="${p.x}" y1="${p.y}" x2="${p.x2}" y2="${p.y}" stroke="#7d8898" stroke-width="5" stroke-linecap="round"/><line x1="${p.x2}" y1="${p.y}" x2="${p.x2}" y2="230" stroke="#2c3441" stroke-width="7" stroke-linecap="round"/>`;
      else if (p.t === 'rail') s += `<line x1="${p.x}" y1="${p.y}" x2="${p.x2}" y2="${p.y}" stroke="#7d8898" stroke-width="5" stroke-linecap="round"/><line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="230" stroke="#2c3441" stroke-width="6"/><line x1="${p.x2}" y1="${p.y}" x2="${p.x2}" y2="230" stroke="#2c3441" stroke-width="6"/>`;
      else if (p.t === 'pk') s += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${224 - p.y}" rx="4" fill="#242b35" stroke="#323b48" stroke-width="1.5"/>`;
    });
    return s;
  }

  function drawFigure(o, zone, ph, props) {
    const sw = { th: 17, sh: 13, ua: 12, fa: 10, tor: 28 };
    let s = '';
    s += `<ellipse cx="${f1(Math.min(300, Math.max(60, (o.hip[0] + o.sho[0]) / 2)))}" cy="231" rx="86" ry="6" fill="#000" opacity=".28"/>`;
    s += `<line x1="-200" y1="230" x2="560" y2="230" stroke="#2a313c" stroke-width="2"/>`;
    s += drawProps(props, true);
    // membres arrière
    const farArm = (c, sc) => {
      return cap(o.sho, o.armF.e, 11, c) + cap(o.armF.e, o.armF.h, 9.5, c) + `<circle cx="${f1(o.armF.h[0])}" cy="${f1(o.armF.h[1])}" r="5" fill="${c}"/>`;
    };
    s += farArm(SKIN_D);
    const farLeg = (c, sh, sk) => {
      let t = cap(o.hip, o.legF.k, 16, sk) + cap(o.legF.k, o.legF.a, 12, c) + cap(o.legF.a, o.toeF, 9, '#c9ced6');
      const v = [o.legF.k[0] - o.hip[0], o.legF.k[1] - o.hip[1]];
      t += cap(o.hip, [o.hip[0] + v[0] * 0.55, o.hip[1] + v[1] * 0.55], 17, SHORT_D);
      return t;
    };
    s += farLeg(SKIN_D, SHORT_D, SKIN_D);
    // zone musculaire (derrière le buste)
    // glow
    if (zone) {
      const z = ({ chest: lerpPt(o.hip, o.sho, 0.78), back: lerpPt(o.hip, o.sho, 0.7), core: lerpPt(o.hip, o.sho, 0.4), shoulders: o.sho, arms: o.armN.e, legs: lerpPt(o.hip, o.legN.k, 0.6), glutes: o.hip, calves: lerpPt(o.legN.k, o.legN.a, 0.55), full: lerpPt(o.hip, o.sho, 0.5) })[zone];
      if (z) s += `<circle cx="${f1(z[0])}" cy="${f1(z[1])}" r="${19 + 3 * Math.sin(ph * 6.28)}" style="fill:var(--accent)" opacity=".28"/><circle cx="${f1(z[0])}" cy="${f1(z[1])}" r="10" style="fill:var(--accent)" opacity=".35"/>`;
    }
    // torse
    s += cap(o.hip, o.sho, sw.tor, 'var(--accent)');
    s += cap(o.hip, lerpPt(o.hip, o.sho, 0.28), sw.tor - 2, SHORT);
    // jambe proche
    s += cap(o.hip, o.legN.k, 17, SKIN) + cap(o.legN.k, o.legN.a, 13, SKIN) + `<circle cx="${f1(o.legN.k[0])}" cy="${f1(o.legN.k[1])}" r="6.8" fill="${SKIN}"/>`;
    const v = [o.legN.k[0] - o.hip[0], o.legN.k[1] - o.hip[1]];
    s += cap(o.hip, [o.hip[0] + v[0] * 0.62, o.hip[1] + v[1] * 0.62], 19, SHORT);
    s += cap(o.legN.a, o.toeN, 10, SHOE);
    // cou + tête
    s += cap(o.sho, o.neck, 9, SKIN);
    const u = [Math.cos(rad(o.ha)), -Math.sin(rad(o.ha))], fv = [-u[1], u[0]];
    const hc = o.head, r = SG.hr;
    s += `<circle cx="${f1(hc[0])}" cy="${f1(hc[1])}" r="${r}" fill="${SKIN}"/>`;
    const p1 = [hc[0] + u[0] * r, hc[1] + u[1] * r], p2 = [hc[0] - u[0] * r, hc[1] - u[1] * r];
    s += `<path d="M${f1(p1[0])} ${f1(p1[1])} A${r} ${r} 0 0 ${(fv[0] * u[1] - fv[1] * u[0]) > 0 ? 1 : 0} ${f1(p2[0])} ${f1(p2[1])} Z" fill="${HAIR}"/>`;
    s += `<circle cx="${f1(hc[0] + fv[0] * r * 0.55 + u[0] * 2)}" cy="${f1(hc[1] + fv[1] * r * 0.55 + u[1] * 2)}" r="1.6" fill="#2a2220"/>`;
    // bras proche
    s += cap(o.sho, o.armN.e, 12.5, SKIN) + cap(o.armN.e, o.armN.h, 10.5, SKIN) + `<circle cx="${f1(o.armN.h[0])}" cy="${f1(o.armN.h[1])}" r="5.6" fill="${SKIN}"/>`;
    s += cap(o.sho, lerpPt(o.sho, o.armN.e, 0.45), 14, 'var(--accent)');
    s += drawProps(props, false);
    return s;
  }

  /* ---------- Poses ---------- */
  const B = {};
  const ST = { hip: [180, 120], tor: 90, foot: [176, 222], hand: [186, 120], fang: -12 };
  const F = (...o) => Object.assign({}, ...o);
  const mkRow = (x, y) => ({ t: 'bar', x: x, x2: x + 48, y });

  // pompes
  const PU = { ank: [46, 212], fang: -75, na: -12, hand: [205, 222] };
  B.pushup = { zone: 'chest', f: [F(PU, { sh: [205, 160] }), F(PU, { sh: [213, 198] })] };
  B.scap = { zone: 'shoulders', f: [F(PU, { sh: [205, 160] }), F(PU, { sh: [205, 168] })], dur: 1600 };
  B.incline = { zone: 'chest', props: [{ t: 'box', x: 148, y: 170, w: 50, h: 54 }], f: [F(PU, { sh: [172, 104], hand: [172, 168] }), F(PU, { sh: [200, 150], hand: [172, 168] })] };
  const DU = { ank: [40, 178], fang: -75, na: -12, hand: [205, 222] };
  B.decline = { zone: 'chest', props: [{ t: 'box', x: 14, y: 186, w: 56, h: 38 }], f: [F(DU, { sh: [200, 160] }), F(DU, { sh: [210, 198] })] };
  const PS = { ank: [66, 212], fang: -75, na: -12, hand: [200, 221] };
  B.pseudo = { zone: 'shoulders', f: [F(PS, { sh: [226, 162] }), F(PS, { sh: [236, 196] })] };
  B.pike = { zone: 'shoulders', f: [F({ ank: [80, 214], fang: -75, hd: -1, hand: [186, 222], na: -40 }, { sh: [184, 158] }), F({ ank: [80, 214], fang: -75, hd: -1, hand: [186, 222], na: -50 }, { sh: [194, 196] })] };
  B.pikeUp = { zone: 'shoulders', props: [{ t: 'box', x: 50, y: 178, w: 62, h: 46 }], f: [F({ ank: [80, 172], fang: -75, hd: -1, hand: [188, 222], na: -40 }, { sh: [186, 158] }), F({ ank: [80, 172], fang: -75, hd: -1, hand: [188, 222], na: -50 }, { sh: [196, 196] })] };
  B.handstand = { zone: 'shoulders', props: [{ t: 'wall', x: 236 }], dur: 2600, f: [{ ank: [212, -2], sh: [176, 160], hand: [172, 224], fang: 80, na: 0 }, { ank: [214, -2], sh: [177, 162], hand: [172, 224], fang: 80, na: 0 }] };
  B.hspu = { zone: 'shoulders', props: [{ t: 'wall', x: 236 }], f: [{ ank: [212, -2], sh: [176, 160], hand: [172, 224], fang: 80, na: 0 }, { ank: [208, 34], sh: [178, 198], hand: [172, 224], fang: 80, na: 0 }] };
  // dips
  const BR = { t: 'rail', x: 140, x2: 252, y: 114 };
  B.bardip = { zone: 'chest', props: [BR], f: [{ hip: [190, 112], tor: 85, hand: [198, 114], foot: [152, 196], fang: -20, na: 6 }, { hip: [190, 188], tor: 85, hand: [198, 114], foot: [152, 214], fang: -20, na: 6 }] };
  const BD = { tor: 92, hand: [122, 150], foot: [206, 222], fang: -12, na: 6 };
  B.benchdip = { zone: 'arms', props: [{ t: 'box', x: 66, y: 152, w: 62, h: 72 }], f: [F(BD, { hip: [140, 150] }), F(BD, { hip: [140, 190], tor: 88 })] };
  // tractions / rowing
  const WB = { t: 'bar', x: 186, x2: 262, y: -2 };
  B.pullup = { zone: 'back', props: [WB], f: [{ hip: [186, 126], tor: 90, hand: [186, -2], foot: [168, 206], fang: -30, na: 0 }, { hip: [184, 88], tor: 90, hand: [186, -2], foot: [164, 168], fang: -30, na: 0 }] };
  const RW = { t: 'bar', x: 205, x2: 254, y: 130 };
  B.row = { zone: 'back', props: [RW], f: [{ ank: [40, 216], sh: [205, 196], hand: [205, 130], fang: 55, na: 0, ed: 1 }, { ank: [40, 216], sh: [188, 140], hand: [205, 130], fang: 55, na: 0, ed: 1 }] };
  B.towelrow = { zone: 'back', props: [{ t: 'wall', x: 236 }], f: [{ ank: [150, 214], sh: [93, 58], hand: [180, 80], fang: -20, na: 15, ed: 1 }, { ank: [150, 214], sh: [136, 52], hand: [160, 90], fang: -20, na: 15, ed: 1 }] };
  const SU = { hip: [150, 208], hand: [284, 192], foot: [56, 198], fang: 60, kd: 1, na: 8 };
  B.superman = { zone: 'back', dur: 2200, f: [F(SU, { tor: 6 }), F(SU, { tor: 13, foot: [52, 186], hand: [286, 180] })] };
  B.supermanPull = { zone: 'back', f: [F(SU, { tor: 12, foot: [52, 188], hand: [288, 184] }), F(SU, { tor: 12, foot: [52, 188], hand: [226, 208], ed: -1 })] };
  // jambes
  const SQT = { hip: [180, 120], tor: 90, foot: [174, 222], hand: [238, 64], fang: -12 };
  B.squat = { zone: 'legs', f: [SQT, { hip: [138, 174], tor: 55, foot: [176, 222], hand: [236, 118], fang: -12, na: 30 }] };
  B.chairSquat = { zone: 'legs', props: [{ t: 'box', x: 86, y: 174, w: 58, h: 50 }], f: [SQT, { hip: [132, 166], tor: 68, foot: [178, 222], hand: [236, 112], fang: -12, na: 18 }] };
  B.deepSquat = { zone: 'legs', dur: 2600, f: [{ hip: [134, 196], tor: 62, foot: [180, 222], hand: [208, 150], fang: -12, na: 25 }, { hip: [134, 192], tor: 66, foot: [180, 222], hand: [208, 146], fang: -12, na: 25 }] };
  B.bulgarian = { zone: 'legs', props: [{ t: 'box', x: 26, y: 170, w: 62, h: 54 }], f: [{ hip: [132, 134], tor: 90, foot: [186, 222], foot2: [78, 166], kd2: -1, fang: -12, fang2: -70, hand: [196, 86] }, { hip: [130, 184], tor: 88, foot: [186, 222], foot2: [78, 166], kd2: -1, fang: -12, fang2: -70, hand: [194, 136] }] };
  const PI = { hip: [142, 198], tor: 50, foot: [160, 222], foot2: [244, 196], kd2: -1, fang: -12, fang2: 70, hand: [222, 160], na: 30 };
  B.pistol = { zone: 'legs', f: [{ hip: [180, 120], tor: 90, foot: [176, 222], foot2: [186, 150], kd2: -1, fang: -12, fang2: 60, hand: [238, 70] }, PI] };
  B.pistolA = { zone: 'legs', props: [{ t: 'wall', x: 262 }], f: [{ hip: [180, 120], tor: 90, foot: [176, 222], foot2: [186, 150], kd2: -1, fang: -12, fang2: 60, hand: [260, 80] }, F(PI, { hand: [262, 150] })] };
  const LG = { tor: 90, foot: [176, 222], foot2: [78, 214], kd2: -1, fang: -12, fang2: -75, na: 4 };
  B.lunge = { zone: 'legs', f: [F(LG, { hip: [128, 132], hand: [146, 116] }), F(LG, { hip: [126, 180], foot2: [70, 212], hand: [144, 164] })] };
  B.jumpLunge = { zone: 'legs', dur: 1500, f: [F(LG, { hip: [126, 180], foot2: [70, 212], hand: [144, 164] }), F(LG, { hip: [128, 96], foot: [200, 160], foot2: [60, 150], hand: [196, 70] }), F(LG, { hip: [126, 180], foot2: [70, 212], hand: [144, 164] })], loop: true };
  // hanches
  const BG = { foot: [200, 221], hand: [118, 222], fang: -12, kd: -1, na: -40 };
  B.bridge = { zone: 'glutes', f: [F(BG, { hip: [140, 208], tor: 187, na: -7 }), F(BG, { hip: [126, 176], tor: 220, na: -40 })] };
  B.bridge1 = { zone: 'glutes', f: [F(BG, { hip: [140, 208], tor: 187, na: -7, foot2: [214, 136] }), F(BG, { hip: [126, 176], tor: 220, na: -40, foot2: [200, 104] })] };
  B.thrust = { zone: 'glutes', props: [{ t: 'box', x: 196, y: 178, w: 60, h: 46 }], f: [F(BG, { hip: [140, 206], tor: 190, na: -10, foot: [214, 172] }), F(BG, { hip: [128, 170], tor: 218, na: -38, foot: [214, 172] })] };
  const NC = { knee: [150, 214], foot: [96, 216], fang: -90, kd: -1 };
  B.nordic = { zone: 'legs', props: [{ t: 'box', x: 80, y: 206, w: 28, h: 18 }], f: [F(NC, { hip: [150, 162], tor: 90, hand: [190, 130], na: 0 }), F(NC, { hip: [197, 192], tor: 25, hand: [282, 214], na: -10 })] };
  B.calf = { zone: 'calves', props: [{ t: 'wall', x: 240 }], f: [{ hip: [180, 120], tor: 90, foot: [180, 222], hand: [236, 88], fang: -12 }, { hip: [182, 104], tor: 90, foot: [184, 206], hand: [236, 88], fang: -72 }] };
  B.calf1 = { zone: 'calves', props: [{ t: 'wall', x: 240 }], f: [{ hip: [180, 120], tor: 90, foot: [180, 222], foot2: [150, 194], kd2: 1, hand: [236, 88], fang: -12, fang2: -50 }, { hip: [182, 104], tor: 90, foot: [184, 206], foot2: [150, 180], kd2: 1, hand: [236, 88], fang: -72, fang2: -50 }] };
  // gainage
  const PK = { ank: [46, 214], fang: -75, hd: -1, na: -10, hand: [240, 221] };
  B.plank = { zone: 'core', dur: 2600, f: [F(PK, { sh: [208, 186] }), F(PK, { sh: [208, 189] })] };
  B.sidePlank = { zone: 'core', dur: 2400, f: [F(PK, { sh: [208, 186] }), F(PK, { sh: [208, 178], hd: -1 })] };
  B.hollow = { zone: 'core', dur: 2400, f: [{ hip: [150, 216], tor: 170, hand: [22, 196], foot: [246, 184], fang: 70, na: 12, kd: -1 }, { hip: [150, 216], tor: 168, hand: [22, 192], foot: [244, 176], fang: 70, na: 12, kd: -1 }] };
  const LP = { t: 'pk', x: 152, y: 190, w: 38 };
  B.lsit = { zone: 'core', dur: 2400, props: [LP], f: [{ hip: [170, 188], tor: 92, hand: [170, 188], foot: [272, 186], fang: 80, na: 0 }, { hip: [170, 187], tor: 92, hand: [170, 188], foot: [273, 183], fang: 80, na: 0 }] };
  B.tuck = { zone: 'core', dur: 2400, props: [LP], f: [{ hip: [170, 188], tor: 92, hand: [170, 188], foot: [214, 168], fang: 60, na: 0 }, { hip: [170, 187], tor: 92, hand: [170, 188], foot: [216, 165], fang: 60, na: 0 }] };
  const LY = { hand: [100, 220], na: 0, fang: 30, kd: -1 };
  B.revCrunch = { zone: 'core', f: [F(LY, { hip: [130, 212], tor: 180, foot: [176, 180] }), F(LY, { hip: [138, 194], tor: 182, foot: [172, 150] })] };
  B.legRaise = { zone: 'core', f: [F(LY, { hip: [130, 212], tor: 180, foot: [232, 211], fang: 70 }), F(LY, { hip: [130, 212], tor: 180, foot: [202, 140], fang: 70 }), F(LY, { hip: [130, 212], tor: 180, foot: [131, 110], fang: 70 })], loop: false };
  const HG = { hip: [186, 126], tor: 90, hand: [186, -4], na: 0 };
  B.hangKnee = { zone: 'core', props: [WB], f: [F(HG, { foot: [184, 224], fang: -80 }), F(HG, { foot: [240, 176], fang: -60 })] };
  B.hangLeg = { zone: 'core', props: [WB], f: [F(HG, { foot: [186, 224], fang: -80 }), F(HG, { foot: [258, 188], fang: 0 }), F(HG, { foot: [286, 128], fang: 30 })] };
  B.dragon = { zone: 'core', props: [{ t: 'box', x: 100, y: 196, w: 96, h: 28 }], f: [{ ank: [150, 24], sh: [150, 190], hand: [136, 184], fang: 90, na: 0, ed: -1 }, { ank: [306, 133], sh: [150, 190], hand: [136, 184], fang: 70, na: 0, ed: -1 }] };
  B.deadHang = { zone: 'arms', props: [WB], dur: 2400, f: [F(HG, { foot: [184, 224], fang: -80 }), F(HG, { hip: [186, 122], foot: [184, 222], fang: -80 })] };
  // plyo
  B.plyoPush = { zone: 'chest', dur: 1300, f: [F(PU, { sh: [213, 198] }), { ank: [50, 190], sh: [210, 140], hand: [212, 196], fang: -75, na: -12 }] };
  B.jumpSquat = { zone: 'legs', dur: 1300, f: [{ hip: [138, 174], tor: 55, foot: [176, 222], hand: [236, 118], fang: -12, na: 30 }, { hip: [180, 74], tor: 90, foot: [178, 176], hand: [236, 36], fang: -70, na: 0 }] };
  B.broad = { zone: 'legs', dur: 1700, f: [{ hip: [110, 176], tor: 50, foot: [130, 222], hand: [62, 170], fang: -12, na: 30 }, { hip: [200, 100], tor: 70, foot: [250, 166], hand: [258, 70], fang: -40, na: 10 }, { hip: [260, 168], tor: 55, foot: [282, 222], hand: [330, 140], fang: -12, na: 28 }], loop: false };
  B.boxJump = { zone: 'legs', dur: 1800, props: [{ t: 'box', x: 226, y: 170, w: 70, h: 54 }], f: [{ hip: [100, 176], tor: 50, foot: [124, 222], hand: [54, 170], fang: -12, na: 30 }, { hip: [196, 100], tor: 80, foot: [214, 158], hand: [244, 62], fang: -40, na: 8 }, { hip: [262, 66], tor: 90, foot: [262, 164], hand: [270, 66], fang: -12 }], loop: true };
  // cardio
  B.jacks = { zone: 'full', dur: 1000, f: [{ hip: [180, 120], tor: 90, foot: [176, 222], foot2: [186, 222], hand: [186, 124], hand2: [180, 126] }, { hip: [180, 124], tor: 90, foot: [146, 222], foot2: [214, 222], kd: -1, hand: [200, -4], hand2: [160, -4] }] };
  B.knees = { zone: 'legs', dur: 900, f: [{ hip: [180, 120], tor: 90, foot: [176, 222], foot2: [232, 172], kd2: -1, hand: [214, 112], hand2: [150, 86], fang2: -50 }, { hip: [180, 120], tor: 90, foot: [232, 172], foot2: [176, 222], kd: -1, hand: [150, 86], hand2: [214, 112], fang: -50 }] };
  const MC = { fang: -75, na: -10, hand: [207, 222], hip: [147, 182], tor: 19 };
  B.climbers = { zone: 'core', dur: 700, f: [F(MC, { foot: [50, 214], foot2: [118, 206], kd2: -1 }), F(MC, { foot: [118, 206], foot2: [50, 214], kd: -1, fang: -75 })] };
  B.burpee = { zone: 'full', dur: 2800, loop: false, f: [
    { hip: [180, 120], tor: 90, foot: [176, 222], hand: [186, 124] },
    { hip: [138, 176], tor: 50, foot: [176, 222], hand: [214, 222], na: 30 },
    F(PU, { sh: [205, 160] }), F(PU, { sh: [213, 198] }),
    { hip: [138, 176], tor: 50, foot: [176, 222], hand: [214, 222], na: 30 },
    { hip: [180, 80], tor: 90, foot: [178, 180], hand: [190, 0], fang: -70 }] };
  B.skater = { zone: 'legs', dur: 1000, f: [{ hip: [150, 150], tor: 72, foot: [176, 222], foot2: [96, 196], kd2: -1, hand: [90, 120], hand2: [210, 130], na: 15 }, { hip: [210, 150], tor: 72, foot: [150, 222], foot2: [260, 190], kd2: -1, hand: [262, 120], hand2: [140, 130], na: 15 }] };
  // mobilité
  const CIR = []; for (let k = 0; k < 8; k++) { const a = k * 45; CIR.push({ hip: [180, 120], tor: 90, foot: [176, 222], hand: [180 + 62 * Math.cos(rad(a)), 56 - 62 * Math.sin(rad(a))], hand2: [180 + 62 * Math.cos(rad(a + 40)), 56 - 62 * Math.sin(rad(a + 40))] }); }
  B.circles = { zone: 'shoulders', dur: 3200, loop: true, f: CIR };
  const CC = { knee: [125, 214], foot: [74, 215], fang: -80, hand: [195, 222], kd: -1 };
  B.catcow = { zone: 'core', dur: 3000, f: [F(CC, { hip: [125, 150], tor: -4, na: -40 }), F(CC, { hip: [125, 170], tor: 12, na: 25 })] };
  B.thoracic = { zone: 'back', dur: 2600, f: [F(CC, { hip: [125, 160], tor: 3, hand2: [195, 221], na: 0 }), F(CC, { hip: [125, 160], tor: 3, hand2: [176, 118], na: 5, ed2: 1 })] };
  B.pec = { zone: 'chest', props: [{ t: 'wall', x: 240 }], dur: 3000, f: [{ hip: [180, 120], tor: 90, foot: [176, 222], hand: [238, 52] }, { hip: [182, 120], tor: 96, foot: [176, 222], hand: [238, 52], na: -4 }] };
  B.child = { zone: 'back', dur: 3000, f: [{ hip: [112, 198], tor: 8, knee: [152, 212], foot: [100, 218], fang: -80, hand: [250, 220], na: -20 }, { hip: [112, 196], tor: 12, knee: [152, 212], foot: [100, 218], fang: -80, hand: [254, 220], na: -24 }] };
  B.hipflex = { zone: 'legs', dur: 3000, f: [{ hip: [140, 190], tor: 90, foot: [210, 222], knee2: [84, 214], foot2: [34, 214], fang2: -85, hand: [150, 170] }, { hip: [150, 192], tor: 92, foot: [210, 222], knee2: [84, 214], foot2: [34, 214], fang2: -85, hand: [160, 172] }] };
  B.ham = { zone: 'legs', dur: 3000, f: [{ hip: [112, 212], tor: 70, foot: [214, 214], fang: 70, hand: [196, 200], na: 10 }, { hip: [112, 212], tor: 48, foot: [214, 214], fang: 70, hand: [212, 206], na: 10 }] };

  const MAP = {
    'pompes-inclinees': 'incline', 'pompes-classiques': 'pushup', 'pompes-diamant': 'pushup', 'pompes-archer': 'pushup', 'pompes-une-main-assistees': 'pushup', 'pompes-scapulaires': 'scap',
    'pompes-pieds-surelevees': 'decline', 'pompes-pseudo-planche': 'pseudo', 'pompes-pike': 'pike', 'pompes-pike-pieds-surelevees': 'pikeUp',
    'equilibre-contre-le-mur': 'handstand', 'pompes-verticales-negatives': 'hspu', 'pompes-verticales-au-mur': 'hspu',
    'dips-sur-chaise': 'benchdip', 'dips-sur-chaise-pieds-surelevees': 'benchdip', 'dips-sur-barres': 'bardip', 'dips-sur-barres-lents': 'bardip',
    'tractions-negatives': 'pullup', 'tractions-pronation': 'pullup', 'tractions-supination': 'pullup', 'tractions-prise-large': 'pullup', 'tractions-archer': 'pullup', 'tractions-explosives': 'pullup', 'muscle-up-negatif': 'pullup',
    'rowing-serviette-porte-genoux': 'towelrow', 'rowing-serviette-porte': 'towelrow', 'superman-tenu': 'superman', 'superman-avec-tirage-de-coudes': 'supermanPull',
    'rowing-inverse-jambes-flechies': 'row', 'rowing-inverse': 'row', 'rowing-inverse-pieds-surelevees': 'row', 'rowing-inverse-supination': 'row', 'rowing-inverse-archer': 'row',
    'squat-sur-chaise': 'chairSquat', 'squat': 'squat', 'squat-tempo-lent': 'squat', 'squat-bulgare': 'bulgarian', 'pistol-squat-assiste': 'pistolA', 'pistol-squat': 'pistol',
    'fentes-arriere': 'lunge', 'fentes-marchees': 'lunge', 'fentes-bulgares': 'bulgarian', 'fentes-sautees': 'jumpLunge',
    'pont-fessier': 'bridge', 'pont-fessier-unilateral': 'bridge1', 'hip-thrust-pieds-surelevees': 'thrust', 'nordic-curl-excentrique': 'nordic', 'nordic-curl': 'nordic',
    'mollets-debout': 'calf', 'mollets-une-jambe': 'calf1',
    'planche': 'plank', 'hollow-body': 'hollow', 'l-sit-groupe': 'tuck', 'l-sit': 'lsit', 'planche-laterale': 'sidePlank',
    'crunch-inverse': 'revCrunch', 'releves-de-jambes-allonge': 'legRaise', 'releves-de-genoux-suspendu': 'hangKnee', 'releves-de-jambes-suspendu': 'hangLeg', 'dragon-flag-negatif': 'dragon',
    'pompes-explosives': 'plyoPush', 'pompes-claquees': 'plyoPush', 'squat-saute': 'jumpSquat', 'saut-en-longueur': 'broad', 'sauts-sur-box': 'boxJump',
    'jumping-jacks': 'jacks', 'mountain-climbers': 'climbers', 'burpees': 'burpee', 'montees-de-genoux': 'knees', 'sauts-de-patineur': 'skater',
    'cercles-d-epaules-et-de-bras': 'circles', 'chat-vache': 'catcow', 'rotation-thoracique': 'thoracic', 'squat-profond-tenu': 'deepSquat', 'dead-hang': 'deadHang',
    'etirement-pectoraux': 'pec', 'etirement-dos-posture-de-l-enfant': 'child', 'etirement-flechisseurs-de-hanche': 'hipflex', 'etirement-ischios': 'ham'
  };

  /* ---------- Animation ---------- */
  const ease = u => u * u * (3 - 2 * u);
  const NUM = ['hip', 'tor', 'sh', 'ank', 'foot', 'foot2', 'hand', 'hand2', 'knee', 'knee2', 'na', 'fang', 'fang2'];
  function lerp(a, b, u) { return a + (b - a) * u; }
  function mix(A, B_, u) {
    const r = Object.assign({}, A);
    NUM.forEach(k => {
      const x = A[k], y = B_[k];
      if (x == null || y == null) { if (y != null && u > 0.5) r[k] = y; return; }
      r[k] = Array.isArray(x) ? [lerp(x[0], y[0], u), lerp(x[1], y[1], u)] : lerp(x, y, u);
    });
    ['kd', 'kd2', 'hd', 'ed', 'ed2'].forEach(k => { if (B_[k] != null && u > 0.5) r[k] = B_[k]; });
    return r;
  }
  function frameAt(set, t) {
    const f = set.f, n = f.length, per = set.dur || 2200;
    let ph = (t / per) % 1, pos;
    if (set.loop) pos = ph * n; else { const tri = ph < 0.5 ? ph * 2 : (1 - ph) * 2; pos = tri * (n - 1); }
    let i = Math.floor(pos), u = ease(pos - i);
    if (set.loop) { return mix(f[i % n], f[(i + 1) % n], u); }
    if (i >= n - 1) return f[n - 1];
    return mix(f[i], f[i + 1], u);
  }
  function render(arch, t) {
    const set = B[arch] || B.squat, p = frameAt(set, t);
    return drawFigure(solve(p), set.zone, (t / (set.dur || 2200)) % 1, set.props);
  }

  const VB = '0 -20 360 270', VBC = {};
  function viewBoxFor(arch) {
    if (VBC[arch]) return VBC[arch];
    const set = B[arch] || B.squat, per = set.dur || 2200;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    const pt = p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); };
    for (let i = 0; i < 40; i++) {
      const o = solve(frameAt(set, per * i / 40));
      [o.head, o.sho, o.hip, o.legN.k, o.legN.a, o.toeN, o.legF.a, o.toeF, o.armN.h, o.armN.e, o.armF.h].forEach(pt);
    }
    (set.props || []).forEach(p => { if (p.t === 'box' || p.t === 'pk') { pt([p.x, p.y]); pt([p.x + p.w, 224]); } if (p.t === 'bar' || p.t === 'rail') { pt([p.x, p.y]); pt([p.x2, p.y]); } });
    y1 = Math.max(y1, 232); x0 -= 26; x1 += 26; y0 -= 22; y1 += 8;
    let w = x1 - x0, h = y1 - y0; const AR = 4 / 3;
    if (w / h < AR) { const nw = h * AR; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / AR; y0 -= (nh - h); h = nh; }
    return (VBC[arch] = `${f1(x0)} ${f1(y0)} ${f1(w)} ${f1(h)}`);
  }
  function figSvg(exId, cls = '') {
    const arch = MAP[exId] || 'squat';
    return `<svg class="fig ${cls}" data-a="${arch}" viewBox="${viewBoxFor(arch)}" preserveAspectRatio="xMidYMax meet"><g class="fg">${render(arch, 0)}</g></svg>`;
  }
  function loop() {
    const ts = performance.now();
    document.querySelectorAll('svg.fig').forEach(sv => {
      const r = sv.getBoundingClientRect();
      if (r.bottom < -50 || r.top > innerHeight + 50 || !r.width) return;
      const g = sv.firstChild; if (!g) return;
      g.innerHTML = render(sv.dataset.a, ts);
    });
  }
  setInterval(loop, 40);
  window.FIG = { figSvg, render, B, MAP, VB, viewBoxFor };
})();
