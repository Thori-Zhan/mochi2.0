(() => {
  'use strict';
  const loaded=new Map(),running=new Map(),complete=new Set(),preloaded=new Set(),waiting=new WeakSet(),replay=new WeakSet();
  const log=[],errors=[],scriptProblems=new Map();
  let manifest,manifestPending,serviceTimer,priority=0;
  function readManifest(){
    if(manifest)return Promise.resolve(manifest);
    if(manifestPending)return manifestPending;
    manifestPending=fetch('site-manifest.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('加载清单暂时无法读取，请再试一次');return r.json();}).then(m=>manifest=m).catch(e=>{manifestPending=null;throw e;});
    return manifestPending;
  }
  window.addEventListener('error',event=>{if(event.filename)scriptProblems.set(new URL(event.filename,location.href).pathname,event.message);});
  const now=()=>performance.now();
  function file(file){
    if(loaded.has(file))return loaded.get(file);
    const promise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=file;script.async=false;script.dataset.siteModule=file;
      script.onload=()=>{const problem=scriptProblems.get(new URL(file,location.href).pathname);if(problem){reject(Error('功能准备出现异常，请刷新预览后重试'));return;}log.push({file,at:now()});resolve();};
      script.onerror=()=>{script.remove();loaded.delete(file);reject(Error('暂时没有加载成功，请再点一次'));};
      document.head.append(script);
    });
    loaded.set(file,promise);return promise;
  }
  function preload(files){for(const f of files){if(preloaded.has(f)||loaded.has(f))continue;preloaded.add(f);const link=document.createElement('link');link.rel='preload';link.as='script';link.href=f;document.head.append(link);}}
  const yieldTask=()=>new Promise(r=>setTimeout(r,0));
  async function ensure(name){
    await readManifest();if(complete.has(name))return;if(running.has(name))return running.get(name);
    const group=manifest.groups[name];if(!group)throw Error('未知页面');
    const promise=(async()=>{
      for(const dep of group.deps)await ensure(dep);
      preload(group.files);
      for(const f of group.files){await file(f);if(name!=='shell')await yieldTask();}
      complete.add(name);
      if(name==='shell'){window.__siteShellReady=true;document.dispatchEvent(new Event('mochi-shell-ready'));scheduleServices();}
      if(name==='services')window.__siteServicesReady=true;
      document.dispatchEvent(new CustomEvent('mochi-feature-ready',{detail:{group:name}}));
    })();running.set(name,promise);
    promise.catch(error=>{running.delete(name);errors.push({group:name,error:error.message,at:now()});});
    return promise;
  }
  const visible=()=>document.querySelector('.phone>.page:not([hidden])');
  const appGroups={chat:'services',home:'services',mail:'services',feed:'services',music:'services',interact:'services',note:'services',memory:'services',period:'services',stats:'services',checkin:'services',eat:'services',market:'services',giftbox:'services','call-time':'services',calendar:'calendar','memo-arc':'archives','my-arc':'archives',drift:'drift',divination:'divination',decision:'decision'};
  function groupsFor(target){
    const app=target.closest('[data-app]');if(app)return [appGroups[app.dataset.app]||'services'];
    const tab=target.closest('.tab[data-page]');if(tab){const id=tab.dataset.page;return id==='page-phone'?['shell']:id==='page-setting'?['settings']:['services'];}
    if(target.closest('.confirm-all,#private-all-functions'))return ['services'];
    if(target.closest('#more-divine,#row-open-divination,#home-divine .hd-view'))return ['divination'];
    if(target.closest('#more-drift'))return ['drift'];
    if(target.closest('#more-decide'))return ['decision'];
    if(target.closest('#page-setting,#page-theme,#auto-theme-page,#perf-settings'))return ['settings'];
    if(target.closest('#music-widget,#music-float,#call-mini,#call-mask,#more-call-time,#chat-input,#page-chat,#page-chatcard'))return ['services'];
    return [];
  }
  let notice=null,noticeUsers=0;
  function busy(){
    noticeUsers++;
    const timer=setTimeout(()=>{if(!notice){notice=document.createElement('div');notice.id='site-load-status';notice.role='status';document.body.append(notice);}notice.innerHTML='<span class="site-load-star" aria-hidden="true">❄</span><span>正在准备…</span>';notice.style.pointerEvents='none';notice.hidden=false;},250);
    return ()=>{clearTimeout(timer);noticeUsers--;if(!noticeUsers&&notice)notice.hidden=true;};
  }
  function report(error){
    if(window.__siteShellReady&&window.toast){window.toast(error.message);return;}
    if(!notice){notice=document.createElement('div');notice.id='site-load-status';document.body.append(notice);}
    notice.replaceChildren(document.createTextNode(error.message+' '));notice.style.pointerEvents='auto';
    const retry=document.createElement('button');retry.type='button';retry.textContent='重试';retry.onclick=()=>{notice.hidden=true;ensure('shell').catch(report);};notice.append(retry);notice.hidden=false;
  }
  document.addEventListener('click',event=>{
    if(!(event.target instanceof Element))return;
    const target=event.target.closest('button,a,[role="button"],.app,.tab,.set-row,.chat-item,.private-function-item,.gs-row')||event.target;
    if(replay.has(target))return;
    const groups=groupsFor(target).filter(g=>!complete.has(g));if(!groups.length)return;
    event.preventDefault();event.stopImmediatePropagation();if(waiting.has(target))return;
    waiting.add(target);const origin=visible(),end=busy(),oldBusy=target.getAttribute('aria-busy');target.setAttribute('aria-busy','true');priority++;
    Promise.all(groups.map(ensure)).then(()=>{
      if(!target.isConnected||visible()!==origin)return;
      replay.add(target);try{target.click();}finally{replay.delete(target);}
    }).catch(report).finally(()=>{end();priority--;waiting.delete(target);if(oldBusy===null)target.removeAttribute('aria-busy');else target.setAttribute('aria-busy',oldBusy);});
  },true);
  function scheduleServices(){
    clearTimeout(serviceTimer);serviceTimer=setTimeout(()=>{
      const run=()=>ensure('services').catch(report);
      if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:1200});else run();
    },120);
  }
  window.mochiSite={ensure,ready:g=>complete.has(g),report:()=>({loaded:[...complete],files:log.slice(),errors:errors.slice(),coverage:manifest?.coverage}),groups:()=>Object.keys(manifest?.groups||{})};
  window.mochiFeatureLoader={load:ensure,loaded:()=>['decision','divination'].filter(g=>complete.has(g))};
  for(const [name,group]of [['openDecision','decision'],['openNarc','archives'],['openMyArc','archives']]){const entry=(...args)=>ensure(group).then(()=>window[name](...args));entry.lazyEntry=true;window[name]=entry;}
  document.addEventListener('mochi-opening-done',scheduleServices);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!complete.has('services'))scheduleServices();});
  ensure('shell').catch(report);
})();
