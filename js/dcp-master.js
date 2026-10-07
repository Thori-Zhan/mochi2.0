(function(){try{
(function () {
  function dcpAll(st) {
    try {
      const s = st || window.activeStore();
      const v = s.get('reply-dcp-all');
      if (v === null || v === undefined || v === '') return 100;
      const n = Number(v);
      if (isNaN(n)) return 100;
      return Math.max(0, Math.min(100, n));
    } catch (e) { return 100; }
  }
  function dcpEff(v, st) {
    const n = Number(v);
    if (!isFinite(n)) return 0;
    let a = 100;
    try { a = dcpAll(st); } catch (e) { a = 100; }
    if (a >= 100) return Math.max(0, Math.min(100, n));
    return Math.max(0, Math.min(100, Math.round(n * a / 100)));
  }
  window.dcpAll = dcpAll;
  window.dcpEff = dcpEff;
})();
window.__mochiLoaded.push("dcp-master.js");
}catch(e){console.error("dcp-master.js",e);window.__jsErrors.push("dcp-master.js: "+String(e));window.__mochiErrLoaded.push("dcp-master.js");}})();