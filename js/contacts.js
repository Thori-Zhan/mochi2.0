(function(){try{
(function () {
  const G = 'xy-home-v2';
  const EXCLUDE = ['contacts', 'active-contact', 'feed-posts', 'migrated-v1', 'js-errors', 'theme-mode', 'accent-color',
    'fish-log', 'fish-log-global-migrated',
    'age-confirmed', 'storage-guide-shown',
    'incoming-requests', 'desk-checkin-en', 'desk-call-en', 'desk-freq-mode', 'call-hold',
    'night-mode-en',
    'group-chat-msgs',
    'bg-keepalive', 'bg-notify', 'bg-notify-nodedup',
    'gift-wallet', 'wallet-global-migrated',
    'gc-profiles', 'gc-beauty', 'group-chat-enabled',
    '__last-backup', '__last-backup-remind', '__onboard-done', '__guide-done', '__edge-backup-hint-done', '__auto-backup-snapshot',
    '__ka-hb',
    'period-records', 'period-cfg', 'period-daily', 'period-notify', 'period-migrated',
    'cc-groups-public', 'cc-groups-public-off', 'cc-scope-migrated', 'cc-media-names-public',
    'cc-scope-notice-done',
    'my-emoji-groups', 'mye-global-migrated',
    'emoji-recent',
    'emoji-recent-kaomoji', 'emoji-recent-emoji',
    '__coach-seen',
    'media-auto-check',
    'piggy-log', 'piggy-goal-name', 'piggy-goal-amt', 'piggy-cards', 'piggy-last-visit',
    'piggy-goals', 'piggy-goal-cur', 'piggy-coin-log', 'piggy-coin-goals', 'piggy-coin-goal-cur', 'piggy-coin-last-visit',
    'piggy-coin-prob',
    'market-custom', 'market-migrated',
    'market-migrated-v2', 'market-migrated-v3',
    'cjian-roster', 'cjian-state', 'cjian-seeded', 'cjian-rehome-v1',
    'cjian-belong-v2',
    'feed-notices', 'feed-app-unread', 'feed-cover-bg', 'feed-ta-cover',
    'feed-ta-name', 'feed-ta-avatar', 'feed-user-name', 'feed-user-avatar',
    'feed-last', 'feed-next', 'feed-day-count',
    'psync-snap', 'psync-queue', 'psync-en',
    'decision-history', 'decision-settings', 'dec-global-migrated',
    'gdec-members', 'gdec-history', 'gdec-settings', 'gdec-global-migrated',
    'pomo-cfg', 'pomo-today', 'pomo-total', 'pomo-msgs', 'pomo-send-chat', 'pomo-bell',
    'pomo-companion', 'pomo-companion-log', 'pomo-cmp-usecards',
    'memo-app-items', 'memo-app-send', 'memo-app-global-migrated', 'memo-app-remind',
    'beauty-schemes', 'chat-beauty-schemes', 'hide-ta-sticker',
    'hide-tab-kaomoji', 'hide-tab-emoji',
    'chat-textcard-direct',
    'chat-panel-prewarm',
    'full-beauty-schemes', 'beauty-undo-stack', 'ver-update-ack-ts', 'ver-update-notify',
    'call-active',
    'applock-en', 'applock-pin', 'applock-qa',
    'applock-qa-en', 'applock-qalist', 'applock-qaskip',
    'cardlock-state',
    'cs-font',
    'sfx-unified',
    'entry-cjian-first', 'entry-default-contact', 'entry-show-list',
    'battery-check-run', 'battery-check-last', 'heat-check-last',
    'flash-check-last',
    'ver-retry',
    'fhub-freq', 'fhub-seen',
    'age-confirmed'];
  function isExcluded(k) {
    const r = k.slice(G.length + 1);
    if (r.indexOf('__') === 0) return true;
    if (EXCLUDE.indexOf(r) >= 0) return true;
    if (r.indexOf('splash-seen:') === 0) return true;
    if (r.indexOf('reply-gc-') === 0) return true;
    if (r.indexOf('music-file:') === 0) return true;
    if (r.indexOf('font-blob-') === 0) return true;
    if (r.indexOf('narc-') === 0) return true;
    if (r.indexOf('myarc') === 0) return true;
    if (r.indexOf('screen-adj-') === 0) return true;
    const m = r.match(/^([^:]+):/);
    if (m) {
      const head = m[1];
      if (head === 'default' || /^c[0-9a-z]{5,}$/.test(head)) return true;
      const bizPrefix = ['dc-off', 'rc-off', 'mc-off', 'ck-off', 'quote-off', 'day-fish', 'greeted', 'cal'];
      if (bizPrefix.some(p => head.indexOf(p) === 0)) return false;
      return true;
    }
    return false;
  }
  let _cid = 'default';
  try {
    const a = window.xyStore ? window.xyStore(G).get('active-contact') : localStorage.getItem(G + ':active-contact');
    if (a) _cid = a;
  } catch (e) {}
  window.__activeCid = _cid;
  window.activePrefix = function () { return G + ':' + (window.__activeCid || 'default'); };
  function defaultStore() {
    const ns = G + ':default';
    return {
      get(k) {
        let v = null;
        try { v = window.xyStore(ns).get(k); } catch (e) {}
        if (v !== null) return v;
        try { v = window.xyStore(G).get(k); } catch (e) {}
        return v;
      },
      set(k, v) {
        window.xyStore(ns).set(k, v);
        try { window.xyStore(G).remove(k); } catch (e) {}
      },
      awaitingBigKey(k) {
        try { if (window.xyStore(ns).get(k) !== null) return false; } catch (e3) {}
        try { if (window.xyStore(G).get(k) !== null) return false; } catch (e4) {}
        try { return window.xyStore(ns).awaitingBigKey(k); } catch (e) { return false; }
      },
      requestBigKey(k) {
        try { window.xyStore(ns).requestBigKey(k); } catch (e) {}
        try { window.xyStore(G).requestBigKey(k); } catch (e2) {}
      },
      whenBigKeyBack(k, cb) {
        try {
          const s = window.xyStore(ns);
          if (s && s.whenBigKeyBack) { s.whenBigKeyBack(k, cb); return; }
        } catch (e) {}
        try { const r = window.xyStore(G); if (r && r.whenBigKeyBack) { r.whenBigKeyBack(k, cb); return; } } catch (e2) {}
        try { if (cb) cb(); } catch (e3) {}
      },
      remove(k) {
        window.xyStore(ns).remove(k);
        try { window.xyStore(G).remove(k); } catch (e) {}
      }
    };
  }
  window.activeStore = function () {
    const dyn = function () {
      const cid = window.__activeCid || 'default';
      return cid === 'default' ? defaultStore() : window.xyStore(G + ':' + cid);
    };
    return {
      get: (k) => dyn().get(k),
      set: (k, v) => dyn().set(k, v),
      remove: (k) => dyn().remove(k),
      awaitingBigKey: (k) => { const d = dyn(); return !!(d.awaitingBigKey && d.awaitingBigKey(k)); },
      requestBigKey: (k) => { const d = dyn(); try { if (d.requestBigKey) d.requestBigKey(k); } catch (e) {} },
      whenBigKeyBack: (k, cb) => {
        const d = dyn();
        if (d.whenBigKeyBack) { d.whenBigKeyBack(k, cb); return; }
        try { if (cb) cb(); } catch (e2) {}
      }
    };
  };
  window.storeFor = function (cid) { return window.xyStore(G + ':' + cid); };
  window.storeForCid = function (cid) { return cid === 'default' ? defaultStore() : window.xyStore(G + ':' + cid); };
  window.partnerGenderFor = function (cid) {
    try { return window.xyStore(G + ':' + (cid || 'default')).get('partner-gender') || ''; } catch (e) { return ''; }
  };
  window.taWordFor = function (cid) {
    const g = window.partnerGenderFor(cid);
    if (g === 'he') return '他';
    if (g === 'she') return '她';
    return 'TA';
  };
  window.taWord = function () { return window.taWordFor(window.__activeCid || 'default'); };
  window.contactNameFor = function (cid) {
    try {
      const c = getContacts().find(x => x.id === (cid || 'default'));
      return (c && c.name) || '';
    } catch (e) { return ''; }
  };
  window.taFit = function (text, cid) {
    if (text === null || text === undefined) return text;
    const s = String(text);
    if (s.indexOf('他') < 0 && s.indexOf('TA') < 0 && s.indexOf('ta') < 0) return s;
    const w = window.taWordFor(cid || window.__activeCid || 'default');
    const taw = w === 'TA' ? 'ta' : w;
    const segs = s.split(/(<svg[\s\S]*?<\/svg>)/);
    for (let i = 0; i < segs.length; i += 2) {
      const parts = segs[i].split(/(data:[a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+)/);
      for (let j = 0; j < parts.length; j += 2) {
        let p = parts[j].split('其他').join('\u0001').split('TA').join(w).split('他').join(w);
        if (taw !== 'ta') p = p.replace(/\bta\b/g, taw);
        parts[j] = p.split('\u0001').join('其他');
      }
      segs[i] = parts.join('');
    }
    return segs.join('');
  };
  function regStore() { return window.xyStore(G); }
  function getContacts() {
    try {
      const v = regStore().get('contacts');
      if (v) { const a = JSON.parse(v); if (Array.isArray(a) && a.length) return a; }
    } catch (e) {}
    return [{ id: 'default', name: '默认' }];
  }
  window.getContacts = function () { return getContacts().filter(c => c.id === (window.__activeCid || "default")); };
  window.getActiveContact = function () { return window.__activeCid || 'default'; };
  window.createContact = function (name) {
    const list = getContacts();
    const id = 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
    const nm = name || ('联系人' + (list.length));
    list.push({ id: id, name: nm });
    regStore().set('contacts', JSON.stringify(list));
    try { window.xyStore(G + ':' + id).set('lbl-partner', nm); } catch (e) {}
    return id;
  };
  window.renameContact = function (id, name) {
    const list = getContacts(); const c = list.find(x => x.id === id);
    if (c) {
      const oldName = c.name;
      c.name = name || c.name;
      regStore().set('contacts', JSON.stringify(list));
      try {
        const s = window.xyStore(G + ':' + id);
        const cur = s.get('lbl-partner');
        const csLbl = s.get('cs-lbl-partner');
        const taWordId = window.taWordFor ? window.taWordFor(id) : 'TA';
        const oldEff = csLbl || oldName || taWordId;
        if (!cur || cur === oldName) s.set('lbl-partner', c.name);
        const newEff = csLbl || c.name || taWordId;
        if (newEff !== oldEff) {
          if (id === (window.__activeCid || 'default') && window.chatSysNickChanged) {
            try { window.chatSysNickChanged(oldEff); } catch (e) {}
          } else {
            let h = [];
            try { const v = JSON.parse(s.get('sysmsg-nick-hist') || '[]'); if (Array.isArray(v)) h = v; } catch (e) {}
            if (h.indexOf(oldEff) < 0) { h.push(oldEff); s.set('sysmsg-nick-hist', JSON.stringify(h)); }
          }
        }
      } catch (e) {}
      try { document.dispatchEvent(new CustomEvent('contact-renamed', { detail: { id, name: c.name, oldName } })); } catch (e) {}
    }
  };
  window.deleteContact = function (id) {
    if (id === 'default') return false;
    const list = getContacts().filter(x => x.id !== id);
    regStore().set('contacts', JSON.stringify(list));
    const prefix = G + ':' + id + ':';
    const del = function (k) { try { window.xyStore(prefix).remove(k.slice(prefix.length)); } catch (e) {} };
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf(prefix) === 0) del(k);
    }
    if (window.idbGetAllKeys) {
      window.idbGetAllKeys().then(keys => {
        (keys || []).forEach(k => { if (typeof k === 'string' && k.indexOf(prefix) === 0) del(k); });
      }).catch(() => {});
    }
    if (window.__activeCid === id) window.setActiveContact('default');
    return true;
  };
  let autoFixingCid = false;   // true=正在执行自动校正，不算用户手动切换
  let cidUserSwitched = false; // 本会话用户手动切过桌面 → 校正不再干预
  window.setActiveContact = function (id) {
    if (id === (window.__activeCid || 'default')) return;
    if (!autoFixingCid) cidUserSwitched = true;
    try { if (window.chatFlushSave) window.chatFlushSave(); } catch (e) {}
    try { if (window.ccFlushSave) window.ccFlushSave(); } catch (e) {}
    window.__activeCid = id;
    try { regStore().set('active-contact', id); } catch (e) {
      try { localStorage.setItem(G + ':active-contact', id); } catch (e2) {}
      try { if (window.idbSet) window.idbSet(G + ':active-contact', id); } catch (e3) {}
    }
    if (window.refreshActiveContactUI) window.refreshActiveContactUI();
    try { document.dispatchEvent(new Event('contact-switched')); } catch (e) {}
    try {
      document.querySelectorAll('.page').forEach(p => { if (!p.hidden) p.hidden = true; }); // FIX #338 同值写也发 mutation（Blink 实测同值 3 连写=3 条记录），44 页全扫=唤醒全部页面观察器
      const home = document.getElementById('page-phone'); if (home) home.hidden = false;
    } catch (e) {}
  };
  window.switchContact = window.setActiveContact;
  let cidAutoFixTries = 0;   // 已尝试次数（回填挂起时首次可能读不到值，不能一次定死）
  function autoFixMomentSafe() {
    try {
      const sp = document.getElementById('splash');
      if (sp && !sp.classList.contains('hide')) return true;
      const home = document.getElementById('page-phone');
      if (!home || home.hidden) return false;
      const pages = document.querySelectorAll('.page');
      for (let i = 0; i < pages.length; i++) {
        if (pages[i] !== home && !pages[i].hidden) return false;
      }
      return true;
    } catch (e) { return false; }
  }
  function applyCidCorrection(saved) {
    if (!saved || saved === (window.__activeCid || 'default')) return;
    if (saved !== 'default') {
      let known = false;
      try { known = getContacts().some(c => c && c.id === saved); } catch (e) {}
      if (!known) return;
    }
    cidAutoFixTries = 99; // 已生效 → 本会话不再校正
    autoFixingCid = true;
    try { window.setActiveContact(saved); } catch (e) {}
    autoFixingCid = false;
    try { console.info('[mochi] 启动校正：localStorage 无 active-contact，已按 IndexedDB 权威值切回桌面 ' + saved); } catch (e) {}
  }
  function correctCidFromIdb() {
    if (cidUserSwitched || cidAutoFixTries >= 3) return;
    if (!window.xyStore || !autoFixMomentSafe()) return;
    let saved = null;
    try { saved = window.xyStore(G).get('active-contact'); } catch (e) { return; }
    saved = (saved == null ? '' : String(saved)).trim();
    if (!saved && window.idbGet) {
      try {
        window.idbGet(G + ':active-contact').then(function (v) {
          cidAutoFixTries++;
          const s = (v == null ? '' : String(v)).trim();
          if (!s || cidUserSwitched || cidAutoFixTries > 3) return;
          if (!autoFixMomentSafe()) return;
          applyCidCorrection(s);
        }).catch(function () { cidAutoFixTries++; });
      } catch (e) {}
      return;
    }
    cidAutoFixTries++;
    applyCidCorrection(saved);
  }
  try {
    if (window.__mochiDataReady) setTimeout(correctCidFromIdb, 0);
    else {
      document.addEventListener('mochi-restore-done', function h() {
        document.removeEventListener('mochi-restore-done', h);
        correctCidFromIdb();
      });
    }
    document.addEventListener('mochi-wrj-heal', function () { correctCidFromIdb(); });
    setTimeout(correctCidFromIdb, 16000);
  } catch (e) {}
  window.refreshActiveContactUI = function () {
    try { if (window.applyAvatars) window.applyAvatars(); } catch (e) {}
    try { if (window.renderChatHeader) window.renderChatHeader(); } catch (e) {}
  };
  function migrateLegacy() {
    const def = window.xyStore(G + ':default');
    const root = window.xyStore(G);
    try {
      ['bg-keepalive', 'bg-notify', 'bg-notify-nodedup', 'group-chat-enabled'].forEach(function (k) {
        const v = def.get(k);
        if (v !== null && v !== undefined && v !== '') {
          try { if (root.get(k) === null || root.get(k) === undefined) root.set(k, v); } catch (e) {}
          try { def.remove(k); } catch (e) {}
        }
      });
      const gcKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf(G + ':default:reply-gc-') === 0) gcKeys.push(k.slice((G + ':default:').length));
      }
      gcKeys.forEach(function (k) {
        const v = def.get(k);
        if (v !== null && v !== undefined && v !== '') {
          try { if (root.get(k) === null || root.get(k) === undefined) root.set(k, v); } catch (e) {}
          try { def.remove(k); } catch (e) {}
        }
      });
    } catch (e) {}
    ['pomo-cfg', 'pomo-today', 'pomo-total', 'pomo-msgs', 'pomo-send-chat', 'pomo-bell',
      'pomo-companion', 'pomo-companion-log', 'pomo-cmp-usecards',
      'beauty-schemes', 'chat-beauty-schemes', 'hide-ta-sticker', 'desk-freq-mode',
      'full-beauty-schemes', 'fhub-freq', 'fhub-seen',
      'screen-adj-top', 'screen-adj-bottom', 'screen-adj-h', 'screen-adj-desk',
      'screen-adj-shift', 'screen-adj-text', 'screen-adj-side'].forEach(function (k) {
      const v = def.get(k);
      if (v !== null && v !== undefined && v !== '') {
        try { if (root.get(k) === null || root.get(k) === undefined) root.set(k, v); } catch (e) {}
        try { def.remove(k); } catch (e) {}
      }
    });
    ['age-confirmed', 'storage-guide-shown'].forEach(function (k) {
      const v = def.get(k);
      if (v !== null && v !== undefined && v !== '') {
        try { if (root.get(k) === null || root.get(k) === undefined) root.set(k, v); } catch (e) {}
        try { def.remove(k); } catch (e) {}
      }
    });
    try {
      const stale = [];
      for (let i = 0; i < localStorage.length; i++) {
        const kk = localStorage.key(i);
        if (kk && kk.indexOf(G + ':default:splash-seen:') === 0) stale.push(kk);
      }
      stale.forEach(function (kk) { try { localStorage.removeItem(kk); } catch (e2) {} });
    } catch (e) {}
    const old = [];
    const garbage = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.indexOf(G + ':default:default:') === 0) garbage.push(k);
    }
    garbage.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
      if (window.idbDelete) try { window.idbDelete(k); } catch (e) {}
    });
    const sysGarbage = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.indexOf(G + ':default:__') === 0) sysGarbage.push(k);
    }
    sysGarbage.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
      if (window.idbDelete) try { window.idbDelete(k); } catch (e) {}
    });
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf(G + ':') === 0 && !isExcluded(k)) old.push(k);
    }
    const finish = function () {
      try {
        if (!regStore().get('contacts')) {
          let name = '默认';
          try { const n = window.xyStore(G + ':default').get('lbl-partner'); if (n) name = n; } catch (e) {
            try { const n = localStorage.getItem(G + ':default:lbl-partner'); if (n) name = n; } catch (e2) {}
          }
          regStore().set('contacts', JSON.stringify([{ id: 'default', name: name }]));
        }
        if (!regStore().get('active-contact')) {
          const acWrite = function () {
            try { if (!regStore().get('active-contact')) regStore().set('active-contact', 'default'); } catch (e) {}
          };
          if (window.idbHasKey) {
            try {
              window.idbHasKey(G + ':active-contact').then(function (has) {
                if (has === false) acWrite();
              }).catch(acWrite);
            } catch (e) { acWrite(); }
          } else acWrite();
        }
        localStorage.setItem(G + ':migrated-v1', '1');
      } catch (e) {}
      window.__contactsMigrated = true;
      window.__activeCid = window.__activeCid || 'default';
    };
    if (!old.length) { finish(); return; }
    const step = function (i) {
      if (i >= old.length) { finish(); return; }
      const k = old[i];
      const rest = k.slice(G.length + 1);
      const newKey = G + ':default:' + rest;
      const next = function () { step(i + 1); };
      const isChat = (function () {
        const tail = k.slice(G.length + 1);
        return tail === 'chat-msgs' || /^[^:]+:chat-msgs$/.test(tail);
      })();
      const cleanupOld = function () {
        try { localStorage.removeItem(k); } catch (e) {}
        if (isChat && window.idbDelete) { try { window.idbDelete(k); } catch (e) {} }
      };
      const settle = function (payload) {
        try { window.xyStore(G + ':default').set(rest, payload); } catch (e) {}
        const landed = function (durable) { if (durable) cleanupOld(); next(); };
        try { if (localStorage.getItem(newKey) !== null) { landed(true); return; } } catch (e) {}
        if (window.idbHasKey) {
          Promise.resolve(window.idbHasKey(newKey)).then(function (has) {
            landed(has === true);
          }).catch(function () { landed(false); });
        } else landed(false);
      };
      let v = null; try { v = localStorage.getItem(k); } catch (e) {}
      if (v !== null) {
        const hasNew = window.xyStore(G + ':default').get(rest);
        if (hasNew) { cleanupOld(); next(); return; }
        if (window.idbGet) {
          window.idbGet(newKey).then(function (existing) {
            if (existing) { cleanupOld(); next(); return; }
            settle(v);
          }).catch(function () { settle(v); });
        } else settle(v);
      } else if (window.idbGet) {
        window.idbGet(k).then(r => {
          if (r !== undefined && r !== null) {
            const hasNew = window.xyStore(G + ':default').get(rest);
            if (hasNew) { cleanupOld(); next(); return; }
            window.idbGet(newKey).then(function (existing) {
              if (existing) { cleanupOld(); next(); return; }
              settle(r);
            }).catch(function () { settle(r); });
          } else {
            cleanupOld();
            next();
          }
        }).catch(next);
      } else next();
    };
    if (window.idbGetAllKeys) {
      window.idbGetAllKeys().then(keys => {
        (keys || []).forEach(k => {
          if (typeof k === 'string' && k.indexOf(G + ':') === 0 && !isExcluded(k) && old.indexOf(k) < 0) old.push(k);
        });
        step(0);
      }).catch(() => step(0));
    } else step(0);
  }
  function runMigrateWhenReady() {
    if (window.__mochiDataReady) { migrateLegacy(); return; }
    try {
      document.addEventListener('mochi-restore-done', function h() {
        document.removeEventListener('mochi-restore-done', h);
        migrateLegacy();
      });
    } catch (e) { migrateLegacy(); }
  }
  runMigrateWhenReady();
})();
window.__mochiLoaded.push("contacts.js");
}catch(e){console.error("contacts.js",e);window.__jsErrors.push("contacts.js: "+String(e));window.__mochiErrLoaded.push("contacts.js");}})();