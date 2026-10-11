// No splash, forced notice, animation or remote announcement request.
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

// Approved appearance and time preferences. These keys never rewrite chat records.
(function () {
  const root=document.documentElement;
  const preferences=window.xyStore?.('xy-home-v2');
  const read=(key,fallback)=>{try{return preferences?.get(key)||localStorage.getItem('xy-home-v2:'+key)||fallback;}catch(e){return fallback;}};
  const write=(key,value)=>{try{if(preferences)preferences.set(key,value);else localStorage.setItem('xy-home-v2:'+key,value);return true;}catch(e){window.toast?.('设置未保存：本机存储不可用');return false;}};
  const palettes={
    blue:{name:'雾蓝茉莉',light:['#f1f5f9','#ffffff','#263d50','#6b8194','#527c9f','#e1edf7','#dce6ee','#d5e7f5'],dark:['#1c2732','#273643','#e5eff8','#a3b9ca','#99c3e3','#314b61','#3c5061','#3b5c75']},
    peach:{name:'奶油杏桃',light:['#faf4ed','#fffcf8','#554236','#8c7565','#ad7054','#f4e4d5','#ebded1','#f2d6be'],dark:['#302820','#3c3229','#f6e8d9','#c6b19e','#dfab86','#554034','#5d4b3e','#704d38']},
    red:{name:'石榴红',light:['#f6f1e7','#fffaf0','#39201e','#806653','#801d23','#eee2ca','#ddcfb5','#801d23'],dark:['#120d0e','#241316','#f4e9d1','#c2ac97','#d14a3c','#3b191d','#51262a','#701c24']}
  };
  let preset=read('private-theme-preset','blue');if(!palettes[preset])preset='blue';
  let timeMode=read('private-time-mode','demand');if(!['demand','all','simple'].includes(timeMode))timeMode='demand';
  root.dataset.privateTime=timeMode;
  const appearance=document.querySelector('#page-setting .them-sec[data-sec="basic"]');
  const chatSettings=document.querySelector('#page-setting .them-sec[data-sec="chat"]');
  const group=document.createElement('div');group.className='set-group glass private-presets';
  group.innerHTML='<h3>主题预设</h3><div class="private-preset-list"></div><p>配色与日夜模式独立，切换配色不改变当前模式。</p>';
  const quick=document.createElement('button');quick.type='button';quick.id='private-theme-toggle';quick.className='ch-settings';
  document.getElementById('chat-settings-btn')?.before(quick);
  function apply(){
    const dark=root.getAttribute('data-theme')==='dark';const p=palettes[preset][dark?'dark':'light'];
    root.dataset.privatePreset=preset;
    ['bg','panel','ink','muted','accent','soft','line','sent'].forEach((key,i)=>root.style.setProperty('--private-'+key,p[i]));
    const aliases={'page-bg':0,'page-bg-grad':0,'phone-bg-a':0,'phone-bg-b':0,'bg-a':0,'bg-b':0,'card-bg':1,'card-bg-97':1,'glass-bg':1,'input-bg':1,'ink':2,'soft-ink':2,'muted':3,'hint-ink':3,'line':6,'card-border':6,'input-border':6,'btn-bg':4,'btn-ink':dark?'#17212b':'#ffffff'};
    Object.entries(aliases).forEach(([key,value])=>root.style.setProperty('--'+key,typeof value==='number'?p[value]:value));
    root.style.setProperty('--private-bottom-bg',p[1]);root.style.setProperty('--private-blue',p[4]);
    quick.textContent=dark?'☀':'☾';quick.setAttribute('aria-label',dark?'切换日间主题':'切换夜间主题');quick.title=quick.getAttribute('aria-label');
    group.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preset===preset)));
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=p[0];
  }
  Object.entries(palettes).forEach(([id,p])=>{
    const b=document.createElement('button');b.type='button';b.dataset.preset=id;b.className='private-preset';
    const swatch=document.createElement('span');swatch.className='private-preset-swatch';swatch.style.background=p.light[0];swatch.style.borderColor=p.light[4];
    const label=document.createElement('span');label.textContent=p.name;b.append(swatch,label);
    b.addEventListener('click',()=>{if(write('private-theme-preset',id)){preset=id;apply();}});group.querySelector('.private-preset-list').appendChild(b);
  });
  appearance?.prepend(group);
  quick.addEventListener('click',()=>{
    const next=root.getAttribute('data-theme')==='dark'?'light':'dark';if(!write('theme-mode',next))return;
    if(next==='dark')root.setAttribute('data-theme','dark');else root.removeAttribute('data-theme');
    const val=document.getElementById('theme-mode-val');if(val)val.textContent=next==='dark'?'已开启':'关闭';apply();
  });
  new MutationObserver(apply).observe(root,{attributes:true,attributeFilter:['data-theme']});apply();
  const times=document.createElement('fieldset');times.className='set-group glass private-time-options';
  const legend=document.createElement('legend');legend.textContent='消息时间显示';times.appendChild(legend);
  for(const [value,label,description] of [['demand','按需查看','点击普通文字气泡，查看头像下方的时间；再次点击收起。'],['all','始终显示','每条普通消息都在头像下方显示时间。'],['simple','简洁模式','只显示聊天中间的日期与时间标记。']]){
    const row=document.createElement('label');const radio=document.createElement('input');radio.type='radio';radio.name='private-time-mode';radio.value=value;radio.checked=timeMode===value;
    const text=document.createElement('span');const title=document.createElement('strong');title.textContent=label;const desc=document.createElement('small');desc.textContent=description;text.append(title,desc);row.append(radio,text);times.appendChild(row);
    radio.addEventListener('change',()=>{if(write('private-time-mode',value)){timeMode=value;root.dataset.privateTime=value;document.querySelectorAll('#chat-body .private-time-open').forEach(m=>m.classList.remove('private-time-open'));}});
  }
  chatSettings?.prepend(times);
  // Delegation also works for new messages and virtualized history, without rescanning.
  const body=document.getElementById('chat-body');
  function toggleTime(target){
    if(timeMode!=='demand'||target.closest('button,a,input,textarea,video,audio,img,[data-act],.msg-poke-seg,.msg-quote'))return;
    const bubble=target.closest('.msg-bubble'),msg=bubble?.closest('.msg');if(msg?.querySelector('.msg-time'))msg.classList.toggle('private-time-open');
  }
  body?.addEventListener('click',e=>toggleTime(e.target));
  body?.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.classList.contains('msg-bubble')){e.preventDefault();toggleTime(e.target);}});
  window.mochiOnDataReady?.(()=>{
    const savedPreset=read('private-theme-preset','blue');if(palettes[savedPreset])preset=savedPreset;
    const savedTime=read('private-time-mode','demand');if(['demand','all','simple'].includes(savedTime))timeMode=savedTime;
    root.dataset.privateTime=timeMode;times.querySelectorAll('input').forEach(n=>n.checked=n.value===timeMode);apply();
  });
})();

