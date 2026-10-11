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
    panel.prepend(b);
    // Keep the native file input on the visible entry, not the hidden legacy button.
    const picker = document.getElementById('chat-img-pick');
    const surface = picker && window.mochiFilePickSurface
      ? window.mochiFilePickSurface(b, { id: 'private-chat-img-tap', accept: 'image/*', multiple: true, owner: picker })
      : null;
    if (surface) {
      surface.addEventListener('click', e => e.stopPropagation());
      surface.addEventListener('change', () => {
        const morePanel = document.getElementById('chat-more-panel');
        if (morePanel) morePanel.hidden = true;
      });
    }
    b.addEventListener('click', e => {
      e.stopPropagation();
      if (picker && window.mochiFilePickFire) window.mochiFilePickFire(picker);
      else image.click();
    });
  }
})();

// Calendar is a read-only view of existing local chat records. No history copies or writes.
(function () {
  const search=document.getElementById('chat-search');const phone=document.querySelector('.phone');
  if(!search||!phone)return;
  const entry=document.createElement('button');entry.type='button';entry.id='private-chat-dates';entry.className='private-date-entry';entry.textContent='按日期查找';
  search.querySelector('.chat-search-bar')?.before(entry);
  const page=document.createElement('section');page.id='page-private-dates';page.className='page private-date-page';page.hidden=true;
  page.innerHTML='<header class="private-date-head"><button type="button" aria-label="返回聊天">‹</button><strong>按日期查找</strong><span></span></header><div class="private-date-controls"><input type="month" aria-label="选择年月"><button type="button">今天</button></div><div class="private-date-week"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div><div class="private-date-months"></div><p class="private-date-status" role="status"></p>';
  phone.insertBefore(page,document.querySelector('.tabbar'));
  const picker=page.querySelector('input');const nowKey=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');};
  picker.value=nowKey();let retry=null,scroll=0;
  function close(){clearTimeout(retry);scroll=page.querySelector('.private-date-months').scrollTop;document.querySelector('.tabbar [data-page="page-chat"]')?.click();}
  function render(){
    clearTimeout(retry);
    const snapshot=window.privateChatDateIndex?.();if(!snapshot)return;
    const counts=snapshot.counts;const dates=Object.keys(counts).sort();picker.min=dates[0]?.slice(0,7)||nowKey();picker.max=nowKey();
    const box=page.querySelector('.private-date-months');const top=box.scrollTop;box.replaceChildren();
    const [year,month]=picker.value.split('-').map(Number);
    for(let offset=-1;offset<=0;offset++){
      const first=new Date(year,month-1+offset,1),y=first.getFullYear(),m=first.getMonth();
      const h=document.createElement('h3');h.textContent=y+'年'+(m+1)+'月';box.appendChild(h);
      const grid=document.createElement('div');grid.className='private-date-grid';for(let i=0;i<first.getDay();i++)grid.appendChild(document.createElement('span'));
      for(let d=1;d<=new Date(y,m+1,0).getDate();d++){
        const key=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
        const b=document.createElement('button');b.type='button';b.textContent=d;b.disabled=!counts[key]||snapshot.loading;b.dataset.date=key;
        b.setAttribute('aria-label',key+(counts[key]?' '+counts[key]+'条消息':' 无聊天记录'));
        if(new Date(y,m,d).toDateString()===new Date().toDateString())b.className='private-date-today';
        b.addEventListener('click',()=>{close();requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!window.privateChatJumpDate?.(key))window.toast?.('记录尚未就绪，请稍后再试');}));});grid.appendChild(b);
      }
      box.appendChild(grid);
    }
    box.scrollTop=top;
    page.querySelector('.private-date-status').textContent=snapshot.loading?'正在读取更早的本地记录…':dates.length?'深色日期有聊天记录':'还没有带日期的聊天记录';
    if(snapshot.loading&&!page.hidden)retry=setTimeout(render,800);
  }
  entry.addEventListener('click',e=>{e.stopPropagation();search.hidden=true;document.activeElement?.blur?.();document.querySelectorAll('.phone > .page').forEach(p=>p.hidden=p!==page);page.hidden=false;render();page.querySelector('.private-date-months').scrollTop=scroll;});
  const moreSearch=document.getElementById('more-search');
  if(moreSearch){const quick=document.createElement('button');quick.type='button';quick.className='more-item';quick.dataset.mcat=moreSearch.dataset.mcat||'tool';quick.innerHTML='<span class="mi-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18M8 15h2M14 15h2"/></svg></span><span>按日期查找</span>';quick.addEventListener('click',e=>{e.stopPropagation();const panel=document.getElementById('chat-more-panel');if(panel)panel.hidden=true;entry.click();});moreSearch.after(quick);}
  page.querySelector('.private-date-head button').addEventListener('click',close);
  picker.addEventListener('change',()=>{if(picker.value){scroll=0;render();page.querySelector('.private-date-months').scrollTop=0;}});
  page.querySelector('.private-date-controls button').addEventListener('click',()=>{picker.value=nowKey();render();});
  new MutationObserver(()=>{if(page.hidden)clearTimeout(retry);}).observe(page,{attributes:true,attributeFilter:['hidden']});
})();

