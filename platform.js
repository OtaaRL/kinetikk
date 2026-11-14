/* Kinetik — adaptateur plateforme (Android via Capacitor / navigateur). Sur Electron, window.native existe déjà. */
(function () {
  const cap = window.Capacitor, isCap = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  if (isCap || window.innerWidth <= 760) document.documentElement.classList.add('mobile');
  if (window.native) return;
  let wl = null;
  const plug = n => (cap && cap.Plugins && cap.Plugins[n]) || null;
  window.native = {
    platform: isCap ? 'android' : 'web',
    load: async () => { try { return JSON.parse(localStorage.getItem(LS) || 'null'); } catch (e) { return null; } },
    save: async d => { try { localStorage.setItem(LS, JSON.stringify(d)); } catch (e) {} return true; },
    awake: async on => {
      try {
        if (on && navigator.wakeLock && !wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); }
        if (!on && wl) { await wl.release(); wl = null; }
      } catch (e) {}
      return true;
    },
    demo: async q => {
      const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
      const b = plug('Browser');
      if (b && b.open) { try { await b.open({ url }); return true; } catch (e) {} }
      window.open(url, '_blank'); return true;
    },
    exportData: async d => {
      const txt = JSON.stringify(d);
      try { await navigator.clipboard.writeText(txt); return 'clipboard'; } catch (e) {}
      return false;
    },
    importData: () => new Promise(res => {
      modal(`<h2 style="margin-bottom:6px">Restaurer une sauvegarde</h2><p class="sub" style="margin-bottom:14px;font-size:14px">Collez ici le texte de la sauvegarde copiée depuis Kinetik.</p>
        <textarea id="imp-t" class="inp" style="height:150px;resize:none;font-size:13px" placeholder="{...}"></textarea>
        <div class="row between" style="margin-top:18px"><button class="btn ghost" id="imp-c">Annuler</button><button class="btn primary" id="imp-o">Restaurer</button></div>`, 'sm');
      $('#imp-c').addEventListener('click', () => { closeModal(); res(null); });
      $('#imp-o').addEventListener('click', () => { let d; try { d = JSON.parse($('#imp-t').value); } catch (e) { d = { __error: true }; } closeModal(); res(d); });
    }),
    notify: async () => true,
    flash: async () => { try { navigator.vibrate && navigator.vibrate([150, 80, 150]); } catch (e) {} return true; },
    dataPath: async () => ''
  };
})();
