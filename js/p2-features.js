(function(){try{
(function () {
  const uid = window.activePrefix();
  const store = window.activeStore();
  function pushHist(key, text) {
    try {
      const list = JSON.parse(store.get(key) || '[]');
      list.unshift({ text: text, ts: Date.now() });
      if (list.length > 200) list.length = 200;
      store.set(key, JSON.stringify(list));
      try { if (window.idbSet) window.idbSet(window.activePrefix() + ':' + key, JSON.stringify(list)); } catch (e) {}
    } catch (e) {}
  }
  function restoreHist(key) {
    try {
      if (window.idbGet && !store.get(key)) {
        const myPrefix = window.activePrefix();
        window.idbGet(myPrefix + ':' + key).then(v => {
          if (window.activePrefix() !== myPrefix) return;
          if (!v) return;
          try { store.set(key, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) {}
        });
      }
    } catch (e) {}
  }
  restoreHist('memo-history');
  restoreHist('mood-history');
  function fmtTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const p = (n) => (n < 10 ? '0' + n : '' + n);
    return p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function dayStr(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function toast(msg) {
    let t = document.getElementById('cc-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'cc-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'cc-toast'; void t.offsetWidth; t.className = 'cc-toast show';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.className = 'cc-toast'; }, 2000);
  }
  const statsApp = document.querySelector('.app[data-app="stats"]');
  const statsPage = document.getElementById('page-stats');
  if (statsApp && statsPage) {
    statsApp.addEventListener('click', () => {
      const editing = Array.from(document.querySelectorAll('.app-grid')).some(g => g.classList.contains('editing'));
      if (editing) return;
      document.querySelectorAll('.page').forEach(p => p.hidden = true);
      statsPage.hidden = false;
      renderStats();
    });
  }
  const statsBack = document.getElementById('stats-back');
  if (statsBack) {
    statsBack.addEventListener('click', () => {
      document.querySelectorAll('.page').forEach(p => p.hidden = true);
      const home = document.getElementById('page-phone');
      if (home) home.hidden = false;
    });
  }
  function statsInfoCard(icon, label, value) {
    return '<div class="stats-row"><span class="stats-label">' + icon + ' ' + label + '</span><span class="stats-num" style="font-size:15px">' + value + '</span></div>';
  }
  function fmtDTFull(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const p = (n) => (n < 10 ? '0' + n : '' + n);
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function calcStreak(dateSet) {
    const dates = Array.from(dateSet).sort();
    if (!dates.length) return 0;
    let max = 1, cur = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i]) - new Date(dates[i - 1])) / 864e5;
      if (diff === 1) { cur++; max = Math.max(max, cur); } else cur = 1;
    }
      return max;
  }
  const statsFoldOpen = { askcoin: false, games: false };
  function statsFoldSection(icon, title, unit, rows, emptyText, key) {
    const n = rows.length;
    const open = n > 0 && !!statsFoldOpen[key];
    let html = '<div class="stats-sec stats-fold' + (open ? ' open' : '') + '"' +
      (n ? ' data-stats-fold="' + key + '"' : '') + '>' +
      '<div class="stats-sec-head stats-fold-head"' + (n ? ' role="button" tabindex="0"' : '') +
      ' aria-expanded="' + (open ? 'true' : 'false') + '">' +
      '<span class="stats-sec-title">' + icon + title + '</span>' +
      '<span class="stats-fold-right"><span class="stats-sec-count">' + n + ' ' + unit + '</span>' +
      (n ? '<span class="stats-fold-caret">▾</span>' : '') + '</span></div>' +
      '<div class="stats-fold-body">';
    if (!n) {
      html += '<div class="ta-empty">' + emptyText + '</div>';
    } else {
      html += '<div class="stats-list">';
      for (let i = n - 1; i >= 0; i--) {
        const r = rows[i];
        html += '<div class="stats-item">' +
          '<span class="stats-item-name">' + r.main + '</span>' +
          '<span class="stats-item-num dt">' + r.sub + '</span></div>';
      }
      html += '</div>';
    }
    return html + '</div></div>';
  }
  function statsFoldToggle(sec) {
    if (!sec) return;
    const key = sec.getAttribute('data-stats-fold');
    const head = sec.querySelector('.stats-fold-head');
    const open = !statsFoldOpen[key];
    statsFoldOpen[key] = open;
    sec.classList.toggle('open', open);
    if (head) head.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  document.addEventListener('click', function (e) {
    const sec = e.target && e.target.closest ? e.target.closest('.stats-sec[data-stats-fold]') : null;
    if (!sec) return;
    const head = sec.querySelector('.stats-fold-head');
    if (!head || !head.contains(e.target)) return;
    statsFoldToggle(sec);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    const head = e.target && e.target.closest ? e.target.closest('.stats-fold-head') : null;
    if (!head) return;
    e.preventDefault();
    statsFoldToggle(head.parentNode);
  });
  function fmtMDHM(ts) {
    if (!ts) return '';
    const t = new Date(ts);
    return String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0') + ' ' +
      String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
  }
  const escH = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  function statsBarSection(icon, title, countMap, topLabel, emptyText) {
    const entries = [];
    for (const k in countMap) if (countMap.hasOwnProperty(k)) entries.push({ name: k, count: countMap[k] });
    entries.sort((a, b) => b.count - a.count);
    let html = '<div class="stats-sec">' +
      '<div class="stats-sec-head"><span class="stats-sec-title">' + icon + title + '</span>' +
      '<span class="stats-sec-count">' + entries.length + ' 种</span></div>';
    if (!entries.length) {
      html += '<div class="ta-empty">' + emptyText + '</div>';
    } else {
      const top = entries[0].name;
      const topCount = entries[0].count;
      html += '<div class="stats-top">' +
        '<div class="stats-top-tag">' + topLabel + '</div>' +
        '<div class="stats-top-name">「' + String(top).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') + '」</div>' +
        '<div class="stats-top-num">' + topCount + ' 次</div></div>';
      html += '<div class="stats-list">';
      entries.slice(0, 5).forEach(e => {
        html += '<div class="stats-item">' +
          '<span class="stats-item-name">' + String(e.name).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') + '</span>' +
          '<span class="stats-item-num">' + e.count + '</span></div>';
      });
      html += '</div>';
    }
    return html + '</div>';
  }
  function ccCardSet() {
    const set = {};
    try {
      const rawOwn = (window.storeFor && window.storeFor(window.__activeCid || 'default') || store).get('cc-groups');
      const rawPub = (window.xyStore ? window.xyStore('xy-home-v2').get('cc-groups-public') : null);
      [rawOwn, rawPub].forEach(raw => {
        if (!raw) return;
        const g = JSON.parse(raw);
        if (!g || !g.text) return;
        (g.text || []).forEach(([gname, arr]) => (arr || []).forEach(c => {
          if (typeof c === 'string' && c.indexOf('|||') < 0 && c.indexOf('data:') !== 0 && c.indexOf('@@m:') < 0 && !/^https?:\/\//i.test(c) && !(window.mochiMediaIsToken && window.mochiMediaIsToken(c))) set[c] = 1;
        }));
      });
    } catch (e) {}
    return set;
  }
  function ccTextRankSection(icon, title, countMap, topLabel, emptyText, max, dataKey) {
    const entries = [];
    for (const k in countMap) if (countMap.hasOwnProperty(k)) entries.push({ name: k, count: countMap[k] });
    entries.sort((a, b) => b.count - a.count);
    let html = '<div class="stats-sec">' +
      '<div class="stats-sec-head"><span class="stats-sec-title">' + icon + title + '</span>' +
      '<span class="stats-sec-count">' + entries.length + ' 种</span></div>';
    if (!entries.length) {
      html += '<div class="ta-empty">' + emptyText + '</div>';
    } else {
      const top = entries[0].name;
      const topCount = entries[0].count;
      html += '<div class="stats-top">' +
        '<div class="stats-top-tag">' + topLabel + '</div>' +
        '<div class="stats-top-name">「' + String(top).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') + '」</div>' +
        '<div class="stats-top-num">' + topCount + ' 次</div></div>';
      html += '<div class="stats-list">';
      const shown = Math.min(max || 5, entries.length);
      for (let i = 0; i < shown; i++) {
        const e = entries[i];
        html += '<div class="stats-item">' +
          '<span class="stats-item-name">' + String(e.name).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') + '</span>' +
          '<span class="stats-item-num">' + e.count + ' 次</span></div>';
      }
      html += '</div>';
      if (entries.length > shown) {
        html += '<div class="stats-more" data-cc-more="' + title + '" data-cc-key="' + dataKey + '">查看更多 ' + entries.length + ' 种字卡 ▾</div>';
      }
    }
    return html + '</div>';
  }
  function openCcTopModal(title, entries, emptyText) {
    if (!entries || !entries.length) { toast(emptyText || '暂无使用记录'); return; }
    const sorted = entries.slice().sort((a, b) => b.count - a.count);
    const top = sorted.slice(0, 100);
    let txt = '共 ' + sorted.length + ' 张自定义字卡使用过，按次数从高到低\n\n';
    top.forEach((e, i) => {
      txt += (i + 1) + '. ' + String(e.name) + '  ×' + e.count + '\n';
    });
    if (sorted.length > 100) txt += '\n… 仅显示前 100 名';
    if (window.openModal) window.openModal(title, '', function () {}, { staticText: txt, noInput: true, okText: '知道了' });
  }
  function renderCcStats() {
    const ccEl = document.getElementById('st-cc-content');
    if (!ccEl) return;
    let msgs2 = [];
    try { msgs2 = (window.getChatMsgs ? window.getChatMsgs() : JSON.parse(store.get('chat-msgs') || '[]')); } catch (e) {}
    if (!msgs2.length || !msgs2.some(m => m && m.side && m.text)) {
      ccEl.innerHTML = '<div class="ta-empty">暂无聊天记录</div>';
      return;
    }
    const cardSet = ccCardSet();
    const mineCount = {}, taCount = {};
    const name = store.get('lbl-partner') || 'TA';
    const myName = store.get('lbl-user') || '我';
    const EXPR_CORE_RE = /[^0-9A-Za-z\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF]/g;
    msgs2.forEach(m => {
      if (!m || typeof m.text !== 'string' || !m.side) return;
      if (m.special || m.retracted) return;
      if (m.text.indexOf('data:') === 0 || m.text.indexOf('http') === 0) return;
      if (m.text.indexOf('@@m:') >= 0) return; // FIX 2026-09-17 #648 混排令牌的消息也不入「常用文字字卡」榜（榜面文本会直出令牌串）
      if (window.mochiMediaIsToken && window.mochiMediaIsToken(m.text)) return; // FIX 2026-09-13 #394 存量乱码消息不入「常用文字字卡」榜
      const core = m.text.replace(EXPR_CORE_RE, '');
      if (!core) return;
      if (!(m.text in cardSet)) return;
      if (m.side === 'out') mineCount[m.text] = (mineCount[m.text] || 0) + 1;
      else taCount[m.text] = (taCount[m.text] || 0) + 1;
    });
    const mineN = Object.keys(mineCount).length, taN = Object.keys(taCount).length;
    ccEl.innerHTML =
      '<div style="margin-bottom:16px"><div style="font-size:13px;font-weight:700;color:#555;margin-bottom:8px">自定义字卡（公用 + 专属）使用统计</div>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="font-size:12px;color:var(--muted);width:28px">' + escH(myName) + '</div>' +
      '<div style="flex:1;height:8px;background:rgba(0,0,0,.06);border-radius:4px;overflow:hidden"><div style="height:100%;background:var(--ink);width:' + ((mineN + taN) ? Math.round(mineN / (mineN + taN) * 100) : 0) + '%;border-radius:4px"></div></div>' +
      '<div style="font-size:12px;color:var(--ink);width:auto;text-align:right;white-space:nowrap">' + mineN + ' 种</div></div>' +
      '<div style="display:flex;align-items:center;gap:8px"><div style="font-size:12px;color:var(--muted);width:28px">' + escH(name) + '</div>' +
      '<div style="flex:1;height:8px;background:rgba(0,0,0,.06);border-radius:4px;overflow:hidden"><div style="height:100%;background:#999;width:' + ((mineN + taN) ? Math.round(taN / (mineN + taN) * 100) : 0) + '%;border-radius:4px"></div></div>' +
      '<div style="font-size:12px;color:var(--ink);width:auto;text-align:right;white-space:nowrap">' + taN + ' 种</div></div></div>' +
      ccTextRankSection('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>', escH(myName) + ' 发的文字字卡', mineCount, '常用文字', '你还用过自定义字卡里的文字卡', 5, 'mine') +
      ccTextRankSection('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>', escH(name) + ' 发的文字字卡', taCount, '常用文字', '联系人还没用过自定义字卡里的文字卡', 5, 'ta');
    ccEl.__ccMine = []; for (const k in mineCount) if (mineCount.hasOwnProperty(k)) ccEl.__ccMine.push({ name: k, count: mineCount[k] });
    ccEl.__ccTa = []; for (const k in taCount) if (taCount.hasOwnProperty(k)) ccEl.__ccTa.push({ name: k, count: taCount[k] });
  }
  function renderStats() {
    renderCcStats();
    let msgs = [];
    try { msgs = (window.getChatMsgs ? window.getChatMsgs() : JSON.parse(store.get('chat-msgs') || '[]')); } catch (e) {}
    const real = msgs.filter(m => m && m.side && m.text);
    const firstTs = real.length ? (real[0].ts || Date.now()) : 0;
    const lastTs = real.length ? (real[real.length - 1].ts || firstTs) : 0;
    let daysStart = firstTs;
    try {
      const loveStart = store.get('love-start');
      if (loveStart) {
        const ls = new Date(loveStart + 'T00:00:00').getTime();
        if (!isNaN(ls)) daysStart = ls;
      }
    } catch (e) {}
    const days = daysStart ? Math.max(0, Math.floor((Date.now() - daysStart) / 864e5)) : 0;
    const recordEl = document.getElementById('st-record-cards');
    if (recordEl) {
      let mine = 0, ta = 0, textChars = 0;
      real.forEach(m => {
        if (m.side === 'out') mine++; else ta++;
        if (typeof m.text === 'string' && m.text.indexOf('data:') !== 0) textChars += m.text.length;
      });
      let favsCount = 0;
      try { favsCount = (JSON.parse(store.get('fav-msgs') || '[]') || []).length; } catch (e) {}
      recordEl.innerHTML =
        statsInfoCard('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>', '第一次聊天', fmtDTFull(firstTs) || '暂无记录') +
        statsInfoCard('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M10 2h4"/></svg>', '最近聊天', fmtDTFull(lastTs) || '暂无记录') +
        statsInfoCard('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>', '聊天消息', (mine + ta) + ' 条') +
        statsInfoCard('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M9 13l2 2 4-4"/></svg>', '文字数量', textChars + ' 字') +
        statsInfoCard('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 5 5.6.8-4 4 .9 5.6-4.9-2.6-4.9 2.6.9-5.6-4-4 5.6-.8z"/></svg>', '收藏记录', favsCount + ' 条');
    }
    const chatEl = document.getElementById('st-chat-content');
    if (chatEl) {
      if (!real.length) { chatEl.innerHTML = '<div class="ta-empty">暂无聊天记录</div>'; }
      else {
        let userCount = 0, taCount = 0;
        const hourCount = {}, dayCount = {}, dateCount = {};
        const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
        real.forEach(m => {
          if (m.side === 'out') userCount++; else taCount++;
          const t = new Date(m.ts || Date.now());
          hourCount[t.getHours()] = (hourCount[t.getHours()] || 0) + 1;
          dayCount[t.getDay()] = (dayCount[t.getDay()] || 0) + 1;
          const ds = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
          dateCount[ds] = (dateCount[ds] || 0) + 1;
        });
        const total = userCount + taCount;
        const userPct = total ? Math.round(userCount / total * 100) : 0;
        const taPct = total ? Math.round(taCount / total * 100) : 0;
        let peakHour = 0, peakHourVal = 0;
        for (const h in hourCount) if (hourCount[h] > peakHourVal) { peakHourVal = hourCount[h]; peakHour = Number(h); }
        let peakDay = 0, peakDayVal = 0;
        for (const d in dayCount) if (dayCount[d] > peakDayVal) { peakDayVal = dayCount[d]; peakDay = Number(d); }
        const totalDays = Math.max(1, Math.floor((Date.now() - firstTs) / 864e5));
        let maxSingle = 0;
        for (const d in dateCount) maxSingle = Math.max(maxSingle, dateCount[d]);
        const name = store.get('lbl-partner') || 'TA';
        chatEl.innerHTML =
          '<div style="margin-bottom:16px"><div style="font-size:13px;font-weight:700;color:#555;margin-bottom:8px">消息比例</div>' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="font-size:12px;color:var(--muted);width:28px">我</div>' +
          '<div style="flex:1;height:8px;background:rgba(0,0,0,.06);border-radius:4px;overflow:hidden"><div style="height:100%;background:var(--ink);width:' + userPct + '%;border-radius:4px"></div></div>' +
          '<div style="font-size:12px;color:var(--ink);width:76px;text-align:right">' + userCount + ' 条 ' + userPct + '%</div></div>' +
          '<div style="display:flex;align-items:center;gap:8px"><div style="font-size:12px;color:var(--muted);width:28px">' + name + '</div>' +
          '<div style="flex:1;height:8px;background:rgba(0,0,0,.06);border-radius:4px;overflow:hidden"><div style="height:100%;background:#999;width:' + taPct + '%;border-radius:4px"></div></div>' +
          '<div style="font-size:12px;color:var(--ink);width:76px;text-align:right">' + taCount + ' 条 ' + taPct + '%</div></div></div>' +
          statsInfoCard('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>', '最常聊天时间', peakHour + ':00 - ' + ((peakHour + 1) % 24) + ':00') +
          statsInfoCard('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>', '最常聊天日期', '星期' + dayNames[peakDay]) +
          statsInfoCard('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="20" x2="6" y2="14"/><line x1="12" y1="20" x2="12" y2="8"/><line x1="18" y1="20" x2="18" y2="11"/></svg>', '平均每日消息', Math.round(total / totalDays) + ' 条') +
          statsInfoCard('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3-3 4-3 7a3 3 0 006 0c0-1-.3-2-.8-3 1.8 1 3 3 3 5a6 6 0 11-12 0c0-4 3-6 4.5-8.5z"/></svg>', '最长连续聊天', calcStreak(Object.keys(dateCount)) + ' 天') +
          statsInfoCard('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>', '单日最高消息', maxSingle + ' 条') +
          (function () {
            const myName = store.get('lbl-user') || '我';
            function rpSec(title, list, emptyTxt) {
              let sum = 0; list.forEach(m => { sum += Number(m.rpAmount || 0); });
              return '<div class="stats-sec"><div class="stats-sec-head"><span class="stats-sec-title">🧧 ' + title + '</span>' +
                '<span class="stats-sec-count">' + list.length + ' 笔</span></div>' +
                (list.length ? '<div class="stats-top"><div class="stats-top-tag">累计心意币</div><div class="stats-top-name">¥' + sum.toFixed(2) + '</div><div class="stats-top-num">共 ' + list.length + ' 次</div></div>'
                  : '<div class="ta-empty">' + emptyTxt + '</div>') +
                '</div>';
            }
            return rpSec(myName + ' 发红包', msgs.filter(m => m && m.special === 'redpacket' && m.side === 'out'), '我还没有发过红包（红包也是心意币，去发一个试试）') +
              rpSec(escH(name) + ' 发红包', msgs.filter(m => m && m.special === 'redpacket' && m.side === 'in'), '还没有 ' + escH(name) + ' 发的红包');
          })() +
          statsFoldSection('🪙', name + '申请心意币记录', '笔',
            msgs.filter(m => m && m.special === 'askcoin').map(m => ({
              main: '+¥' + (Number(m.askFen || 0) / 100).toFixed(2),
              sub: fmtMDHM(m.askTs || m.ts)
            })),
            escH(name) + ' 还没有向 Mochi 申请过', 'askcoin') +
          (function () {
            const GAME_SPECIAL = { brick: '双人打砖块', pong: '乒乓', snake: '贪吃蛇', memory: '记忆翻牌', rps: '猜拳', c4: '四子棋', ms: '合作扫雷' };
            const GAME_KIND = { rps: '猜拳', pong: 'Pong', snake: '双人贪吃蛇', gomoku: '五子棋', linkup: '连连看', match3: '消消乐', auction: '心意币拍卖会' };   // TA 主动邀请（cuddle 贴贴不算游戏）
            const GAME_NAME_RE = /^(四子棋|合作扫雷|记忆翻牌|双人打砖块|Pong)/;
            const rows = [];
            const push = (m, mainTxt, ico) => {
              if (!m) return;
              rows.push({ main: (ico || '🎮') + ' ' + escH(mainTxt), sub: fmtMDHM(m.ts || m.rpTs), ts: m.ts || m.rpTs || 0 });
            };
            msgs.forEach(m => {
              if (!m) return;
              if (m.special && GAME_SPECIAL[m.special]) push(m, GAME_SPECIAL[m.special] + ' · ' + (m.text || ''), '🎮');
              else if (m.gInv && GAME_KIND[m.gInv]) push(m, name + ' 邀请玩 ' + GAME_KIND[m.gInv], '📩');
            });
            msgs.forEach(m => {
              if (!m || !m.text || !GAME_NAME_RE.test(m.text)) return;
              if (m.special && GAME_SPECIAL[m.special]) return;
              if (m.gInv) return;
              push(m, m.text, '🎮');
            });
            const seen = new Set();
            const uniq = rows.filter(r => { const k = r.main + '|' + r.sub; if (seen.has(k)) return false; seen.add(k); return true; });
            uniq.sort((a, b) => (a.ts || 0) - (b.ts || 0));
            return statsFoldSection('🎮', '小游戏记录', '条', uniq, '还没有小游戏记录（更多功能 → 小游戏，和 TA 玩一局试试）', 'games');
          })();
        }
    }
    const exprEl = document.getElementById('st-expr-content');
    if (exprEl) {
      if (!real.length) { exprEl.innerHTML = '<div class="ta-empty">暂无聊天记录</div>'; }
      else {
        const emotion = {}, heart = {}, intent = {};
        real.forEach(m => {
          (m.mood || []).forEach(md => {
            if (!md || typeof md !== 'object') return;
            if (!md.label) return;
            if (md.tag === '交流意图') intent[md.label] = (intent[md.label] || 0) + 1;
            else if (md.tag === '心意') heart[md.label] = (heart[md.label] || 0) + 1;
            else emotion[md.label] = (emotion[md.label] || 0) + 1;
          });
        });
        exprEl.innerHTML =
          statsBarSection('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9.5l.01.01M15 9.5l.01.01"/></svg>', '情绪字卡', emotion, '常见情绪', '暂无使用记录') +
          statsBarSection('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5S4.5 15.2 4.5 9.9A4.9 4.9 0 0112 7.1a4.9 4.9 0 017.5 2.8c0 5.3-7.5 10.6-7.5 10.6z"/><path d="M19 3.5l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6z"/></svg>', '心意字卡', heart, '常传递心意', '暂无使用记录') +
          statsBarSection('<svg class="st-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8.5 8.5 0 01-12.6 7.4L4 21l1.5-4.4A8.5 8.5 0 1121 12z"/><path d="M8.5 10h7M8.5 13h4.5"/></svg>', '交流意图', intent, '常用交流', '暂无使用记录');
      }
    }
    const daysEl = document.getElementById('st-days');
    if (daysEl) daysEl.textContent = days;
  }
  document.querySelectorAll('#page-stats .fav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#page-stats .fav-tab').forEach(x => x.classList.toggle('sel', x === tab));
      const k = tab.dataset.stab;
      document.querySelectorAll('#page-stats .cal-card').forEach(c => {
        c.hidden = c.dataset.stpanel !== k;
      });
      if (k === 'cc') renderCcStats();
    });
  });
  document.addEventListener('click', function (e) {
    const more = e.target.closest('[data-cc-more]');
    if (!more) return;
    const title = more.getAttribute('data-cc-more');
    const key = more.getAttribute('data-cc-key');
    if (!title || !key) return;
    const ccEl = document.getElementById('st-cc-content');
    if (!ccEl) return;
    const prop = key === 'mine' ? '__ccMine' : '__ccTa';
    const entries = ccEl[prop] || [];
    if (entries.length) {
      openCcTopModal(title, entries, '暂无使用记录');
    }
  });
  const interactApp = document.querySelector('.app[data-app="interact"]');
  const interactPage = document.getElementById('page-interact');
  if (interactApp && interactPage) {
    interactApp.addEventListener('click', () => {
      const editing = Array.from(document.querySelectorAll('.app-grid')).some(g => g.classList.contains('editing'));
      if (editing) return;
      if (window.renderAskRecords) window.renderAskRecords();
      document.querySelectorAll('.page').forEach(p => p.hidden = true);
      interactPage.hidden = false;
    });
  }
  const interactBack = document.getElementById('interact-back');
  if (interactBack) {
    interactBack.addEventListener('click', () => {
      document.querySelectorAll('.page').forEach(p => p.hidden = true);
      const home = document.getElementById('page-phone');
      if (home) home.hidden = false;
    });
  }
const DEF_PLACES = ['在家', '在公司', '在咖啡店', '在公园', '在图书馆', '在路上', '在朋友家', '在健身房', '在超市', '在电影院', '在便利店', '在书店', '在地铁上', '在阳台', '在河边', '在小区楼下', '在面包店', '在车站', '在自习室'];
const DEF_ACTIONS = ['刷手机', '看书', '发呆', '听歌', '写东西', '吃零食', '喝奶茶', '散步', '玩游戏', '想你', '看电影', '追剧', '刷视频', '等快递', '收拾房间', '洗衣服', '做饭', '泡茶', '吃水果', '拍照'];
const DEF_CHECK_MSGS = ['想你了', '记得按时吃饭', '今天也很喜欢你', '早点休息', '有空给我回消息', '别太累', '喝水了吗', '今天开心吗', '我今天有点累', '我今天很开心', '我今天有点想你', '我今天有点无聊', '今天过得怎么样', '记得多穿点', '路上注意安全', '晚安'];
const CK_DEF_KEY = 'checkin-cards-default';
function getCkDefault() {
  const v = store.get(CK_DEF_KEY);
  return v === null ? true : v === '1';
}
function ckList(k, def) {
  try {
    const v = JSON.parse(store.get('checkin-cards-' + k) || 'null');
    if (Array.isArray(v) && v.length) return v;
  } catch (e) {}
  return def.slice();
}
  function ckSaveList(k, list) {
    if (window.xyBigWriteBlocked && window.xyBigWriteBlocked(store, 'checkin-cards-' + k, '寻踪字卡库')) return false;
    store.set('checkin-cards-' + k, JSON.stringify(list));
    return true;
  }
  function ckCustomList(k) {
    try {
      const v = JSON.parse(store.get('checkin-cards-' + k) || 'null');
      if (Array.isArray(v)) return v;
    } catch (e) {}
    return [];
  }
  function ckItems(k) {
    try {
      const v = JSON.parse(store.get('checkin-cards-' + k) || 'null');
      if (Array.isArray(v)) return v.map(x => typeof x === 'string' ? { t: x } : (x && typeof x === 'object' && x.t != null ? x : null)).filter(Boolean);
    } catch (e) {}
    return [];
  }
  function ckSaveItems(k, items) {
    if (window.xyBigWriteBlocked && window.xyBigWriteBlocked(store, 'checkin-cards-' + k, '寻踪字卡库')) return false;
    store.set('checkin-cards-' + k, JSON.stringify(items));
    return true;
  }
  function ckGroups(k) {
    try {
      const v = JSON.parse(store.get('checkin-cards-groups-' + k) || 'null');
      if (Array.isArray(v)) return v;
    } catch (e) {}
    return [];
  }
  function ckSaveGroups(k, groups) {
    if (window.xyBigWriteBlocked && window.xyBigWriteBlocked(store, 'checkin-cards-groups-' + k, '寻踪字卡分组')) return false;
    store.set('checkin-cards-groups-' + k, JSON.stringify(groups));
    return true;
  }
const CK_DEF_LIST = { place: DEF_PLACES, action: DEF_ACTIONS, msg: DEF_CHECK_MSGS };
function isCkCardOff(k, x) {
  if (!CK_DEF_LIST[k]) return false; // #1520：k 不属于三类（防御：旧写法会静默拼出 ck-off-undefined 键）
  if (CK_DEF_LIST[k].indexOf(x) < 0) return false; // #1519a：不是预设卡 ⇒ 预设开关一律不认
  return store.get('ck-off-' + k + ':' + x) === '1' || !!(window.presetGroup && window.presetGroup.isOff('cck', k));
}
function setCkCardOff(k, x, off) { store.set('ck-off-' + k + ':' + x, off ? '1' : '0'); }
const CK_EN_KEY = 'checkin-en';
function ckEn() {
  try {
    const v = store.get(CK_EN_KEY);
    return v === null ? true : v === '1';
  } catch (e) { return true; }
}
window.checkinEnabled = ckEn;
window.checkinDeskOff = function () { return false; };
function ckMergeDef(custom, def) {
  const seen = {};
  return def.map(function (t) { return { t: t }; }).concat(custom).filter(function (x) {
    if (x && x.t != null && !seen[x.t]) { seen[x.t] = 1; return true; }
    return false;
  });
}
function genCheckin() {
  const useDefault = getCkDefault();
  let places = ckItems('place');
  let actions = ckItems('action');
  let msgs = ckItems('msg');
  if (!places.length) places = DEF_PLACES.map(t => ({ t }));
  if (!actions.length) actions = DEF_ACTIONS.map(t => ({ t }));
  if (!msgs.length) msgs = DEF_CHECK_MSGS.map(t => ({ t }));
  if (useDefault) {
    places = ckMergeDef(places, DEF_PLACES);
    actions = ckMergeDef(actions, DEF_ACTIONS);
    msgs = ckMergeDef(msgs, DEF_CHECK_MSGS);
  }
  const out = {};
  let place = useDefault ? places.filter(p => !isCkCardOff('place', p.t)) : places.filter(p => DEF_PLACES.indexOf(p.t) < 0 && !isCkCardOff('place', p.t));
  let action = useDefault ? actions.filter(a => !isCkCardOff('action', a.t)) : actions.filter(a => DEF_ACTIONS.indexOf(a.t) < 0 && !isCkCardOff('action', a.t));
  let msg = useDefault ? msgs.filter(m => !isCkCardOff('msg', m.t)) : msgs.filter(m => DEF_CHECK_MSGS.indexOf(m.t) < 0 && !isCkCardOff('msg', m.t));
  if (!place.length && !action.length && !msg.length) {
    place = places.filter(p => !isCkCardOff('place', p.t));
    action = actions.filter(a => !isCkCardOff('action', a.t));
    msg = msgs.filter(m => !isCkCardOff('msg', m.t));
  }
  if (place.length) out.place = place[Math.floor(Math.random() * place.length)].t;
  if (action.length) out.action = action[Math.floor(Math.random() * action.length)].t;
  if (msg.length) out.msg = msg[Math.floor(Math.random() * msg.length)].t;
  return out;
}
function ckHistRow(x, i) {
  const parts = [x.t, x.place, x.action].filter(Boolean);
  return '<div class="ck-location"><div class="ck-value" style="font-size:13px">' + window.mochiHistDel('i' + i, parts.join(' · ')) + parts.join(' · ') + '</div><div class="ck-label">' + (x.msg || '') + '</div></div>';
}
function renderCheckinHistory() {
  const histEl = document.getElementById('ck-history');
    if (!histEl) return;
    try {
      let h = [];
      try { h = JSON.parse(store.get('checkin-history') || '[]'); } catch (e) { h = []; }
      const valid = (Array.isArray(h) ? h : []).map((x, i) => ({ x, i })).filter(o => o.x && (o.x.place || o.x.action));
      histEl.innerHTML = window.mochiHistFold(valid.map(o => ({ ts: Number(o.x.ts) || 0, html: ckHistRow(o.x, o.i) })), {
        key: 'checkin-hist',
        empty: '<div class="div-result-empty">暂无寻踪记录</div>',
        todayEmpty: '<div class="dc-h-day-empty">今天暂无寻踪记录</div>'
      });
    } catch (e) {}
  }
  function delCheckinHistory(key) { if (window.xyBigWriteBlocked && window.xyBigWriteBlocked(store, 'checkin-history', '寻踪记录')) return; // #1493 删除也是读改写：读不全先按住
    let h = [];
    try { h = JSON.parse(store.get('checkin-history') || '[]'); } catch (e) { return; }
    const i = parseInt(String(key).replace(/^i/, ''), 10);
    if (!(i >= 0) || !(i < h.length)) return;
    h.splice(i, 1);
    try {
      store.set('checkin-history', JSON.stringify(h));
      if (window.idbSet) window.idbSet(window.activePrefix() + ':checkin-history', JSON.stringify(h));
    } catch (e) {}
    renderCheckinHistory();
    if (typeof window.toast === 'function') window.toast('已删除这条寻踪记录');
  }
  window.mochiHistDelBind(document.getElementById('ck-history'), { onDel: delCheckinHistory, title: '删除这条寻踪记录？' });
  (function () {
    if (window.idbGet) {
      const myPrefix = window.activePrefix();
      window.idbGet(myPrefix + ':checkin-history').then(v => {
        if (window.activePrefix() !== myPrefix) return;
        if (!v) return;
        try {
          const data = typeof v === 'string' ? JSON.parse(v) : v;
          if (Array.isArray(data) && data.length && !store.get('checkin-history')) {
            store.set('checkin-history', JSON.stringify(data));
          }
        } catch (e) {}
      });
    }
  })();
  const checkinApp = document.querySelector('.app[data-app="checkin"]');
  const checkinPage = document.getElementById('page-checkin');
  function applyCkDeskIcon() {
    try {
      if (!checkinApp) return;
      let man = false;
      try { man = (JSON.parse(store.get('hidden-icons') || '[]')).indexOf('checkin') >= 0; } catch (e) {}
      checkinApp.style.display = man ? 'none' : '';
    } catch (e) {}
  }
  function ckDisabledBanner() {
    const card = document.getElementById('ck-card');
    if (!card) return;
    let el = document.getElementById('ck-off-tip');
    if (!ckEn()) {
      if (!el) {
        el = document.createElement('div');
        el.id = 'ck-off-tip';
        el.setAttribute('style', 'margin:0 0 10px;padding:8px 10px;border-radius:10px;font-size:12.5px;line-height:1.55;border:1px solid rgba(128,128,128,.34);opacity:.82');
        card.insertBefore(el, card.firstChild);
      }
      el.textContent = '已禁用：联系人无法再触发更新日常。下面是关闭前的最后一次日常；「TA在身边 · 位置感知」不受影响，照常可用。重新开启：设置 → 工具 → 寻踪（TA 的日常）。';
    } else if (el) el.remove();
  }
  function syncCkSwitchUI() {
    const on = ckEn();
    const a = document.getElementById('sf-checkin-en');
    if (a && a.checked !== on) a.checked = on;
    const b = document.getElementById('ck-fe-en');
    if (b && b.checked !== on) b.checked = on;
    const sub = document.getElementById('sf-checkin-sub');
    if (sub) sub.textContent = on ? 'TA 的日常随机刷新，桌面/聊天里都能寻踪' : '已禁用：联系人无法再触发更新日常（桌面【寻踪】仍可进入，页内「TA在身边 · 位置感知」照常用）';
    ckDisabledBanner();
  }
  function ckToast(on) {
    if (typeof window.toast !== 'function') return;
    window.toast(on ? '寻踪已开启：日常继续更新、聊天入口恢复' : '已禁用：联系人无法再触发更新日常（桌面【寻踪】仍可进入，「TA在身边 · 位置感知」照常用）');
  }
  window.setCheckinEnabled = function (on) {
    try { store.set(CK_EN_KEY, on ? '1' : '0'); } catch (e) {}
    syncCkSwitchUI();
    applyCkDeskIcon();
  };
  function bindCkSwitch(input) {
    input.checked = ckEn();
    input.addEventListener('change', function () {
      window.setCheckinEnabled(input.checked);
      ckToast(input.checked);
    });
  }
  (function () {
    if (document.getElementById('sf-checkin-row')) return;
    const anchor = document.getElementById('row-open-divination');
    if (!anchor || !anchor.parentNode) return;
    const row = document.createElement('div');
    row.className = 'set-row';
    row.id = 'sf-checkin-row';
    row.innerHTML =
      '<div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M11 8v3.4l2.4 1.4"/></svg></div>' +
      '<div class="txt">寻踪（TA 的日常）<span class="sub" id="sf-checkin-sub"></span></div>' +
      '<label class="toggle"><input type="checkbox" id="sf-checkin-en"><span class="tk"></span></label>';
    anchor.parentNode.insertBefore(row, anchor);
    bindCkSwitch(row.querySelector('#sf-checkin-en'));
  })();
  (function () {
    if (document.getElementById('ck-fe-en')) return;
    const box = document.getElementById('ck-prob-box');
    if (!box || !box.parentNode) return;
    const grp = document.createElement('div');
    grp.className = 'set-group glass';
    grp.setAttribute('style', 'margin:10px 12px 0');
    grp.innerHTML =
      '<div class="gs-row"><span>启用寻踪（TA 的日常）</span><label class="toggle"><input type="checkbox" id="ck-fe-en"><span class="tk"></span></label></div>' +
      '<div class="gs-sub">关闭后日常不再自动更新、不再推送到聊天、不再写新记录，聊天「更多功能」里的寻踪与点 TA 头像的寻踪半框一并收起。桌面【寻踪】图标仍在（点进去看得到「已禁用」说明，页里的「TA在身边 · 位置感知」是独立功能、照常可用）。下面那个「发送到聊天」概率与已有寻踪记录都不受影响，重新开启即恢复。设置 → 工具 里有同一个开关。</div>';
    box.parentNode.insertBefore(grp, box);
    bindCkSwitch(document.getElementById('ck-fe-en'));
  })();
  applyCkDeskIcon();
  syncCkSwitchUI();
  document.addEventListener('contact-switched', function () { applyCkDeskIcon(); syncCkSwitchUI(); });
  if (window.__mochiDataReady) { applyCkDeskIcon(); syncCkSwitchUI(); }
  else document.addEventListener('mochi-restore-done', function () { applyCkDeskIcon(); syncCkSwitchUI(); });
  document.addEventListener('decor-exited', applyCkDeskIcon);
  function ckLast() { const v = parseInt(store.get('checkin-last'), 10); return isNaN(v) ? 0 : v; }
  function ckNext() { const v = parseFloat(store.get('checkin-next')); return isNaN(v) ? 0 : v; }
  function renderCheckinUI(ck) {
    const place = document.getElementById('ck-place');
    const action = document.getElementById('ck-action');
    const msg = document.getElementById('ck-msg');
    const status = document.getElementById('ck-status');
    const name = store.get('lbl-partner') || 'TA';
    if (place) place.textContent = ck.place || '';
    if (action) action.textContent = ck.action || '';
    if (msg) msg.textContent = ck.msg || '';
    if (status) status.textContent = name + ' 的日常';
  }
  function recordCheckin(ck) { if (window.xyBigWriteHold && window.xyBigWriteHold(store, 'checkin-history')) return; // #1493 读不全先让路（#1403 已给这页折叠＋单删，这里补大键化后的顶库闸）
    const entry = { t: fmtTime(Date.now()), place: ck.place, action: ck.action, msg: ck.msg, ts: Date.now() };
    try {
      const h = JSON.parse(store.get('checkin-history') || '[]');
      h.push(entry);
      store.set('checkin-history', JSON.stringify(h));
      if (window.idbSet) window.idbSet(window.activePrefix() + ':checkin-history', JSON.stringify(h));
    } catch (e) {}
    renderCheckinHistory();
  }
  let ckBigPending = 0, ckBigSeq = 0, ckBigBypass = false;
  function doCheckin() {
    if (!ckEn()) return; // #823a 关闭即全静默：生成/推送/记录/重置计时一并停
    const blind = ['place', 'action', 'msg'].filter(function (k) {
      try { return typeof store.awaitingBigKey === 'function' && store.awaitingBigKey('checkin-cards-' + k); } catch (e) { return false; }
    });
    if (blind.length && !ckBigBypass) {
      if (ckBigPending) return; // 已在等库：60 秒轮询/连点刷新不叠加第二发
      ckBigPending = blind.length;
      const seq = ++ckBigSeq;
      blind.forEach(function (k) { try { store.requestBigKey('checkin-cards-' + k); } catch (e2) {} });
      blind.forEach(function (k) {
        let done = false;
        try {
          store.whenBigKeyBack('checkin-cards-' + k, function () {
            if (seq !== ckBigSeq || done) return;
            done = true;
            if (--ckBigPending > 0) return;
            doCheckin(); // 取齐了＝用完整池子生成（含开关开启时的合并与关闭时的只抽自定义）
          });
        } catch (e3) { if (!done) { done = true; ckBigPending--; } }
      });
      setTimeout(function () {
        if (seq !== ckBigSeq || !ckBigPending) return;
        ckBigSeq++; // 作废在途回调＝保底路径后不会再触发第二次生成
        ckBigPending = 0;
        ckBigBypass = true; // #1520：这一发按可读到的生成，且**不再重新武装一轮闸**——原先保底后
        doCheckin(); // 4 秒保底：IDB 挂死也照旧按可读到的生成（宁可残缺不可静默停更）
      }, 4000);
      return;
    }
    ckBigBypass = false; // #1520：保底放行的这一发用掉即清，下一发觉回填落地后照常走闸
    const ck = genCheckin();
    store.set('checkin-current', JSON.stringify(ck));
    renderCheckinUI(ck);
    const name = store.get('lbl-partner') || 'TA';
    let ckChatOn = true;
    try { ckChatOn = Math.random() * 100 < (window.dcfGet ? window.dcfGet('checkin') : 100); } catch (e) {}
    if (ckChatOn) {
      if (window.chatAddSystem) {
        window.chatAddSystem(name + ' 更新了一条日常');
      }
      if (window.chatAddIn) {
        const line = [ck.place, ck.action, ck.msg].filter(Boolean).join(' · ');
        if (line) window.chatAddIn(line);
      }
      if (Math.random() * 100 < 30) {
        window.chatAddIn(name + ' 提醒你来寻踪.查岗');
      }
    }
    recordCheckin(ck);
    store.set('checkin-last', String(Date.now()));
    store.set('checkin-next', String(1 + Math.random() * 7));
    const p = document.getElementById('ck-p-place');
    const a = document.getElementById('ck-p-action');
    const m = document.getElementById('ck-p-msg');
    if (p) p.textContent = ck.place || '';
    if (a) a.textContent = ck.action || '';
    if (m) m.textContent = ck.msg || '';
  }
  window.openCkPanel = function () {
    if (!ckEn()) return; // #823b 关闭后点顶部 TA 头像不再弹寻踪半框（toggleCkPanel 同源）
    const pc = document.getElementById('poke-card');
    if (pc) pc.hidden = true;
    const ep = document.getElementById('emoji-panel');
    if (ep) ep.hidden = true;
    if (window.closeAvlib) window.closeAvlib();
    const panel = document.getElementById('ck-panel');
    const nameEl = document.getElementById('ck-panel-name');
    const name = store.get('lbl-partner') || 'TA';
    if (nameEl) nameEl.textContent = name;
    let cur = null;
    try { cur = JSON.parse(store.get('checkin-current') || 'null'); } catch (e) {}
    if (cur && cur.place) {
      const p = document.getElementById('ck-p-place');
      const a = document.getElementById('ck-p-action');
      const m = document.getElementById('ck-p-msg');
      if (p) p.textContent = cur.place || '';
      if (a) a.textContent = cur.action || '';
      if (m) m.textContent = cur.msg || '';
    } else {
      doCheckin();
    }
    const upd = document.getElementById('ck-p-updated');
    if (upd) {
      const last = parseInt(store.get('checkin-last'), 10);
      upd.textContent = last ? '更新于 ' + fmtTime(last) : '';
    }
    if (panel) panel.hidden = false;
  };
  function closeCkPanel() {
    const p = document.getElementById('ck-panel');
    if (p) p.hidden = true;
  }
  window.closeCkPanel = closeCkPanel;
  window.toggleCkPanel = function () {
    const p = document.getElementById('ck-panel');
    if (!p) return;
    if (!p.hidden) { closeCkPanel(); return; }
    window.openCkPanel();
  };
  document.addEventListener('click', (e) => {
    const p = document.getElementById('ck-panel');
    if (!p || p.hidden) return;
    if (p.contains(e.target)) return; // 面板内部点击不关闭（含 ✕ / 「TA在身边」入口）
    const av = document.getElementById('chat-partner-av');
    if (av && (e.target === av || av.contains(e.target))) return;
    closeCkPanel();
  });
  const ckPanelClose = document.getElementById('ck-panel-close');
  if (ckPanelClose) ckPanelClose.addEventListener('click', () => { closeCkPanel(); });
  let ckBootDone = false;
  let ckWakeAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') ckWakeAt = Date.now() + 90000;
  });
  function checkAutoCheckin() {
    if (document.hidden) return; // v3.5.127：后台不自动寻踪
    if (Date.now() < ckWakeAt) return; // 回前台冷静期
    if (!ckBootDone) return; // 首次：等数据就绪标志
    try {
      const now = Date.now();
      let last = ckLast(), next = ckNext();
      if (last > now || last < 0 || isNaN(last)) { last = 0; next = 0; }
      if ((now - last) / 36e5 < next) return;
      doCheckin();
    } catch (e) {}
  }
  setInterval(function () { try { if (window.__mochiPhase) window.__mochiPhase('fish-tick'); } catch (e0) {} checkAutoCheckin(); }, 60000);
  function bootCheckin() {
    if (!window.__mochiDataReady) { setTimeout(bootCheckin, 500); return; }
    ckBootDone = true;
    checkAutoCheckin();
  }
  document.addEventListener('mochi-restore-done', bootCheckin);
  setTimeout(bootCheckin, 3000);
  window.openCheckinPage = function () {
    if (!checkinPage) return;
    document.querySelectorAll('.page').forEach(p => p.hidden = true);
    checkinPage.hidden = false;
    let cur = null;
    try { cur = JSON.parse(store.get('checkin-current') || 'null'); } catch (e) {}
    if (cur && cur.place) renderCheckinUI(cur);
    else if (ckEn()) doCheckin();
    ckDisabledBanner();
    renderCheckinHistory();
  };
  if (checkinApp && checkinPage) {
    checkinApp.addEventListener('click', () => {
      const editing = Array.from(document.querySelectorAll('.app-grid')).some(g => g.classList.contains('editing'));
      if (editing) return;
      window.__ckFrom = '';
      window.openCheckinPage();
    });
  }
  const checkinBack = document.getElementById('checkin-back');
  if (checkinBack) {
    checkinBack.addEventListener('click', () => {
      document.querySelectorAll('.page').forEach(p => p.hidden = true);
      if (window.__ckFrom === 'chat') {
        const chatPage = document.getElementById('page-chat');
        if (chatPage) chatPage.hidden = false;
      } else {
        const home = document.getElementById('page-phone');
        if (home) home.hidden = false;
      }
      window.__ckFrom = '';
    });
  }
