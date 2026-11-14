(async function () {
  await loadState();
  setAccent();
  render();
  if (!S.onboarded) openWizard(true);
  window.__S = () => S; // utile pour les tests
  try {
    const A = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (A) A.addListener('backButton', () => { if (!handleBack()) A.exitApp(); });
    const SB = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar;
    if (SB) { SB.setStyle({ style: 'DARK' }); SB.setBackgroundColor({ color: '#0b0d10' }); }
  } catch (e) {}
})();
