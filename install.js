/* Kinetik — installation en mode application (PWA) */
(function () {
  let deferred = null;
  const standalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; try { render(); } catch (x) {} });
  window.addEventListener('appinstalled', () => { deferred = null; toast('Kinetik est installée ✔'); try { render(); } catch (x) {} });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.INSTALL = {
    standalone,
    can: () => !!deferred,
    banner() {
      if (standalone() || window.native && window.native.platform === 'android' || (window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) || (window.native && window.native.dataPath && window.native.platform !== 'web') || S.prefs.hideInstall) return '';
      return `<div class="card" style="margin-bottom:16px;display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap"><div><b>Installer Kinetik sur votre téléphone</b><div class="sub" style="font-size:14px">Icône sur l'écran d'accueil, plein écran, fonctionne sans internet.</div></div><div class="row" style="gap:8px"><button class="btn primary sm" data-act="install">Installer</button><button class="btn ghost sm" data-act="hideInstall">Plus tard</button></div></div>`;
    }
  };
  ACT.install = async () => {
    if (deferred) { deferred.prompt(); try { await deferred.userChoice; } catch (e) {} deferred = null; render(); return; }
    if (window.__SINGLE) {
      modal(`<div class="row between" style="margin-bottom:10px"><h2 style="margin:0">Installer l'application</h2><button class="icon-btn" data-act="modalClose">${ic('x')}</button></div>
        <p class="sub" style="font-size:14px;margin-bottom:12px">Cette version-ci (fichier ou lien Claude) ne peut pas s'installer : Chrome ne propose l'installation que pour un site hébergé. Il suffit de mettre en ligne le dossier <b>Kinetik-web</b> (gratuit, 2 minutes), puis d'ouvrir ce lien dans Chrome : le menu ⋮ proposera alors « Installer l'application ».</p>
        <div class="lesson-step"><span class="qn">1</span><span>Netlify Drop : app.netlify.com/drop, glissez le dossier, vous obtenez un lien.</span></div>
        <div class="lesson-step"><span class="qn">2</span><span>Ou GitHub Pages : déposez les fichiers dans un dépôt public, Settings → Pages.</span></div>`, 'sm'); return;
    }
    modal(`<div class="row between" style="margin-bottom:10px"><h2 style="margin:0">Installer l'application</h2><button class="icon-btn" data-act="modalClose">${ic('x')}</button></div>
      <p class="sub" style="font-size:14px;margin-bottom:12px">Kinetik s'installe comme une vraie appli depuis Chrome, sans passer par le Play Store.</p>
      <div class="lesson-step"><span class="qn">1</span><span>Ouvrez ce site <b>dans Chrome</b> (pas dans une appli intégrée).</span></div>
      <div class="lesson-step"><span class="qn">2</span><span>Touchez le menu <b>⋮</b> en haut à droite.</span></div>
      <div class="lesson-step"><span class="qn">3</span><span>Choisissez <b>« Installer l'application »</b> (ou « Ajouter à l'écran d'accueil »).</span></div>
      <div class="lesson-step"><span class="qn">4</span><span>Confirmez : l'icône Kinetik apparaît avec vos autres applis.</span></div>
      <p class="sub" style="font-size:13px;margin-top:12px">Navigateur Samsung : menu ☰ → « Ajouter la page à » → « Écran d'accueil ». iPhone : Safari → Partager → « Sur l'écran d'accueil ».</p>`, 'sm');
  };
  ACT.hideInstall = () => { S.prefs.hideInstall = true; save(); render(); };
})();
