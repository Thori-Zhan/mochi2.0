(function(){try{
(function () {
  window.mochiRefreshNow = () => location.reload();
  window.mochiIosTabRisk = () => !!window.mochiDevice?.isIOS && !navigator.standalone && !matchMedia('(display-mode: standalone)').matches;
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(e => console.warn('Offline support unavailable', e));
  }
  function persist() {
    navigator.storage?.persisted?.().then(p => { if (!p) return navigator.storage.persist?.(); }).catch(()=>{});
  }
  document.addEventListener('pointerup', persist, { once:true, passive:true });
  let prompt = null;
  const button = document.getElementById('pwa-install');
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); prompt=e; if(button)button.hidden=false; });
  button?.addEventListener('click', async()=>{ if(!prompt)return; await prompt.prompt(); prompt=null;button.hidden=true; });
  window.addEventListener('appinstalled',()=>{prompt=null;if(button)button.hidden=true;});
  const bar = document.getElementById('backup-remind-bar');
  const text = document.getElementById('backup-remind-txt');
  const store = window.xyStore?.('xy-home-v2');
  function checkBackup() {
    if (!bar || !store || !window.__mochiDataReady) return;
    const latest = Math.max(Number(store.get('__last-backup'))||0,Number(store.get('__last-backup-remind'))||0);
    if(Date.now()-latest < 7*86400000)return;
    if(text)text.textContent='数据保存在本机，建议定期导出备份。';bar.hidden=false;
  }
  document.getElementById('backup-remind-close')?.addEventListener('click',()=>{if(bar)bar.hidden=true;store?.set('__last-backup-remind',String(Date.now()));});
  document.addEventListener('mochi-restore-done',checkBackup);checkBackup();
})();
window.__mochiLoaded.push("pwa.js");
}catch(e){console.error("pwa.js",e);window.__jsErrors.push("pwa.js: "+String(e));window.__mochiErrLoaded.push("pwa.js");}})();