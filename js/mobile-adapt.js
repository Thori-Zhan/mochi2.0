(function(){try{
(function () {
  const root = document.documentElement;
  const mobile = matchMedia('(max-width:900px), (hover:none) and (pointer:coarse)');
  const probe = document.createElement('div');
  probe.id = 'private-viewport-probe';
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:fixed;inset:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);box-sizing:border-box;';
  document.body.appendChild(probe);
  let frame = 0, lastInteraction = 0;
  const check = new URLSearchParams(location.search).has('check');
  const readout = document.createElement('pre');
  readout.id = 'private-screen-readout';
  readout.hidden = !check;
  const checkButton = document.createElement('button');
  checkButton.id = 'private-screen-check';
  checkButton.type = 'button';
  checkButton.textContent = check ? '关闭检查' : '检查屏幕';
  checkButton.setAttribute('aria-controls', readout.id);
  checkButton.setAttribute('aria-expanded', String(check));
  checkButton.style.cssText='position:fixed;right:8px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:10001;min-height:44px;padding:6px 12px;border:1px solid #ccc;border-radius:10px;background:#fff;color:#243246;font-size:13px;';
  checkButton.addEventListener('click', () => {
    readout.hidden = !readout.hidden;
    checkButton.textContent = readout.hidden ? '检查屏幕' : '关闭检查';
    checkButton.setAttribute('aria-expanded', String(!readout.hidden));
    schedule();
  });
  document.body.appendChild(checkButton);
  if (readout) {
    readout.style.cssText='position:fixed;top:90px;left:8px;right:8px;z-index:10000;padding:10px;background:#fff;color:#111;border:1px solid #bbb;border-radius:8px;font:12px/1.5 monospace;pointer-events:none;white-space:pre-wrap;';
    readout.setAttribute('role','status');
    document.body.appendChild(readout);
  }
  const editable = () => document.activeElement?.matches('textarea,input:not([type=button]):not([type=checkbox]):not([type=radio]),[contenteditable="true"]');
  function set(name, value) {
    if (root.style.getPropertyValue(name) !== value) root.style.setProperty(name, value);
  }
  function sync() {
    frame = 0;
    if (!mobile.matches) { root.classList.remove('private-viewport'); return; }
    const bounds = probe.getBoundingClientRect();
    const style = getComputedStyle(probe);
    const vv = window.visualViewport;
    let fullHeight = bounds.height || window.innerHeight;
    const standalone = matchMedia('(display-mode:standalone)').matches || navigator.standalone;
    const topInset = parseFloat(style.paddingTop) || 0;
    if (standalone && topInset > 0 && Math.abs(screen.height - fullHeight - topInset) <= 2) {
      fullHeight += topInset;
    }
    const zoomed = vv && Math.abs(vv.scale - 1) > 0.05;
    const keyboard = !!(editable() && vv && !zoomed && fullHeight - vv.height > 100);
    const height = keyboard ? vv.height : fullHeight;
    if (!(height > 120)) return;
    root.classList.add('private-viewport');
    root.dataset.privateKeyboard = String(keyboard);
    set('--private-viewport-height', Math.round(height) + 'px');
    set('--private-viewport-top', keyboard ? Math.round(vv.offsetTop) + 'px' : '0px');
    set('--private-safe-top', keyboard ? '0px' : style.paddingTop);
    set('--private-safe-bottom', keyboard ? '0px' : style.paddingBottom);
    if (!readout.hidden) requestAnimationFrame(() => {
      const bar = document.querySelector('.tabbar');
      const rect = bar?.getBoundingClientRect();
      const css = bar && getComputedStyle(bar);
      const phone = document.querySelector('.phone')?.getBoundingClientRect();
      const input = document.querySelector('#page-chat .chat-input-row')?.getBoundingClientRect();
      readout.textContent = '底栏尺寸检查 v3\n固定区域：'+Math.round(fullHeight)+'  可见区域：'+Math.round(vv?.height||window.innerHeight)+'\n内高：'+window.innerHeight+'  屏幕：'+screen.height+'\n顶部安全区：'+style.paddingTop+'  底部安全区：'+style.paddingBottom+'\n页面顶边：'+Math.round(phone?.top||0)+'  底边：'+Math.round(phone?.bottom||0)+'\n底栏高：'+Math.round(rect?.height||0)+'  底边：'+Math.round(rect?.bottom||0)+'  留白：'+(css?.paddingBottom||'-')+'\n输入栏底边：'+Math.round(input?.bottom||0)+'\n主屏幕：'+(matchMedia('(display-mode:standalone)').matches||navigator.standalone?'是':'否');
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(sync); }
  for (const event of ['resize','orientationchange','pageshow']) window.addEventListener(event, schedule, {passive:true});
  window.visualViewport?.addEventListener('resize', schedule, {passive:true});
  window.visualViewport?.addEventListener('scroll', schedule, {passive:true});
  document.addEventListener('focusin', schedule);
  document.addEventListener('focusout', () => { schedule(); setTimeout(schedule, 300); });
  document.addEventListener('visibilitychange', schedule);
  mobile.addEventListener('change', schedule);
  for (const event of ['pointerdown','touchmove','keydown','scroll']) window.addEventListener(event, () => { lastInteraction = Date.now(); }, {passive:true,capture:true});
  window.__mochiInteracting = () => Date.now() - lastInteraction < 500;
  window.__mochiSyncScreenVars = schedule;
  window.mochiKbDismiss = () => { if (editable()) document.activeElement.blur(); schedule(); };
  sync();
})();
window.__mochiLoaded.push("mobile-adapt.js");
}catch(e){console.error("mobile-adapt.js",e);window.__jsErrors.push("mobile-adapt.js: "+String(e));window.__mochiErrLoaded.push("mobile-adapt.js");}})();