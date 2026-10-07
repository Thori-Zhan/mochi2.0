// No splash, forced notice, animation or automatic notice request.
(function () {
  const status = document.createElement('div');
  status.id = 'private-startup-status'; status.role = 'status';
  status.textContent = '正在恢复本地数据…';
  document.body.appendChild(status);
  function ready() { status.hidden = !!window.__mochiDataReady; }
  document.addEventListener('mochi-restore-done', ready); ready();
  // Non-visible error evidence for local regression checks; no diagnostic page or polling.
  document.body.dataset.privateErrors = JSON.stringify(window.__jsErrors || []);
  window.addEventListener('error', e => { document.body.dataset.privateErrors = JSON.stringify([...(window.__jsErrors || []), String(e.message)]); });
  const labels = {'page-phone':'首页','page-chat':'聊天','page-chatcard':'字卡库','page-setting':'设置'};
  document.querySelectorAll('.tabbar .tab').forEach(tab=>{
    tab.setAttribute('role','button');tab.setAttribute('aria-label',labels[tab.dataset.page]||tab.dataset.page);tab.tabIndex=0;
    tab.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tab.click();}});
  });
  const input = document.getElementById('chat-input');
  const send = document.getElementById('chat-send');
  const more = document.getElementById('chat-more-btn');
  const draftItems = document.getElementById('chat-draft-items');
  function sync() {
    const hasText = !!input?.textContent.trim() || !!draftItems?.childElementCount;
    const chat = document.getElementById('page-chat');
    if (chat) chat.dataset.privateHasText = String(hasText);
    if (send) send.style.setProperty('display', hasText ? 'inline-flex' : 'none', 'important');
    if (more) more.style.setProperty('display', hasText ? 'none' : 'inline-flex', 'important');
  }
  if (input) { input.addEventListener('input', sync); new MutationObserver(sync).observe(input, { childList:true, subtree:true, characterData:true }); }
  if (draftItems) new MutationObserver(sync).observe(draftItems, {childList:true,subtree:true});
  sync();
  if (more) more.querySelector('svg').innerHTML = '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 12h10M12 7v10" fill="none" stroke="currentColor" stroke-width="1.6"/>';
  // Image sending remains available through the existing image handler, now in the + panel.
  const panel = document.getElementById('more-grid-fun');
  const image = document.getElementById('chat-img-btn');
  if (panel && image) {
    const b = document.createElement('button'); b.className = 'more-item'; b.id = 'private-image'; b.type = 'button'; b.dataset.mcat = 'chat';
    b.innerHTML = '<span class="mi-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></span><span>图片</span>';
    b.addEventListener('click', () => image.click()); panel.prepend(b);
  }
})();
