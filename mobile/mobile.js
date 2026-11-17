/* ───────── Reactorium · 휴대폰(앱) 레이아웃 스크립트 ─────────
   게임 스크립트가 끝난 뒤 실행되어 DOM을 휴대폰 배치로 옮긴다.
   요소를 "이동"만 하므로 id·이벤트 리스너는 그대로 유지된다. */
(()=>{
'use strict';
const $=s=>document.querySelector(s);
const en=()=>document.documentElement.lang==='en';
const T=(ko,e)=>en()?e:ko;

/* 1) 모드 전환 버튼을 하단 탭으로 */
const seg=$('.tools .seg'); const nav=document.createElement('nav'); nav.className='mnav';
const MODES={stage:['스테이지','Stages'],lab:['실험실','Lab'],electro:['전기화학','Electro'],fusion:['핵융합','Fusion']};
[...seg.querySelectorAll('.ibtn')].forEach(b=>{ const s=document.createElement('span'); s.className='ml'; s.dataset.k=b.id.slice(2); b.append(s); nav.append(b); });
seg.remove(); document.body.append(nav);

/* 2) 게임 화면: 상태줄 / 보드 / 패널 탭 / 패널 */
const view=$('#view-game'), colB=view.querySelector('.colB');
const strip=document.createElement('div'); strip.className='mstrip';
const mbtns=document.createElement('div'); mbtns.className='mbtns';
['#b-refill','#b-reset'].forEach(id=>{ const b=$(id); b.classList.add('ibtn'); mbtns.append(b); });
strip.append($('#resrow'),mbtns);
colB.querySelector('.boardbar').remove();
const tabs=document.createElement('div'); tabs.className='mtabs'; tabs.setAttribute('role','tablist');
const pane=document.createElement('div'); pane.className='mpane';
const P=[
  ['goals',['목표','Goals'],$('.colA .status')],
  ['shop',['시약장','Shelf'],$('.shopcard')],
  ['ctl',['온도·압력','Conditions'],$('.colC .ctl')],
  ['log',['기록','Log'],$('#logcard')],
];
P.forEach(([k,,card])=>{ const b=document.createElement('button'); b.dataset.k=k; b.setAttribute('role','tab'); tabs.append(b); pane.append(card); });
view.prepend(strip); view.append(tabs,pane);

let cur='shop';
function tab(k){ cur=k; P.forEach(([kk,,card])=>card.classList.toggle('on',kk===k));
  tabs.querySelectorAll('button').forEach(b=>{ b.setAttribute('aria-selected',b.dataset.k===k); if(b.dataset.k===k) b.classList.remove('dot'); });
  pane.scrollTop=0; try{localStorage.setItem('reactor-m-tab',k);}catch(_){} }
tabs.addEventListener('click',e=>{ const b=e.target.closest('button'); if(b) tab(b.dataset.k); });
try{ const s=localStorage.getItem('reactor-m-tab'); if(s&&P.some(p=>p[0]===s)) cur=s; }catch(_){}

/* 3) 글자(언어) 갱신 */
function labels(){
  nav.querySelectorAll('.ml').forEach(s=>s.textContent=T(...MODES[s.dataset.k]));
  tabs.querySelectorAll('button').forEach(b=>{ const p=P.find(x=>x[0]===b.dataset.k); b.textContent=T(...p[1]); });
  ['#b-refill','#b-reset'].forEach(id=>{ const b=$(id), t=b.querySelector('span'); if(t){ b.title=t.textContent; b.setAttribute('aria-label',t.textContent); } });
}
new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

/* 4) 목표가 바뀌면(스테이지 클리어 등) 목표 탭에 점 표시 */
let lastNext=false;
new MutationObserver(()=>{ labels(); const nx=!!$('#goals .nextbtn');
  if(nx&&!lastNext&&cur!=='goals') tabs.querySelector('[data-k="goals"]').classList.add('dot');
  lastNext=nx; }).observe($('#goals'),{childList:true,subtree:true});

/* 5) 보드 크기: 화면 높이에서 상태줄·탭·패널 최소 높이를 빼고 남는 만큼 (5:7 비율) */
const board=$('#board');
function fit(){
  if(view.hidden) return;
  const cs=getComputedStyle(view), gap=parseFloat(cs.rowGap)||8;
  const viewH=view.clientHeight-parseFloat(cs.paddingBottom)-parseFloat(cs.paddingTop);
  const land=matchMedia('(orientation:landscape) and (min-width:700px)').matches;
  const pad=22; // 보드 테두리 + 트레이 여백
  let h, w;
  if(land){ h=viewH-strip.offsetHeight-gap-pad; w=h*5/7; }
  else { const paneMin=Math.max(150,Math.round(innerHeight*0.22));
    h=viewH-strip.offsetHeight-tabs.offsetHeight-3*gap-pad-paneMin;
    w=Math.min(view.clientWidth-pad,h*5/7); }
  board.style.width=Math.max(200,Math.floor(w))+'px';
}
addEventListener('resize',()=>requestAnimationFrame(fit));
nav.addEventListener('click',()=>requestAnimationFrame(fit));

/* 6) 안드로이드 뒤로 가기: 시트 닫기 → 스테이지로 → 앱 종료 */
const App=window.Capacitor?.Plugins?.App;
if(App) App.addListener('backButton',()=>{
  const scrim=$('#scrim');
  if(scrim&&!scrim.hidden){ scrim.click(); return; }
  if($('#m-stage').getAttribute('aria-pressed')!=='true'){ $('#m-stage').click(); return; }
  App.exitApp();
});

labels(); tab(cur); fit(); requestAnimationFrame(fit); document.fonts?.ready.then(fit);
})();