// Complete icon directory delegates to the original app entries, including hidden ones.
(function () {
  const home=document.getElementById('page-phone'),phone=document.querySelector('.phone'),grid=home?.querySelector('.app-grid');if(!grid||!phone)return;
  const page=document.createElement('section');page.id='page-private-functions';page.className='page private-function-page';page.hidden=true;
  page.innerHTML='<header class="private-date-head"><button type="button" aria-label="返回首页">‹</button><strong>全部功能</strong><span></span></header><div class="private-function-content"></div>';
  phone.insertBefore(page,document.querySelector('.tabbar'));
  const entry=document.createElement('button');entry.id='private-all-functions';entry.className='private-all-functions';entry.type='button';entry.textContent='全部功能 ›';grid.after(entry);
  const sections=[['陪伴与互动',['chat','home','mail','feed','divination','music','drift','market','giftbox']],['记录与档案',['interact','memo-arc','my-arc','note','calendar','memory','outfit','period']],['日常与回顾',['stats','checkin','eat','decision']]];
  function render(){
    const content=page.querySelector('.private-function-content');content.replaceChildren();
    const apps=[...grid.querySelectorAll(':scope > .app')],used=new Set();
    function add(title,list){
      if(!list.length)return;const h=document.createElement('h3');h.textContent=title;const g=document.createElement('div');g.className='private-function-grid';content.append(h,g);
      list.forEach(app=>{used.add(app);const b=document.createElement('button');b.type='button';b.className='private-function-item';
        const icon=app.querySelector('.app-ico')?.cloneNode(true);if(icon){icon.removeAttribute('id');icon.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));b.appendChild(icon);}
        const label=document.createElement('span');label.textContent=app.querySelector('.app-name')?.textContent||app.dataset.app;b.appendChild(label);
        b.addEventListener('click',()=>{document.querySelector('.tabbar [data-page="page-phone"]')?.click();app.click();});g.appendChild(b);
      });
    }
    sections.forEach(([title,ids])=>add(title,apps.filter(a=>ids.includes(a.dataset.app))));add('其他功能',apps.filter(a=>!used.has(a)));
  }
  entry.addEventListener('click',()=>{render();document.querySelectorAll('.phone > .page').forEach(p=>p.hidden=p!==page);page.hidden=false;});
  page.querySelector('header button').addEventListener('click',()=>document.querySelector('.tabbar [data-page="page-phone"]')?.click());
})();