const ckRefresh = document.getElementById('ck-refresh');
if (ckRefresh) {
  let ckLastRefresh = 0;
  ckRefresh.addEventListener('click', () => {
    const now = Date.now();
    if (now - ckLastRefresh < 5000) { toast('刷新太频繁，稍后再试'); return; }
    ckLastRefresh = now;
    if (!ckEn()) { toast('寻踪已禁用：设置 → 工具 → 寻踪 重新开启后才能刷新日常'); return; }
    doCheckin();
  });
}
  const CK_DEFS = [
    ['place', DEF_PLACES],
    ['action', DEF_ACTIONS],
    ['msg', DEF_CHECK_MSGS]
  ];
  const CK_LABEL = { place: '地点', action: '在做什么', msg: '说的话' };
  (function cleanLegacyPresetInCk() {
    try {
      const MK = 'ck-mine-clean-v1';
      if (store.get(MK) === '1') return;
      const defMap = { place: DEF_PLACES, action: DEF_ACTIONS, msg: DEF_CHECK_MSGS };
      Object.keys(defMap).forEach(k => {
        let raw = null;
        try { raw = JSON.parse(store.get('checkin-cards-' + k) || 'null'); } catch (e) { raw = null; }
        if (!Array.isArray(raw)) return;
        const cleaned = raw.filter(x => {
          const t = x && typeof x === 'object' ? x.t : x;
          return !(t != null && defMap[k].indexOf(String(t)) >= 0);
        });
        if (cleaned.length !== raw.length) ckSaveItems(k, cleaned);
      });
      store.set(MK, '1');
    } catch (e) {}
  })();
  let ckTab = 'place';
  function ckHasCustom(k) {
    try {
      const v = JSON.parse(store.get('checkin-cards-' + k) || 'null');
      return Array.isArray(v) && v.length > 0;
    } catch (e) { return false; }
  }
  let ckTab2 = 'sys';
  function escCk(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function renderCkSysList() {
    const listEl = document.getElementById('cck-sys-list');
    const titleEl = document.getElementById('cck-sys-title');
    if (titleEl) titleEl.textContent = CK_LABEL[ckTab] || '';
    if (!listEl) return;
    const useDefault = getCkDefault();
    const def = { place: DEF_PLACES, action: DEF_ACTIONS, msg: DEF_CHECK_MSGS }[ckTab];
    listEl.innerHTML = '';
    if (!useDefault) {
      const tip = document.createElement('div');
      tip.className = 'ta-empty';
      tip.textContent = '系统预设字卡已关闭（寻踪只从「我的添加」里抽取）。开启上方开关即可恢复使用。';
      listEl.appendChild(tip);
      return;
    }
    if (window.presetGroup) {
      const barBox = document.createElement('div');
      barBox.innerHTML = window.presetGroup.catBar('cck', ckTab, CK_LABEL[ckTab] || ckTab);
      const bar = barBox.firstElementChild;
      if (bar) {
        listEl.appendChild(bar);
        window.presetGroup.bindBar(bar, 'cck', ckTab, function () { renderCkSysList(); updateCkCount(); });
      }
    }
    def.forEach(x => {
      const off = isCkCardOff(ckTab, x);
      const row = document.createElement('div');
      row.className = 'tc-qrow' + (off ? ' off' : '');
      row.innerHTML = '<div class="tc-qmain"><div class="tc-qtext">' + escCk(x) + ' <span class="tc-known">系统</span></div></div>';
      const lab = document.createElement('label');
      lab.className = 'toggle ccard-toggle';
      lab.innerHTML = '<input type="checkbox"' + (off ? '' : ' checked') + '><span class="tk"></span>';
      lab.querySelector('input').addEventListener('change', () => {
        const nowOff = !lab.querySelector('input').checked;
        setCkCardOff(ckTab, x, nowOff);
        renderCkSysList();
        updateCkCount();
        toast((nowOff ? '已关闭：' : '已开启：') + (x.length > 18 ? x.slice(0, 18) + '…' : x));
      });
      row.appendChild(lab);
      listEl.appendChild(row);
    });
  }
  function renderCkMineList() {
    const listEl = document.getElementById('cck-mine-list');
    const titleEl = document.getElementById('cck-mine-title');
    if (titleEl) titleEl.textContent = CK_LABEL[ckTab] || '';
    if (!listEl) return;
    const custom = ckItems(ckTab);
    const groups = ckGroups(ckTab);
    let html = '';
    html += '<div class="mg-grp-row"><button class="cc-tool mg-grp-add"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>新建分组</button></div>';
    if (!custom.length && !groups.length) {
      let blindTab = false;
      try { blindTab = typeof store.awaitingBigKey === 'function' && store.awaitingBigKey('checkin-cards-' + ckTab); } catch (e0) {}
      if (blindTab) {
        try { store.requestBigKey('checkin-cards-' + ckTab); } catch (e1) {}
        try { store.whenBigKeyBack('checkin-cards-' + ckTab, function () { renderCheckinCards(); }); } catch (e2) {}
        listEl.innerHTML = html + '<div class="ta-empty">字卡库正在取回（内容较多，几秒内自动出现）…</div>';
        bindCkGroupOps();
        return;
      }
      listEl.innerHTML = html + '<div class="ta-empty">暂未添加自定义字卡，可在上方批量输入（每行一个）。</div>';
      bindCkGroupOps();
      return;
    }
    groups.forEach(g => {
      const arr = custom.filter(x => x.grp === g.id);
      html += '<div class="cal-card glass mg-block" data-gid="' + escCk(g.id) + '">' +
        '<div class="cal-card-title mg-title"><button class="mg-handle" data-gid="' + escCk(g.id) + '" title="拖动排序"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg></button>' +
        '<span class="mg-name">' + escCk(g.name) + '</span><span class="mg-cnt">(' + arr.length + ')</span>' +
        '<span class="mg-ops"><button class="mg-op" data-g="' + escCk(g.id) + '" data-op="rn" title="重命名">✎</button><button class="mg-op" data-g="' + escCk(g.id) + '" data-op="rm" title="删除分组">✕</button></span></div>' +
        (arr.length ? arr.map(x => ckMineItemHtml(x, custom.indexOf(x))).join('') : '<div class="ta-empty">这个分组还没有内容</div>') +
        '</div>';
    });
    const ungrouped = custom.filter(x => !x.grp);
    html += '<div class="cal-card glass mg-block mg-ungrouped"><div class="cal-card-title mg-title"><span class="mg-name">未分组</span><span class="mg-cnt">(' + ungrouped.length + ')</span></div>';
    if (!ungrouped.length) html += '<div class="ta-empty">暂无未分组字卡，可在上方批量输入</div>';
    html += ungrouped.map(x => ckMineItemHtml(x, custom.indexOf(x))).join('');
    html += '</div>';
    listEl.innerHTML = html;
    listEl.querySelectorAll('.ta-del').forEach(b => {
      b.addEventListener('click', () => {
        const l = ckItems(ckTab);
        l.splice(Number(b.dataset.idx), 1);
        if (ckSaveItems(ckTab, l) === false) return; // #1520：没读全＝这一发没落笔，别报成功
        renderCkMineList();
        updateCkCount();
        toast('已删除');
      });
    });
    listEl.querySelectorAll('.tc-qtext[data-edit]').forEach(el => {
      el.addEventListener('click', () => {
        const idx = Number(el.dataset.edit);
        const l = ckItems(ckTab);
        const item = l[idx];
        if (!item || !window.openModal) return;
        window.openModal('编辑字卡', item.t, (v) => {
          const val = String(v == null ? '' : v).trim();
          if (!val) { toast('内容不能为空'); return; }
          if (val === item.t) return;
          if (l.some((x, xi) => xi !== idx && x.t === val)) { toast('已有相同内容'); return; }
          l[idx].t = val;
          if (ckSaveItems(ckTab, l) === false) return; // #1520：同上
          renderCkMineList();
          toast('已更新');
        });
      });
    });
    listEl.querySelectorAll('.ta-mv').forEach(b => {
      b.addEventListener('click', () => {
        const idx = Number(b.dataset.idx);
        const l = ckItems(ckTab);
        const item = l[idx];
        if (!item || !window.openModal) return;
        const groups = ckGroups(ckTab);
        const opts = [{ label: '未分组', value: '' }].concat(groups.map(g => ({ label: g.name, value: g.id })));
        window.openModal('移动到分组', '', (v) => {
          if (v == null) return;
          l[idx].grp = v || '';
          if (ckSaveItems(ckTab, l) === false) return; // #1520：同上
          renderCkMineList();
          const tgt = v ? (groups.find(g => g.id === v) || {}).name : '未分组';
          toast('已移动到「' + tgt + '」');
        }, { pills: opts, pill: item.grp || '', noInput: true });
      });
    });
    bindCkGroupOps();
  }
  function ckMineItemHtml(x, idx) {
    return '<div class="tc-qrow"><div class="tc-qmain"><div class="tc-qtext" data-edit="' + idx + '">' + escCk(x.t) + '</div></div>' +
      '<button class="ta-mv" data-idx="' + idx + '" title="移动分组"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><path d="M3 7h13a4 4 0 014 4v0a4 4 0 01-4 4H7"/><path d="M7 11l-4 4 4 4"/></svg></button>' +
      '<button class="ta-del" data-idx="' + idx + '">✕</button></div>';
  }
  function bindCkGroupOps() {
    const wrap = document.getElementById('cck-mine-list');
    if (!wrap) return;
    wrap.querySelectorAll('.mg-grp-add').forEach(b => {
      if (b.__bound) return;
      b.__bound = true;
      b.addEventListener('click', () => {
        const groups = ckGroups(ckTab);
        window.cardGroups.addFlow(groups, g => {
          if (!g) return;
          ckSaveGroups(ckTab, groups);
          refreshCkGrpSelect();
          renderCkMineList();
          toast('已新建分组「' + g.name + '」');
        });
      });
    });
    wrap.querySelectorAll('.mg-op').forEach(b => {
      if (b.__bound) return;
      b.__bound = true;
      b.addEventListener('click', () => {
        const groups = ckGroups(ckTab);
        const gid = b.dataset.g;
        const g = groups.find(x => x.id === gid);
        if (!g) return;
        if (b.dataset.op === 'rn') {
          window.cardGroups.renameFlow(g, groups, name => {
            if (!name) return;
            ckSaveGroups(ckTab, groups);
            refreshCkGrpSelect();
            renderCkMineList();
            toast('分组已重命名');
          });
        } else if (b.dataset.op === 'rm') {
          window.cardGroups.removeFlow(g.name, ok => {
            if (!ok) return;
            const l = ckItems(ckTab);
            l.forEach(x => { if (x.grp === gid) x.grp = ''; });
            ckSaveItems(ckTab, l);
            ckSaveGroups(ckTab, groups.filter(x => x.id !== gid));
            refreshCkGrpSelect();
            renderCkMineList();
            toast('已删除分组「' + g.name + '」');
          });
        }
      });
    });
    wrap.querySelectorAll('.mg-handle').forEach(b => {
      if (b.__bound) return;
      b.__bound = true;
      b.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        const gid = b.dataset.gid;
        const blocks0 = Array.from(wrap.querySelectorAll('.mg-block:not(.mg-ungrouped)'));
        const block = blocks0.find(bl => bl.dataset.gid === gid);
        if (!block) return;
        const title = block.querySelector('.mg-title');
        const rect = title.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const clone = title.cloneNode(true);
        clone.classList.add('mg-drag-clone');
        clone.style.position = 'fixed';
        clone.style.left = rect.left + 'px';
        clone.style.top = rect.top + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.margin = '0';
        clone.style.zIndex = '1000';
        clone.style.pointerEvents = 'none';
        document.body.appendChild(clone);
        block.classList.add('mg-dragging');
        let dropIdx = blocks0.indexOf(block);
        const onMove = (ev) => {
          ev.preventDefault();
          clone.style.top = (ev.clientY - offsetY) + 'px';
          const blocks2 = Array.from(wrap.querySelectorAll('.mg-block:not(.mg-ungrouped)'));
          dropIdx = blocks2.length;
          for (let i = 0; i < blocks2.length; i++) {
            if (blocks2[i] === block) continue;
            const r = blocks2[i].getBoundingClientRect();
            if (ev.clientY < r.top + r.height / 2) { dropIdx = i; break; }
          }
          wrap.querySelectorAll('.mg-drop-line').forEach(el => el.remove());
          const line = document.createElement('div');
          line.className = 'mg-drop-line';
          if (dropIdx >= blocks2.length) {
            const last = blocks2[blocks2.length - 1];
            if (last && last.nextSibling) wrap.insertBefore(line, last.nextSibling);
            else wrap.appendChild(line);
          } else {
            wrap.insertBefore(line, blocks2[dropIdx]);
          }
        };
        const onUp = () => {
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup', onUp);
          document.removeEventListener('pointercancel', onUp);
          clone.remove();
          block.classList.remove('mg-dragging');
          wrap.querySelectorAll('.mg-drop-line').forEach(el => el.remove());
          const blocks2 = Array.from(wrap.querySelectorAll('.mg-block:not(.mg-ungrouped)'));
          const curIdx = blocks2.findIndex(bl => bl.dataset.gid === gid);
          if (curIdx < 0 || dropIdx === curIdx || dropIdx === curIdx + 1) return;
          const groups = ckGroups(ckTab);
          let target = dropIdx < curIdx ? dropIdx : dropIdx - 1;
          if (target < 0) target = 0;
          if (target > groups.length - 1) target = groups.length - 1;
          if (target === curIdx) return;
          const [moved] = groups.splice(curIdx, 1);
          groups.splice(target, 0, moved);
          ckSaveGroups(ckTab, groups);
          renderCkMineList();
          toast('分组已移动');
        };
        document.addEventListener('pointermove', onMove, { passive: false });
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onUp);
        e.preventDefault();
      });
    });
  }
  function refreshCkGrpSelect() {
    const grpSel = document.getElementById('cck-batch-grp');
    if (!grpSel) return;
    const groups = ckGroups(ckTab);
    grpSel.innerHTML = window.cardGroups.grpOnlyOptsHtml(groups, grpSel.value);
    window.cardGroups.bindNewGrp(grpSel, groups, function () { ckSaveGroups(ckTab, groups); });
  }
  function updateCkCount() {
    const useDefault = getCkDefault();
    let sysTotal = 0, mineTotal = 0;
    CK_DEFS.forEach(([k, def]) => {
      mineTotal += ckCustomList(k).length;
      if (useDefault) sysTotal += def.filter(x => !isCkCardOff(k, x)).length;
    });
    const cnt = document.getElementById('cc-checkin-count');
    if (cnt) cnt.textContent = sysTotal;
    const cntM = document.getElementById('cc-checkin-count-mine');
    if (cntM) cntM.textContent = mineTotal;
  }
  window.ckCardsRefreshCounts = updateCkCount;
  function switchCkTab2(tab) {
    ckTab2 = tab;
    const tabsWrap = document.getElementById('ck-tabs');
    if (tabsWrap) tabsWrap.querySelectorAll('.cc-tab').forEach(t => t.classList.toggle('sel', t.dataset.tab === tab));
    const sysPanel = document.getElementById('ck-sys-panel');
    const minePanel = document.getElementById('ck-mine-panel');
    if (sysPanel) sysPanel.hidden = tab !== 'sys';
    if (minePanel) minePanel.hidden = tab !== 'mine';
    if (tab === 'sys') renderCkSysList(); else renderCkMineList();
  }
  function renderCheckinCards() {
    document.querySelectorAll('#page-checkin-cards .fav-tab').forEach(tab => {
      tab.classList.toggle('sel', tab.dataset.cktab === ckTab);
    });
    const useDefault = getCkDefault();
    const defEl = document.getElementById('ck-default');
    if (defEl) defEl.checked = useDefault;
    refreshCkGrpSelect(); // v3.7.x：切换分类时刷新该分类的分组下拉
    switchCkTab2(ckTab2);
    updateCkCount();
  }
  const ckDefaultEl = document.getElementById('ck-default');
  if (ckDefaultEl) {
    ckDefaultEl.addEventListener('change', () => {
      store.set(CK_DEF_KEY, ckDefaultEl.checked ? '1' : '0');
      renderCheckinCards();
      toast(ckDefaultEl.checked ? '系统预设字卡已开启' : '系统预设字卡已关闭（仅用你添加的字卡）');
    });
  }
  document.querySelectorAll('#page-checkin-cards .fav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      ckTab = tab.dataset.cktab;
      renderCheckinCards();
    });
  });
  const ckTabsWrap = document.getElementById('ck-tabs');
  if (ckTabsWrap) {
    ckTabsWrap.querySelectorAll('.cc-tab').forEach(tab => {
      tab.addEventListener('click', () => { ckTab2 = tab.dataset.tab; switchCkTab2(ckTab2); });
    });
  }
  const batchAdd = document.getElementById('cck-batch-add');
  if (batchAdd) {
    refreshCkGrpSelect();
    batchAdd.addEventListener('click', () => {
      const ta = document.getElementById('cck-batch');
      const raw = ta ? ta.value : '';
      const items = raw.split('\n').map(s => s.trim()).filter(Boolean);
      if (!items.length) { toast('请输入内容，每行一个'); return; }
      const grpSel = document.getElementById('cck-batch-grp');
      const parsed = window.cardGroups.parseCatVal(grpSel ? grpSel.value : '');
      if (!parsed) { toast('请先选择分组'); return; }
      const list = ckItems(ckTab);
      items.forEach(it => {
        const x = { t: it };
        if (parsed.grp) x.grp = parsed.grp;
        list.push(x);
      });
      if (ckSaveItems(ckTab, list) === false) return; // #1520：拦下＝输入框原样保留，等库回填后再点一次
      if (ta) ta.value = '';
      renderCkMineList();
      updateCkCount();
      toast('已添加 ' + items.length + ' 条到「' + (CK_LABEL[ckTab] || ckTab) + '」');
    });
  }
  const ckNewGrp = document.getElementById('ck-new-grp');
  if (ckNewGrp) {
    ckNewGrp.addEventListener('click', () => {
      const groups = ckGroups(ckTab);
      window.cardGroups.addFlow(groups, g => {
        if (!g) return;
        ckSaveGroups(ckTab, groups);
        refreshCkGrpSelect();
        if (ckTab2 === 'mine') renderCkMineList();
        toast('已新建分组「' + g.name + '」');
      });
    });
  }
  const liCK = document.getElementById('li-checkin-cards');
  const ckCardsPage = document.getElementById('page-checkin-cards');
  if (liCK && ckCardsPage) {
    liCK.addEventListener('click', () => {
      document.querySelectorAll('.page').forEach(p => p.hidden = true);
      ckCardsPage.hidden = false;
      ckTab2 = 'sys';
      const tw = document.getElementById('ck-tabs'); if (tw) tw.style.display = 'none';
      renderCheckinCards();
    });
  }
  const liCKMine = document.getElementById('li-checkin-cards-mine');
  if (liCKMine && ckCardsPage) {
    liCKMine.addEventListener('click', () => {
      document.querySelectorAll('.page').forEach(p => p.hidden = true);
      ckCardsPage.hidden = false;
      ckTab2 = 'mine';
      const tw = document.getElementById('ck-tabs'); if (tw) tw.style.display = 'none';
      renderCheckinCards();
    });
  }
  const ckCardsBack = document.getElementById('checkin-cards-back');
  if (ckCardsBack) {
    ckCardsBack.addEventListener('click', () => {
      document.querySelectorAll('.page').forEach(p => p.hidden = true);
      const home = document.getElementById('page-chatcard');
      if (home) home.hidden = false;
    });
  }
  renderCheckinCards();
  window.__cardSearchFns = window.__cardSearchFns || [];
  window.__cardSearchFns.push({ name: '寻踪日常字卡', fn: function (kw) {
    const out = [];
    try {
      CK_DEFS.forEach(function (pair) {
        const k = pair[0]; const def = pair[1]; const label = CK_LABEL[k] || k;
        (def || []).forEach(function (x) { if (x && String(x).toLowerCase().indexOf(kw) >= 0) out.push({ t: String(x), cat: label + '·系统' }); });
        (ckCustomList(k) || []).forEach(function (item) { const txt = item && item.t ? item.t : ''; if (txt && txt.toLowerCase().indexOf(kw) >= 0) out.push({ t: txt, cat: label + '·我的' }); });
      });
    } catch (e) {}
    return out;
  } });
  function todayMemoText() { return store.get('memo-' + dayStr(new Date())) || legacyToday('memo', 'memo-history'); }
  function todayMoodText() { return store.get('today-mood-' + dayStr(new Date())) || legacyToday('today-mood', 'mood-history'); }
  function legacyToday(curKey, histKey) {
    try {
      const list = JSON.parse(store.get(histKey) || '[]');
      if (list.length && list[0].ts &&
          new Date(list[0].ts).toDateString() === new Date().toDateString()) {
        const legacy = store.get(curKey);
        if (legacy) {
          const ds = dayStr(new Date());
          store.set(curKey + '-' + ds, legacy);
          try { if (window.idbSet) window.idbSet(window.activePrefix() + ':' + curKey + '-' + ds, legacy); } catch (e) {}
          return legacy;
        }
      }
    } catch (e) {}
    return '';
  }
  const memoEl = document.getElementById('memo-text');
  if (memoEl) {
    memoEl.textContent = todayMemoText() || '点这里记一句话';
    memoEl.addEventListener('click', () => {
      if (window.openModal) {
        window.openModal('今日备忘', memoEl.textContent === '点这里记一句话' ? '' : memoEl.textContent, (v) => {
          const val = (v || '').trim();
          if (val) {
            memoEl.textContent = val; store.set('memo', val); pushHist('memo-history', val);
            try { if (window.idbSet) window.idbSet(window.activePrefix() + ':memo', val); } catch (e) {}
            const ds = dayStr(new Date());
            store.set('memo-' + ds, val);
            try { if (window.idbSet) window.idbSet(window.activePrefix() + ':memo-' + ds, val); } catch (e) {}
          }
        });
      }
    });
  }
  const moodEl = document.getElementById('today-mood-text');
  if (moodEl) {
    moodEl.textContent = todayMoodText() || '点一下选心情';
    moodEl.addEventListener('click', () => {
      if (window.openModal) {
        const moods = ['开心', '平静', '想你', '忙碌', '困', '充实', '温柔'];
        window.openModal('今天的心情', '', (v) => {
          const val = (v || '').trim();
          if (val) {
            moodEl.textContent = val; store.set('today-mood', val); pushHist('mood-history', val);
            try { if (window.idbSet) window.idbSet(window.activePrefix() + ':today-mood', val); } catch (e) {}
            const ds = dayStr(new Date());
            store.set('today-mood-' + ds, val);
            try { if (window.idbSet) window.idbSet(window.activePrefix() + ':today-mood-' + ds, val); } catch (e) {}
          }
        }, { pills: moods.map(m => ({ label: m, value: m })), pill: todayMoodText() || '' });
      }
    });
  }
  const weekEl = document.getElementById('week-days');
  if (weekEl) {
    const names = ['日', '一', '二', '三', '四', '五', '六'];
    const now = new Date();
    const todayIdx = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - todayIdx);
    weekEl.innerHTML = names.map((n, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const ds = dayStr(d);
      return '<div class="week-day' + (i === todayIdx ? ' today' : '') + '" data-date="' + ds + '"' + (i === todayIdx ? '' : ' role="button"') + '><b>' + (i === todayIdx ? '今' : n) + '</b>' + d.getDate() + '</div>';
    }).join('');
    weekEl.addEventListener('click', (ev) => {
      const cell = ev.target.closest('.week-day');
      if (!cell || cell.classList.contains('today')) return;
      const editing = Array.from(document.querySelectorAll('.app-grid')).some(g => g.classList.contains('editing'));
      if (editing) return;
      const ds = cell.getAttribute('data-date');
      if (!ds || !window.openModal) return;
      const parts = ds.split('-');
      const dd = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      const wdNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const dateLabel = (+parts[1]) + ' 月 ' + (+parts[2]) + ' 日（' + wdNames[dd.getDay()] + '）';
      const n2 = new Date();
      const isFuture = dd > new Date(n2.getFullYear(), n2.getMonth(), n2.getDate());
      const histOnDay = function (histKey) {
        try {
          const list = JSON.parse(store.get(histKey) || '[]');
          const t = dd.toDateString();
          return list.filter(x => x && x.ts && new Date(x.ts).toDateString() === t)
            .map(x => x.text).filter(Boolean);
        } catch (e) { return []; }
      };
      const memo = isFuture ? '' : (store.get('memo-' + ds) || histOnDay('memo-history').join('；'));
      const mood = isFuture ? '' : (store.get('today-mood-' + ds) || histOnDay('mood-history').join('；'));
      const lines = [];
      lines.push(dateLabel);
      lines.push('');
      if (isFuture) {
        lines.push('（未来的日子还没有内容，等到了那一天再来看吧）');
      } else {
        lines.push('【今日备忘】');
        lines.push(memo || '（这一天没有备忘）');
        lines.push('');
        lines.push('【今天的心情】');
        lines.push(mood || '（这一天没有记录心情）');
      }
      window.openModal(ds + ' 当日备忘与心情', '', () => {}, { noInput: true, staticText: lines.join('\n') });
    });
  }
  document.addEventListener('contact-switched', function () {
    try {
      const memoEl2 = document.getElementById('memo-text');
      if (memoEl2) {
        memoEl2.textContent = todayMemoText() || '点这里记一句话';
      }
      const moodEl2 = document.getElementById('today-mood-text');
      if (moodEl2) {
        moodEl2.textContent = todayMoodText() || '点一下选心情';
      }
      const ckPanel = document.getElementById('ck-panel');
      if (ckPanel) ckPanel.hidden = true;
    } catch (e) {}
  });
  (function () {
    let lastDay = dayStr(new Date());
    setInterval(function () {
      try {
        const now = dayStr(new Date());
        if (now === lastDay) return;
        lastDay = now;
        const m = document.getElementById('memo-text');
        if (m) m.textContent = todayMemoText() || '点这里记一句话';
        const md = document.getElementById('today-mood-text');
        if (md) md.textContent = todayMoodText() || '点一下选心情';
      } catch (e) {}
    }, 30000);
  })();
})();
(function () {
  const store = window.activeStore();
  const DIR_POS = {
    '在你左边': { x: 0.08, y: 0.5 },
    '在你右边': { x: 0.92, y: 0.5 },
    '在你身后': { x: 0.5, y: 0.08 },
    '在你前面': { x: 0.5, y: 0.92 },
    '离你两步': { x: 0.5, y: 0.38 },
    '抬头就能看到': { x: 0.5, y: 0.12 },
    '在你看不到的地方偷看你': { x: 0.86, y: 0.16 },
    '在你看不到的地方': { x: 0.72, y: 0.28 },
    '隔着世界在你身边': { x: 0.5, y: 0.5, center: true },
    '感觉到了吗': { x: 0.5, y: 0.5, center: true },
    '能摸到我吗': { x: 0.5, y: 0.5, center: true },
    '一直没走远': { x: 0.5, y: 0.45 },
    '隐约在你身旁': { x: 0.55, y: 0.5 },
    '在你心里': { x: 0.5, y: 0.5, center: true }
  };
  const DIST_ADJUST = { '再近一点': 0.15, '再远一点': -0.15, '就停这儿': 0, '马上到你身边': 0.3, '一直在原地等你': 0 };
  function adjustTowardCenter(pos, amount) {
    return { x: pos.x + (0.5 - pos.x) * amount, y: pos.y + (0.5 - pos.y) * amount, center: pos.center };
  }
  function lastDirText() {
    const hist = loadHist();
    for (const h of hist) {
      if (h.type === 'dir') return h.text;
      if (h.type === 'combo') return h.text.split(' ')[0];
    }
    return null;
  }
  function fxPos(text, type) {
    if (DIR_POS[text]) return DIR_POS[text];
    const dirText = lastDirText();
    const base = dirText ? (DIR_POS[dirText] || { x: 0.5, y: 0.3 }) : { x: 0.5, y: 0.3 };
    if (type === 'dist') {
      const adj = DIST_ADJUST[text] || 0;
      if (adj) return adjustTowardCenter(base, adj);
    }
    return base;
  }
  const EGG_COOLDOWN = 7 * 24 * 3600 * 1000;
  function loadCur() { try { return JSON.parse(store.get('loc-current') || 'null'); } catch (e) { return null; } }
  function saveCur(v) { store.set('loc-current', v ? JSON.stringify(v) : ''); }
  function loadHist() { try { return JSON.parse(store.get('loc-history') || '[]'); } catch (e) { return []; } }
  function saveHist(list) { if (window.xyBigWriteHold && window.xyBigWriteHold(store, 'loc-history')) return; // #1493 读不全先让路：这一格大键化后冷读空＝拿空账追加＝顶掉整本位置历史
    const s = JSON.stringify(list);
    store.set('loc-history', s);
    try { if (window.idbSet) window.idbSet(window.activePrefix() + ':loc-history', s); } catch (e) {}
  }
  window.locAddHist = function (text, type, auto) {
    try {
      const hist = loadHist();
      hist.unshift({ text: String(text == null ? '' : text), type: type || 'sense', ts: Date.now(), auto: !!auto });
      saveHist(hist);
    } catch (e) {}
  };
  window.locRefreshBody = function () { try { renderLocPanel(); } catch (e) {} };
  function eggLastTs() { return parseInt(store.get('loc-egg-last') || '0', 10) || 0; }
  function eggUsed() { return Date.now() - eggLastTs() < EGG_COOLDOWN; }
  function loadCustom() { return window.locLibGetCustomCards ? window.locLibGetCustomCards() : []; }
  function saveCustom(list) { if (window.locLibSaveCustom) window.locLibSaveCustom(list); }
  function senseDesc(cur) {
    if (!cur) return '还没感觉到 TA…';
    const t = cur.text;
    if (t.indexOf('看不到') >= 0 && t.indexOf('偷看') < 0) return 'TA 在你看不到的地方，但没走远';
    if (t.indexOf('隔着世界') >= 0) return 'TA 隔着世界，隐约在你身旁';
    if (t.indexOf('感觉到') >= 0) return '你感觉到了 TA，就在附近';
    if (t.indexOf('能摸到') >= 0) return '你能摸到 TA，很近很安心';
    if (t.indexOf('没走远') >= 0) return 'TA 一直没走远，就在身边';
    if (t.indexOf('隐约') >= 0) return 'TA 隐约在你身旁，感觉到了吗';
    if (t.indexOf('心里') >= 0) return 'TA 在你心里，最近的距离';
    if (t.indexOf('身后') >= 0) return '你感觉到 TA 在你身后，很近';
    if (t.indexOf('左边') >= 0) return '你感觉到 TA 在你左边';
    if (t.indexOf('右边') >= 0) return '你感觉到 TA 在你右边';
    if (t.indexOf('前面') >= 0) return '你感觉到 TA 在你前面';
    if (t.indexOf('身边') >= 0) return 'TA 就在你身边，很安心';
    if (t.indexOf('跟着') >= 0 || t.indexOf('陪你') >= 0) return 'TA 在陪你，感觉到了吗';
    return '你感觉到 TA 在附近：' + t;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function fmtT(ts) { if (!ts) return ''; const d = new Date(ts); const p = (n) => (n < 10 ? '0' + n : '' + n); return p(d.getHours()) + ':' + p(d.getMinutes()); }
  function toast(s) { try { if (typeof window.toast === 'function') window.toast(s); } catch (e) {} }
  function playLocFx(text, type) {
    const fx = document.getElementById('loc-fx');
    if (!fx) return;
    const pos = fxPos(text, type);
    fx.hidden = false;
    fx.className = 'loc-fx' + (pos.center ? ' loc-fx-center' : '');
    fx.style.left = (pos.x * 100) + '%';
    fx.style.top = (pos.y * 100) + '%';
    void fx.offsetWidth;
    fx.classList.add('loc-fx-show');
    clearTimeout(fx._t);
    fx._t = setTimeout(() => {
      fx.classList.remove('loc-fx-show');
      fx._t = setTimeout(() => { fx.hidden = true; }, 500);
    }, 2000);
  }
  function sendLocCard(text, type) {
    const ts = Date.now();
    if (type === 'egg' && eggUsed()) {
      toast('彩蛋「在你心里」一周只能用一次');
      return;
    }
    if (window.chatAddIn) window.chatAddIn(text, { rateAllow: true });
    saveCur({ text: text, type: type, ts: ts });
    const hist = loadHist();
    hist.unshift({ text: text, type: type, ts: ts });
    saveHist(hist);
    if (type === 'egg') store.set('loc-egg-last', String(ts));
    playLocFx(text, type);
    locViewDate = dayStr(new Date());
    renderLocPanel();
    if (window.refreshSense) window.refreshSense();
  }
  function dayStr(d) { const p = (n) => (n < 10 ? '0' + n : '' + n); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
  function dayLabel(s) {
    const today = dayStr(new Date());
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (s === today) return '今天';
    if (s === dayStr(y)) return '昨天';
    const parts = s.split('-');
    return parts[1] + '月' + parts[2] + '日';
  }
  function uniqueDays(hist) {
    const set = new Set();
    hist.forEach(h => { try { set.add(dayStr(new Date(h.ts))); } catch (e) {} });
    return Array.from(set).sort().reverse();
  }
  let locViewDate = '';
  let comboMode = store.get('loc-combo') !== '0'; // 默认开，记住选择
  let pendingDir = null;
  function sendComboCard(dirText, distText) {
    const ts = Date.now();
    const text = dirText + ' ' + distText;
    if (window.chatAddIn) window.chatAddIn(text, { rateAllow: true });
    saveCur({ text: text, type: 'combo', ts: ts });
    const hist = loadHist();
    hist.unshift({ text: text, type: 'combo', ts: ts });
    saveHist(hist);
    playLocFx(dirText, 'dir');
    pendingDir = null;
    locViewDate = dayStr(new Date());
    renderLocPanel();
    if (window.refreshSense) window.refreshSense();
  }
  let asking = false;
  function locLibGroup(k) {
    try {
      const sys = window.locLibGetSys ? window.locLibGetSys() : null;
      if (sys && Array.isArray(sys[k])) return sys[k];
    } catch (e) {}
    return [];
  }
  function backToChatAfterAsk() {
    closeLocPanel();
    if (window.closeCkPanel) window.closeCkPanel();
    const chatPage = document.getElementById('page-chat');
    if (!chatPage) return;
    if (chatPage.hidden) { if (window.enterChat) window.enterChat(); return; }
    const body = document.getElementById('chat-body');
    if (body) body.scrollTop = body.scrollHeight;
  }
  function askWhere() {
    if (asking) return;
    asking = true;
    if (window.chatSendMsg) window.chatSendMsg('你在哪？');
    toast(window.taFit ? window.taFit('已问 TA 一声，等 TA 回位置…') : '已问 TA 一声，等 TA 回位置…');
    backToChatAfterAsk();
    setTimeout(() => {
      asking = false;
      const dirs = locLibGroup('dir');
      const dists = locLibGroup('dist');
      const d = (dirs.length ? dirs : ['在你左边'])[Math.floor(Math.random() * (dirs.length ? dirs.length : 1))];
      const t = (dists.length ? dists : ['再近一点'])[Math.floor(Math.random() * (dists.length ? dists.length : 1))];
      sendComboCard(d, t);
    }, 2000 + Math.random() * 2000);
  }
  function showLocChangeBubble(text) {
    if (store.get('loc-bubble') === '0') return; // 设置「换位提醒弹窗」关：TA 换位置不再弹黑色轻提示
    let bub = document.getElementById('loc-change-bubble');
    if (!bub) {
      bub = document.createElement('div');
      bub.id = 'loc-change-bubble';
      bub.className = 'loc-change-bubble';
      document.body.appendChild(bub);
    }
    bub.textContent = window.taFit ? window.taFit('你感觉到 TA 换了位置：' + text) : ('你感觉到 TA 换了位置：' + text);
    bub.classList.add('loc-bubble-show');
    clearTimeout(bub._t);
    bub._t = setTimeout(() => { bub.classList.remove('loc-bubble-show'); }, 3000);
  }
  function renderLocPanel() {
    const body = document.getElementById('loc-body');
    if (!body) return;
    const cur = loadCur();
    const allHist = loadHist();
    const days = uniqueDays(allHist);
    const today = dayStr(new Date());
    if (!locViewDate || days.indexOf(locViewDate) < 0 || days.indexOf(today) >= 0) {
      locViewDate = days.indexOf(today) >= 0 ? today : (days[0] || today);
    }
    const dayHist = allHist.filter(h => { try { return dayStr(new Date(h.ts)) === locViewDate; } catch (e) { return false; } });
    const dayIdx = days.indexOf(locViewDate);
    let html = '';
    const LOC_LABEL = window.locLibLabel || function (t) { return t; };
    html += '<div class="loc-sense-box"><div class="loc-sense-head"><span class="loc-sense-dot"></span><span class="loc-sense-title">你感觉到的</span></div><div class="loc-sense-text">' + esc(senseDesc(cur)) + '</div></div>';
    html += '<div class="loc-section"><div class="loc-sec-title">此刻的位置</div>';
    if (cur) {
      html += '<div class="loc-now"><span class="loc-now-pin"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg></span><div class="loc-now-main"><div class="loc-sec-value">' + esc(cur.text) + '</div><div class="loc-sec-sub">' + (LOC_LABEL[cur.type] || (cur.type === 'combo' ? '组合' : '位置卡')) + ' · ' + fmtT(cur.ts) + '</div></div></div>';
    } else {
      html += '<div class="loc-sec-value loc-empty">— 还没有位置卡</div>';
    }
    html += '</div>';
    html += '<div class="loc-section"><div class="loc-sec-title">位置时间线</div>';
    html += '<div class="loc-day-switch"><button class="loc-day-btn" id="loc-day-prev"' + (dayIdx >= days.length - 1 ? ' disabled' : '') + '>‹</button><span class="loc-day-label">' + dayLabel(locViewDate) + '</span><button class="loc-day-btn" id="loc-day-next"' + (dayIdx <= 0 ? ' disabled' : '') + '>›</button></div>';
    if (dayHist.length) {
      html += '<div class="loc-timeline">' + dayHist.map(h => {
        const tag = LOC_LABEL[h.type] || '';
        const auto = h.auto ? '<span class="loc-tl-auto">TA</span>' : '';
        return '<div class="loc-tl-item"><span class="loc-tl-time">' + fmtT(h.ts) + '</span><span class="loc-tl-text">' + esc(h.text) + '</span><span class="loc-tl-tag">' + esc(tag) + '</span>' + auto + window.mochiHistDel('k|' + (Number(h.ts) || 0) + '|' + esc(h.text), (LOC_LABEL[h.type] || '位置卡') + ' · ' + esc(h.text)) + '</div>'; // #1493 单条删除
      }).join('') + '</div>';
      html += '<div class="loc-day-count">共 ' + dayHist.length + ' 条</div>';
    } else {
      html += '<div class="loc-sec-value loc-empty">这天没有位置记录</div>';
    }
    html += '</div>';
    html += '<div class="loc-sec-sub" style="padding:10px 2px 0;line-height:1.7">光点落在哪儿，就是 TA 在哪儿：方位卡落在画面对应方向；距离卡、状态卡跟着最近一张方位卡的方位走——「再近一点」朝屏幕中心靠、「再远一点」朝屏幕边缘退开（上一张说的是「在你右边」时，光点贴屏幕右侧属正常）。</div>';
    html += '<div class="set-group glass" style="margin:14px 2px 0">'
      + '<div class="gs-row"><span>TA 自动换位</span><label class="toggle"><input type="checkbox" id="loc-auto-tg"' + (store.get('loc-auto') === '0' ? '' : ' checked') + '><span class="tk"></span></label></div>'
      + '<div class="gs-row"><span>换位提醒弹窗</span><label class="toggle"><input type="checkbox" id="loc-bubble-tg"' + (store.get('loc-bubble') === '0' ? '' : ' checked') + '><span class="tk"></span></label></div>'
      + '<div class="gs-row"><span>换位发到聊天</span><label class="toggle"><input type="checkbox" id="loc-chat-tg"' + (store.get('loc-chat') === '0' ? '' : ' checked') + '><span class="tk"></span></label></div>'
      + '</div>'
      + '<div class="gs-sub" style="padding:0 2px 10px">TA 自动换位：开启后每 2～6 小时随机换一次位置（关掉后到点也不换；「问 TA 一声」不受影响）。换位内容 70% 是陪伴卡（在你身边／一直没走远等），30% 从字卡库启用的位置卡里随机；每次换位都会记进「位置时间线」，换位内容与上一次不同时才算「换了位置」才弹提醒。<br>换位提醒弹窗：TA 自动换位置时顶部弹的黑色轻提示。<br>换位发到聊天：关掉后 TA 自动换位只记进「位置时间线」，不再发进聊天记录。<br>方位感知的【感知一下】：点了就先让 TA 当场换一次位置、再按新位置报方位，不用等那发 2～6 小时（不用打开任何开关，点了就是换）；它不受「TA 自动换位」总开关与夜间静默管（那两枚管的是 TA 自己到点来打扰），发进聊天与弹提醒仍照上面两枚开关。</div>';
    html += '<button class="loc-ask-btn" id="loc-ask-btn">问 TA 一声「你在哪？」</button>';
    body.innerHTML = html;
    window.mochiHistDelBind(body, {
      title: '删除这条位置记录？',
      onDel: function (k) {
        const p = String(k).split('|');
        const ts = Number(p[1]) || 0, tx = p.slice(2).join('|');
        const arr = loadHist();
        const i = arr.findIndex(function (x) { return x && (Number(x.ts) || 0) === ts && String(x.text || '') === tx; });
        if (i < 0) { if (typeof window.toast === 'function') window.toast('这条已经变了，没有删掉任何内容'); return; }
        if (window.xyBigWriteBlocked && window.xyBigWriteBlocked(store, 'loc-history', '位置记录')) return;
        arr.splice(i, 1);
        saveHist(arr);
        renderLocPanel();
        if (typeof window.toast === 'function') window.toast('已删除这条位置记录');
      }
    });
    const askBtn = document.getElementById('loc-ask-btn');
    if (askBtn) askBtn.addEventListener('click', askWhere);
    const bindLocTg = function (id, key) {
      const tg = document.getElementById(id);
      if (tg) tg.addEventListener('change', function () {
        store.set(key, tg.checked ? '1' : '0');
        if (key === 'loc-auto' && tg.checked) scheduleLocAuto();
      });
    };
    bindLocTg('loc-auto-tg', 'loc-auto');
    bindLocTg('loc-bubble-tg', 'loc-bubble');
    bindLocTg('loc-chat-tg', 'loc-chat');
    const prevBtn = document.getElementById('loc-day-prev');
    if (prevBtn) prevBtn.addEventListener('click', () => { if (dayIdx < days.length - 1) { locViewDate = days[dayIdx + 1]; renderLocPanel(); } });
    const nextBtn = document.getElementById('loc-day-next');
    if (nextBtn) nextBtn.addEventListener('click', () => { if (dayIdx > 0) { locViewDate = days[dayIdx - 1]; renderLocPanel(); } });
  }
  function openLocPanel() {
    const panel = document.getElementById('loc-panel');
    const nameEl = document.getElementById('loc-name');
    if (nameEl) nameEl.textContent = store.get('lbl-partner') || 'TA';
    if (panel) panel.classList.add('loc-full');
    if (window.refreshSense) window.refreshSense();
    renderLocPanel();
    if (panel) panel.hidden = false;
    const ck = document.getElementById('ck-panel');
    if (ck) ck.hidden = true;
  }
  function closeLocPanel() {
    const panel = document.getElementById('loc-panel');
    if (panel) { panel.hidden = true; panel.classList.remove('loc-full'); }
  }
  const entry = document.getElementById('ck-loc-entry');
  if (entry) entry.addEventListener('click', () => openLocPanel());
  const entryDesk = document.getElementById('ck-loc-entry-desk');
  if (entryDesk) entryDesk.addEventListener('click', () => openLocPanel());
  const locBack = document.getElementById('loc-back');
  if (locBack) locBack.addEventListener('click', closeLocPanel);
  try {
    if (window.idbGet && !store.get('loc-history')) {
      const myPrefix = window.activePrefix();
      window.idbGet(myPrefix + ':loc-history').then(v => {
        if (window.activePrefix() !== myPrefix) return;
        if (v) { try { store.set('loc-history', typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) {} }
      });
    }
  } catch (e) {}
  let locAutoTimer = null, locWakeAt = 0;
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') locWakeAt = Date.now() + 60000; });
  function locTypeOf(text) {
    if (window.locLibTypeOf) return window.locLibTypeOf(text);
    return 'custom';
  }
  function doLocAuto() {
    if (window.nightModeActive && window.nightModeActive()) return;
    if (document.hidden || Date.now() < locWakeAt || !window.__mochiDataReady) return;
    if (store.get('loc-auto') === '0') return; // 设置「TA 自动换位」关：到点也不发（拦设置后仍残留的当次定时器）
    emitLocChange(null);
  }
  function emitLocChange(avoidText) {
    const companion = ['在你身边', '一直没走远', '隔着世界在你身边', '隐约在你身旁', '在你看不到的地方']
      .filter(function (t) { return !(window.locLibTextOff && window.locLibTextOff(t)); });
    let text;
    for (let retry = 0, tries = avoidText ? 3 : 1; retry < tries; retry++) {
      if (companion.length && Math.random() < 0.7) {
        text = companion[Math.floor(Math.random() * companion.length)];
      } else {
        const all = (window.locLibAllEnabled ? window.locLibAllEnabled() : []).slice();
        if (!all.length) return false;
        text = all[Math.floor(Math.random() * all.length)];
      }
      if (!avoidText || text !== avoidText) break;
    }
    if (!text) return false;
    const type = locTypeOf(text);
    const ts = Date.now();
    const oldCur = loadCur();
    if (store.get('loc-chat') !== '0' && window.chatAddIn) window.chatAddIn(text, { rateAllow: true });
    saveCur({ text: text, type: type, ts: ts, auto: true });
    const hist = loadHist();
    hist.unshift({ text: text, type: type, ts: ts, auto: true });
    saveHist(hist);
    playLocFx(text, type);
    locViewDate = dayStr(new Date());
    renderLocPanel(); // #1436 换位落地必重画（旧写法＝只写库不重画，面板开着时「位置时间线」停在上一张＝用户看到「没记录」）
    if (window.refreshSense) window.refreshSense();
    if (oldCur && oldCur.text !== text) showLocChangeBubble(text);
    return true;
  }
  window.locShiftNow = function () {
    const c = loadCur();
    return emitLocChange(c && c.text ? c.text : null);
  };
  function scheduleLocAuto() {
    clearTimeout(locAutoTimer);
    if (store.get('loc-auto') === '0') { locAutoTimer = setTimeout(scheduleLocAuto, 60000); return; }
    locAutoTimer = setTimeout(() => { doLocAuto(); scheduleLocAuto(); }, (2 + Math.random() * 4) * 3600000);
  }
  function bootLocAuto() { if (!window.__mochiDataReady) { setTimeout(bootLocAuto, 500); return; } scheduleLocAuto(); }
  document.addEventListener('mochi-restore-done', bootLocAuto);
  setTimeout(bootLocAuto, 3000);
  document.addEventListener('contact-switched', () => {
    try { closeLocPanel(); locViewDate = ''; } catch (e) {}
  });
  window.playLocFx = playLocFx;
})();
(function () {
  const store = window.activeStore();
  const KEY = 'loc-sense';
  const DIRS = [
    { k: '正前方', arrow: '↑', angle: -90 },
    { k: '右前方', arrow: '↗', angle: -45 },
    { k: '右侧',   arrow: '→', angle: 0 },
    { k: '右后方', arrow: '↘', angle: 45 },
    { k: '后方',   arrow: '↓', angle: 90 },
    { k: '左后方', arrow: '↙', angle: 135 },
    { k: '左侧',   arrow: '←', angle: 180 },
    { k: '左前方', arrow: '↖', angle: 225 }
  ];
  const NEAR_WORDS = ['在你身边', '一直没走远', '隔着世界在你身边', '能摸到我吗', '陪你走着', '停下来等你', '抬头就能看到', '在你前面', '原地等你'];
  const FAR_WORDS = ['在你看不到的地方', '在你看不到的地方偷看你', '再远一点', '就停这儿'];
  function dirFromText(t) {
    if (!t) return '';
    if (t.indexOf('左边') >= 0) return '左侧';
    if (t.indexOf('右边') >= 0) return '右侧';
    if (t.indexOf('身后') >= 0 || t.indexOf('后面') >= 0) return '后方';
    if (t.indexOf('前面') >= 0 || t.indexOf('抬头') >= 0) return '正前方';
    return '';
  }
  function load() {
    try {
      const v = JSON.parse(store.get(KEY) || 'null');
      if (v && typeof v === 'object') return v;
    } catch (e) {}
    return {};
  }
  function save(s) { store.set(KEY, JSON.stringify(s)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function esc(x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function senseWords(k) {
    if (window.locLibSenseGroup) {
      const w = window.locLibSenseGroup(k);
      if (Array.isArray(w) && w.length) return w;
    }
    return { direct: ['无法判断'], rangef: ['无法判断'], power: ['若有若无'], touch: ['好像碰到了你的手'] }[k];
  }
  function isUndirected(d) { return d === '无法判断' || d === '身边'; }
  function rollDir() {
    const words = senseWords('direct');
    const dir8 = DIRS.map(d => d.k).filter(k => words.indexOf(k) >= 0);
    if (Math.random() >= 0.08) {
      if (dir8.length) return pick(dir8);
      const others = words.filter(w => !isUndirected(w));
      return others.length ? pick(others) : '无法判断';
    }
    const pool = words.indexOf('身边') >= 0 ? ['无法判断', '无法判断', '无法判断', '身边'] : ['无法判断', '无法判断', '无法判断', '无法判断'];
    return pick(pool);
  }
  function ensureDirInLib(d) {
    const words = senseWords('direct');
    if (words.indexOf(d) >= 0) return d;
    return '无法判断';
  }
  function rollRangeAndPower() {
    let hist = [];
    try { hist = JSON.parse(store.get('loc-history') || '[]'); } catch (e) {}
    let near = false, far = false;
    for (let i = 0; i < hist.length && i < 5; i++) {
      const t = hist[i].text || '';
      if (NEAR_WORDS.some(w => t.indexOf(w) >= 0)) near = true;
      if (FAR_WORDS.some(w => t.indexOf(w) >= 0)) far = true;
    }
    const rfWords = senseWords('rangef');
    const pwWords = senseWords('power');
    let rf, pw;
    if (near && !far) {
      const nearRf = rfWords.filter(w => w === '很近' || w === '近');
      const nearPw = pwWords.filter(w => w === '明显');
      rf = pick(nearRf.length ? nearRf : rfWords);
      pw = pick(nearPw.length ? nearPw : pwWords);
    } else if (far && !near) {
      const farRf = rfWords.filter(w => w === '稍远' || w === '很远' || w === '无法判断');
      const farPw = pwWords.filter(w => w === '微弱' || w === '若有若无');
      rf = pick(farRf.length ? farRf : rfWords);
      pw = pick(farPw.length ? farPw : pwWords);
    } else {
      rf = pick(rfWords);
      pw = pick(pwWords);
    }
    return { rangef: rf, power: pw };
  }
  function getSense(force) {
    const s = load();
    const now = Date.now();
    let dirty = false;
    let cur = null;
    try { cur = JSON.parse(store.get('loc-current') || 'null'); } catch (e) {}
    const fixedDir = cur ? dirFromText(cur.text) : '';
    if (fixedDir) {
      if (s.dir !== fixedDir) {
        s.dir = fixedDir;
        s.nextDirAt = now + (15 + Math.floor(Math.random() * 31)) * 60000; // 15~45 分钟
        dirty = true;
      }
    } else if (!s.dir || (s.nextDirAt && now >= s.nextDirAt) || force) {
      s.dir = rollDir();
      s.nextDirAt = now + (15 + Math.floor(Math.random() * 31)) * 60000; // 15~45 分钟
      dirty = true;
    } else {
      s.dir = ensureDirInLib(s.dir);
    }
    if (!s.rangef || !s.power || force) {
      const rp = rollRangeAndPower();
      s.rangef = rp.rangef;
      s.power = rp.power;
      dirty = true;
    }
    if (dirty) save(s);
    return s;
  }
  function maybeTouch(s) {
    if (Math.random() >= 0.04) return null; // 4% 概率
    const t = pick(senseWords('touch'));
    s.touch = t;
    s.touchAt = Date.now();
    save(s);
    if (window.playLocFx) window.playLocFx(t, 'touch');
    return t;
  }
  function resultText(s, touched) {
    const name = store.get('lbl-partner') || 'TA';
    if (isUndirected(s.dir)) {
      return '方位感知 · ' + name + '\n？ 暂时无法判断方向。\n但你似乎感觉到，有谁在附近。';
    }
    if (s.power === '消失') {
      return '方位感知 · ' + name + '\n刚才似乎还在，现在已经感觉不到了。';
    }
    const arrows = DIRS.find(d => d.k === s.dir);
    return '方位感知 · ' + name + '\n' + (arrows ? arrows.arrow + ' ' : '') + s.dir + '\n' + s.rangef + ' · ' + s.power +
      (touched ? '\n……好像有什么轻轻碰了你一下。' : '');
  }
  function render() {
    const s = getSense(false);
    const circle = document.getElementById('fw-circle');
    if (circle) {
      circle.innerHTML = '';
      const cx = 50, cy = 50, r = 36;
      DIRS.forEach(d => {
        const rad = d.angle * Math.PI / 180;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'fw-dir' + (s.dir === d.k ? ' on' : '');
        b.textContent = d.arrow;
        b.style.left = x + '%';
        b.style.top = y + '%';
        b.title = d.k;
        circle.appendChild(b);
      });
      const me = document.createElement('div');
      me.className = 'fw-me';
      me.textContent = '你';
      circle.appendChild(me);
      const cur = document.createElement('div');
      cur.id = 'fw-cur-dir';
      cur.className = 'fw-cur-dir';
      cur.textContent = s.dir || '无法判断';
      circle.appendChild(cur);
    }
    const detail = document.getElementById('fw-detail');
    if (detail) {
      const arrows = DIRS.find(d => d.k === s.dir);
      detail.innerHTML =
        '<div class="fw-row"><span class="fw-row-label">方向</span><span class="fw-row-val">' + (arrows ? arrows.arrow + ' ' : '') + esc(s.dir) + '</span></div>' +
        '<div class="fw-row"><span class="fw-row-label">距离感</span><span class="fw-row-val">' + esc(s.rangef) + '</span></div>' +
        '<div class="fw-row"><span class="fw-row-label">感知强度</span><span class="fw-row-val">' + esc(s.power) + '</span></div>';
    }
  }
  let perceiveCdUntil = 0;
  function perceive() {
    const btn = document.getElementById('fw-perceive');
    const now = Date.now();
    if (now < perceiveCdUntil) return;
    perceiveCdUntil = now + 4000;
    if (btn) { btn.classList.add('busy'); btn.disabled = true; }
    if (window.locShiftNow) window.locShiftNow();
    const s = getSense(true);
    const touched = maybeTouch(s);
    const result = document.getElementById('fw-result');
    if (result) {
      result.hidden = false;
      result.innerHTML = '';
      resultText(s, touched).split('\n').forEach(l => {
        const p = document.createElement('p');
        p.className = 'fw-p-line';
        p.textContent = l;
        result.appendChild(p);
      });
    }
    render();
    try {
      const arrows2 = DIRS.find(d => d.k === s.dir);
      let tlText;
      if (isUndirected(s.dir)) {
        tlText = '方位感知：暂时无法判断方向';
      } else {
        tlText = '方位感知：' + (arrows2 ? arrows2.arrow + ' ' : '') + s.dir + ' · ' + s.rangef + ' · ' + s.power;
      }
      if (touched) tlText += ' · 好像有什么轻轻碰了你一下';
      if (window.locAddHist) window.locAddHist(tlText, 'sense', false);
      if (window.locRefreshBody) window.locRefreshBody();
    } catch (e) {}
    setTimeout(() => {
      if (btn) { btn.classList.remove('busy'); btn.disabled = false; }
    }, 4000);
  }
  function passiveHint() {
    const s = load();
    const now = Date.now();
    if (s.hintAt && now - s.hintAt < 3600000) return;
    if (Math.random() >= 0.02) return; // 每次检查 2% 低概率
    const gs = getSense(false);
    if (isUndirected(gs.dir)) return;
    const arrows = DIRS.find(d => d.k === gs.dir);
    const name = store.get('lbl-partner') || 'TA';
    if (window.toast) window.toast('……好像' + (arrows ? arrows.arrow + ' ' : '') + '有人在你' + gs.dir + '。');
    s.hintAt = now;
    save(s);
  }
  window.refreshSense = function () {
    getSense(false);
    render();
  };
  const perceiveBtn = document.getElementById('fw-perceive');
  if (perceiveBtn) perceiveBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    perceive();
  });
  let lastHintCheck = 0;
  setInterval(function () {
    const panel = document.getElementById('loc-panel');
    if (panel && !panel.hidden) {
      const s = load();
      if (s.nextDirAt && Date.now() >= s.nextDirAt) { getSense(false); render(); }
    }
    if (Math.floor(Date.now() / 30000) !== lastHintCheck) {
      lastHintCheck = Math.floor(Date.now() / 30000);
      passiveHint();
    }
  }, 30000);
  document.addEventListener('contact-switched', function () {
    const panel = document.getElementById('loc-panel');
    if (panel) panel.hidden = true;
  });
})();
(function () {
  function store() { try { return window.activeStore(); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function dayKey() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  window.taIsNear = function () {
    const s = store(); if (!s) return false;
    let cur = null; try { cur = JSON.parse(s.get('loc-current') || 'null'); } catch (e) {}
    if (!cur) return false;
    const t = cur.text || '';
    return /能摸到|没走远|身边|心里|感觉到|隐约|陪你|跟着|马上到/.test(t);
  };
  window.taSenseDesc = function () {
    const s = store(); if (!s) return '还没感觉到 TA…';
    let cur = null; try { cur = JSON.parse(s.get('loc-current') || 'null'); } catch (e) {}
    if (!cur) return '还没感觉到 TA…';
    const t = cur.text || '';
    if (t.indexOf('隔着世界') >= 0) return window.taFit ? window.taFit('TA 隔着世界，隐约在你身旁') : 'TA 隔着世界，隐约在你身旁';
    if (t.indexOf('感觉到') >= 0) return window.taFit ? window.taFit('你感觉到了 TA，就在附近') : '你感觉到了 TA，就在附近';
    if (t.indexOf('能摸到') >= 0) return window.taFit ? window.taFit('你能摸到 TA，很近很安心') : '你能摸到 TA，很近很安心';
    if (t.indexOf('没走远') >= 0) return window.taFit ? window.taFit('TA 一直没走远，就在身边') : 'TA 一直没走远，就在身边';
    if (t.indexOf('隐约') >= 0) return window.taFit ? window.taFit('TA 隐约在你身旁，感觉到了吗') : 'TA 隐约在你身旁，感觉到了吗';
    if (t.indexOf('身边') >= 0) return window.taFit ? window.taFit('TA 就在你身边，很安心') : 'TA 就在你身边，很安心';
    return window.taFit ? window.taFit('你感觉到 TA 在附近') : '你感觉到 TA 在附近';
  };
  window.taChimeAllow = function (key, opts) {
    opts = opts || {};
    const s = store(); if (!s) return false;
    const now = Date.now();
    if (opts.cooldown) { let last = 0; try { last = parseInt(s.get('ta-chime:' + key + ':last') || '0', 10) || 0; } catch (e) {} if (now - last < opts.cooldown) return false; }
    if (opts.dailyMax) { let rec = null; try { rec = JSON.parse(s.get('ta-chime:' + key + ':day') || 'null'); } catch (e) {} if (rec && rec.date === dayKey() && rec.n >= opts.dailyMax) return false; }
    return true;
  };
  window.taChimeUse = function (key) {
    const s = store(); if (!s) return;
    try { s.set('ta-chime:' + key + ':last', '' + Date.now()); } catch (e) {}
    let rec = null; try { rec = JSON.parse(s.get('ta-chime:' + key + ':day') || 'null'); } catch (e) {}
    if (!rec || rec.date !== dayKey()) rec = { date: dayKey(), n: 0 };
    rec.n++; try { s.set('ta-chime:' + key + ':day', JSON.stringify(rec)); } catch (e) {}
  };
  let el = null, timer = null, clickFn = null;
  window.taChimeShow = function (text, opts) {
    opts = opts || {};
    if (window.taFit) text = window.taFit(text);
    if (!el) { el = document.createElement('div'); el.className = 'ta-chime-note'; document.body.appendChild(el); }
    const miss = opts.miss ? '<span class="ta-chime-miss">' + esc(window.taFit ? window.taFit(opts.miss) : opts.miss) + '</span>' : '';
    const grabTip = opts.onClick ? '<span class="ta-chime-grab-tip">点我抓包</span>' : '';
    el.innerHTML = '<span class="ta-chime-dot"></span><span class="ta-chime-text">' + esc(text) + '</span>' + miss + grabTip;
    clickFn = opts.onClick || null;
    el.classList.toggle('grab', !!clickFn);
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => { el.classList.remove('show', 'grab'); clickFn = null; }, opts.dur || 4200);
  };
  document.addEventListener('click', (ev) => {
    if (!el || !el.classList.contains('grab') || !el.contains(ev.target)) return;
    const fn = clickFn; clickFn = null;
    el.classList.remove('show', 'grab');
    clearTimeout(timer);
    try { if (navigator.vibrate) navigator.vibrate([60, 40, 120]); } catch (e) {}
    if (fn) fn();
  }, true);
  const CHECKIN_TA_CARDS = ['你今天也努力了', '我一直看着你呢', '又一起过了一天', '辛苦啦，过来抱抱', '嗯，今天也好好过来了', '你在，我就安心'];
  const CHECKIN_TA_MISS = ['（字卡有限，他想说的比这张多）', '（这张好像不是他想说的，别在意）', '（他没控制住，意思不全是这个）'];
  window.checkinTaCard = function (cb) {
    if (!window.taChimeAllow('checkin-ta', { cooldown: 24 * 3600 * 1000, dailyMax: 1 })) { if (cb) cb(null); return; }
    window.taChimeUse('checkin-ta');
    const miss = Math.random() < 0.22;
    const text = CHECKIN_TA_CARDS[Math.floor(Math.random() * CHECKIN_TA_CARDS.length)];
    const card = miss ? { text: text, miss: CHECKIN_TA_MISS[Math.floor(Math.random() * CHECKIN_TA_MISS.length)] } : { text: text };
    if (cb && window.taFit) { card.text = window.taFit(card.text); if (card.miss) card.miss = window.taFit(card.miss); }
    if (cb) cb(card);
  };
})();
(function () {
  function curStore() { try { return window.storeFor(window.__activeCid || 'default'); } catch (e) { return null; } }
  function vibrate(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function editingNow() { return Array.from(document.querySelectorAll('.app-grid')).some(g => g.classList.contains('editing')); }
  function libPool(cat, group, fallback) {
    let arr = (window.getLibPool ? window.getLibPool(cat, group, fallback) : (fallback || [])).slice();
    if (window.isDefaultCardOff) arr = arr.filter(c => !window.isDefaultCardOff(cat, c));
    return arr.length ? arr.slice() : (window.gateCardFallback ? window.gateCardFallback(cat, fallback) : (fallback || []).slice());
  }
  window.__p2LibPoolProbe = libPool; // #1515 只读探针（行为尺用，不参与业务）
  function dcfP(cat, def) { try { if (window.dcfGet) return window.dcfGet(cat); } catch (e) {} return def; }
  function dcfHit(cat) { return Math.random() * 100 < dcfP(cat, 100); }
  function toast(msg) {
    let t = document.getElementById('cc-toast');
    if (!t) { t = document.createElement('div'); t.id = 'cc-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = 'cc-toast'; void t.offsetWidth; t.className = 'cc-toast show';
    clearTimeout(t._timer); t._timer = setTimeout(() => { t.className = 'cc-toast'; }, 2000);
  }
  function openPage(pg) {
    document.querySelectorAll('.page').forEach(p => p.hidden = true);
    pg.hidden = false;
    requestAnimationFrame(() => {
      const tabbar = document.querySelector('.tabbar');
      const phone = document.querySelector('.phone');
      if (tabbar) tabbar.hidden = true;
      if (phone) phone.classList.add('no-statusbar');
      pg.classList.add('full');
    });
  }
  function backHome(pg) {
    if (pg) pg.classList.remove('full');
    document.querySelectorAll('.page').forEach(p => p.hidden = true);
    const home = document.getElementById('page-phone');
    if (home) home.hidden = false;
  }
  function onLongPress(el, cb, duration) {
    duration = duration || 450;
    let timer = null;
    function start() { clearTimeout(timer); timer = setTimeout(cb, duration); }
    function cancel() { clearTimeout(timer); }
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchcancel', cancel);
    el.addEventListener('mousedown', (e) => { if (e.button === 0) start(); });
    el.addEventListener('mouseup', cancel);
    el.addEventListener('mouseleave', cancel);
  }
  const host = (document.getElementById('page-phone') || {}).parentNode || document.body;
  function makeApp(app, name, svg) {
    const a = document.createElement('div');
    a.className = 'app'; a.setAttribute('data-app', app); a.setAttribute('data-desk-widget', 'app-' + app);
    a.innerHTML = '<div class="app-ico">' + svg + '</div><div class="app-name">' + name + '</div>';
    return a;
  }
const eatApp=makeApp("eat","吃什么","🍽");document.querySelector("#desktop-pages .app-grid")?.appendChild(eatApp);
  const DEF_EAT_DISHES = ['番茄炒蛋', '红烧肉', '清蒸鱼', '麻婆豆腐', '宫保鸡丁', '酸辣土豆丝', '蛋炒饭', '牛肉面', '饺子', '馄饨', '皮蛋瘦肉粥', '可乐鸡翅', '糖醋排骨', '清炒时蔬', '蛋花汤', '凉拌黄瓜', '回锅肉', '水煮肉片', '鱼香肉丝', '葱油拌面'];
  const DEF_EAT_COMMENTS = ['就吃这个吧', '听起来不错', '我想吃这个', '可以', '这个好吃', '嗯，就这个', '想吃'];
  const EAT_ASK_MSGS = ['今晚吃 {0} 怎么样？', '{0}，想吃吗？', '要不要吃 {0}？', '今天吃 {0} 好不好？'];
  const eatPage = document.createElement('div');
  eatPage.className = 'page'; eatPage.id = 'page-eat'; eatPage.hidden = true;
  eatPage.innerHTML =
    '<div class="chat-head"><span class="ch-back" id="eat-back"><svg viewBox="0 0 24 24" fill="none" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></span><span class="ch-name">吃什么</span></div>' +
    '<div class="eat-body">' +
      '<div class="eat-cur-bar"><span class="eat-cur-label">当前菜单</span><span class="eat-cur-name" id="eat-cur-name">…</span><button class="eat-switch-menu" id="eat-switch-menu">切换菜单</button></div>' +
      '<div class="eat-wheel-wrap"><canvas class="eat-wheel" id="eat-wheel"></canvas><div class="eat-pointer" id="eat-pointer"><svg viewBox="0 0 20 20" width="20" height="20"><polygon points="10,18 3,2 17,2" fill="#e8533d"/></svg></div></div>' +
      '<div class="eat-card glass"><div class="eat-label">今天吃</div><div class="eat-dish" id="eat-dish">…</div><div class="eat-comment" id="eat-comment">…</div></div>' +
      '<div class="eat-btns"><button class="eat-change" id="eat-change">换一个</button><button class="eat-send" id="eat-send">发到聊天</button></div>' +
      '<div class="eat-btns"><button class="eat-spin" id="eat-spin">转盘抽取</button><button class="eat-askta" id="eat-askta">问 TA</button></div>' +
      '<div class="eat-history" id="eat-history"></div>' +
      '<div class="eat-mgr"><button class="eat-add" id="eat-add">+ 添加菜名</button><button class="eat-menu-btn" id="eat-menu-btn">编辑菜单</button></div>' +
      '<div class="eat-mgr"><button class="eat-menu-btn" id="eat-remind-toggle">TA 提醒：开</button><button class="eat-menu-btn" id="eat-remind-prob">触发概率 2%</button></div>' +
      '<div class="eat-menu-panel" id="eat-menu-panel" hidden>' +
        '<div class="eat-menu-chips" id="eat-menu-chips"></div>' +
        '<div class="eat-menu-ops"><button class="eat-menu-op" id="eat-menu-new">+ 新建</button><button class="eat-menu-op" id="eat-menu-rename">重命名</button><button class="eat-menu-op" id="eat-menu-del">删除</button></div>' +
        '<textarea class="eat-menu-ta" id="eat-menu-ta" rows="8" placeholder="一行一个菜名，至少 2 道"></textarea>' +
        '<div class="eat-menu-acts"><button class="eat-menu-save" id="eat-menu-save">保存菜单</button><button class="eat-menu-reset" id="eat-menu-reset">填入默认菜品</button></div>' +
      '</div>' +
      '<div class="eat-switch-overlay" id="eat-switch-overlay" hidden>' +
        '<div class="eat-switch-card glass">' +
          '<div class="eat-switch-title">切换菜单</div>' +
          '<div class="eat-switch-chips" id="eat-switch-chips"></div>' +
          '<div class="eat-switch-or">或转盘随机选</div>' +
          '<div class="eat-wheel-wrap eat-wheel-wrap-sm"><canvas class="eat-wheel" id="eat-switch-wheel"></canvas><div class="eat-pointer" id="eat-switch-pointer"><svg viewBox="0 0 20 20" width="20" height="20"><polygon points="10,18 3,2 17,2" fill="#e8533d"/></svg></div></div>' +
          '<div class="eat-switch-name" id="eat-switch-name">点下方按钮开始转</div>' +
          '<div class="eat-switch-acts"><button class="eat-switch-cancel" id="eat-switch-cancel">取消</button><button class="eat-switch-go" id="eat-switch-go">开始转</button></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  host.appendChild(eatPage);
  function eatMenu() { const s = curStore(); try { const a = JSON.parse((s && s.get('eat-menu')) || '[]'); if (Array.isArray(a) && a.length) return a.filter(d => d); } catch (e) {} return null; }
  function eatSaveMenu(a) { const s = curStore(); if (s) try { s.set('eat-menu', JSON.stringify(a)); } catch (e) {} }
  function eatHistory() { const s = curStore(); try { const a = JSON.parse((s && s.get('eat-history')) || '[]'); return Array.isArray(a) ? a.slice(-3) : []; } catch (e) {} return []; }
  function eatPushHistory(dish) { const h = eatHistory(); h.push({ d: dish, t: Date.now() }); const s = curStore(); if (s) try { s.set('eat-history', JSON.stringify(h.slice(-10))); } catch (e) {} eatRenderHistory(); }
  function eatRenderHistory() { const h = eatHistory(); const el = document.getElementById('eat-history'); if (!el) return; if (!h.length) { el.innerHTML = ''; return; } el.innerHTML = '最近吃了：' + h.map(x => '<span class="eh-tag">' + x.d + '</span>').join(''); }
  function eatSaveMenus(a) { const s = curStore(); if (s) try { s.set('eat-menus', JSON.stringify(a)); } catch (e) {} }
  function eatMenus() {
    const s = curStore();
    try { const a = JSON.parse((s && s.get('eat-menus')) || '[]'); if (Array.isArray(a) && a.length) { const out = a.filter(m => m && m.name && Array.isArray(m.dishes)).map(m => ({ name: String(m.name), dishes: m.dishes.filter(d => d) })); if (out.length) return out; } } catch (e) {}
    const oldMenu = eatMenu();
    if (oldMenu) { const migrated = [{ name: '我的菜单', dishes: oldMenu }]; eatSaveMenus(migrated); if (s) try { s.set('eat-menu', '[]'); } catch (e) {} return migrated; }
    let oldCards = []; try { const a = JSON.parse((s && s.get('eat-cards')) || '[]'); if (Array.isArray(a)) oldCards = a.filter(d => d); } catch (e) {}
    if (oldCards.length) { const pool = DEF_EAT_DISHES.slice(); oldCards.forEach(d => { if (pool.indexOf(d) < 0) pool.push(d); }); const migrated = [{ name: '我的菜单', dishes: pool }]; eatSaveMenus(migrated); if (s) try { s.set('eat-cards', '[]'); } catch (e) {} return migrated; }
    return [{ name: '默认菜单', dishes: DEF_EAT_DISHES.slice() }];
  }
  function eatCurMenuIdx() { const s = curStore(); try { const i = parseInt(s && s.get('eat-cur-idx'), 10); if (!isNaN(i) && i >= 0) return i; } catch (e) {} return 0; }
  function eatSaveCurMenuIdx(i) { const s = curStore(); if (s) try { s.set('eat-cur-idx', String(i)); } catch (e) {} }
  function eatCurMenu() { const menus = eatMenus(); let idx = eatCurMenuIdx(); if (idx >= menus.length) idx = 0; return { menus: menus, idx: idx, menu: menus[idx] }; }
  function eatDishes() { return eatCurMenu().menu.dishes.slice(); }
  function eatRenderCurName() { const el = document.getElementById('eat-cur-name'); if (el) el.textContent = eatCurMenu().menu.name; }
  let eatSpinAngle = 0; let eatSpinTimer = null; let eatSpinning = false; let eatHlIdx = -1; let eatHlTimer = null;
  const EAT_BTN_IDS = ['eat-change', 'eat-send', 'eat-spin', 'eat-askta'];
  function eatSetBtns(dis) { EAT_BTN_IDS.forEach(id => { const b = document.getElementById(id); if (b) { if (dis) b.setAttribute('disabled', ''); else b.removeAttribute('disabled'); } }); }
  function eatClearSpin() { if (eatSpinTimer) { cancelAnimationFrame(eatSpinTimer); eatSpinTimer = null; } eatSpinning = false; eatSetBtns(false); eatHlIdx = -1; if (eatHlTimer) { clearTimeout(eatHlTimer); eatHlTimer = null; } }
  function eatInitCanvas() { const c = document.getElementById('eat-wheel'); if (!c) return; const dpr = window.devicePixelRatio || 1; const size = 240; c.width = size * dpr; c.height = size * dpr; c.style.width = size + 'px'; c.style.height = size + 'px'; c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0); }
  function eatDrawWheelCore(canvas, dishes, hlIdx, angle) {
    const ctx = canvas.getContext('2d'); const dpr = window.devicePixelRatio || 1; const W = canvas.width / dpr; const cx = W / 2; const cy = W / 2; const r = cx - 4;
    const n = dishes.length; if (!n) return; const slice = (2 * Math.PI) / n;
    const colors = ['#ff6b6b','#ffa94d','#69db7c','#4dabf7','#f06595','#ffd43b','#a9e34b','#74c0fc','#e599f7','#ff922b'];
    ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, W);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
    for (let i = 0; i < n; i++) {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, i * slice, (i + 1) * slice);
      const isHl = (hlIdx != null && hlIdx >= 0 && i === hlIdx);
      ctx.fillStyle = isHl ? '#fff' : colors[i % colors.length]; ctx.fill();
      ctx.strokeStyle = isHl ? colors[i % colors.length] : '#fff'; ctx.lineWidth = isHl ? 3 : 2; ctx.stroke();
      ctx.save(); ctx.rotate(i * slice + slice / 2);
      ctx.fillStyle = isHl ? colors[i % colors.length] : '#fff';
      ctx.font = 'bold 11px "PingFang SC","Microsoft YaHei","Hiragino Sans GB",sans-serif'; ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const maxW = r - 14; let txt = dishes[i]; let w = ctx.measureText(txt).width;
      while (w > maxW && txt.length > 2) { txt = txt.slice(0, -1); w = ctx.measureText(txt + '..').width; }
      if (txt !== dishes[i]) txt += '..';
      ctx.fillText(txt, r - 8, 0); ctx.restore();
    }
    ctx.restore(); ctx.restore();
  }
  function eatDrawWheel(dishes, hlIdx) { const c = document.getElementById('eat-wheel'); if (!c) return; eatDrawWheelCore(c, dishes, hlIdx, eatSpinAngle); }
  function eatIdxUnderPtr(normalized, n, slice) { return Math.floor((((3 * Math.PI / 2 - normalized) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)) / slice) % n; }
  function eatSpinWheel(dishes, cb) {
    if (eatSpinning) return;
    if (!dishes.length) { toast('当前菜单是空的，先添加菜名'); return; }
    eatSpinning = true; eatSetBtns(true);
    const totalAngle = eatSpinAngle + (3 + Math.random() * 4) * Math.PI * 2 + Math.random() * Math.PI * 2;
    const startAngle = eatSpinAngle; const duration = 3200; const startTime = Date.now();
    const de = document.getElementById('eat-dish'); const flashDishes = dishes.slice();
    let flashIdx = 0; let flashTimer;
    function flashTick(t) {
      const interval = Math.max(40, Math.round(50 + t * 400));
      flashTimer = setTimeout(() => {
        if (!eatSpinning) return;
        flashIdx = (flashIdx + 1) % flashDishes.length;
        if (de) { de.classList.add('fade'); setTimeout(() => { de.textContent = flashDishes[flashIdx]; de.classList.remove('fade'); }, 80); }
        if (eatSpinning) flashTick(Math.min((Date.now() - startTime) / duration, 1));
      }, interval);
    }
    flashTick(0);
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function tick() {
      const elapsed = Date.now() - startTime; const t = Math.min(elapsed / duration, 1);
      eatSpinAngle = startAngle + (totalAngle - startAngle) * easeOutCubic(t);
      eatDrawWheel(dishes);
      if (t < 1) { eatSpinTimer = requestAnimationFrame(tick); return; }
      eatSpinTimer = null; clearTimeout(flashTimer);
      const n = dishes.length; const slice = 2 * Math.PI / n;
      const normalized = (totalAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const idx = eatIdxUnderPtr(normalized, dishes.length, slice);
      var ptr = document.getElementById('eat-pointer'); if (ptr) { ptr.classList.add('pop'); setTimeout(function () { ptr.classList.remove('pop'); }, 500); }
      eatHlIdx = idx; eatDrawWheel(dishes, idx); vibrate([10, 40, 10]);
      eatHlTimer = setTimeout(function () { eatHlIdx = -1; eatDrawWheel(dishes); eatHlTimer = null; eatSpinning = false; eatSetBtns(false); }, 1200);
      if (cb) cb(dishes[idx]);
    }
    eatSpinTimer = requestAnimationFrame(tick);
  }
  let eatSwAngle = 0, eatSwTimer = null, eatSwSpinning = false, eatSwHlIdx = -1, eatSwHlTimer = null;
  function eatSwitchInitCanvas() { const c = document.getElementById('eat-switch-wheel'); if (!c) return; const dpr = window.devicePixelRatio || 1; const size = 200; c.width = size * dpr; c.height = size * dpr; c.style.width = size + 'px'; c.style.height = size + 'px'; c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0); }
  function eatSwitchDraw(names, hlIdx) { const c = document.getElementById('eat-switch-wheel'); if (!c) return; eatDrawWheelCore(c, names, hlIdx, eatSwAngle); }
  function eatSwitchClear() { if (eatSwTimer) { cancelAnimationFrame(eatSwTimer); eatSwTimer = null; } if (eatSwHlTimer) { clearTimeout(eatSwHlTimer); eatSwHlTimer = null; } eatSwSpinning = false; eatSwHlIdx = -1; }
  function eatSwitchOpen() {
    const ov = document.getElementById('eat-switch-overlay'); if (!ov) return;
    const menus = eatMenus();
    if (menus.length < 2) { toast('只有 1 个菜单，先在「编辑菜单」里新建更多菜单吧'); return; }
    eatSwitchClear(); eatSwitchInitCanvas(); ov.hidden = false; eatSwAngle = 0;
    eatSwitchDraw(menus.map(m => m.name));
    eatSwitchRenderChips();
    const nameEl = document.getElementById('eat-switch-name'); if (nameEl) nameEl.textContent = '点下方按钮开始转';
    const goBtn = document.getElementById('eat-switch-go'); if (goBtn) { goBtn.disabled = false; goBtn.textContent = '开始转'; }
  }
  function eatSwitchRenderChips() {
    const box = document.getElementById('eat-switch-chips'); if (!box) return;
    const menus = eatMenus(); const cur = eatCurMenuIdx();
    box.innerHTML = menus.map((m, i) => '<span class="eat-chip' + (i === cur ? ' on' : '') + '" data-i="' + i + '">' + eatEsc(m.name) + '</span>').join('');
  }
  function eatSwitchTo(i) {
    const menus = eatMenus(); if (i < 0 || i >= menus.length) return;
    if (i === eatCurMenuIdx()) { eatSwitchClose(); return; }
    const name = menus[i].name;
    eatSwitchClose();
    eatSaveCurMenuIdx(i); eatClearSpin();
    eatRenderCurName(); eatLastPick = eatPick(); eatRenderHistory();
    toast('已切换到「' + name + '」');
  }
  document.getElementById('eat-switch-chips').addEventListener('click', (e) => {
    const t = e.target.closest('.eat-chip'); if (!t) return;
    const i = parseInt(t.getAttribute('data-i'), 10); if (isNaN(i)) return;
    eatSwitchTo(i);
  });
  function eatSwitchClose() { eatSwitchClear(); const ov = document.getElementById('eat-switch-overlay'); if (ov) ov.hidden = true; }
  function eatSwitchSpin() {
    if (eatSwSpinning) return;
    const menus = eatMenus(); const names = menus.map(m => m.name);
    if (names.length < 2) return;
    eatSwSpinning = true;
    const goBtn = document.getElementById('eat-switch-go'); if (goBtn) goBtn.disabled = true;
    const totalAngle = eatSwAngle + (3 + Math.random() * 4) * Math.PI * 2 + Math.random() * Math.PI * 2;
    const startAngle = eatSwAngle; const duration = 3200; const startTime = Date.now();
    const nameEl = document.getElementById('eat-switch-name');
    let flashIdx = 0, flashTimer;
    function flashTick(t) {
      const interval = Math.max(40, Math.round(50 + t * 400));
      flashTimer = setTimeout(() => {
        if (!eatSwSpinning) return;
        flashIdx = (flashIdx + 1) % names.length;
        if (nameEl) { nameEl.classList.add('fade'); setTimeout(() => { nameEl.textContent = names[flashIdx]; nameEl.classList.remove('fade'); }, 80); }
        if (eatSwSpinning) flashTick(Math.min((Date.now() - startTime) / duration, 1));
      }, interval);
    }
    flashTick(0);
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function tick() {
      const elapsed = Date.now() - startTime; const t = Math.min(elapsed / duration, 1);
      eatSwAngle = startAngle + (totalAngle - startAngle) * easeOutCubic(t);
      eatSwitchDraw(names);
      if (t < 1) { eatSwTimer = requestAnimationFrame(tick); return; }
      eatSwTimer = null; clearTimeout(flashTimer);
      const n = names.length; const slice = 2 * Math.PI / n;
      const normalized = (totalAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const idx = eatIdxUnderPtr(normalized, names.length, slice);
      const ptr = document.getElementById('eat-switch-pointer'); if (ptr) { ptr.classList.add('pop'); setTimeout(() => ptr.classList.remove('pop'), 500); }
      eatSwHlIdx = idx; eatSwitchDraw(names, idx); vibrate([10, 40, 10]);
      if (nameEl) { nameEl.classList.add('fade'); setTimeout(() => { nameEl.textContent = names[idx]; nameEl.classList.remove('fade'); }, 200); }
      eatSwHlTimer = setTimeout(() => {
        eatSwHlIdx = -1; eatSwSpinning = false; eatSwHlTimer = null;
        eatSaveCurMenuIdx(idx); eatClearSpin();
        eatRenderCurName(); eatLastPick = eatPick(); eatRenderHistory();
        eatSwitchClose(); toast('已切换到「' + names[idx] + '」');
      }, 1200);
    }
    eatSwTimer = requestAnimationFrame(tick);
  }
  function eatAlignWheelToDish(dish) {
    const dishes = eatDishes(); const i = dishes.indexOf(dish);
    if (i < 0) return;
    const slice = 2 * Math.PI / dishes.length;
    eatSpinAngle = ((3 * Math.PI / 2 - (i + 0.5) * slice) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    eatDrawWheel(dishes);
  }
  function eatPick() {
    const dishes = eatDishes();
    if (!dishes.length) {
      const de2 = document.getElementById('eat-dish'); const ce2 = document.getElementById('eat-comment');
      if (de2) { de2.classList.add('fade'); setTimeout(() => { de2.textContent = '空菜单，先添加菜名'; de2.classList.remove('fade'); }, 200); }
      if (ce2) { ce2.classList.add('fade'); setTimeout(() => { ce2.textContent = ''; ce2.classList.remove('fade'); }, 200); }
      return '';
    }
    const dish = dishes[Math.floor(Math.random() * dishes.length)];
    const comments = DEF_EAT_COMMENTS; const comment = comments[Math.floor(Math.random() * comments.length)];
    const de = document.getElementById('eat-dish'); const ce = document.getElementById('eat-comment');
    if (de) { de.classList.add('fade'); setTimeout(() => { de.textContent = dish; de.classList.remove('fade'); }, 200); }
    if (ce) { ce.classList.add('fade'); setTimeout(() => { ce.textContent = '\u201c' + comment + '\u201d'; ce.classList.remove('fade'); }, 200); }
    eatAlignWheelToDish(dish);
    return dish + ' · ' + comment;
  }
  let eatLastPick = '';
  if (eatApp) eatApp.addEventListener('click', () => { if (editingNow()) return; eatClearSpin(); eatInitCanvas(); openPage(eatPage); eatRenderCurName(); eatLastPick = eatPick(); eatRenderHistory(); eatRenderRemind(); eatRemindSweep(); });
  document.getElementById('eat-back').addEventListener('click', () => { eatClearSpin(); backHome(eatPage); });
  (function () {
    var de = document.getElementById('eat-dish'); if (!de) return;
    var pressTimer = null;
    de.addEventListener('touchstart', function (e) { if (e.touches.length > 1) return; pressTimer = setTimeout(function () { rmDish(); }, 600); }, { passive: true });
    de.addEventListener('touchend', function () { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });
    de.addEventListener('touchmove', function () { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } }, { passive: true }); // #721 同上，被动化
    de.addEventListener('mousedown', function () { pressTimer = setTimeout(function () { rmDish(); }, 600); });
    de.addEventListener('mouseup', function () { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });
    de.addEventListener('mouseleave', function () { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });
    function rmDish() {
      pressTimer = null; if (eatSpinning) return;
      var de2 = document.getElementById('eat-dish'); var curDish = de2 ? de2.textContent : '';
      if (!curDish || curDish === '…') return;
      if (!window.openModal) return;
      window.openModal('删除菜名', '', function (v) {
        if (!v) return;
        const cur = eatCurMenu(); const i = cur.menu.dishes.indexOf(curDish);
        if (i < 0) { toast('当前菜单里没有「' + curDish + '」'); return; }
        if (cur.menu.dishes.length <= 1) { toast('菜单至少留 1 道菜，未删除'); return; }
        cur.menu.dishes.splice(i, 1); cur.menus[cur.idx] = cur.menu; eatSaveMenus(cur.menus);
        eatDrawWheel(eatDishes()); eatLastPick = eatPick(); eatRenderHistory(); toast('已移除');
      }, { noInput: true, staticText: '要从当前菜单移除「' + curDish + '」吗？' });
    }
  })();
  document.getElementById('eat-change').addEventListener('click', () => { if (editingNow() || eatSpinning) return; eatLastPick = eatPick(); eatDrawWheel(eatDishes()); });
  document.getElementById('eat-send').addEventListener('click', () => { if (editingNow() || eatSpinning) return; if (eatLastPick && window.chatAddIn) { try { window.chatAddIn(eatLastPick); } catch (e) {} toast('已发送'); } });
  document.getElementById('eat-add').addEventListener('click', () => { if (!window.openModal) return; window.openModal('添加菜名', '', (v) => { if (!v) return; const cur = eatCurMenu(); if (cur.menu.dishes.indexOf(v) >= 0) { toast('当前菜单已有「' + v + '」'); return; } cur.menu.dishes.push(v); cur.menus[cur.idx] = cur.menu; eatSaveMenus(cur.menus); eatDrawWheel(eatDishes()); toast('已添加到「' + cur.menu.name + '」'); }); });
  document.getElementById('eat-spin').addEventListener('click', () => { if (editingNow() || eatSpinning) return; const dishes = eatDishes(); eatSpinWheel(dishes, (dish) => { const de = document.getElementById('eat-dish'); if (de) { de.classList.add('fade'); setTimeout(() => { de.textContent = dish; de.classList.remove('fade'); }, 200); } const ce = document.getElementById('eat-comment'); const comments = DEF_EAT_COMMENTS; const comment = comments[Math.floor(Math.random() * comments.length)]; if (ce) { ce.classList.add('fade'); setTimeout(() => { ce.textContent = '\u201c' + comment + '\u201d'; ce.classList.remove('fade'); }, 200); } eatLastPick = dish + ' · ' + comment; eatPushHistory(dish); }); });
  document.getElementById('eat-askta').addEventListener('click', () => { if (editingNow() || eatSpinning) return; if (!eatLastPick) { eatLastPick = eatPick(); } if (!eatLastPick) { toast('当前菜单是空的，先添加菜名'); return; } const m = eatLastPick.match(/^(.+?) ·/); const dish = m ? m[1] : eatLastPick; const msg = EAT_ASK_MSGS[Math.floor(Math.random() * EAT_ASK_MSGS.length)].replace('{0}', dish); if (window.chatSendMsg) { try { window.chatSendMsg(msg); } catch (e) {} toast('已发送'); } });
  let eatEditIdx = 0;
  function eatEsc(s) { return String(s).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])); }
  function eatRenderMenuChips() {
    const box = document.getElementById('eat-menu-chips'); if (!box) return;
    const menus = eatMenus();
    box.innerHTML = menus.map((m, i) => '<span class="eat-chip' + (i === eatEditIdx ? ' on' : '') + '" data-i="' + i + '">' + eatEsc(m.name) + '</span>').join('');
  }
  function eatEditFill() {
    const menus = eatMenus(); if (eatEditIdx >= menus.length) eatEditIdx = 0;
    const ta = document.getElementById('eat-menu-ta'); if (ta) ta.value = menus[eatEditIdx].dishes.join('\n');
    eatRenderMenuChips();
  }
  document.getElementById('eat-menu-btn').addEventListener('click', () => {
    const panel = document.getElementById('eat-menu-panel');
    if (panel.hidden) { eatEditIdx = eatCurMenuIdx(); eatEditFill(); panel.hidden = false; } else { panel.hidden = true; }
  });
  document.getElementById('eat-menu-save').addEventListener('click', () => {
    const ta = document.getElementById('eat-menu-ta'); const lines = ta.value.split('\n').map(s => s.trim()).filter(s => s);
    if (lines.length < 1) { toast('至少输入 1 个菜名'); return; }
    const menus = eatMenus(); if (eatEditIdx >= menus.length) eatEditIdx = 0;
    menus[eatEditIdx].dishes = lines; eatSaveMenus(menus);
    if (eatEditIdx === eatCurMenuIdx()) { eatDrawWheel(eatDishes()); eatLastPick = eatPick(); }
    toast('「' + menus[eatEditIdx].name + '」已保存（' + lines.length + ' 道）');
  });
  document.getElementById('eat-menu-reset').addEventListener('click', () => {
    const ta = document.getElementById('eat-menu-ta'); if (ta) ta.value = DEF_EAT_DISHES.join('\n');
    toast('已填入默认 ' + DEF_EAT_DISHES.length + ' 道菜，点「保存菜单」生效');
  });
  document.getElementById('eat-menu-chips').addEventListener('click', (e) => {
    const t = e.target.closest('.eat-chip'); if (!t) return;
    eatEditIdx = parseInt(t.getAttribute('data-i'), 10) || 0; eatEditFill();
  });
  document.getElementById('eat-menu-new').addEventListener('click', () => {
    if (!window.openModal) return;
    window.openModal('新建菜单', '', (v) => {
      if (!v) return; const menus = eatMenus();
      if (menus.some(m => m.name === v)) { toast('已有同名菜单'); return; }
      menus.push({ name: v, dishes: [] }); eatSaveMenus(menus);
      eatEditIdx = menus.length - 1; eatEditFill(); toast('已新建「' + v + '」（空菜单，可在下方添加菜名）');
    }, { placeholder: '如：家常菜 / 外卖 / 夜宵' });
  });
  document.getElementById('eat-menu-rename').addEventListener('click', () => {
    if (!window.openModal) return; const menus = eatMenus(); if (eatEditIdx >= menus.length) eatEditIdx = 0;
    const oldName = menus[eatEditIdx].name;
    window.openModal('重命名菜单', oldName, (v) => {
      if (!v || v === oldName) return;
      if (menus.some((m, i) => i !== eatEditIdx && m.name === v)) { toast('已有同名菜单'); return; }
      menus[eatEditIdx].name = v; eatSaveMenus(menus); eatEditFill();
      if (eatEditIdx === eatCurMenuIdx()) eatRenderCurName();
      toast('已重命名为「' + v + '」');
    });
  });
  document.getElementById('eat-menu-del').addEventListener('click', () => {
    const menus = eatMenus(); if (menus.length <= 1) { toast('至少保留 1 个菜单'); return; }
    if (eatEditIdx >= menus.length) eatEditIdx = 0;
    const name = menus[eatEditIdx].name;
    if (!window.openModal) return;
    window.openModal('删除菜单', '', (v) => {
      if (!v) return;
      const wasCur = eatEditIdx === eatCurMenuIdx();
      menus.splice(eatEditIdx, 1); eatSaveMenus(menus);
      if (wasCur) { eatSaveCurMenuIdx(0); } else if (eatEditIdx < eatCurMenuIdx()) { eatSaveCurMenuIdx(eatCurMenuIdx() - 1); }
      if (eatEditIdx >= menus.length) eatEditIdx = menus.length - 1;
      eatEditFill(); eatRenderCurName(); eatDrawWheel(eatDishes()); eatLastPick = eatPick();
      toast('已删除「' + name + '」');
    }, { noInput: true, staticText: '要删除菜单「' + name + '」吗？此操作不可撤销。' });
  });
  document.getElementById('eat-switch-menu').addEventListener('click', () => { if (editingNow() || eatSpinning) return; eatSwitchOpen(); });
  document.getElementById('eat-switch-cancel').addEventListener('click', () => { eatSwitchClose(); });
  document.getElementById('eat-switch-go').addEventListener('click', () => { eatSwitchSpin(); });
  document.addEventListener('contact-switched', function () { eatClearSpin(); eatSwitchClose(); const mp = document.getElementById('eat-menu-panel'); if (mp) mp.hidden = true; });
  const DEF_EAT_REMIND = ['到饭点啦，去吃饭吧', '该吃饭了哦，别饿着', '今天吃 {d} 怎么样？就它了', '{d} 挺好的，去吃这个吧', '记得吃热乎的，别随便对付一口', '去吃饭吧，吃完跟我说说吃了什么', '别忙忘了吃饭，胃是自己的', '我看着呢，快去吃饭', '放下手里的事，先吃饭好不好', '饭要按时吃，我才会放心', '好好吃饭的人，运气不会太差哦', '饿了就去做点吃的，别硬撑'];
  const DEF_EAT_REMIND_CARE = ['吃了什么呀？说给我听听', '吃饱了吗？没饱再去添一点', '吃得合胃口吗？', '慢慢吃，不着急', '记得配点汤汤水水', '吃完了就休息一会儿吧'];
  const DEF_EAT_REMIND_NIGHT = ['夜深了，饿不饿？想吃点夜宵吗', '这个点还没睡呀，要不要来点夜宵', '饿着肚子睡觉可不好，去弄点吃的吧', '夜宵别吃太撑，留点肚子给梦', '偷偷问一句，今晚想吃夜宵吗', '去煮碗热乎的面吧，我陪你吃', '深夜的胃，也该被好好对待', '别只啃饼干，夜宵也要认真吃', '吃夜宵的人，今晚会做甜甜的梦', '要不要我给你留一盏灯，你去觅食'];
  const DEF_EAT_REMIND_NIGHT_CARE = ['夜宵吃的什么呀？说给我听听', '吃饱了就快去睡，别熬太晚', '吃完夜宵记得刷个牙再睡哦', '太晚就别吃太辣的，伤胃', '夜宵吃完了就躺下吧，我守着'];
  const EAT_REMIND_WINDOWS = [['breakfast', 390, 570], ['lunch', 660, 810], ['dinner', 1020, 1170], ['nightcap', 1290, 1410]];
  function eatDayKey() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function eatRemindEn() { const s = curStore(); const v = s && s.get('eat-remind-en'); return v === null ? true : v === '1'; }
  function eatRemindSetEn(on) { const s = curStore(); if (s) try { s.set('eat-remind-en', on ? '1' : '0'); } catch (e) {} }
  function eatRemindProb() { const s = curStore(); try { const n = parseInt(s && s.get('eat-remind-prob'), 10); if (!isNaN(n)) return Math.max(0, Math.min(100, n)); } catch (e) {} return 2; }
  function eatRenderRemind() {
    const t = document.getElementById('eat-remind-toggle');
    if (t) t.textContent = 'TA 提醒：' + (eatRemindEn() ? '开' : '关');
    const p = document.getElementById('eat-remind-prob');
    if (p) p.textContent = '触发概率 ' + eatRemindProb() + '%';
  }
  function eatRemindFire(code) {
    const s = curStore(); if (!s) return;
    try { s.set('eat-remind-done:' + code + ':' + eatDayKey(), '1'); } catch (e) {}
    const dishes = eatDishes();
    const dish = dishes.length ? dishes[Math.floor(Math.random() * dishes.length)] : '';
    let text = '';
    const isNight = code === 'nightcap';
    const pool = isNight ? libPool('eat', '夜宵提醒', DEF_EAT_REMIND_NIGHT) : libPool('eat', '提醒吃饭', DEF_EAT_REMIND);
    if (pool.length) text = pool[Math.floor(Math.random() * pool.length)] || '';
    if (!text) return;
    text = text.replace(/\{d\}/g, dish || '饭');
    if (window.chatAddIn) { try { window.chatAddIn(text, { tag: '吃饭提醒' }); } catch (e) {} }
    try { if (navigator.vibrate) navigator.vibrate([80, 60, 80]); } catch (e) {}
    if (Math.random() * 100 < dcfP('eat', 35)) {
      setTimeout(() => {
        const care = isNight ? libPool('eat', '夜宵关心', DEF_EAT_REMIND_NIGHT_CARE) : libPool('eat', '追问关心', DEF_EAT_REMIND_CARE);
        if (care.length && window.chatAddIn) { try { window.chatAddIn(care[Math.floor(Math.random() * care.length)], { silent: true, tag: '吃饭提醒' }); } catch (e) {} }
      }, 1400);
    }
  }
  function eatRemindSweep() {
    try {
      const pfx = (window.activePrefix ? window.activePrefix() : 'xy-home-v2:default'); // 无尾冒号：xyStore 合键时自己补 ':'
      const scan = pfx + ':eat-remind-done:';
      const today = eatDayKey(); const dead = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf(scan) === 0 && k.slice(-10) !== today) dead.push(k);
      }
      dead.forEach(function (k) { try { window.xyStore(pfx).remove(k.slice(pfx.length + 1)); } catch (e) {} });
    } catch (e) {}
  }
  function eatRemindMaybe() {
    try {
      eatRemindSweep();
      if (!window.chatAddIn) return;
      const h = new Date().getHours(); if (h >= 23 || h < 6) return; // v3.26.x：23:00-06:00 静默期，不提醒吃饭（深更半夜吃饭提醒离谱）
      if (!eatRemindEn()) return;
      const now = new Date(); const mins = now.getHours() * 60 + now.getMinutes();
      const w = EAT_REMIND_WINDOWS.find(x => mins >= x[1] && mins <= x[2]);
      if (!w) return;
      const s = curStore(); if (!s) return;
      if (s.get('eat-remind-done:' + w[0] + ':' + eatDayKey()) === '1') return;
      if (Math.random() * 100 >= eatRemindProb()) return;
      eatRemindFire(w[0]);
    } catch (e) {}
  }
  eatRemindMaybe(); // 启动即查一次：打开应用时恰在饭点窗口内可立即触发（守卫齐备，安全）
  setTimeout(eatRemindMaybe, 60000);
  setInterval(eatRemindMaybe, 240000);
  document.getElementById('eat-remind-toggle').addEventListener('click', () => {
    if (editingNow()) return;
    const on = !eatRemindEn();
    eatRemindSetEn(on); eatRenderRemind();
    toast(on ? '已开启：TA 会偶尔在饭点发字卡提醒你吃饭' : '已关闭：TA 不再饭点提醒');
  });
  document.getElementById('eat-remind-prob').addEventListener('click', () => {
    if (!window.openModal) return;
    window.openModal('触发概率（%）', String(eatRemindProb()), (v) => {
      if (v === null || v === '') return;
      const n = parseInt(v, 10);
      if (isNaN(n) || n < 0 || n > 100) { toast('请输入 0-100 的整数'); return; }
      const s = curStore(); if (s) try { s.set('eat-remind-prob', String(n)); } catch (e) {}
      eatRenderRemind(); toast(n <= 0 ? '已设置：基本不会触发' : '已设置：每个饭点约 ' + n + '%/4分钟 概率触发');
    });
  });
})();
window.__mochiLoaded.push("p2-features.js");
}catch(e){console.error("p2-features.js",e);window.__jsErrors.push("p2-features.js: "+String(e));window.__mochiErrLoaded.push("p2-features.js");}})();