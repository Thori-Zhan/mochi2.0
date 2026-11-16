(() => {
  const phone = document.querySelector('.phone');
  const root = document.documentElement;
  const canvas = document.createElement('canvas');
  canvas.id = 'idle-snow'; canvas.setAttribute('aria-hidden', 'true'); phone.append(canvas);
  const ctx = canvas.getContext('2d');
  const settings = document.querySelector('.snow-settings');
  const label = document.createElement('label'); label.className = 'snow-option at-row';
  label.innerHTML = '闲置积雪与自动清雪<input type="checkbox" class="at-switch" id="snow-idle-enabled" role="switch" checked>';
  settings.append(label);
  const enabled = label.querySelector('input');
  enabled.checked=window.mochiSnow.config.idle;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let amount = .12, lastActivity = Date.now(), width = 0, height = 0, scale = 1;
  let crumbs = [], frame = 0, clearing = null, gesture = null, suppressClickUntil = 0;
  const caps = ['#snow-nav-enabled', '#snow-chat-enabled'];
  function bump(x, center, spread) {
    return Math.exp(-Math.pow((x-center)/spread,2));
  }
  const deposits = new WeakMap();
  function snowProfile(surface) {
    if (deposits.has(surface)) return deposits.get(surface);
    const bins = 96, stages = 48, grains = 1600;
    const random = crypto.getRandomValues(new Uint32Array(grains * 2));
    const heights = new Float32Array(bins);
    const layers = [heights.slice()];
    let dropped = 0, gust = random[random.length-1] / 4294967296;
    for (let stage = 1; stage <= stages; stage++) {
      const target = Math.round(grains * stage / stages);
      while (dropped < target) {
        const landing = random[dropped * 2] / 4294967296;
        if (dropped % 100 === 0) gust = (gust + (landing - .5) * .28 + 1) % 1;
        const position = landing < .12 ? landing / .12 : (gust + (landing - .56) * .62 + 1) % 1;
        let index = Math.min(bins - 1, Math.floor(position * bins));
        // Fresh powder settles into a nearby low spot before joining the bank.
        for (let step = 0; step < 3; step++) {
          const left = Math.max(0, index - 1), right = Math.min(bins - 1, index + 1);
          const next = heights[left] < heights[right] ? left : right;
          if (heights[index] - heights[next] < 1.1) break;
          index = next;
        }
        const size = .42 + random[dropped * 2 + 1] / 4294967296 * .55;
        heights[index] += size;
        if (index > 0) heights[index - 1] += size * .18;
        if (index < bins - 1) heights[index + 1] += size * .18;
        dropped++;
      }
      let soft = heights.slice();
      for (let pass = 0; pass < 3; pass++) {
        const next = soft.slice();
        for (let i = 1; i < bins - 1; i++) next[i] = soft[i - 1] * .25 + soft[i] * .5 + soft[i + 1] * .25;
        soft = next;
      }
      layers.push(soft);
    }
    deposits.set(surface, layers);
    return layers;
  }
  function snowHeight(layers, position) {
    const stage = Math.max(0, Math.min(48, amount * 48));
    const low = Math.floor(stage), high = Math.min(48, low + 1), mix = stage - low;
    const bin = Math.max(0, Math.min(95, position * 95));
    const left = Math.floor(bin), right = Math.min(95, left + 1), fraction = bin - left;
    const a = layers[low][left] * (1 - fraction) + layers[low][right] * fraction;
    const b = layers[high][left] * (1 - fraction) + layers[high][right] * fraction;
    return 24 * Math.tanh((a * (1 - mix) + b * mix) / 24);
  }
  function relativeRect(el) {
    const b=el.getBoundingClientRect(), p=phone.getBoundingClientRect();
    return {x:b.left-p.left,y:b.top-p.top,w:b.width,h:b.height};
  }
  function cap(el, checked) {
    if (!checked || !el || !el.getClientRects().length || getComputedStyle(el).display==='none') return;
    const r = relativeRect(el), dark = root.dataset.theme === 'dark';
    const layers = snowProfile(el);
    const radius = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 14, r.w / 2);
    const margin = Math.min(10, r.w * .025), start = r.x + margin, end = r.x + r.w - margin;
    function edge(x) {
      const distance = Math.min(x - r.x, r.x + r.w - x);
      return r.y + (distance < radius ? radius - Math.sqrt(Math.max(0, radius * radius - (radius - distance) ** 2)) : 0);
    }
    const gradient = ctx.createLinearGradient(0, r.y - 18, 0, r.y + 4);
    gradient.addColorStop(0, dark ? '#dce1de' : '#ffffff');
    gradient.addColorStop(1, dark ? '#b7bfbd' : '#e1ebf0');
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.moveTo(start, edge(start));
    for (let x = start; x <= end; x += 1.5) {
      const taper = Math.min(1, (x-start)/12, (end-x)/12);
      const depth = snowHeight(layers, (x-r.x)/r.w) * Math.max(0,taper);
      ctx.lineTo(x, edge(x) - depth);
    }
    ctx.lineTo(end, edge(end));
    for (let x = end; x >= start; x -= 2) ctx.lineTo(x, edge(x) + .4);
    ctx.closePath(); ctx.fill();
  }
  function draw() {
    frame=0;
    if(clearing){
      const t=Math.min(1,(performance.now()-clearing.started)/750);
      amount=.12+(clearing.from-.12)*Math.pow(1-t,3);
      if(t===1)clearing=null;
    }
    ctx.setTransform(scale,0,0,scale,0,0); ctx.clearRect(0,0,width,height);
    const opening=document.getElementById('opening-screen');
    canvas.hidden=!enabled.checked || !opening.hidden;
    root.toggleAttribute('data-idle-snow', enabled.checked);
    if(canvas.hidden)return;
    const dark=root.dataset.theme==='dark';
    ctx.fillStyle=dark?'#c3c8c8':'#f8fcff';
    ctx.shadowColor=dark?'#00000035':'#8baabb55';ctx.shadowBlur=2;ctx.shadowOffsetY=1;
    // Soft banks sit at the screen edges, keeping the center readable.
    if(document.getElementById('snow-page-enabled').checked){
      const edgeDepth=Math.max(0,amount-.08)*21;
      for(const side of [0,1]){
        ctx.beginPath();ctx.moveTo(side?width:0,0);
        for(let y=0;y<=height;y+=3){
          const u=y/height;
          const lobes=side ? .52*bump(u,.24,.10)+.75*bump(u,.68,.18)+.38*bump(u,.94,.04) : .82*bump(u,.12,.07)+.30*bump(u,.41,.15)+.58*bump(u,.81,.09);
          const depth=edgeDepth*(.03+.6*lobes);
          ctx.lineTo(side?width-depth:depth,y);
        }
        ctx.lineTo(side?width:0,height);ctx.closePath();ctx.fill();
      }
    }
    cap(phone.querySelector('.tabbar'),document.querySelector(caps[0]).checked);
    if(!document.getElementById('page-phone').hidden){
      cap(document.getElementById('deco-widget'),true);
      cap(document.getElementById('music-widget'),true);
    }
    const chat=document.getElementById('page-chat');
    if(!chat.hidden)cap(chat.querySelector('.chat-input-row'),document.querySelector(caps[1]).checked);
    ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    ctx.fillStyle=dark?'#c3c8c8':'#f8fcff';
    const now=performance.now();crumbs=crumbs.filter(c=>now-c.born<600);
    for(const c of crumbs){const t=(now-c.born)/600;ctx.globalAlpha=(1-t)*.8;ctx.beginPath();ctx.arc(c.x+c.vx*t,c.y-9*t+22*t*t,c.r,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;
    if(crumbs.length||clearing)requestDraw();
  }
  function requestDraw(){if(!frame)frame=requestAnimationFrame(draw);}
  function resize(){
    const r=phone.getBoundingClientRect();width=r.width;height=r.height;scale=Math.min(devicePixelRatio||1,2);
    const w=Math.round(width*scale),h=Math.round(height*scale);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    requestDraw();
  }
  new ResizeObserver(resize).observe(phone);
  new ResizeObserver(requestDraw).observe(phone.querySelector('.tabbar'));
  new ResizeObserver(requestDraw).observe(document.querySelector('#page-chat .chat-input-row'));
  for(const id of ['deco-widget','music-widget'])new ResizeObserver(requestDraw).observe(document.getElementById(id));
  new MutationObserver(records=>{
    if(records.some(r=>r.target.classList.contains('page')||r.target.id==='auto-theme-page'||r.target.id==='opening-screen'))requestDraw();
  }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});
  new MutationObserver(requestDraw).observe(root,{attributes:true,attributeFilter:['data-theme','style']});
  settings.addEventListener('change',()=>{
    if(!enabled.checked){clearing=null;gesture=null;}
    requestDraw();
  });
  function blocked(target){return target.closest('#opening-screen,.modal-mask,.tc-mask,.preview-help');}
  function clearOnReturn(target){
    lastActivity=Date.now();
    if(!enabled.checked||canvas.hidden||amount<=.16||clearing||blocked(target)||!phone.contains(target))return false;
    clearing={started:performance.now(),from:amount};
    suppressClickUntil=Date.now()+850;
    const bar=phone.querySelector('.tabbar'),r=relativeRect(bar);
    if(!reduced.matches&&bar.getClientRects().length)for(let i=0;i<18;i++)crumbs.push({x:r.x+(i+.5)*r.w/18,y:r.y-4-amount*9,vx:(Math.random()-.5)*24,r:1+Math.random(),born:performance.now()});
    if(reduced.matches){amount=.12;clearing=null;}
    requestDraw();return true;
  }
  document.addEventListener('click',e=>{if(Date.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
  document.addEventListener('pointerdown',e=>{
    if(e.pointerType==='touch')return;
    if(clearOnReturn(e.target)){gesture=e.pointerId;e.preventDefault();e.stopImmediatePropagation();}
  },true);
  document.addEventListener('pointerup',e=>{
    if(e.pointerType!=='touch'&&gesture===e.pointerId){gesture=null;e.preventDefault();e.stopImmediatePropagation();}
  },true);
  document.addEventListener('touchstart',e=>{
    if(e.touches.length===1&&clearOnReturn(e.target)){gesture='touch';e.preventDefault();e.stopImmediatePropagation();}
  },{capture:true,passive:false});
  document.addEventListener('touchend',e=>{
    if(gesture==='touch'){gesture=null;e.preventDefault();e.stopImmediatePropagation();}
  },{capture:true,passive:false});
  document.addEventListener('touchcancel',()=>{gesture=null;},true);
  document.addEventListener('keydown',()=>{lastActivity=Date.now();});
  function accumulate(){
    if(document.hidden)return;
    const minutes=(Date.now()-lastActivity)/60000;
    const next=Math.min(1,.12+Math.max(0,minutes-2)/28*.88);
    let changed=false;
    if(next>amount+.005){amount=next;changed=true;}
    if(changed)requestDraw();
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden){try{localStorage.setItem('xy-home-v2:snow-away',String(Date.now()));}catch{}}else{accumulate();requestDraw();}});
  window.addEventListener('pageshow',accumulate);
  setInterval(accumulate,30000);
  try{const away=Number(localStorage.getItem('xy-home-v2:snow-away'));if(away&&away<Date.now())lastActivity=away;}catch{}
  document.addEventListener('snow-settings-restored',()=>{
    if(!enabled.checked){clearing=null;gesture=null;}requestDraw();
  });
  document.addEventListener('wheel',()=>{lastActivity=Date.now();},{passive:true});
  document.addEventListener('touchmove',()=>{lastActivity=Date.now();},{passive:true});
  window.addEventListener('pagehide',()=>{
    try{localStorage.setItem('xy-home-v2:snow-away',String(Date.now()));}catch{}
  });
  const help=document.createElement('details');help.className='at-help';
  help.innerHTML='<summary>积雪说明</summary><p>闲置约 2 分钟后逐渐积雪，约半小时达到最厚。回来后的第一次触碰会先自动清雪，下一次操作页面。关闭闲置积雪后，底栏仍可单独显示薄雪。</p>';
  settings.append(help);
  resize();accumulate();
})();
