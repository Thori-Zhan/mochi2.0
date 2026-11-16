(() => {
  const phone = document.querySelector('.phone');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const snow = '<svg class="motion-snow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v20M3.34 7l17.32 10M3.34 17 20.66 7M9 4l3 3 3-3M9 20l3-3 3 3M3.6 10.6l4.1-1.1-1.1-4.1M20.4 13.4l-4.1 1.1 1.1 4.1M6.6 18.6l1.1-4.1-4.1-1.1M17.4 5.4l-1.1 4.1 4.1 1.1"/></svg>';
  const chat = document.getElementById('page-chat');
  const body = document.getElementById('chat-body');
  const loading = document.getElementById('chat-loading');
  loading.querySelector('.chat-loading-card').innerHTML = snow + '<span class="chat-loading-txt" role="status">正在读取聊天记录…</span>';
  let current = null;
  function arrive(surface) {
    if (!surface || reduced.matches) return;
    surface.classList.remove('motion-arrive');
    void surface.offsetWidth;
    surface.classList.add('motion-arrive');
  }
  phone.addEventListener('animationend', e => {
    if (e.animationName === 'motion-arrive') e.target.classList.remove('motion-arrive');
  });
  let pendingFrame;
  function syncPage() {
    pendingFrame = null;
    const settings = document.getElementById('auto-theme-page');
    const next = settings && !settings.hidden ? settings : [...phone.querySelectorAll(':scope > .page')].find(page => !page.hidden);
    if (next === current) return;
    current = next;
    if (document.getElementById('opening-screen')?.hidden !== false) arrive(next);
  }
  new MutationObserver(records => {
    if (!records.some(r => r.target.classList.contains('page') || r.target.id === 'auto-theme-page')) return;
    if (!pendingFrame) pendingFrame = requestAnimationFrame(syncPage);
  }).observe(phone, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
  let wasReading = !loading.hidden;
  new MutationObserver(() => {
    const reading = !loading.hidden;
    if (wasReading && !reading && !chat.hidden) arrive(body);
    wasReading = reading;
  }).observe(loading, { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('mochi-opening-done', () => { syncPage(); arrive(current); });
  syncPage();
})();