// Private navigation preferences contain only app IDs, never conversation data.
(function () {
  const page = document.getElementById('page-setting');
  const grid = document.querySelector('#page-phone .app-grid');
  if (!page || !grid) return;
  const sections = [...page.querySelectorAll('.them-sec')];
  const find = name => sections.find(s => s.dataset.sec === name);
  const basic = find('basic'), tools = find('tools'), system = find('system');
  if (basic && tools) {
    [...basic.querySelectorAll('.set-group')].forEach(g => {
      if (g.querySelector('#row-export,#row-import') || /清除本地数据/.test(g.textContent)) tools.appendChild(g);
    });
  }
  if (system && tools) [...system.querySelectorAll('.set-group')].forEach(g => {
    if (/应用锁/.test(g.textContent)) tools.appendChild(g);
  });
  const tracking = document.getElementById('sf-checkin-row');
  if (tracking && system) { const group=document.createElement('div');group.className='set-group glass';group.appendChild(tracking);system.appendChild(group); }
  if (tools && basic) {
    const divination = document.getElementById('row-open-divination');
    if(divination) find('chat')?.appendChild(divination.closest('.set-group') || divination);
    const oldInsets = document.getElementById('safe-top-force');
    if(oldInsets) oldInsets.closest('.set-group')?.setAttribute('hidden','');
  }
  sections.forEach(s=>s.querySelectorAll('.set-group').forEach(g=>{if(!g.querySelector('.set-row,input,button'))g.hidden=true;}));
  const tabs = document.getElementById('set-tabs');
  if (tabs) tabs.hidden = true;
  const menu = document.createElement('div'); menu.className = 'private-settings-menu';
  const back = document.createElement('button'); back.type = 'button'; back.className = 'private-settings-back'; back.textContent = '‹ 返回设置'; back.hidden = true;
  const cats = [['chat','聊天','回复方式 · 通话 · 音效'],['basic','外观','深色模式 · 手机桌面美化'],['tools','数据','备份 · 恢复 · 本机存储'],['system','自动互动','互动设置 · 后台运行 · 通知']];
  if (system) {
    const shortcut=document.createElement('button');shortcut.type='button';shortcut.className='private-settings-category';shortcut.textContent='主动消息、送礼与心意币设置';
    shortcut.addEventListener('click',()=>{document.getElementById('row-general')?.click();});system.prepend(shortcut);
  }
  function show(name) {
    menu.hidden = !!name; back.hidden = !name;
    sections.forEach(s => { s.hidden = s.dataset.sec !== name; });
    const title = page.querySelector('.set-title'); if (title) title.textContent = name ? cats.find(c=>c[0]===name)?.[1] || '设置' : '设置';
  }
  cats.forEach(([id,label,desc]) => {
    const b=document.createElement('button');b.type='button';b.className='private-settings-category';
    const text=document.createElement('span');text.textContent=label;const small=document.createElement('small');small.textContent=desc;text.appendChild(small);b.appendChild(text);
    const arrow=document.createElement('span');arrow.textContent='›';b.appendChild(arrow);b.addEventListener('click',()=>show(id));menu.appendChild(b);
  });
  back.addEventListener('click',()=>{const input=document.getElementById('set-search-input');if(input?.value){input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));}show('');});page.querySelector('.set-title')?.after(back,menu);show('');
  document.querySelector('.tabbar [data-page="page-setting"]')?.addEventListener('click',()=>back.click());
  const search=document.getElementById('set-search-input');search?.addEventListener('input',()=>{menu.hidden=!!search.value.trim();back.hidden=!search.value.trim();if(!search.value.trim())show('');});

  const prefStore=window.xyStore?.('xy-home-v2');const KEY='private-home-layout-v1';
  let prefs={order:[],hidden:[]};try {const p=JSON.parse(prefStore?.get(KEY)||'null');if(p&&Array.isArray(p.order)&&Array.isArray(p.hidden))prefs=p;}catch(e){}
  let apps=[];const idOf=a=>a.dataset.app||a.dataset.deskWidget||'';
  function apply(){apps=[...grid.querySelectorAll(':scope > .app')].filter(a=>idOf(a));apps.forEach((a,i)=>{const pos=prefs.order.indexOf(idOf(a));a.style.order=String(pos<0?prefs.order.length+i:pos);a.hidden=prefs.hidden.includes(idOf(a));});}
  const editor=document.createElement('div');editor.className='private-home-editor';editor.hidden=true;grid.before(editor);
  function save(){prefStore?.set(KEY,JSON.stringify(prefs));apply();render();}
  function render(){editor.replaceChildren();const ordered=[...apps].sort((a,b)=>Number(a.style.order)-Number(b.style.order));ordered.forEach((a,i)=>{
    const row=document.createElement('div');row.className='private-home-edit-row';const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=!prefs.hidden.includes(idOf(a));check.addEventListener('change',()=>{prefs.hidden=prefs.hidden.filter(x=>x!==idOf(a));if(!check.checked)prefs.hidden.push(idOf(a));save();});label.append(check,document.createTextNode(a.querySelector('.app-name')?.textContent||idOf(a)));row.appendChild(label);
    for(const [delta,text] of [[-1,'上移'],[1,'下移']]){const b=document.createElement('button');b.type='button';b.textContent=text;b.disabled=i+delta<0||i+delta>=ordered.length;b.addEventListener('click',()=>{const ids=ordered.map(idOf);[ids[i],ids[i+delta]]=[ids[i+delta],ids[i]];prefs.order=ids;save();});row.appendChild(b);}editor.appendChild(row);
  });const done=document.createElement('button');done.type='button';done.textContent='完成';done.addEventListener('click',()=>editor.hidden=true);editor.appendChild(done);}
  const home=document.getElementById('page-phone');let holdTimer=null,holdPoint=null,held=false;
  const cancelHold=()=>{clearTimeout(holdTimer);holdTimer=null;};
  home.addEventListener('pointerdown',e=>{
    if(e.button!==0||e.target.closest('.app,button,input,a,label,.deco-widget,.private-home-editor'))return;
    holdPoint={x:e.clientX,y:e.clientY};held=false;
    holdTimer=setTimeout(()=>{held=true;apply();render();editor.hidden=false;editor.scrollIntoView({block:'nearest'});},650);
  });
  home.addEventListener('pointermove',e=>{if(holdPoint&&Math.hypot(e.clientX-holdPoint.x,e.clientY-holdPoint.y)>10)cancelHold();});
  ['pointerup','pointercancel','pointerleave'].forEach(name=>home.addEventListener(name,cancelHold));
  home.addEventListener('contextmenu',e=>{if(held)e.preventDefault();});
  document.querySelectorAll('.tabbar .tab').forEach(t=>t.addEventListener('click',()=>{cancelHold();editor.hidden=true;}));
  apply();
  const appearance=find('basic');if(appearance){const b=document.createElement('button');b.type='button';b.className='private-settings-category';b.textContent='首页入口排序与隐藏';b.addEventListener('click',()=>{document.querySelectorAll('.phone > .page').forEach(p=>p.hidden=p.id!=='page-phone');document.querySelector('.tabbar [data-page="page-phone"]')?.click();editor.hidden=false;apply();render();});appearance.appendChild(b);}
})();

// Nested dialogs retain their contents; only the top dialog receives input.
(function () {
  const masks=[...document.querySelectorAll('.modal-mask,.qa-mask,#tc-mask,#chat-more-panel,#emoji-panel,#batch-panel,#voice-panel')];
  const stack=[];
  function sync(){
    const open=m=>!m.hidden&&m.getClientRects().length>0&&getComputedStyle(m).display!=='none';
    masks.forEach(m=>{if(open(m)&&!stack.includes(m))stack.push(m);});
    for(let i=stack.length-1;i>=0;i--)if(!open(stack[i]))stack.splice(i,1);
    const top=stack[stack.length-1];masks.forEach(m=>{const behind=open(m)&&m!==top;if(m.classList.contains('private-dialog-behind')!==behind)m.classList.toggle('private-dialog-behind',behind);if(m.inert!==behind)m.inert=behind;});
  }
  masks.forEach(m=>new MutationObserver(sync).observe(m,{attributes:true,attributeFilter:['hidden','style']}));sync();
})();
