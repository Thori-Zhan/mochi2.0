(function(){try{
(function () {
  try { window.__jsErrors = window.__jsErrors || []; } catch (e0) {}
  try {
    window.toast = function (msg) {
      try {
        const text = (msg === undefined || msg === null) ? '' : String(msg);
        if (!text) return;
        window.__lastToastAt = Date.now();
        const show = function () {
          let t = document.getElementById('cc-toast');
          if (!t) {
            t = document.createElement('div');
            t.id = 'cc-toast';
            if (!document.body) { setTimeout(show, 0); return; }
            document.body.appendChild(t);
          }
          t.textContent = text;
          t.className = 'cc-toast'; void t.offsetWidth; t.className = 'cc-toast show';
          clearTimeout(t._timer);
          t._timer = setTimeout(function () { t.className = 'cc-toast'; }, 2600);
        };
        show();
      } catch (e) {}
    };
  } catch (e) {}
  try {
    window.mochiOverlayBusy = function () {
      try {
        const roots = [];
        if (document.body) roots.push(document.body);
        const ph = document.querySelector('.phone');
        if (ph && ph !== document.body) roots.push(ph);
        const vw = window.innerWidth || 1, vh = window.innerHeight || 1;
        for (let r = 0; r < roots.length; r++) {
          const kids = roots[r].children;
          for (let i = 0; i < kids.length; i++) {
            const el = kids[i];
            if (el.hidden || el.id === 'modal-mask') continue;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            if (cs.position !== 'fixed') continue;
            if (cs.pointerEvents === 'none') continue;
            const rc = el.getBoundingClientRect();
            if (rc.width * rc.height < vw * vh * 0.5) continue;
            const z = parseInt(cs.zIndex, 10);
            if (!isNaN(z) && z >= 80) return true;
          }
        }
      } catch (e) {}
      return false;
    };
  } catch (e) {}
  let isMobile = false;
  try { isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches; } catch (e) {}
  let mobileRule = isMobile ? 'viewport<=900' : '';
  const ua = String(navigator.userAgent || '');
  const LAYOUT_KEY = 'xy-home-v2:__layout-pref';
  let layoutPref = '';
  try { layoutPref = localStorage.getItem(LAYOUT_KEY) || ''; } catch (e) {}
  try {
    const pq = /[?&](mobile|pc)=(\d)/.exec(location.search || '');
    if (pq) {
      const want = pq[2] === '1' ? pq[1] : '';
      if (want !== layoutPref) {
        layoutPref = want;
        try {
          if (want) localStorage.setItem(LAYOUT_KEY, want);
          else localStorage.removeItem(LAYOUT_KEY);
        } catch (e2) {}
      }
    }
  } catch (e) {}
  let isTablet = false;
  try {
    const plat = String(navigator.platform || '');
    const _mScreen = Math.min((screen && screen.width) || 0, (screen && screen.height) || 0);
    isTablet = (/iPad/i.test(ua) || plat === 'iPad') && !/android/i.test(ua) ||
      ((plat === 'MacIntel' || /Macintosh/i.test(ua)) && navigator.maxTouchPoints > 1 && 'ontouchstart' in window && _mScreen >= 600);
    const _tw = (screen && screen.width) || 0, _th = (screen && screen.height) || 0;
    if (!isTablet && /Android/i.test(ua) && !/Mobile/i.test(ua) && Math.min(_tw, _th) >= 600) isTablet = true;
  } catch (e) {}
  const sig = {
    sw: 0, sh: 0, touch: false, uaDesk: false, uaMobile: false, oriApi: false,
    coarse: false, hoverNone: false, vvW: 0, uchMobile: false, uchAndroid: false
  };
  try {
    sig.sw = screen.width || screen.availWidth || 0;
    sig.sh = screen.height || screen.availHeight || 0;
    sig.touch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
    sig.uaDesk = /Windows NT|Macintosh|X11|CrOS/i.test(ua);
    sig.uaMobile = /Android|iPhone|iPod|Mobile/i.test(ua);
    sig.oriApi = typeof window.orientation !== 'undefined';
    if (window.matchMedia) {
      sig.coarse = !!window.matchMedia('(pointer: coarse)').matches;
      sig.hoverNone = !!window.matchMedia('(hover: none)').matches;
    }
    sig.vvW = (window.visualViewport && window.visualViewport.width) || 0;
    const uch = navigator.userAgentData;
    if (uch) {
      sig.uchMobile = uch.mobile === true;
      sig.uchAndroid = /android/i.test(String(uch.platform || ''));
    }
  } catch (e) {}
  const narrowScreen = sig.sw > 0 && sig.sw < 900;
  const phoneShaped = narrowScreen && sig.sh >= sig.sw * 1.25;
  const mobileInput = sig.coarse && sig.hoverNone;
  const RULES = [
    ['narrow-screen+touch', sig.touch && narrowScreen],
    ['vv<=900+touch', sig.touch && sig.vvW > 0 && sig.vvW <= 900],
    ['desktop-ua+touch', sig.touch && sig.uaDesk && (sig.oriApi || mobileInput)],
    ['mobile-ua+narrow-screen', sig.uaMobile && narrowScreen],
    ['desktop-ua+phone-screen', sig.uaDesk && phoneShaped],
    ['desktop-ua+coarse-pointer', sig.uaDesk && mobileInput],
    ['desktop-ua+mobile-uch', sig.uaDesk && (sig.uchMobile || sig.uchAndroid)],
    ['desktop-ua+vv<=900+mobile-input', sig.uaDesk && sig.vvW > 0 && sig.vvW <= 900 && (sig.oriApi || mobileInput)]
  ];
  let viewportFixed = false;
  function viewportMetaContent(widthPart) {
    return widthPart + ', initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=' + (isIOSUa() ? 'resizes-content' : 'resizes-visual');
  }
  function applyViewportFix() {
    if (viewportFixed) return;
    if (layoutPref === 'pc') return;
    viewportFixed = true;
    try {
      document.querySelectorAll('meta[name="viewport"]').forEach(function (m) {
        m.setAttribute('content', viewportMetaContent('width=device-width'));
      });
    } catch (e) {}
    try {
      requestAnimationFrame(function () {
        try {
          if (!(window.matchMedia && window.matchMedia('(max-width: 900px)').matches)) {
            var vw = 0;
            try {
              var vv = window.visualViewport;
              var est = vv && vv.width > 0 ? Math.round(vv.width)
                : (vv && vv.scale > 0 && vv.width > 0 ? Math.round(vv.width * vv.scale) : 0);
              if (est >= 200 && est < 900) vw = est;
            } catch (e2) {}
            if (vw) {
              document.querySelectorAll('meta[name="viewport"]').forEach(function (m) {
                m.setAttribute('content', viewportMetaContent('width=' + vw));
              });
            }
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                try {
                  if (!(window.matchMedia && window.matchMedia('(max-width: 900px)').matches)) {
                    document.documentElement.classList.add('force-mobile');
                  }
                } catch (e3) {}
              });
            });
          }
        } catch (e) {}
      });
    } catch (e) {}
  }
  if (!isMobile && !isTablet) {
    for (let ri = 0; ri < RULES.length; ri++) {
      if (RULES[ri][1]) {
        isMobile = true;
        mobileRule = RULES[ri][0];
        break;
      }
    }
    if (isMobile) applyViewportFix();
  } else if (isTablet) {
    mobileRule = 'tablet';
  }
  if (layoutPref === 'mobile') {
    isMobile = true; isTablet = false; mobileRule = 'pref:mobile';
    applyViewportFix();
  } else if (layoutPref === 'pc') {
    isMobile = false; isTablet = false; mobileRule = 'pref:pc';
  }
  if (isTablet) { try { document.documentElement.classList.add('tablet'); } catch (e) {} }
  function isIOSUa() {
    return (/iphone|ipad|ipod/i.test(ua) && !/android/i.test(ua) && !window.MSStream) ||
      ((navigator.platform === 'MacIntel' || /Macintosh/i.test(ua)) && navigator.maxTouchPoints > 1 && 'ontouchstart' in window);
  }
  const isIOS = isIOSUa();
  const isAndroid = /android/i.test(ua);
  const isVia = /via/i.test(ua);
  function setLayoutPref(v) {
    layoutPref = v || '';
    try {
      if (layoutPref) localStorage.setItem(LAYOUT_KEY, layoutPref);
      else localStorage.removeItem(LAYOUT_KEY);
    } catch (e) {}
    return layoutPref;
  }
  const _envUa = String((function () { try { return navigator.userAgent || ''; } catch (e) { return ''; } })());
  const env = {
    isAndroidWebView: (function () {
      try {
        if (!_envUa) return true;
        return /wv\b|MicroMessenger|MicroApp|VivoBrowser|OPBrowser|MQQBrowser|QQBrowser|baiduboxapp|UCBrowser|XiaoMi|MiuiBrowser|HuaweiBrowser|Quark|SogouMobileBrowser|SamsungBrowser|MetaSr|OBABROWSER|dingtalk/i.test(_envUa);
      } catch (e) { return true; }
    })(),
    brokenFileShare: /huaweibrowser|quark|heytapbrowser/i.test(_envUa),
    shareSheetCrash: /heytapbrowser/i.test(_envUa),
    downloadAsk: (function () {
      try {
        if (/huaweibrowser|quark|miuibrowser|vivobrowser|heytapbrowser|opbrowser|mqqbrowser|qqbrowser|ucbrowser|baiduboxapp|baidubrowser|sogoumobilebrowser|micromessenger|microapp|obabrowser|dingtalk/i.test(_envUa)) return true;
        if (isIOS) return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
        if (!isAndroid) return false;
        if (/firefox/i.test(_envUa)) return false;
        if (window.showSaveFilePicker) return false;
        return !(navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.txt', { type: 'text/plain' })] }));
      } catch (e) { return false; }
    })(),
    apiBlockedHint: /QQBrowser|Quark/i.test(_envUa),
    notifyQuirk: /miui|xiaomi|redmi|hyperos/i.test(_envUa) || /android/i.test(_envUa)
  };
  try {
    if (!window.__mochiPhase) {
      window.__mochiPhaseLog = window.__mochiPhaseLog || [];
      window.__mochiPhase = function (tag) {
        try {
          var l = window.__mochiPhaseLog;
          if (l.length >= 30) l.shift();
          l.push({ t: Date.now(), tag: String(tag) });
        } catch (e) {}
      };
    }
  } catch (e) {}
  (function () {
    if (window.__mochiStorRej) return;
    var rej = [];
    window.__mochiStorRej = rej;
    window.__mochiStorRejN = 0;
    var frameOf = function (err) {
      try {
        var ls = String((err && err.stack) || '').split('\n');
        for (var i = 0; i < ls.length; i++) {
          var f = (ls[i] || '').trim();
          if (!f || f.indexOf('__mochiLsSetItemWitness') >= 0) continue;
          if (f.indexOf('@') < 0 && !/\bat\s+\S/.test(f)) continue;
          return f.slice(0, 120);
        }
      } catch (e) {}
      return '';
    };
    var lastSnap = { t: 0 };
    var snapshot = function () {
      if (Date.now() - lastSnap.t < 2000) return lastSnap;
      var o = { keys: 0, bytes: 0, maxK: '', maxB: 0, trunc: 0 };
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (!k) continue;
          var v = '';
          try { v = localStorage.getItem(k) || ''; } catch (e) { o.trunc = 1; }
          var b = (k.length + v.length) * 2; // UTF-16 估算，与【数据】段同一把尺
          o.keys++; o.bytes += b;
          if (b > o.maxB) { o.maxB = b; o.maxK = String(k).slice(0, 30); }
        }
      } catch (e2) { o.trunc = 1; }
      o.t = Date.now();
      lastSnap = o;
      return o;
    };
    var record = function (storeName, key, val, err) {
      try {
        window.__mochiStorRejN++;
        var s = snapshot();
        var bytes = 0;
        try { bytes = (val == null ? 0 : String(val).length) * 2; } catch (e0) {}
        var bg = 0;
        try { bg = document.hidden ? 1 : 0; } catch (e1) {}
        var item = {
          t: Date.now(), store: storeName, k: String(key).slice(0, 40), bytes: bytes,
          err: (err && err.name) || '异常', at: frameOf(err),
          keys: s.keys, lsBytes: s.bytes, maxK: s.maxK, maxB: s.maxB, trunc: s.trunc, bg: bg
        };
        rej.push(item);
        if (rej.length > 12) rej.shift();
        if (window.__mochiPhase) window.__mochiPhase('ls-rej:' + item.k.slice(0, 18));
        return item;
      } catch (e2) { return null; }
    };
    window.__mochiStorRejLast = function () { return rej.length ? rej[rej.length - 1] : null; };
    var wrap = function (host, name) {
      try {
        if (!host || typeof host.setItem !== 'function') return;
        var orig = host.setItem;
        if (orig.__mochiLsWitness) return;
        var wrapped = function __mochiLsSetItemWitness(k, v) {
          try {
            return orig.call(this, k, v);
          } catch (e) {
            record(name, k, v, e);
            throw e; // 照原样抛：调用方的 catch／降级逻辑一字不变
          }
        };
        try { wrapped.__mochiLsWitness = 1; } catch (e0) {}
        Object.defineProperty(host, 'setItem', {
          value: wrapped, writable: true, configurable: true, enumerable: false
        });
      } catch (e2) {}
    };
    try { if (window.localStorage) wrap(window.localStorage, 'local'); } catch (e3) {}
    try { if (window.sessionStorage) wrap(window.sessionStorage, 'session'); } catch (e4) {}
  })();
  window.__mochiDeskScene = function () {
    var out = { txt: '', blurCss: false, blurPx: 0, texKB: 0, zoom: 1, pageBg: false, tabBlur: false, mode: '无' };
    try {
      var ph = document.querySelector('.phone');
      var bl = document.getElementById('phone-bg-layer');
      if (ph && bl) {
        var bi = bl.style.backgroundImage || '';
        var dpos = bi.indexOf('data:');
        if (dpos >= 0) { out.mode = '图'; out.texKB = Math.round((bi.length - dpos) / 1024); }
        else if (bi && bi !== 'none') out.mode = '渐变';
        else out.mode = bl.style.opacity === '1' ? '底色' : '无';
        var bs = getComputedStyle(bl);
        out.blurCss = ph.classList.contains('desk-blur-on');
        var bv = parseInt(bs.getPropertyValue('--desk-bg-blur'), 10);
        out.blurPx = isNaN(bv) ? 0 : bv;
        var rp = ph.getBoundingClientRect();
        if (rp.width > 0) {
          var rb = bl.getBoundingClientRect();
          out.zoom = Math.round(rb.width / rp.width * 100) / 100;
        }
      }
      var dp = document.querySelector('.desktop-pages');
      out.pageBg = !!(dp && dp.classList.contains('has-page-bg'));
      out.tabBlur = !!document.querySelector('.tabbar-blur-on');
      out.txt = '壁纸=' + out.mode + (out.texKB ? (out.texKB >= 1024 ? '≈' + (out.texKB / 1024).toFixed(1) + 'MB' : '≈' + out.texKB + 'KB') : '')
        + (out.zoom > 1.02 ? '·外扩盒×' + out.zoom : '')
        + ' 模糊=' + (out.blurCss ? 'CSS滤镜' + out.blurPx + 'px(兜底)' : (out.blurPx > 0 ? '已烘' : '关'))
        + ' 整页背景=' + (out.pageBg ? '有' : '无') + ' 标签栏毛玻璃=' + (out.tabBlur ? '开' : '关')
        + ' DPR=' + (window.devicePixelRatio || 1);
    } catch (e) { out.txt = '读数失败'; }
    return out;
  };
  window.mochiDevice = {
    isMobile: !!isMobile,
    isTablet: !!isTablet,
    isIOS: !!isIOS,
    isAndroid: !!isAndroid,
    isVia: !!isVia,
    mobileRule: mobileRule,
    layoutPref: layoutPref,
    signals: sig,
    env: env,
    setLayoutPref: setLayoutPref
  };
  window.mochiVvDiag = function () {
    try {
      const d = document.documentElement;
      const cs = window.getComputedStyle(d);
      const vv = window.visualViewport || null;
      const phone = document.querySelector('.phone');
      const ps = phone ? window.getComputedStyle(phone) : null;
      const pr = phone ? phone.getBoundingClientRect() : null;
      let fsMode = '关闭';
      if (document.fullscreenElement || document.webkitFullscreenElement) fsMode = '原生全屏';
      else if (d.classList.contains('fs-css-active')) fsMode = 'CSS兜底全屏';
      else if (d.classList.contains('ios-fs-active')) fsMode = 'iOS隐藏模拟状态栏';
      else if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) fsMode = '系统级全屏(display_override)';
      const out = {
        innerH: window.innerHeight || 0,
        innerW: window.innerWidth || 0,
        vvH: vv ? Math.round(vv.height) : null,
        vvW: vv ? Math.round(vv.width) : null,
        vvOffsetTop: vv ? Math.round(vv.offsetTop || 0) : null,
        vvScale: vv ? vv.scale : null,
        screenH: (window.screen && screen.height) || 0,
        docScrollY: Math.round(window.scrollY || window.pageYOffset || 0),
        safeBottom: cs.getPropertyValue('--mochi-safe-bottom').trim() || '(未设→env)',
        iosH: cs.getPropertyValue('--mochi-ios-h').trim() || '(未设)',
        phoneH: ps ? Math.round(parseFloat(ps.height) || 0) : 0,
        phoneTop: pr ? Math.round(pr.top) : null,
        phoneBottom: pr ? Math.round(pr.bottom) : null,
        phoneInlineH: phone && phone.style.height ? phone.style.height : '',
        phoneAlignSelf: phone && phone.style.alignSelf ? phone.style.alignSelf : '',
        htmlInlineOverflow: d.style.overflow || '',
        bodyScrollLock: !!(document.body && document.body.classList.contains('scroll-lock')),
        vvFit: d.classList.contains('ios-vv-fit'),
        standalone: d.classList.contains('ios-pwa-standalone'),
      force: (function () { try { return localStorage.getItem('xy-home-v2:__safe-top-force') === '1'; } catch (e) { return false; } })(),
        fsMode: fsMode,
        kb: null
      };
      if (pr && vv) out.gapBottom = Math.round(vv.height - pr.bottom);
      try {
        const ae = document.activeElement;
        const isTxt = ae && ((ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')
          ? (ae.type !== 'checkbox' && ae.type !== 'range' && ae.type !== 'file' && ae.type !== 'color' && !ae.readOnly)
          : ae.isContentEditable === true);
        out.focusCovered = null;
        out.focusBottom = null;
        if (isTxt && vv && ae.getBoundingClientRect) {
          const ar = ae.getBoundingClientRect();
          out.focusBottom = Math.round(ar.bottom);
          out.focusCovered = ar.bottom > (vv.offsetTop || 0) + vv.height + 2 ? 1 : 0;
        }
      } catch (e5) {}
      try { if (typeof window.__mochiIosKb === 'function') out.kb = window.__mochiIosKb(); } catch (e2) {}
      try { if (!out.kb && typeof window.__mochiAndroidKb === 'function') out.kb = window.__mochiAndroidKb(); } catch (e4) {}
      try { if (typeof window.scrollLockInfo === 'function') out.lock = window.scrollLockInfo(); } catch (e3) {}
      return out;
    } catch (e) { return null; }
  };
})();
window.mochiViewportForm = function (sig) {
  const envTop = sig.envTop || 0;
  const envBottom = sig.envBottom || 0;
  const innerH = sig.innerH || 0;
  const screenH = sig.screenH || 0;
  const iosMajor = sig.iosMajor || 0;
  const safMajor = sig.safMajor || (function () { try { var m = /Version\/(\d+)\./.exec(String(navigator.userAgent || '')); return m ? +m[1] : 0; } catch (e) { return 0; } })();
  const standalone = !!sig.standalone;
  const diff = (screenH > 0 && innerH > 0) ? (screenH - innerH) : 0;
  const e2eOverH = (screenH > 0 && innerH > 0) ? (innerH - screenH) : 0;
  const e2eZ = (sig.screenW > 0 && sig.innerW > 0 && sig.innerW > sig.screenW) ? (sig.screenW / sig.innerW) : 0;
  const needEnvProbe = ((screenH > 0 && innerH > 0 && diff <= 2) || standalone);
  const coverBrowser = !standalone && envTop >= 20 && (diff <= 2 || !!sig.andr);
  const e2eBase = !standalone && !!sig.andr && envTop < 20
    && e2eOverH >= 3 && e2eZ > 0.5 && e2eZ <= 1;
  const e2eBrowser = e2eBase && (e2eOverH <= 64 || !!sig.e2eLatch);
  const forceCover = standalone && !!sig.safeTopForce;
  const resStand = standalone && !forceCover && envTop >= 20 && envTop <= 160 && diff >= envTop - 8 && iosMajor >= 18 && safMajor > 0 && safMajor < 26;
  const ipadForm = standalone && envTop >= 20 && diff <= 2 && screenH > 0 && innerH >= screenH - 2;
  let safeTop;
  if (forceCover) safeTop = (envTop >= 20) ? envTop : ((diff >= 20 && diff <= 160) ? diff : 0);
  else if (resStand) safeTop = 0;
  else safeTop = ((standalone || coverBrowser) && envTop >= 20 && envTop <= 160) ? envTop
    : (e2eBrowser ? Math.min(40, Math.max(20, Math.round(e2eZ > 0 ? 28 / e2eZ : 28))) : 0);
  let envTopFallback = false;
  if (safeTop === 0 && standalone && envTop < 20 && envBottom >= 20 && diff <= 2) {
    safeTop = Math.min(72, Math.max(40, envBottom + 18));
    envTopFallback = true;
  }
  const expBase = (coverBrowser || resStand || ipadForm || e2eBrowser) ? innerH
    : (forceCover ? ((screenH >= innerH ? screenH : 0) || (safeTop + innerH))
      : Math.min((screenH >= innerH ? screenH : 0) || (envTop + innerH), envTop + innerH));
  const expTop = envTopFallback ? (safeTop + 14) : resStand ? 12 : (e2eBrowser ? safeTop : Math.max(envTop, 12));
  const iosCover = standalone && !forceCover && !resStand && !ipadForm && envTop >= 20 && envTop <= 160;
  const form = forceCover ? 'force-cover' : resStand ? 'reserved' : ipadForm ? 'ipad'
    : coverBrowser ? 'cover-browser' : e2eBrowser ? 'e2e-browser'
    : (envTop >= 20 ? 'covered' : (diff >= 20 ? 'avoided' : 'plain'));
  return { form: form, resStand: resStand, ipadForm: ipadForm, coverBrowser: coverBrowser,
    forceCover: forceCover, iosCover: iosCover, needEnvProbe: needEnvProbe, safeTop: safeTop,
    envTopFallback: envTopFallback, envBottom: envBottom,
    safeBottom: e2eBrowser ? Math.min(28, Math.max(12, Math.round(e2eZ > 0 ? 16 / e2eZ : 16))) : 0,
    e2eBrowser: e2eBrowser,
    expBase: expBase, expTop: expTop, envTop: envTop, diff: diff,
    standalone: standalone, iosMajor: iosMajor };
};
(function () {
  var PUNCT = /[\s。！？!?.,，、;；:：·~～「」『』（）()【】\[\]“”‘’"'—_\-]+/g;
  window.mochiSearch = {
    terms: function (q) { return String(q || '').trim().toLowerCase().split(/\s+/).filter(function (w) { return w; }); },
    qnorm: function (q) { return String(q || '').replace(PUNCT, ' ').trim(); },
    norm: function (s) { return String(s || '').toLowerCase().replace(PUNCT, ''); },
    anchor: function (terms) { return terms.reduce(function (a, b) { return b.length > a.length ? b : a; }, terms[0] || ''); },
    rank: function (text, q) {
      var t = this.norm(text); var nq = this.norm(q);
      if (!nq) return 2;
      if (t === nq) return 0;
      return t.indexOf(nq) === 0 ? 1 : 2;
    },
    and: function (hayLower, terms) { return terms.every(function (w) { return hayLower.indexOf(w) >= 0; }); }
  };
})();
window.__mochiPickArmed = window.__mochiPickArmed || { seq: 0, opened: 0 };
window.mochiFilePickFromLabel = function (e) {
  try {
    var hit = !!(e && e.target && e.target.closest && e.target.closest('label[data-file-pick-for]'));
    if (hit) window.__mochiPickArmed.opened++;
    return hit;
  } catch (err) { return false; }
};
window.mochiFilePickGuard = function (input, onMiss) {
  var token = ++window.__mochiPickArmed.seq;
  var openedAt = window.__mochiPickArmed.opened;
  var settled = false;
  var finish = function (ok) {
    if (settled) return;
    settled = true;
    if (!ok && typeof onMiss === 'function') { try { onMiss(); } catch (e) {} }
  };
  var onFocus = function () { cleanup(); finish(true); };
  var onClick = function () { cleanup(); finish(true); };
  var onChange = function () { cleanup(); finish(true); };
  function cleanup() {
    try { input.removeEventListener('focus', onFocus); } catch (e) {}
    try { input.removeEventListener('click', onClick); } catch (e) {}
    try { input.removeEventListener('change', onChange); } catch (e) {}
  }
  try { input.addEventListener('focus', onFocus); } catch (e) {}
  try { input.addEventListener('click', onClick); } catch (e) {}
  try { input.addEventListener('change', onChange); } catch (e) {}
  setTimeout(function () {
    if (settled) return;
    if (window.__mochiPickArmed.opened !== openedAt) { cleanup(); settled = true; return; } // label 路径已生效
    if (window.mochiFilePickSurfaceTap && window.mochiFilePickSurfaceTap()) { cleanup(); settled = true; return; }
    cleanup();
    finish(false); // 没等到任何信号 → 判定「这次没弹出」，走兜底
  }, 60);
  return { done: function () { cleanup(); settled = true; }, token: token };
};
window.mochiFilePickLabel = function (btn, input) {
  try {
    if (!btn || !input || !btn.appendChild) return;
    if (!input.id) input.id = 'mochi-file-pick-' + Date.now().toString(36);
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
    var mark = 'data-file-pick-for';
    var label = btn.querySelector('label[' + mark + '="' + input.id + '"]');
    if (!label) {
      label = document.createElement('label');
      label.setAttribute(mark, input.id);
      label.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;cursor:pointer;';
      var surf = btn.querySelector('input[data-file-pick-surface]');
      if (surf) btn.insertBefore(label, surf); else btn.appendChild(label);
    }
    label.htmlFor = input.id;
  } catch (e) { /* 兼容助手绝不能成为错误源 */ }
};
window.__mochiPickLog = window.__mochiPickLog || [];
window.mochiPickLog = function (entry, step) {
  try {
    var arr = window.__mochiPickLog;
    arr.push({ t: Date.now(), e: String(entry || '').slice(0, 22), s: String(step || '').slice(0, 22) });
    if (arr.length > 6) arr.splice(0, arr.length - 6);
  } catch (e) {}
};
window.mochiPickCbFail = function (entry, e, nFiles) {
  var msg = '';
  try { msg = String((e && e.message) || e || '').slice(0, 60); } catch (x) {}
  try { if (window.mochiPickLog) window.mochiPickLog(entry || 'pick', 'cb:err'); } catch (x2) {}
  try { if (window.__jsErrors) window.__jsErrors.push('[选图导入] ' + String(entry || '') + ' ×' + (nFiles || 0) + '：' + msg); } catch (x3) {}
  try { if (window.toast) window.toast('选好 ' + (nFiles || 0) + ' 个文件，导入这一步没走完（' + (msg || '未知原因') + '），请再点一次'); } catch (x4) {}
};
window.mochiImportLogKey = function () { return 'xy-home-v2:__import-log'; };
window.__mochiImportLog = (function () {
  try {
    var a = JSON.parse(localStorage.getItem(window.mochiImportLogKey()) || '[]');
    return Array.isArray(a) ? a : [];
  } catch (e) { return []; }
})();
window.mochiImportLog = function (what) {
  try {
    var arr = window.__mochiImportLog;
    arr.push({ t: Date.now(), w: String(what || '').slice(0, 180) });
    if (arr.length > 8) arr.splice(0, arr.length - 8);
    localStorage.setItem(window.mochiImportLogKey(), JSON.stringify(arr));
  } catch (e) {}
};
window.mochiDataPickAccept = '.json,application/json,text/plain,application/octet-stream';
window.mochiModalPickOk = function (cfg) {
  var o = cfg || {};
  var okBtn = o.okBtn;
  var host = okBtn && okBtn.parentNode;
  if (!okBtn || !host) return null;
  var input = document.getElementById('mochi-modal-pick');
  if (!input) {
    input = document.createElement('input');
    input.type = 'file';
    input.id = 'mochi-modal-pick';
    input.className = 'mochi-pick-surface';
    input.setAttribute('data-file-pick-surface', '1');
    input.setAttribute('data-modal-pick', '1');
    input.style.cssText = 'position:absolute;margin:0;padding:0;border:0;outline:none;background:transparent;color:transparent;font-size:0;appearance:none;-webkit-appearance:none;cursor:pointer;z-index:2;';
  }
  try {
    var hp = getComputedStyle(host).position || '';
    if (hp !== 'absolute' && hp !== 'fixed' && hp !== 'relative' && hp !== 'sticky') host.style.position = 'relative';
  } catch (e1) {}
  try { input.accept = o.accept || ''; } catch (e2) {}
  input.multiple = !!o.multiple;
  try { host.appendChild(input); } catch (e3) { return null; }
  try {
    var r = okBtn.getBoundingClientRect(), pr = host.getBoundingClientRect();
    input.style.left = Math.round(r.left - pr.left) + 'px';
    input.style.top = Math.round(r.top - pr.top) + 'px';
    input.style.width = Math.max(24, Math.round(r.width)) + 'px';
    input.style.height = Math.max(24, Math.round(r.height)) + 'px';
  } catch (e4) {}
  input.onclick = function (ev) {
    var mode = (typeof o.mode === 'function') ? o.mode() : null;
    if (typeof o.skipWhen === 'function' && o.skipWhen(mode)) {
      try { ev.preventDefault(); } catch (e5) {}
      try { ev.stopPropagation(); } catch (e6) {}
      window.mochiModalPickOkClear();
      try { okBtn.click(); } catch (e7) {}
      return;
    }
    if (window.mochiPickLog) window.mochiPickLog(o.entry || 'modal-ok', 'leg:modal-ok');
  };
  input.onchange = function () {
    var files = Array.prototype.slice.call(input.files || []);
    try { input.value = ''; } catch (e8) {} // 允许重选同一文件
    var mode = (typeof o.mode === 'function') ? o.mode() : null;
    if (window.mochiPickLog) window.mochiPickLog(o.entry || 'modal-ok', files.length ? ('files=' + files.length) : 'files=0');
    if (files.length && typeof o.onFiles === 'function') { try { o.onFiles(files, mode); } catch (e9) { if (window.mochiPickCbFail) window.mochiPickCbFail(o.entry || 'modal-ok', e9, files.length); } }
    var tok = input.__armTok = (input.__armTok || 0) + 1;
    setTimeout(function () { if (input.__armTok === tok) window.mochiModalPickOkClear(); }, 0);
  };
  return input;
};
window.mochiModalPickOkClear = function () {
  try {
    var input = document.getElementById('mochi-modal-pick');
    if (input && input.parentNode) input.parentNode.removeChild(input);
  } catch (e) {}
};
window.mochiFilePickSurface = function (btn, opts) {
  try {
    var o = opts || {};
    if (!btn || !btn.appendChild) return null;
    var id = o.id || ('mochi-pick-surface-' + Date.now().toString(36));
    var input = document.getElementById(id);
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = id;
      input.className = 'mochi-pick-surface';
      input.setAttribute('data-file-pick-surface', '1');
      input.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;margin:0;padding:0;border:0;outline:none;background:transparent;color:transparent;font-size:0;appearance:none;-webkit-appearance:none;cursor:pointer;z-index:0;';
      var _pos = '';
      try { _pos = getComputedStyle(btn).position || ''; } catch (e3) {}
      if (_pos !== 'absolute' && _pos !== 'fixed' && _pos !== 'relative' && _pos !== 'sticky') btn.style.position = 'relative';
      btn.appendChild(input);
      input.addEventListener('click', function () {
        window.__mochiSurfaceTapAt = Date.now();
        try {
          var bp = getComputedStyle(btn).position;
          if (bp === 'static' || bp === '') btn.style.position = 'relative';
        } catch (e4) {}
      }, true);
      input.__mochiSurface = { owner: null, onFiles: null };
    }
    try { input.accept = typeof o.accept === 'string' ? o.accept : 'image/*'; } catch (e) {} // #1413：只有「没提 accept」才兜底成图片；提了空串＝这一格不限制类型，别再偷偷换成 image/*（同一型缺陷在 chatcard #1040d 那处只能靠事后补写绕开）
    input.multiple = !!o.multiple;
    var rec = input.__mochiSurface = input.__mochiSurface || { owner: null, onFiles: null };
    var newOwner = o.owner;
    if (typeof newOwner === 'string') { try { newOwner = document.getElementById(newOwner); } catch (eO) { newOwner = null; } }
    if (newOwner) rec.owner = newOwner;
    if (typeof o.owner === 'string' && o.owner) rec.ownerId = o.owner;
    if (rec.host && rec.host !== btn) rec.owner = null;
    rec.host = btn;
    if (typeof o.onFiles === 'function') rec.onFiles = o.onFiles;
    if (typeof o.owner === 'string' && o.owner && typeof rec.onFiles !== 'function' && window.mochiFilePickBindHost) {
      try {
        var preHost = window.mochiFilePickBindHost(o.owner, btn);
        if (preHost && !rec.owner) rec.owner = preHost;
      } catch (eB) {}
    }
    if (!input.__mochiNativeHooked) {
      input.__mochiNativeHooked = 1;
      input.addEventListener('pointerdown', function () {
        if (window.mochiPickLog) window.mochiPickLog((btn && btn.id) || (input.id || 'surf'), 'surf:hit');
      }, { capture: true, passive: true });
    }
    input.onchange = function () {
      var files = Array.prototype.slice.call(input.files || []);
      try { input.value = ''; } catch (e) {} // 允许重选同一文件
      if (window.mochiPickLog) window.mochiPickLog((btn && btn.id) || (input.id || 'surf'), files.length ? ('surf:files=' + files.length) : 'surf:files=0');
      if (!files.length) return;
      if (typeof rec.onFiles === 'function') { try { rec.onFiles(files); } catch (eCb) { if (window.mochiPickCbFail) window.mochiPickCbFail((btn && btn.id) || input.id || 'surf', eCb, files.length); } return; }
      var owner = rec.owner;
      if (!owner && rec.ownerId) { try { owner = document.getElementById(rec.ownerId); } catch (e3) { owner = null; } }
      if (typeof owner === 'string') { try { owner = document.getElementById(owner); } catch (e2) { owner = null; } }
      if (!owner) { if (window.mochiPickLog) window.mochiPickLog((btn && btn.id) || (input.id || 'surf'), 'surf:nopipe'); return; }
      try {
        var dt = new DataTransfer();
        for (var i = 0; i < files.length; i++) dt.items.add(files[i]);
        owner.files = dt.files;
        owner.dispatchEvent(new Event('change'));
      } catch (e) {
        if (window.toast) { try { toast('浏览器不支持这种方式选择图片，请改用 Chrome 或 Edge 打开'); } catch (x) {} }
      }
    };
    return input;
  } catch (e) { return null; }
};
window.mochiFilePickSurfaceTap = function () {
  var at = window.__mochiSurfaceTapAt || 0;
  window.__mochiSurfaceTapAt = 0;
  return (Date.now() - at) < 400;
};
window.mochiFilePickSurfaceAll = function (input) {
  var out = [];
  try {
    var all = document.querySelectorAll('input[data-file-pick-surface]');
    for (var i = 0; i < all.length; i++) {
      var rec = all[i].__mochiSurface;
      if (rec && (rec.owner === input || (typeof rec.owner === 'string' && rec.owner === input.id) || (rec.ownerId && rec.ownerId === input.id))) out.push(all[i]);
    }
  } catch (e) {}
  return out;
};
var PICK_DOOR_KEY = 'xy-home-v2:__pick-doors';
var _pickDoorAutoSeq = 0; // A 档（当场换门）生成的层 id 计数
var PICK_DOOR_MAX = 40; // 台账上限（每条约 60B＝共 2.4KB）；超出按最久没点过的门淘汰
var _pickDoors = null;
function pickDoorLoad() {
  if (_pickDoors) return _pickDoors;
  _pickDoors = {};
  try {
    var o = JSON.parse(localStorage.getItem(PICK_DOOR_KEY) || '{}');
    if (o && typeof o === 'object' && !Array.isArray(o)) _pickDoors = o;
  } catch (e) { _pickDoors = {}; }
  return _pickDoors;
}
var _pickDoorSaveT = 0;
var _pickDoorLsDead = 0; // 1＝LS 这一发落不下去，台账只活在内存里（每次页面回收清零）
function pickDoorSave() {
  var s = '';
  try { s = JSON.stringify(_pickDoors || {}); } catch (e0) { return; }
  try { localStorage.setItem(PICK_DOOR_KEY, s); _pickDoorLsDead = 0; } catch (e) { _pickDoorLsDead = 1; }
  try { if (window.idbSet) window.idbSet(PICK_DOOR_KEY, s); } catch (e2) {}
}
function pickDoorDirty() {
  try {
    if (_pickDoorSaveT) return;
    _pickDoorSaveT = setTimeout(function () {
      _pickDoorSaveT = 0;
      pickDoorSave();
    }, 600);
  } catch (e2) {}
}
function pickDoorMergeIdb() {
  try {
    if (!window.idbGet) return;
    Promise.resolve(window.idbGet(PICK_DOOR_KEY)).then(function (raw) {
      if (!raw) return;
      var o = raw;
      try { if (typeof raw === 'string') o = JSON.parse(raw); } catch (eP) { return; }
      if (!o || typeof o !== 'object' || Array.isArray(o)) return;
      var d = pickDoorLoad(), ch = 0;
      Object.keys(o).forEach(function (k) {
        var n = o[k], cur = d[k];
        if (!n || typeof n !== 'object') return;
        if (!cur || (Number(n.t) || 0) > (Number(cur.t) || 0)) { d[k] = n; ch++; }
      });
      if (!ch && !_pickDoorLsDead) return;
      pickDoorTrim(d);
      if (_pickDoorLsDead) pickDoorDirty(); // LS 那份本来就是空的＝把库里读到的补回 LS 写得进的那台机器
      if (window.mochiPickDoorSweep) window.mochiPickDoorSweep(true);
    }).catch(function () {});
  } catch (e) {}
}
try {
  document.addEventListener('mochi-restore-done', function () { pickDoorMergeIdb(); });
  setTimeout(pickDoorMergeIdb, 2500); // 回填事件没派发（首装／无 IDB）也要有一发，两路都只在 t 上取新
} catch (eM) {}
function pickDoorTrim(d) {
  try {
    var ks = Object.keys(d || {});
    if (ks.length <= PICK_DOOR_MAX) return;
    ks.sort(function (a, b) { return (Number(d[a] && d[a].t) || 0) - (Number(d[b] && d[b].t) || 0); });
    for (var i = 0; i < ks.length - PICK_DOOR_MAX; i++) delete d[ks[i]];
  } catch (e) {}
}
function pickDoorHasLayer(el) {
  try {
    var kids = el.children || [];
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].getAttribute && kids[i].getAttribute('data-file-pick-surface') === '1') return true;
    }
  } catch (e) {}
  return false;
}
window.mochiFilePickDoor = function (el, o) {
  try {
    o = o || {};
    if (!pickDoorHostable(el) || !window.mochiFilePickSurface) return null; // #1343：替换元素装不出渲染得出来的子节点＝铺进去也是死层
    var owner = o.owner;
    var host = typeof owner === 'string' ? document.getElementById(owner) : owner;
    if (typeof owner === 'string' && !host && window.mochiFilePickBindHost) host = window.mochiFilePickBindHost(owner);
    if (!host && typeof o.onFiles !== 'function') return null;
    var lid = o.id || ('mochi-door-' + (el.id || ''));
    var layer = window.mochiFilePickSurface(el, {
      id: lid, accept: typeof o.accept === 'string' ? o.accept : ((host && host.accept) || 'image/*'), // #1413：门上同一把尺（宿主是空串＝不限制，不许一路兜回相册）
      multiple: typeof o.multiple === 'boolean' ? o.multiple : !!(host && host.multiple),
      owner: host || owner, onFiles: o.onFiles
    });
    if (!layer) return null;
    try { if (layer.parentNode === el && el.firstChild !== layer) el.insertBefore(layer, el.firstChild); } catch (e0) {}
    if (o.face && o.face !== el && el.contains(o.face)) {
      if (!pickDoorFitLayer(layer, el, o.face)) return null;
    } else if (o.veto) {
      var _hb = null, _lb = null;
      try { _hb = el.getBoundingClientRect(); _lb = layer.getBoundingClientRect(); } catch (e1) {}
      if (_hb && _lb && _hb.width && _hb.height && (!_lb.width || !_lb.height)) {
        try { if (layer.parentNode) layer.parentNode.removeChild(layer); } catch (e2) {}
        window.__mochiDoorNoFit = (window.__mochiDoorNoFit || 0) + 1;
        return null;
      }
    }
    var rec = layer.__mochiSurface;
    if (rec) {
      if (o.veto) rec.veto = 1;
    }
    return layer;
  } catch (e) { return null; }
};
var PICK_DOOR_NOCHILD = { IMG: 1, INPUT: 1, BR: 1, HR: 1, PICTURE: 1, SOURCE: 1, VIDEO: 1, AUDIO: 1, IFRAME: 1, EMBED: 1, OBJECT: 1, TRACK: 1, AREA: 1, CANVAS: 1, PROGRESS: 1, SELECT: 1, TEXTAREA: 1, META: 1, LINK: 1, SCRIPT: 1, STYLE: 1, BASE: 1, WBR: 1 };
function pickDoorHostable(el) { return !!(el && el.appendChild && !PICK_DOOR_NOCHILD[el.tagName]); }
function pickDoorAnchor(el) {
  try {
    var seg = [], cur = el, i = 0;
    for (; i < 8 && cur && cur.nodeType === 1; i++, cur = cur.parentElement) {
      if (cur.id) {
        seg.reverse();
        return { root: String(cur.id).slice(0, 40), idx: seg, ok: 1 };
      }
      var p = cur.parentElement;
      if (!p) break;
      var kids = p.children || [], k = 0, n = 0;
      for (; n < kids.length; n++) { if (kids[n] === cur) break; if (kids[n].tagName === cur.tagName) k++; }
      seg.push(cur.tagName + '#' + k);
    }
  } catch (e) {}
  return null;
}
function pickDoorResolve(a) {
  try {
    if (!a || !a.root || !Array.isArray(a.idx)) return null;
    var cur = document.getElementById(a.root);
    if (!cur) return null;
    for (var i = 0; i < a.idx.length && cur; i++) {
      var seg = String(a.idx[i]).split('#'), want = seg[0], k = Number(seg[1]) || 0;
      var kids = cur.children || [], hit = null;
      for (var n = 0; n < kids.length; n++) {
        if (kids[n].tagName !== want) continue;
        if (k-- === 0) { hit = kids[n]; break; }
      }
      cur = hit;
    }
    return cur && cur.nodeType === 1 ? cur : null;
  } catch (e) { return null; }
}
function pickDoorClimb(node) {
  try {
    var face = null;
    for (var cur = node, i = 0; i < 6 && cur && cur.nodeType === 1; i++, cur = cur.parentElement) {
      if (cur.namespaceURI && cur.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;
      var tag = cur.tagName;
      if (tag === 'BUTTON' || tag === 'A') return { el: cur, face: null };   // label 不算：它自己就是转发层，再塞 input 进去＝两条转发路叠在一格
      var leaf = !cur.children || cur.children.length === 0;
      if (leaf && pickDoorHostable(cur)) return { el: cur, face: null };
      if (leaf) { face = face || cur; continue; }
      if (face && pickDoorHostable(cur)) return { el: cur, face: face };
    }
  } catch (e) {}
  return null;
}
function pickDoorFitLayer(layer, host, face) {
  try {
    var fr = face.getBoundingClientRect(), hr = host.getBoundingClientRect();
    if (!fr.width || !fr.height) return false;
    layer.style.left = Math.round(fr.left - hr.left) + 'px';
    layer.style.top = Math.round(fr.top - hr.top) + 'px';
    layer.style.width = Math.round(fr.width) + 'px';
    layer.style.height = Math.round(fr.height) + 'px';
    var cx = fr.left + fr.width / 2, cy = fr.top + fr.height / 2;
    if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) return true; // 不在视口内＝无从复核，按旧语义放行
    var u = document.elementFromPoint(cx, cy);
    if (u === layer) return true;
    if (u === face) { // face 自己是定位元素、压在层上面：把层抬到它之上（盒子与它完全重合＝只盖它这一格）
      try { layer.style.zIndex = '2'; } catch (e1) {}
      u = document.elementFromPoint(cx, cy);
      if (u === layer) return true;
    }
    if (u && !host.contains(u)) return true;
    if (u && !u.__mochiSurface) {
      try {
        var up = '';
        try { up = getComputedStyle(u).position || ''; } catch (e2) {}
        if (up === 'static' || up === '') u.style.position = 'relative';
        if (!u.style.zIndex || u.style.zIndex === 'auto' || u.style.zIndex === '0') u.style.zIndex = '1';
      } catch (e3) {}
      u = document.elementFromPoint(cx, cy);
      if (u === layer) return true;
    }
    try { if (layer.parentNode) layer.parentNode.removeChild(layer); } catch (e4) {}
    window.__mochiDoorNoFit = (window.__mochiDoorNoFit || 0) + 1;
    return false;
  } catch (e) { return false; }
}
window.mochiFilePickLearnDoor = function (input) {
  try {
    var ev = window.event;
    if (!ev || !ev.isTrusted || ev.type !== 'click') return; // 程序化／延时补腿不记（只认手指那一下）
    if (ev.timeStamp && typeof performance !== 'undefined' && performance.now && performance.now() - ev.timeStamp > 400) return;
    var surfAt = window.__mochiSurfaceTapAt || 0;
    if (surfAt && Date.now() - surfAt < 400) return;         // 本次手势落在真层上＝别重复记
    var raw = ev.target;
    if (!raw || raw.nodeType !== 1 || raw.__mochiSurface) return;   // 落点本身就是某张层＝这一发已由原生腿负责，不再记
    var climb = pickDoorClimb(raw);                                  // 往上找铺得安全的那一格（见上）
    var tgt = climb && climb.el, face = climb && climb.face;         // #1343：face＝手指那一格（宿主是容器时按它收盒子）
    if (!tgt) return;
    if (!input || !input.id || !input.accept) return;        // 宿主没有 accept＝无法保证重建时口径一致（音频/文件门不自动学）
    var cur = ev.currentTarget;
    if (cur && cur !== document && typeof cur.contains === 'function' && !cur.contains(tgt)) return;
    if (tgt.appendChild) {
      try {
        var _had = null, _kids = tgt.children || [];
        for (var _ki = 0; _ki < _kids.length; _ki++) {
          if (_kids[_ki].getAttribute && _kids[_ki].getAttribute('data-file-pick-surface') === '1') { _had = _kids[_ki]; break; }
        }
        if (_had) tgt.__mochiDoorId = _had.id;
        else if (!tgt.__mochiDoorId) tgt.__mochiDoorId = 'mochi-door-x-' + (++_pickDoorAutoSeq);
        var _justArmed = !_had;
        if (window.mochiFilePickDoor(tgt, { id: tgt.__mochiDoorId, owner: input, veto: _had ? undefined : 1, face: _had ? null : face }) && _justArmed && window.mochiPickLog) {
          window.__mochiDoorPendingLog = 1; // 由下面的 B 档决定这一笔的名字：落得了盘就叫 door:learn
        }
      } catch (eA) {}
    }
    var _bstat = '';
    try {
      var _anchor = tgt.id ? null : pickDoorAnchor(tgt);
      if ((tgt.id || _anchor) && tgt.isConnected) {
        var d = pickDoorLoad();
        var k = String(tgt.id || ('fp:' + _anchor.root + '>' + (_anchor.idx || []).join('/'))).slice(0, 80);
        var want = { owner: String(input.id).slice(0, 40), accept: String(input.accept).slice(0, 64), multiple: !!input.multiple, t: Date.now() }; // #1410：数据文件的 accept 并集 58 字符，按 40 截会把末条 MIME 截成半截（台账那份与宿主那份永不相等＝这一格被误判成「两种状态切」而永久剔门）
        if (!tgt.id) { want.a = _anchor; if (face) want.f = pickDoorAnchor(face); }
        var old = d[k];
        if (old && old.bad) { /* 已被判过「口径不一致」＝永久裁决，不再自动铺 */ }
        else if (old && (old.owner !== want.owner || old.accept !== want.accept || !!old.multiple !== want.multiple)) {
          d[k] = { bad: 1, t: want.t }; // 同一格在不同状态下选的东西不一样＝自动铺层必然选错类型＝剔除
          pickDoorDirty();
          _bstat = 'variant';
        } else if (old) { old.t = want.t; }
        else { d[k] = want; pickDoorTrim(d); pickDoorDirty(); _bstat = 'learn'; }
      }
    } catch (eB) {}
    try {
      if (window.__mochiDoorPendingLog || _bstat === 'variant') {
        window.__mochiDoorPendingLog = 0;
        if (window.mochiPickLog) {
          window.mochiPickLog(_bstat === 'learn' || _bstat === 'variant' ? (tgt.id || 'door') : (input.id || 'pick'),
            _bstat === 'variant' ? 'door:variant' : (_bstat === 'learn' ? 'door:learn' : 'door:now'));
        }
      }
    } catch (eLg) {}
  } catch (e) {}
};
var _pickSweepAt = 0;
window.mochiPickDoorSweep = function (force) {
  try {
    var now = Date.now();
    if (!force && now - _pickSweepAt < 250) return 0;
    _pickSweepAt = now;
    var d = pickDoorLoad(), n = 0;
    for (var k in d) {
      if (!Object.prototype.hasOwnProperty.call(d, k)) continue;
      var r = d[k];
      if (!r || r.bad || !r.owner) continue;
      var el = k.indexOf('fp:') === 0 ? pickDoorResolve(r.a) : document.getElementById(k); // #1343：无 id 的门按结构锚找回去
      if (!el || !pickDoorHostable(el)) continue;
      if (pickDoorHasLayer(el)) continue;
      var _f = r.f ? pickDoorResolve(r.f) : null;
      if (_f && !el.contains(_f)) _f = null;   // 锚解析到别处＝宁可不铺，绝不在猜错的格子上铺一张门
      window.mochiFilePickDoor(el, { owner: r.owner, accept: r.accept, multiple: r.multiple, veto: 1, face: _f });
      n++;
    }
    return n;
  } catch (e) { return 0; }
};
function pickDoorDisable(node) {
  try {
    var door = node && node.parentElement;
    if (node && node.parentNode) node.parentNode.removeChild(node);
    if (door && door.id) {
      var d = pickDoorLoad();
      d[String(door.id).slice(0, 40)] = { bad: 1, t: Date.now() };
      pickDoorTrim(d);
      pickDoorDirty();
    }
  } catch (e) {}
}
try {
  document.addEventListener('click', function (e) {
    try {
      var t = e && e.target;
      var rec = t && t.__mochiSurface;
      if (!rec || !rec.veto) return;
      if (window.__mochiPickAskSeq === window.__mochiGestureSeq) {
        var oh = (rec.owner && rec.owner.id) || rec.ownerId || '';
        if (!oh || oh === window.__mochiPickAskHost) return;
      }
      e.preventDefault(); // 没人认领这一发＝它不该弹选择器，原样交回入口逻辑（开面板／开抽屉）
      if (window.mochiPickLog) window.mochiPickLog(t.id || 'door', 'door:veto');
    } catch (e2) {}
  }, false);
} catch (e3) {}
try { setTimeout(function () { window.mochiPickDoorSweep(true); }, 0); } catch (e4) {}
function pickDoorLayerOf(el) {
  try {
    var kids = el.children || [];
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].getAttribute && kids[i].getAttribute('data-file-pick-surface') === '1') return kids[i];
    }
  } catch (e) {}
  return null;
}
window.mochiPickDoorCensus = function () {
  var d = pickDoorLoad(), total = 0, armed = 0, bad = 0, dead = 0;
  try {
    for (var k in d) {
      if (!Object.prototype.hasOwnProperty.call(d, k)) continue;
      total++;
      var r = d[k];
      if (!r || r.bad) { bad++; continue; }
      var el = k.indexOf('fp:') === 0 ? pickDoorResolve(r.a) : document.getElementById(k);
      var lay = el && pickDoorLayerOf(el);
      if (!lay) continue;
      var b = null;
      try { b = lay.getBoundingClientRect(); } catch (e1) {}
      if (b && b.width && b.height) armed++; else dead++; // 0×0＝这张层根本命不到＝病还在
    }
  } catch (e) {}
  return { total: total, armed: armed, bad: bad, dead: dead, nofit: window.__mochiDoorNoFit || 0 };
};
window.mochiTapOn = function (el, fn) {
  if (!el || typeof fn !== 'function') return false;
  var tDown = null;   // touch 路布点
  var pDown = null;   // pointer 路布点
  var tapGuard = 0;   // 三路共用防重入闸
  function tapIsTap(dx, dy, dt) { return dt <= 450 && dx * dx + dy * dy <= 144; }
  function tapFire() {
    var now = Date.now();
    if (now < tapGuard) return;
    tapGuard = now + 800;
    fn();
  }
  function tapCancel(d) {
    if (!d) return;
    if (!tapIsTap(Math.sqrt(d.mx || 0), 0, Date.now() - d.t)) return;
    tapFire();
  }
  try {
    el.addEventListener('touchstart', function (e) {
      var t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      tDown = { x: t.clientX, y: t.clientY, t: Date.now(), id: t.identifier, mx: 0 };
    }, { passive: true });
    el.addEventListener('touchend', function (e) {
      var t = e.changedTouches && e.changedTouches[0];
      if (!tDown || !t || t.identifier !== tDown.id) return;
      var dx = t.clientX - tDown.x, dy = t.clientY - tDown.y, dt = Date.now() - tDown.t;
      tDown = null;
      if (!tapIsTap(dx, dy, dt)) return;
      tapFire();
    }, { passive: true });
    el.addEventListener('touchmove', function (e) {
      var t = e.changedTouches && e.changedTouches[0];
      if (!tDown || !t || t.identifier !== tDown.id) return;
      var dx = t.clientX - tDown.x, dy = t.clientY - tDown.y, m = dx * dx + dy * dy;
      if (m > tDown.mx) tDown.mx = m;
    }, { passive: true });
    el.addEventListener('touchcancel', function () { var d = tDown; tDown = null; tapCancel(d); }, { passive: true });
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      pDown = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId, mx: 0 };
    });
    el.addEventListener('pointerup', function (e) {
      if (!pDown || e.pointerId !== pDown.id || e.pointerType === 'mouse') return;
      var dx = e.clientX - pDown.x, dy = e.clientY - pDown.y, dt = Date.now() - pDown.t;
      pDown = null;
      if (!tapIsTap(dx, dy, dt)) return;
      tapFire();
    });
    el.addEventListener('pointermove', function (e) {
      if (!pDown || e.pointerId !== pDown.id || e.pointerType === 'mouse') return;
      var dx = e.clientX - pDown.x, dy = e.clientY - pDown.y, m = dx * dx + dy * dy;
      if (m > pDown.mx) pDown.mx = m;
    });
    el.addEventListener('pointercancel', function () { var d = pDown; pDown = null; tapCancel(d); });
    el.addEventListener('click', function (e) {
      if (Date.now() < tapGuard) { e.preventDefault(); e.stopPropagation(); return; }
      tapFire();
    });
  } catch (e) { return false; }
  return true;
};
window.__mochiLastTap = { x: 0, y: 0, t: 0 };
(function () {
  var mark = function (ev) {
    try {
      window.__mochiGestureSeq = (window.__mochiGestureSeq || 0) + 1;
      if (window.mochiPickDoorSweep) window.mochiPickDoorSweep();
      var p = (ev.touches && ev.touches[0]) || (ev.changedTouches && ev.changedTouches[0]) || ev;
      if (typeof p.clientX !== 'number') return;
      if (p.target && p.target.id === 'mochi-file-pick-fallback') return;
      window.__mochiLastTap = { x: p.clientX, y: p.clientY, t: Date.now() };
    } catch (e) {}
  };
  try {
    document.addEventListener('pointerdown', mark, { capture: true, passive: true });
    document.addEventListener('touchstart', mark, { capture: true, passive: true });
    document.addEventListener('mousedown', function (e) { if (e && e.isTrusted) mark(e); }, { capture: true, passive: true });
  } catch (e2) {}
})();
window.mochiFileInputRendered = function (input) {
  try {
    if (!input || !input.isConnected) return false;
    if (!input.getClientRects || input.getClientRects().length === 0) return false;
    var cs = getComputedStyle(input);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    var r = input.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if ((cs.clipPath && cs.clipPath !== 'none') || (cs.clip && cs.clip.indexOf('0px 0px 0px 0px') >= 0)) return false;
    return true;
  } catch (e) { return false; }
};
window.mochiPickFallback = function (input, tap) {
  var ov = document.getElementById('mochi-file-pick-fallback');
  if (!ov) {
    ov = document.createElement('input');
    ov.type = 'file';
    ov.id = 'mochi-file-pick-fallback';
    ov.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:24px;height:24px;margin:0;padding:0;border:0;outline:none;background:transparent;color:transparent;font-size:0;appearance:none;-webkit-appearance:none;z-index:2147483600;pointer-events:none;opacity:1;';
    document.body.appendChild(ov);
    try {
      var st = document.createElement('style');
      st.textContent = 'input#mochi-file-pick-fallback::file-selector-button,input#mochi-file-pick-fallback::-webkit-file-upload-button{display:none;}';
      document.head.appendChild(st);
    } catch (e0) {}
    ov.addEventListener('click', function () {
      ov.style.pointerEvents = 'none';
    }, true);
    var off = function () { try { ov.style.pointerEvents = 'none'; } catch (eO2) {} };
    try {
      document.addEventListener('pointerup', off, { capture: true, passive: true });
      document.addEventListener('touchend', off, { capture: true, passive: true });
      document.addEventListener('mouseup', off, { capture: true, passive: true });
    } catch (eO3) {}
    window.__mochiPickFbOff = off;
    ov.addEventListener('change', function () {
      var files = Array.prototype.slice.call(ov.files || []);
      try { ov.value = ''; } catch (e1) {}
      var orig = window.__mochiPickFbTarget;
      if (!orig) return;
      window.__mochiPickFbTarget = null;
      if (window.mochiPickLog) window.mochiPickLog((orig.id || 'pick'), files.length ? ('fb:files=' + files.length) : 'fb:files=0');
      if (!files.length) return;
      try {
        var dt = new DataTransfer();
        for (var i = 0; i < files.length; i++) dt.items.add(files[i]);
        orig.files = dt.files;
        orig.dispatchEvent(new Event('change'));
      } catch (e2) {}
    });
  }
  try {
    var r = input && input.getBoundingClientRect ? input.getBoundingClientRect() : null;
    var vw = window.innerWidth || 360, vh = window.innerHeight || 640;
    var w = (r && r.width >= 24) ? Math.min(r.width, vw - 8) : 120;
    var h = (r && r.height >= 24) ? Math.min(r.height, vh - 8) : 44;
    var x = tap ? (tap.x - w / 2) : (r ? r.left : (vw - w) / 2);
    var y = tap ? (tap.y - h / 2) : (r ? r.top : (vh - h) / 2);
    x = Math.max(0, Math.min(x, vw - w));
    y = Math.max(0, Math.min(y, vh - h));
    try { ov.accept = input && input.accept ? input.accept : ''; } catch (e3) {}
    try { ov.multiple = !!(input && input.multiple); } catch (e4) {}
    ov.style.left = Math.round(x) + 'px';
    ov.style.top = Math.round(y) + 'px';
    ov.style.width = Math.round(w) + 'px';
    ov.style.height = Math.round(h) + 'px';
    ov.style.pointerEvents = 'auto';
    window.__mochiPickFbTarget = input;
    try { setTimeout(window.__mochiPickFbOff, 1200); } catch (e6) {}
  } catch (e5) { return null; }
  return ov;
};
window.mochiFilePickFire = function (input, opts) {
  var o = opts || {};
  if (window.mochiPickLog) window.mochiPickLog((input && input.id) || 'pick', 'leg:fire');
  if (window.mochiPickLog && input && window.mochiFilePickSurfaceAll) {
    try { window.mochiPickLog((input && input.id) || 'pick', 'srf:' + window.mochiFilePickSurfaceAll(input).length); } catch (e) {}
  }
  try { window.__mochiPickAskSeq = window.__mochiGestureSeq; window.__mochiPickAskHost = (input && input.id) || ''; } catch (eAsk) {}
  try { if (window.mochiFilePickLearnDoor) window.mochiFilePickLearnDoor(input); } catch (eL) {}
  if (window.mochiFilePickSurfaceTap && window.mochiFilePickSurfaceTap()) return true;
  var tap = (window.__mochiLastTap && (Date.now() - window.__mochiLastTap.t) < 1200) ? window.__mochiLastTap : null;
  var touchable = false;
  if (window.mochiFileInputRendered(input)) {
    try {
      if (!tap) touchable = true;
      else {
        var under = document.elementFromPoint(tap.x, tap.y);
        touchable = !!(under && (under === input || input.contains(under) || (under.contains && under.contains(input))));
      }
    } catch (eT) { touchable = false; }
  }
  if (tap && !touchable && window.mochiPickFallback) {
    var fb = window.mochiPickFallback(input, tap);
    if (fb) {
      if (window.mochiPickLog) window.mochiPickLog((input && input.id) || 'pick', 'fb:onscreen');
      if (typeof fb.showPicker === 'function') { try { fb.showPicker(); } catch (eFb1) {} }
      try { fb.click(); } catch (eFb2) {}
      return true;
    }
  }
  var fired = false;
  if (input && typeof input.showPicker === 'function') {
    try { input.showPicker(); fired = true; } catch (e) {}
  }
  try { input.click(); fired = true; } catch (e) {}
  if (!fired) { if (typeof o.onFail === 'function') { try { o.onFail(); } catch (e) {} } }
  return fired;
};
window.mochiFilePick = function (opts) {
  var o = opts || {};
  var id = o.id || 'mochi-file-pick';
  var input = null; // 常驻单例：同一 id 复用，绝不随点按堆积节点 mochi-755-single
  try { input = document.getElementById(id); } catch (e) {}
  if (!input) {
    input = document.createElement('input');
    input.type = 'file';
    input.id = id;
    input.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:1;margin:0;padding:0;border:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;';
    document.body.appendChild(input);
  }
  try { input.accept = ('accept' in o) ? String(o.accept == null ? '' : o.accept) : (input.accept || ''); } catch (e) {} // #1413：判据换成「调用方到底提没提这一项」——裸登记（bindHost 不带 accept）照旧保留宿主口径（#1230e 原意不变），而入口**有意**传的空串从此真能清掉上一个分类留下的值；旧写法表达不出「显式清空」，常驻 input 被多个分类共用时后一个档会继承前一个档的过滤器（字卡库语音档实测 chooser 上留着 image/*＝语音文件全灰显）
  if (typeof o.multiple === 'boolean') input.multiple = o.multiple;
  if (typeof o.onFiles === 'function') input.__mochiOnFiles = o.onFiles;
  input.onchange = function () {
    var files = Array.prototype.slice.call(input.files || []);
    try { input.value = ''; } catch (e) {} // 允许重选同一文件
    if (window.mochiPickLog) window.mochiPickLog((input && input.id) || 'pick', files.length ? ('files=' + files.length) : 'files=0');
    if (input.__mochiOnFiles) { try { input.__mochiOnFiles(files); } catch (eCb2) { if (window.mochiPickCbFail) window.mochiPickCbFail((input && input.id) || 'pick', eCb2, files.length); } }
  };
  if (o.btn && window.mochiFilePickLabel) window.mochiFilePickLabel(o.btn, input);
  if (window.mochiFilePickSurfaceAll && typeof o.onFiles === 'function') {
    try {
      var surfs = window.mochiFilePickSurfaceAll(input);
      for (var si = 0; si < surfs.length; si++) {
        var srec = surfs[si].__mochiSurface;
        if (!srec) continue;
        srec.onFiles = o.onFiles;
        if (!srec.owner) srec.owner = input;
      }
    } catch (e) {}
  }
  var activate = function () {
    window.mochiFilePickFire(input, { onFail: function () { if (o.onError) { try { o.onError(); } catch (x) {} } } });
  };
  if (!o.noClick) { try { window.__mochiPickAskSeq = window.__mochiGestureSeq; window.__mochiPickAskHost = input.id || id; } catch (eA) {} }
  try {
    var _lt = window.event && window.event.target;
    var _lrec = _lt && _lt.__mochiSurface;
    if (_lrec && _lrec.veto && _lt !== input && _lrec.owner !== input && (_lrec.ownerId || '') !== id && typeof pickDoorDisable === 'function') {
      window.__mochiSurfaceTapAt = 0;
      pickDoorDisable(_lt);
      if (window.mochiPickLog) window.mochiPickLog(id || 'pick', 'door:mix');
    }
  } catch (eM) {}
  if (!o.noClick && window.mochiFilePickSurfaceTap && window.mochiFilePickSurfaceTap()) {
    if (window.mochiFilePickGuard) window.mochiFilePickGuard(input, function () {}); // 仍登记一次武装（诊断口径 seq 不变）
    return input;
  }
  if (!o.noClick) {
    if (o.btn && window.mochiFilePickGuard) window.mochiFilePickGuard(input, activate);
    else activate();
  }
  return input;
};
window.mochiFilePickBindHost = function (id, btn) {
  try {
    if (!id || document.getElementById(id)) return document.getElementById(id);
    return window.mochiFilePick({ id: id, noClick: true, btn: btn || null });
  } catch (e) { return null; }
};
window.__mochiLoaded.push("device.js");
}catch(e){console.error("device.js",e);window.__jsErrors.push("device.js: "+String(e));window.__mochiErrLoaded.push("device.js");}})();