// Versioned local release notes: dismissible, no network, no compulsory acknowledgement.
(function () {
  const VERSION='2026-10-11-ui-1';window.__privateRelease=VERSION;
  const releases=[
    {id:VERSION,date:'2026年10月11日',items:[['主题预设','外观里新增雾蓝茉莉、奶油杏桃、石榴红，各自支持日间与夜间配色。'],['日夜切换','聊天顶部保留原来的名字与操作，只增加一个日夜切换按钮。'],['消息时间','聊天设置新增按需、始终、简洁三种显示方式，中间日期标记始终保留。'],['全部功能','首页新增分组图标入口，隐藏的功能也能从这里打开，不删除记录。'],['更新合集','设置 → 数据可查看更新公告；本版可选择下次更新前不再弹出。']]},
    {id:'previous-date',date:'此前更新',items:[['日期查找','聊天支持按日期寻找本机历史消息。'],['设置返回','点击底部设置图标可回到设置主页。'],['首页整理','长按首页空白处，或从外观设置进入，调整入口顺序与显示。']]}
  ];
  const mask=document.createElement('div');mask.id='private-release-mask';mask.className='private-release-mask';mask.hidden=true;
  mask.innerHTML='<section role="dialog" aria-modal="true" aria-labelledby="private-release-title"><header><h2 id="private-release-title">更新公告</h2><button type="button" aria-label="关闭更新公告">×</button></header><div class="private-release-content"></div><label class="private-release-mute"><input type="checkbox">下次更新前不再弹出</label><button type="button" class="private-release-done">知道了</button></section>';
  document.body.appendChild(mask);let returnFocus=null;let muted='';const noticeStore=window.xyStore?.('xy-home-v2'),key='private-release-muted';
  function readMuted(){try{return noticeStore?.get(key)||localStorage.getItem('xy-home-v2:'+key)||'';}catch(e){return '';}}
  muted=readMuted();
  function show(archive=false){
    returnFocus=document.activeElement;const content=mask.querySelector('.private-release-content');content.replaceChildren();
    mask.querySelector('h2').textContent=archive?'更新公告合集':'更新公告';
    releases.forEach((release,index)=>{
      const details=document.createElement('details');details.open=index===0;const summary=document.createElement('summary');summary.textContent=release.date;details.appendChild(summary);
      const ul=document.createElement('ul');release.items.forEach(([title,desc])=>{const li=document.createElement('li'),strong=document.createElement('strong');strong.textContent=title+'：';li.append(strong,document.createTextNode(desc));ul.appendChild(li);});details.appendChild(ul);content.appendChild(details);
    });
    mask.querySelector('input').checked=muted===VERSION;mask.hidden=false;
    document.querySelector('.phone')?.setAttribute('inert','');
    mask.querySelector('header button').focus();
  }
  function close(){
    const checked=mask.querySelector('input').checked;try{muted=checked?VERSION:'';if(noticeStore)noticeStore.set(key,muted);else localStorage.setItem('xy-home-v2:'+key,muted);}catch(e){window.toast?.('公告偏好未保存');}
    mask.hidden=true;document.querySelector('.phone')?.removeAttribute('inert');returnFocus?.focus?.();
  }
  mask.querySelector('header button').addEventListener('click',close);mask.querySelector('.private-release-done').addEventListener('click',close);
  mask.addEventListener('click',e=>{if(e.target===mask)close();});
  mask.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();close();}
    if(e.key==='Tab'){const nodes=[...mask.querySelectorAll('button,input,summary')].filter(n=>n.getClientRects().length);const i=nodes.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();nodes.at(-1)?.focus();}else if(!e.shiftKey&&i===nodes.length-1){e.preventDefault();nodes[0]?.focus();}}
  });
  const data=document.querySelector('#page-setting .them-sec[data-sec="tools"]');const entry=document.createElement('button');entry.type='button';entry.className='private-settings-category';entry.textContent='更新公告合集';entry.addEventListener('click',()=>show(true));data?.prepend(entry);
  function maybeShow(){
    muted=readMuted();
    if(muted===VERSION||!window.__mochiDataReady||document.hidden)return;
    // Don't stack on the app lock or another active dialog. Retry on the next gesture only.
    if([...document.querySelectorAll('.modal-mask,.qa-mask,#tc-mask,[id*="applock"]')].some(n=>!n.hidden&&n.getClientRects().length&&getComputedStyle(n).display!=='none'))return;
    show();document.removeEventListener('pointerup',maybeShow);
  }
  document.addEventListener('mochi-restore-done',maybeShow,{once:true});
  document.addEventListener('pointerup',maybeShow);if(window.__mochiDataReady)maybeShow();
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
