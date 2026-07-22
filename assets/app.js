const fmt = n => n.toLocaleString('ko-KR');
const won = n => '₩' + fmt(n);
const TODAY = new Date('2026-06-13');
const monthsSince = d => (TODAY - new Date(d)) / (1000*60*60*24*30.4375);
const daysUntil = d => Math.round((new Date(d) - TODAY)/(1000*60*60*24));
const ageBucket = d => { const m=monthsSince(d); if(m>=6) return {l:'6개월+ 경과',c:'danger'}; if(m>=3) return {l:'3개월+ 경과',c:'warn'}; if(m>=1) return {l:'1개월+ 경과',c:'ok'}; return {l:'1개월 미만',c:'muted'}; };
const dispDate = d => d.replace(/-/g,'.').slice(2);

/* ---------------- mock data ---------------- */
const agenciesByField = {
  '메디컬':[
    {id:'a1', name:'한백', region:'인천·경기', grade:'A', sales:48200000, recv:2354500, last:'06/09', next:'06/15', pay:'2025-11-20'},
    {id:'a2', name:'대성 메디칼', region:'서울', grade:'A+', sales:61500000, recv:12500000, last:'06/05', next:'06/14', pay:'2026-02-15'},
    {id:'a3', name:'부산 정형', region:'부산·경남', grade:'B', sales:23800000, recv:0, last:'05/28', next:'06/20', pay:'2026-06-01'},
    {id:'a4', name:'우리 헬스케어', region:'대구', grade:'B', sales:18400000, recv:3120000, last:'06/02', next:'06/18', pay:'2026-05-05'},
    {id:'a5', name:'중부 의료기', region:'대전·충청', grade:'C', sales:9700000, recv:880000, last:'05/21', next:'06/22', pay:'2025-09-30'},
  ],
  '케미컬':[
    {id:'c1', name:'동양케미칼', region:'경기·인천', grade:'A', sales:38500000, recv:4200000, last:'06/07', next:'06/16', pay:'2026-03-10'},
    {id:'c2', name:'대한화학상사', region:'서울', grade:'A+', sales:52000000, recv:0, last:'06/03', next:'06/19', pay:'2026-06-02'},
    {id:'c3', name:'우성케미컬', region:'부산', grade:'B', sales:17600000, recv:1850000, last:'05/26', next:'06/21', pay:'2025-12-15'},
  ],
  '하이드로겔':[
    {id:'h1', name:'젤메드', region:'서울', grade:'A+', sales:29400000, recv:2600000, last:'06/08', next:'06/17', pay:'2026-04-22'},
    {id:'h2', name:'바이오겔코리아', region:'경기', grade:'A', sales:21300000, recv:0, last:'06/01', next:'06/20', pay:'2026-05-30'},
    {id:'h3', name:'메디젤', region:'대구', grade:'C', sales:9800000, recv:740000, last:'05/24', next:'06/23', pay:'2025-10-05'},
  ],
};
function curAgencies(){ return agenciesByField[state.domField]||agenciesByField['메디컬']; }
function findAgency(id){ for(const k in agenciesByField){ const a=agenciesByField[k].find(x=>x.id===id); if(a) return a; } return null; }
const fieldMeta = { '메디컬':{orders:23,claims:2}, '케미컬':{orders:11,claims:0}, '하이드로겔':{orders:8,claims:1} };
const alertsByField = {
  '메디컬':[{tag:'warn',t:'채권채무조회서 발송',s:'6월 말일 기준 · D-7'},{tag:'danger',t:'주문 주기 이탈 — 부산 정형',s:'평균 30일 주기 / 45일째 미주문'},{tag:'warn',t:'계약 갱신 임박 — 대성 메디칼',s:'D-9'}],
  '케미컬':[{tag:'warn',t:'채권채무조회서 발송',s:'6월 말일 기준 · D-7'},{tag:'danger',t:'주문 주기 이탈 — 우성케미컬',s:'평균 21일 주기 / 38일째 미주문'}],
  '하이드로겔':[{tag:'warn',t:'채권채무조회서 발송',s:'6월 말일 기준 · D-7'},{tag:'danger',t:'주문 주기 이탈 — 메디젤',s:'평균 28일 주기 / 41일째 미주문'},{tag:'warn',t:'계약 갱신 임박 — 젤메드',s:'D-12'}],
};
const pipelineByField = {
  '메디컬':{'제안':[{n:'한백',amt:12000000},{n:'우리 헬스케어',amt:9500000}],'견적':[{n:'대성 메디칼',amt:32000000}],'협상':[{n:'부산 정형',amt:18000000}],'계약':[{n:'중부 의료기',amt:7200000}],'납품':[{n:'세종 메디텍 (이관)',amt:21000000}]},
  '케미컬':{'제안':[{n:'동양케미칼',amt:8000000}],'견적':[{n:'대한화학상사',amt:24000000}],'협상':[{n:'우성케미컬',amt:11000000}],'계약':[],'납품':[{n:'한울케미 (이관)',amt:6000000}]},
  '하이드로겔':{'제안':[{n:'젤메드',amt:7000000}],'견적':[{n:'바이오겔코리아',amt:15000000}],'협상':[],'계약':[{n:'메디젤',amt:5000000}],'납품':[]},
};
const fuByField = {
  '메디컬':[{date:'06/14',agency:'대성 메디칼',type:'계약 갱신',note:'D-9, 갱신 협의 통화',tag:'warn'},{date:'06/15',agency:'한백',type:'미수금',note:'30일 초과 — 채권채무조회 대상',tag:'danger'},{date:'06/18',agency:'우리 헬스케어',type:'재방문',note:'견적 후속',tag:'teal'},{date:'06/20',agency:'부산 정형',type:'정기 접촉',note:'미접촉 21일',tag:'muted'}],
  '케미컬':[{date:'06/16',agency:'우성케미컬',type:'미수금',note:'채권채무조회 대상',tag:'danger'},{date:'06/19',agency:'대한화학상사',type:'재방문',note:'견적 후속',tag:'teal'}],
  '하이드로겔':[{date:'06/17',agency:'젤메드',type:'계약 갱신',note:'D-12',tag:'warn'},{date:'06/23',agency:'메디젤',type:'정기 접촉',note:'미접촉 41일',tag:'muted'}],
};
function fieldTabs(){ return `<div style="display:flex;gap:6px;margin-bottom:16px">${['메디컬','케미컬','하이드로겔'].map(f=>`<button class="btn" style="${f===state.domField?'background:var(--navy);border-color:var(--navy);color:#fff':''}" onclick="setField('${f}')">${f}</button>`).join('')}</div>`; }
function setField(f){ state.domField=f; state.checked=new Set(); render(); }
function poUpload(input){ const fs=[...input.files]; if(!fs.length) return; const box=document.getElementById('poFiles'); if(box) box.innerHTML=fs.map(x=>`<span class="badge teal" style="margin:3px 5px 0 0">${x.name}</span>`).join(''); toast(fs.length+'개 PO 파일을 업로드했습니다'); }
const ledger = { // 출고현황 per agency
  a1:[
    {d:'05/03', item:'수액세트 (10cc)', qty:500, price:1200},
    {d:'05/09', item:'안전주사기 23G',  qty:1000,price:280},
    {d:'05/16', item:'수액세트 (20cc)', qty:300, price:1500},
    {d:'05/23', item:'채혈관 EDTA',     qty:2000,price:150},
    {d:'05/29', item:'멸균거즈 4x4',    qty:800, price:320},
  ]
};
const leads = [
  {id:'l1', name:'한울 메디칼 유통', region:'부산·경남', type:'일반 후보', channel:'KIMES 전시회', elig:'3/4', score:82, status:'제안'},
  {id:'l2', name:'동방 헬스',        region:'광주',     type:'독점 후보', channel:'웹 문의',    elig:'4/4', score:90, status:'심사'},
  {id:'l3', name:'세종 메디텍',      region:'세종',     type:'일반 후보', channel:'AI 리서치',  elig:'2/4', score:61, status:'발굴'},
  {id:'l4', name:'강원 정형상사',    region:'강원',     type:'일반 후보', channel:'소개',       elig:'3/4', score:74, status:'심사'},
];
const recvAccounts = ['외상매출금','외화외상매출금','받을어음','미수수익','선급금','선급비용','단기대여금','장기대여금','보증금'];
const payAccounts  = ['외상매입금','외화외상매입금','지급어음','미지급금','선수금','선수수익','단기차입금','장기차입금','임대보증금'];

const worldCountries = ['대한민국','일본','중국','대만','홍콩','베트남','태국','싱가포르','말레이시아','인도네시아','필리핀','인도','파키스탄','방글라데시','몽골','카자흐스탄','미얀마','캄보디아','라오스','네팔','스리랑카',
'사우디아라비아','아랍에미리트','카타르','쿠웨이트','이스라엘','튀르키예','이란','이라크','요르단','레바논','오만','바레인',
'독일','프랑스','영국','이탈리아','스페인','포르투갈','네덜란드','벨기에','스위스','오스트리아','스웨덴','노르웨이','덴마크','핀란드','폴란드','체코','헝가리','그리스','아일랜드','루마니아','우크라이나','러시아',
'미국','캐나다','멕시코',
'브라질','아르헨티나','칠레','콜롬비아','페루','에콰도르','우루과이','파라과이','볼리비아','베네수엘라','코스타리카','파나마','과테말라',
'남아프리카공화국','이집트','나이지리아','케냐','모로코','알제리','튀니지','가나','에티오피아',
'호주','뉴질랜드'];
const koreaRegions = ['서울','부산','대구','인천','광주','대전','울산','세종','경기','강원','충청북도','충청남도','전라북도','전라남도','경상북도','경상남도','제주'];
const regionMap = {
  '대한민국': koreaRegions,
  '일본': ['홋카이도','도호쿠','관동','주부','관서','주고쿠','시코쿠','규슈·오키나와'],
  '미국': ['동부','중서부','남부','서부'],
  '독일': ['바이에른','노르트라인','베를린','함부르크'],
  '중국': ['화북','화동','화남','서부'],
};
function regionsOf(c){ if(c==='전 세계 (미정)') return ['전체']; return ['전체'].concat(regionMap[c]||[]); }
const marketPool = {
  '대한민국':[
    {name:'서울 메디플러스', region:'서울', size:'중견', lic:true,  items:'캐스트·하이드로겔', fit:88},
    {name:'인천 정형유통',   region:'인천', size:'중견', lic:true,  items:'캐스트',          fit:81},
    {name:'수원 메디칼상사', region:'경기', size:'중견', lic:true,  items:'하이드로겔',       fit:79},
    {name:'경기 헬스라인',   region:'경기', size:'중소', lic:false, items:'재활용품',         fit:64},
    {name:'대전 메디코',     region:'대전', size:'중견', lic:true,  items:'캐스트',          fit:76},
    {name:'강원 정형상사',   region:'강원', size:'중소', lic:true,  items:'캐스트',          fit:72},
    {name:'천안 헬스케어',   region:'충청남도', size:'중견', lic:true, items:'하이드로겔',     fit:78},
  ],
  '일본':[
    {name:'Tokyo Ortho Supply', region:'관동', size:'대기업', lic:true, items:'캐스트·스플린트', fit:90},
    {name:'Osaka Medix',        region:'관서', size:'중견',   lic:true, items:'캐스트',          fit:77},
  ],
  '미국':[
    {name:'Midwest Ortho Dist.', region:'중서부', size:'중견', lic:true,  items:'캐스트',     fit:82},
    {name:'West Coast Cast Co.', region:'서부',   size:'중소', lic:false, items:'하이드로겔', fit:68},
  ],
  '독일':[
    {name:'EU Cast Partners', region:'바이에른', size:'중견', lic:true, items:'하이드로겔', fit:75},
  ],
};
function mktList(){ const m=state.market; let l;
  if(m.country==='전 세계 (미정)' || !marketPool[m.country]){ l=[]; Object.keys(marketPool).forEach(c=>marketPool[c].forEach(x=>l.push(Object.assign({country:c},x)))); }
  else l=marketPool[m.country].map(x=>Object.assign({country:m.country},x));
  if(m.region && m.region!=='전체') l=l.filter(x=>x.region===m.region);
  if(m.filters.includes('mid')) l=l.filter(x=>x.size==='중견'||x.size==='대기업');
  if(m.filters.includes('lic')) l=l.filter(x=>x.lic);
  if(m.filters.includes('cast')) l=l.filter(x=>/캐스트/.test(x.items));
  return l; }
function mktCountry(c){ const m=state.market; m.country=c; m.region='전체'; m.searched=true; m.filters=[]; m.chat.push({r:'ai',t:`${c==='전 세계 (미정)'?'전 세계(국가 미정)':c} 기준으로 다시 탐색했어요 — 후보 ${mktList().length}곳. 지역·규모·라이선스·취급 품목으로 좁혀볼까요?`}); render(); }
function mktRegion(r){ state.market.region=r; render(); }
function mktSearch(){ const m=state.market; m.searched=true; if(m.chat.length===0){ m.chat.push({r:'ai',t:`${m.region==='전체'?m.country+' 전체 지역':m.country+' · '+m.region}에서 STP 조건에 맞는 후보를 ${mktList().length}곳 찾았어요. 더 좁히고 싶은 기준을 말씀해 주세요 — 예: 매출 규모, 판매 라이선스 보유, 취급 품목.`}); } render(); setTimeout(()=>{const e=document.getElementById('mktResults'); if(e) e.scrollIntoView({behavior:'smooth',block:'start'});},80); }
function mktAsk(key,label){ const m=state.market; if(!m.filters.includes(key)) m.filters.push(key); m.chat.push({r:'me',t:label}); m.chat.push({r:'ai',t:`${label} 조건을 반영했어요. 현재 후보 ${mktList().length}곳입니다.`}); render(); }
function mktReset(){ const m=state.market; m.filters=[]; m.chat=m.chat.slice(0,1); m.chat.push({r:'ai',t:`조건을 초기화했어요. 현재 후보 ${mktList().length}곳입니다.`}); render(); }
function mktSend(){ const inp=document.getElementById('mktInput'); const v=(inp&&inp.value||'').trim(); if(!v) return; const m=state.market; m.chat.push({r:'me',t:v}); const ap=[];
  if(/중견|규모|대기업|큰|매출/.test(v)&&!m.filters.includes('mid')){m.filters.push('mid');ap.push('중견 이상');}
  if(/라이선스|면허|허가|판매업/.test(v)&&!m.filters.includes('lic')){m.filters.push('lic');ap.push('판매 라이선스 보유');}
  if(/캐스트|casting/i.test(v)&&!m.filters.includes('cast')){m.filters.push('cast');ap.push('캐스트 취급');}
  m.chat.push({r:'ai',t: ap.length?`${ap.join(', ')} 조건을 반영했어요. 현재 후보 ${mktList().length}곳입니다.`:`현재 후보 ${mktList().length}곳입니다. 매출 규모·판매 라이선스·취급 품목으로 더 좁힐 수 있어요.`}); render(); }

/* ---------------- state ---------------- */
/* ============================================================
   포털 분리 — 국내영업 / 해외영업
     index.html     → window.PORTAL_ID='domestic'   (app.js 만 로드)
     overseas.html  → window.PORTAL_ID='overseas'   (app.js + overseas.js)
   공통 셸(state·helpers·render·탭바·이벤트)은 app.js 하나를 공유하고,
   화면(VIEWS)과 메뉴(nav)만 포털별로 갈아끼웁니다.
   ============================================================ */
const ROLES=['관리자','국내영업','해외영업','조회전용'];
const ICONS={
  search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"/>',
  shield:'<path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>',
  chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
};
// roles 가 있으면 그 역할만 메뉴가 보입니다(금액 민감 화면 등).
const PORTALS={
  domestic:{ id:'domestic', name:'BL TECH', sub:'영업 포털 · 국내', home:'dom-dash',
    roles:['관리자','국내영업','조회전용'], allow:['dom-','disc-','agency','doc','quote','lead','proposal','home','cert-hub'],
    nav:[ {grp:'고객 발굴 센터'}, {v:'disc-dash',t:'발굴 동선 · 대시보드',icon:'search'}, {v:'disc-market',t:'시장분석 · STP',sub:1}, {v:'disc-leads',t:'잠재 거래처 리스트',sub:1},
          {grp:'국내영업'}, {v:'dom-dash',t:'대시보드',icon:'grid'}, {v:'dom-shipping',t:'출고 현황',sub:1}, {v:'dom-clients',t:'거래처 등록',sub:1},
          {v:'dom-agencies',t:'미수금 관리',sub:1,roles:['관리자','국내영업']}, {v:'dom-returns',t:'반품 · 교환 처리',sub:1},
          {v:'dom-pricing',t:'보험수가표 · 견적서',sub:1}, {v:'dom-contracts',t:'계약 관리',sub:1,roles:['관리자','국내영업']},
          {grp:'공통'}, {v:'cert-hub',t:'인증·규제 허브',icon:'shield'} ] },
  overseas:{ id:'overseas', name:'BL TECH', sub:'영업 포털 · 해외', home:'ov-dash',
    roles:['관리자','해외영업','조회전용'], allow:['ov-','cert-hub'],
    nav:[ {grp:'해외영업'}, {v:'ov-dash',t:'대시보드',icon:'globe'}, {v:'ov-pricelist',t:'신규 고객',sub:1}, {v:'ov-orders',t:'수주 · 생산',sub:1},
          {v:'ov-agencies',t:'거래처 관리',sub:1}, {v:'ov-shipping',t:'선적 · 물류',sub:1}, {v:'ov-docs',t:'수출서류',sub:1},
          {grp:'공통'}, {v:'cert-hub',t:'인증·규제 허브',icon:'shield'} ] },
};
const PORTAL = PORTALS[window.PORTAL_ID] || PORTALS.domestic;
const OTHER  = PORTAL.id==='domestic' ? PORTALS.overseas : PORTALS.domestic;
const VIEWS  = {};   // 각 포털 스크립트가 자기 화면을 등록합니다
function roleOk(item){ return !item.roles || item.roles.includes(state.role); }
function portalOk(){ return PORTAL.roles.includes(state.role); }
function allowedView(v){ return PORTAL.allow.some(p=>v===p||v.startsWith(p)); }
/* 메뉴에서 숨기는 것만으로는 부족 — 대시보드 KPI·본문 링크로도 들어올 수 있으므로
   라우팅 단계에서 한 번 더 막습니다. (Firestore Rules 가 최종 방어선) */
const VIEW_ROLES={};
PORTAL.nav.forEach(it=>{ if(it.v&&it.roles) VIEW_ROLES[it.v]=it.roles; });
const VIEW_PARENT={ 'dom-ledger':'dom-agencies','dom-shipstatus':'dom-agencies','doc':'dom-agencies','agency':'dom-agencies','dom-followup':'dom-agencies' };
function viewRoleOk(v){ const r=VIEW_ROLES[v]||VIEW_ROLES[VIEW_PARENT[v]]; return !r || r.includes(state.role); }

/* ============================================================
   [1] 영구 저장 대상  →  Firestore 이관 예정
   새로고침·재로그인 후에도 남아야 하는 "업무 데이터".
   주석의 화살표가 Firestore 컬렉션/문서 매핑 계획입니다.
   ※ 원장·미수 금액 원본은 여기 넣지 않습니다(원본=영림원). FILE_POLICY 참고.
   ============================================================ */
let data = {
  journal:[],           // → journal/{id}          영업 일지
  userAlerts:[],        // → alerts/{id}           알림
  ledgerStatus:{},      // → sendStatus/ledger      원장·채권채무조회서 발송 상태
  shipStatus:{},        // → sendStatus/shipping    출고현황 발송 상태
  recvFollowups:[ {agency:'한백', note:'30일 초과 — 채권채무조회 대상', status:'미회수'}, {agency:'대성 메디칼', note:'D-9 갱신 협의 통화 예정', status:'미회수'}, {agency:'부산 정형', note:'정기 접촉 미접촉 21일', status:'미회수'} ], // → followups/{id}
  sugaSource:{ label:'2026-04-27 고시 기준', xls:null, rates:null, report:null }, // → priceTables/suga  업로드 반영본
  quoteUpload:null,     // → Storage 참조(견적서 증빙)
};

/* ============================================================
   [2] UI 임시 상태  →  저장하지 않음
   열린 탭·체크박스·필터·정렬 등 "화면 상태"만.
   Firestore에 넣지 말 것 (넣으면 쓰기 과금만 늘고 의미 없음).
   ============================================================ */
let state = { view:'dom-dash', tabs:[{id:'dom-dash',view:'dom-dash',label:'대시보드',ctx:null}], activeTab:'dom-dash', clientSel:undefined, clientNew:false, clientOcr:null,
  role:'관리자',
  recvTab:'미수 현황', shipMode:'의뢰', shipChk:new Set(), shipFilter:'전체', returnChk:new Set(),
  domField:'메디컬', ovField:'메디컬', fxRange:'1M', shipCase:'fob-customer', shipAgency:'o1', ovSelPO:0, ovPreview:null, plMode:'기존', agency:null, aTab:'개요', lead:null, checked:new Set(), docAgency:null, shipTab:'메디컬', ledgerChk:new Set(), narrowed:false,
  market:{ country:'전 세계 (미정)', region:'전체', searched:true, filters:[], chat:[] },
  suga:{ brand:'NEAL', grade:'A', premold:true, cover:true } };

/* ============================================================
   파일 업로드 정책 — 목적에 따라 보관 여부가 다릅니다.
   Firebase Storage에 "쌓이기만 하는 파일"을 막기 위한 기준.
   ============================================================ */
const FILE_POLICY = {
  extract: { badge:'추출용', note:'수치만 반영하고 원본은 보관하지 않습니다', keep:false },
  keep:    { badge:'증빙 보관', note:'증빙으로 보관됩니다', keep:true },
};
function uploadBadge(kind){ const p=FILE_POLICY[kind]; return `<span class="badge ${kind==='extract'?'muted':'teal'}" style="margin-left:6px">${p.badge}</span>`; }

/* 원장의 주인(system of record)은 영림원.
   포털은 원장을 복제하지 않고 "발송 대상 + 발송 상태"만 관리합니다.
   → Firestore 문서 폭증·읽기 과금을 막는 핵심 원칙. */
/* 출고 진행·출하완료는 공유 수주~출고 시스템이 주인.
   포털이 상태를 입력·추적하지 않고 조회만 합니다. */
function shipReadonlyNotice(){
  return `<div style="display:flex;align-items:flex-start;gap:9px;background:var(--surface-2);border:1px solid var(--border);border-left:3px solid var(--ink-2);border-radius:8px;padding:10px 13px;margin-bottom:14px;font-size:12.5px;line-height:1.6">
    <svg width="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" stroke-width="2" style="flex:0 0 15px;margin-top:2px"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7"/><circle cx="12" cy="12" r="3"/></svg>
    <div><b>조회 전용 화면입니다.</b> 재고 판정·출고 진행·<b>출하완료</b>는 수주~출고 시스템(생산·구매·출고팀)에서 관리해요. 이 포털은 주문 내역을 <b>보기만</b> 하고 상태를 바꾸지 않습니다.</div>
  </div>`;
}

function sorNotice(){
  return `<div style="display:flex;align-items:flex-start;gap:9px;background:var(--surface-2);border:1px solid var(--border);border-left:3px solid var(--teal);border-radius:8px;padding:10px 13px;margin-bottom:14px;font-size:12.5px;line-height:1.6">
    <svg width="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" style="flex:0 0 15px;margin-top:2px"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
    <div><b>금액 원본은 영림원(ERP)입니다.</b> 이 화면은 <b>발송 대상과 발송 상태</b>만 관리해요. 잔액·마감 수치는 엑셀 업로드로 반영되며, 포털이 원장을 따로 보관하지 않습니다.</div>
  </div>`;
}

/* ---------------- helpers ---------------- */
const gradeBadge = g => { const c={'A+':'teal','A':'info','B':'warn','C':'muted'}[g]||'muted'; return `<span class="badge ${c}">${g}</span>`; };
function setHead(t,c){ document.getElementById('ttl').textContent=t; document.getElementById('crumb').textContent=c; }
// 사용자·외부 응답 문자열을 HTML에 넣을 때 (챗봇 답변 등) — XSS 방지
function escapeHtml(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function toast(msg){ const t=document.getElementById('toast'); t.innerHTML='<svg width="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>'+msg; t.classList.add('show'); clearTimeout(window._tt); window._tt=setTimeout(()=>t.classList.remove('show'),2600); }
function openModal(html){ document.getElementById('modal').innerHTML=html; document.getElementById('modalBg').classList.add('show'); }
function closeModal(){ document.getElementById('modalBg').classList.remove('show'); }

/* ---------------- views ---------------- */
const sugaGrades=['A+','A','B','C']; const sugaGi={'A+':0,'A':1,'B':2,'C':3};
const sugaRate={'A+':'23%','A':'25%','B':'27%','C':'30%'};
// 단가(견적가)는 NEAL·SMILE 동일. p=[A+,A,B,C]. sN/sS = 2026-04-27 보험수가(브랜드별)
const sugaCommon=[
  {code:'8502028', n:'Cast', spec:'2"',         p:[1200,1300,1400,1500],      sN:5250,  sS:5250},
  {code:'8503028', n:'Cast', spec:'3"',         p:[1700,1800,2000,2200],      sN:7590,  sS:7590},
  {code:'8504028', n:'Cast', spec:'4"',         p:[1900,2100,2200,2500],      sN:8620,  sS:8620},
  {code:'8505028', n:'Cast', spec:'5"',         p:[2000,2100,2300,2600],      sN:8840,  sS:8840},
  {code:'8400028', n:'Splint (Roll)', spec:'2" × 4.5m', p:[27800,30200,32700,36300], sN:128050, sS:128050},
  {code:'8402028', n:'Splint (Roll)', spec:'3" × 4.5m', p:[33700,36700,39600,44000], sN:155300, sS:155300},
  {code:'8403028', n:'Splint (Roll)', spec:'4" × 4.5m', p:[35500,38600,41700,46300], sN:163320, sS:163320},
  {code:'8404028', n:'Splint (Roll)', spec:'5" × 4.5m', p:[38700,42100,45400,50500], sN:178340, sS:178340},
  {code:'8405028', n:'Splint (Roll)', spec:'6" × 4.5m', p:[49800,54100,58400,64900], sN:229180, sS:229180},
  {code:'8301028', n:'Splint (Pre-Cut)', spec:'2" × 12"', p:[3400,3700,4000,4400],   sN:15330, sS:15580},
  {code:'8305028', n:'Splint (Pre-Cut)', spec:'3" × 14"', p:[3800,4100,4400,4900],   sN:17070, sS:17070},
  {code:'8310028', n:'Splint (Pre-Cut)', spec:'3" × 40"', p:[6000,6500,7000,7800],   sN:27300, sS:27300},
  {code:'8312028', n:'Splint (Pre-Cut)', spec:'4" × 18"', p:[4500,4900,5200,5800],   sN:20360, sS:20360},
  {code:'8314028', n:'Splint (Pre-Cut)', spec:'4" × 34"', p:[6000,6500,7000,7800],   sN:27300, sS:27300},
  {code:'8321028', n:'Splint (Pre-Cut)', spec:'5" × 34"', p:[7100,7800,8400,9300],   sN:32680, sS:32680},
  {code:'8324028', n:'Splint (Pre-Cut)', spec:'5" × 50"', p:[10700,11600,12600,14000], sN:49130, sS:49130},
  {code:'8325028', n:'Splint (Pre-Cut)', spec:'6" × 34"', p:[7100,7800,8400,9300],   sN:32680, sS:32680},
  {code:'8326028', n:'Splint (Pre-Cut)', spec:'6" × 50"', p:[13100,14300,15400,17100], sN:60300, sS:60300},
];
const premoldLine=[
  {code:'K8103228', n:'NPSA-S (Premold)', price:10800, suga:31330},
  {code:'K8103228', n:'NPSA-M (Premold)', price:10800, suga:31330},
  {code:'K8103228', n:'NPSA-L (Premold)', price:10800, suga:31330},
  {code:'K8103028', n:'NPLA-S (Premold)', price:17180, suga:49870},
  {code:'K8103028', n:'NPLA-M (Premold)', price:17180, suga:49870},
  {code:'K8103028', n:'NPLA-L (Premold)', price:17180, suga:49870},
  {code:'K8103328', n:'NPSL-S (Premold)', price:17180, suga:47390},
  {code:'K8103328', n:'NPSL-M (Premold)', price:17180, suga:47390},
  {code:'K8103328', n:'NPSL-L (Premold)', price:17180, suga:47390},
  {code:'K8103128', n:'NPLL-S (Premold)', price:21880, suga:60350},
  {code:'K8103128', n:'NPLL-M (Premold)', price:21880, suga:60350},
  {code:'K8103128', n:'NPLL-L (Premold)', price:21880, suga:60350},
];
/* 의료보험코드 → 보험수가 override (업로드본). null이면 기본 고시값 사용 */
const sugaKnownCodes=new Set([...sugaCommon.map(x=>x.code), ...premoldLine.map(x=>x.code)]);
function sugaBaseRate(code){ const a=sugaCommon.find(x=>x.code===code); if(a) return a.sN; const b=premoldLine.find(x=>x.code===code); return b?b.suga:null; }
function sugaIsOv(code){ const r=data.sugaSource.rates; return !!(r && r[code]!=null && r[code]!==sugaBaseRate(code)); }
function sugaCommonRate(x, brand){ const r=data.sugaSource.rates; if(r && brand==='NEAL' && r[x.code]!=null) return r[x.code]; return brand==='NEAL'?x.sN:x.sS; }
function premoldRate(x){ const r=data.sugaSource.rates; return (r && r[x.code]!=null) ? r[x.code] : x.suga; }
function parseNum(v){ if(v==null) return null; const s=String(v).replace(/[, ]/g,'').replace(/원/g,''); if(s==='-'||s==='') return null; const n=Number(s); return isFinite(n)?n:null; }
function parseSugaWorkbook(wb){
  const rates={}; let parsed=0;
  wb.SheetNames.forEach(sn=>{
    const ws=wb.Sheets[sn]; if(!ws) return;
    const rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:''});
    // 헤더행: '코드'(보험코드/의료보험코드) + '보험수가' 가 같은 행에 있는 곳
    let h=-1;
    for(let i=0;i<Math.min(rows.length,25);i++){
      const cells=(rows[i]||[]).map(c=>String(c));
      if(cells.some(c=>/코드/.test(c)) && cells.some(c=>/보험\s*수가|상한금액/.test(c))){ h=i; break; }
    }
    if(h<0) return;
    const head=(rows[h]||[]).map(c=>String(c));
    const codeCol=head.findIndex(c=>/코드/.test(c));
    // '보험수가'·'상한금액' 컬럼 중 가장 오른쪽(=최신 고시일자) 선택
    let sugaCol=-1; head.forEach((c,j)=>{ if(/보험\s*수가|상한금액/.test(c)) sugaCol=j; });
    if(codeCol<0||sugaCol<0) return;
    for(let i=h+1;i<rows.length;i++){
      const row=rows[i]||[]; const raw=row[codeCol]; if(raw==null||raw==='') continue;
      const code=String(raw).trim().toUpperCase().replace(/\s/g,'');
      const val=parseNum(row[sugaCol]); if(val==null) continue;
      rates[code]=val; parsed++;
    }
  });
  let matched=0, changed=0;
  sugaKnownCodes.forEach(c=>{ if(rates[c]!=null){ matched++; if(rates[c]!==sugaBaseRate(c)) changed++; } });
  return { rates, report:{ parsed, matched, changed, total:sugaKnownCodes.size } };
}
const coverLine=[
  {n:'NCB-2010', price:3000},{n:'NCB-3008', price:3000},{n:'NCB-3012', price:3800},{n:'NCB-4008', price:3600},
  {n:'NCB-4014', price:4400},{n:'NCB-4018', price:5100},{n:'NCB-5012', price:4500},{n:'NCB-5018', price:5400},
];
function sugaSet(f,v){ const y=window.scrollY; state.suga[f]=v; render(); window.scrollTo(0,y); }
function sugaToggle(k){ const y=window.scrollY; state.suga[k]=!state.suga[k]; render(); window.scrollTo(0,y); }
function sugaTableHTML(){
  const st=state.suga, idx=sugaGi[st.grade];
  const ovc=c=>sugaIsOv(c)?'color:var(--teal);font-weight:700':'';
  const basic = sugaCommon.map(x=>`<tr><td></td><td>${st.brand} ${x.n} <span class="muted">${x.spec}</span></td><td class="num">${won(x.p[idx])}</td><td class="num" style="${ovc(x.code)}">${won(sugaCommonRate(x,st.brand))}</td></tr>`).join('');
  let groups = `<tr class="grouphdr"><td></td><td colspan="3"><b>기본 (캐스트 · 스플린트)</b> <span class="badge ok">항상 포함</span></td></tr>${basic}`;
  if(st.brand==='NEAL'){
    const pm = premoldLine.map(x=>`<tr><td></td><td>NEAL ${x.n}</td><td class="num">${won(x.price)}</td><td class="num" style="${ovc(x.code)}">${premoldRate(x)!=null?won(premoldRate(x)):'<span class="muted">–</span>'}</td></tr>`).join('');
    const cv = coverLine.map(x=>`<tr><td></td><td>NEAL ${x.n}</td><td class="num">${won(x.price)}</td><td class="num"><span class="muted">비급여</span></td></tr>`).join('');
    groups += `<tr class="grouphdr"><td style="text-align:center"><input type="checkbox" class="chk" ${st.premold?'checked':''} onclick="sugaToggle('premold')"></td><td colspan="3"><b>닐 프리몰드 라인</b> <span class="muted">견적서 선택 포함 · 단가 고정</span></td></tr>${pm}`;
    groups += `<tr class="grouphdr"><td style="text-align:center"><input type="checkbox" class="chk" ${st.cover?'checked':''} onclick="sugaToggle('cover')"></td><td colspan="3"><b>닐커버 라인 (NCB)</b> <span class="muted">견적서 선택 포함 · 단가 고정 · 비급여</span></td></tr>${cv}`;
  }
  return `<div class="card">
    <div style="display:flex;align-items:center;border-bottom:1px solid var(--border)">
      <div class="tabs" style="flex:1;border-bottom:none">${['NEAL','SMILE'].map(b=>`<button class="${b===st.brand?'active':''}" onclick="sugaSet('brand','${b}')">${b}</button>`).join('')}</div>
    </div>
    <div class="pad">
      <div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-bottom:13px">
        <span class="muted" style="font-size:12px;margin-right:2px">등급</span>
        ${sugaGrades.map(g=>`<button class="btn sm" style="${g===st.grade?'background:var(--teal);border-color:var(--teal);color:#fff':''}" onclick="sugaSet('grade','${g}')">${g}</button>`).join('')}
        <span class="muted" style="font-size:12px;margin-left:6px">단가 적용률 ${sugaRate[st.grade]} · 좌측 체크로 견적서 포함</span>
      </div>
      <div class="ov" style="border:1px solid var(--border);border-radius:8px;overflow-x:auto"><table>
        <thead><tr><th style="width:34px"></th><th>품목</th><th class="num">단가 (${st.grade})</th><th class="num">보험수가</th></tr></thead>
        <tbody>${groups}</tbody>
      </table></div>
    </div>
  </div>`;
}
function nowStamp(){ const n=new Date(),p=x=>String(x).padStart(2,'0'); return `${n.getFullYear()}-${p(n.getMonth()+1)}-${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`; }
function sugaUpload(input){
  const f=input.files&&input.files[0]; if(!f){ return; }
  // 정리표(우리 제품 보험수가표) → 의료보험코드 기준 실제 반영
  if(typeof XLSX==='undefined'){
    data.sugaSource.xls={ name:f.name, at:nowStamp() };
    data.sugaSource.label='업로드본 ('+f.name+')';
    toast('엑셀 파서 미로딩(인터넷 필요) — 파일명만 기록');
    input.value=''; render(); return;
  }
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const wb=XLSX.read(new Uint8Array(e.target.result), {type:'array'});
      const res=parseSugaWorkbook(wb);
      if(res.report.matched===0){
        toast('보험수가를 못 읽었어요 — 양식(의료보험코드·보험수가 컬럼) 확인 필요');
        input.value=''; render(); return;
      }
      data.sugaSource.rates=res.rates;
      data.sugaSource.report=res.report;
      data.sugaSource.xls={ name:f.name, at:nowStamp() };
      data.sugaSource.label='업로드본 ('+f.name+')';
      toast('수가표 반영 — '+res.report.matched+'개 품목 매칭 · '+res.report.changed+'개 변경');
    }catch(err){
      toast('엑셀 읽기 실패: '+(err&&err.message||err));
    }
    input.value=''; render();
  };
  reader.readAsArrayBuffer(f);
}
function sugaClearXls(){ data.sugaSource.xls=null; data.sugaSource.rates=null; data.sugaSource.report=null; data.sugaSource.label='2026-04-27 고시 기준'; toast('업로드본 해제 — 기본 고시값으로 복귀'); render(); }
function quoteUpload(input){
  const f=input.files&&input.files[0]; if(!f){ return; }
  data.quoteUpload={ name:f.name, at:nowStamp() };
  toast('견적서 파일 ‘'+f.name+'’ 첨부 완료 — 다우오피스로 발송할 수 있습니다');
  input.value=''; render();
}
function quoteClear(){ data.quoteUpload=null; toast('첨부 견적서 해제'); render(); }
function sugaUploadCard(){
  const s=data.sugaSource, r=s.report;
  return `<div class="card" style="margin-bottom:16px"><div class="pad">
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <div style="flex:1;min-width:200px">
        <div style="font-weight:700;font-size:14px">수가표 자료 관리</div>
        <div class="muted" style="font-size:12px;margin-top:3px">현재 적용본 : <b style="color:var(--ink)">${s.label}</b>${s.xls?` <span class="muted">· 업로드 ${s.xls.at}</span>`:''}</div>
      </div>
      <label class="btn primary" style="cursor:pointer"><input type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="sugaUpload(this,'xls')">정리표 업로드 (표 반영)</label>${uploadBadge('extract')}
      ${s.rates?`<button class="btn sm" onclick="sugaClearXls()">기본 고시값으로</button>`:''}
    </div>
    ${r?`<div style="margin-top:11px;display:flex;align-items:center;gap:10px;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:8px;padding:9px 12px;font-size:12.5px;color:#065F46"><svg width="15" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg><b>의료보험코드 매칭 ${r.matched}/${r.total}개</b> · 보험수가 변경 ${r.changed}개 · 시트에서 ${r.parsed}행 인식</div>`:''}
    <div class="muted" style="font-size:11.5px;margin-top:10px;line-height:1.6">· <b>정리표</b>(우리 제품 보험수가표 NEAL/SMILE)를 올리면 <b>의료보험코드</b>를 키로 표의 보험수가에 자동 반영됩니다.<br>· 양식: <b>의료보험코드 · 품명 · 규격 · 단위 · 보험수가</b> 컬럼이 한 행에 있으면 인식. 보험수가 컬럼이 여러 개면 가장 오른쪽(최신 고시일)을 적용.<br>· 현재는 화면 세션에만 반영됩니다(새로고침 시 초기화). 영구 저장·이력은 다음 단계 Firebase 연동으로 확장.</div>
  </div></div>`;
}

function vHome(){
  setHead('홈','BL TECH 영업 포털 · 시작하기');
  const steps=[
    ['01','고객 발굴','거래처 후보를 찾아 검증'],
    ['02','영업 진행','국내·해외 주문·출고 관리'],
    ['03','인증·사후관리','진입 요건·문서·미수금'],
  ];
  const areas=[
    { bg:'--info-soft', fg:'--info', title:'고객 발굴 센터', badge:'1단계', badgeC:'info',
      icon:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
      desc:'새로 거래할 만한 곳을 찾아 검증하고, 영업팀으로 넘기는 단계예요.',
      links:'<button class="btn sm" data-view="disc-dash">발굴 동선</button><button class="btn sm" data-view="disc-leads">잠재 거래처</button>' },
    { bg:'--teal-soft', fg:'--teal-d', title:'국내영업', badge:'추천 시작점', badgeC:'teal',
      icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
      desc:'국내 대리점의 주문·출고·미수금·반품을 한 곳에서 관리해요.',
      links:'<button class="btn primary sm" data-view="dom-dash">대시보드 열기</button><button class="btn sm" data-view="dom-agencies">미수금 관리</button><button class="btn sm" data-view="dom-clients">거래처 등록</button>' },
    { bg:'--ok-soft', fg:'--ok', title:'해외영업',
      icon:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"/>',
      desc:'수출 거래처의 수주·생산·선적·수출서류를 관리해요.',
      links:'<button class="btn sm" data-view="ov-dash">대시보드</button><button class="btn sm" data-view="ov-orders">수주·생산</button>' },
    { bg:'--warn-soft', fg:'--warn', title:'인증·규제 허브', badge:'공통', badgeC:'muted',
      icon:'<path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>',
      desc:'제품 인증서와 규제 진입 요건을 모아보는 공통 자료실이에요.',
      links:'<button class="btn sm" data-view="cert-hub">허브 열기</button>' },
  ];
  return `
  <div class="pagehead"><div><div class="t">환영합니다 👋</div><div class="d">BL TECH 영업 포털이에요. 아래에서 업무 영역을 고르면 바로 시작할 수 있어요. 왼쪽 메뉴로 언제든 이동할 수 있습니다.</div></div></div>
  <div class="seclabel">이렇게 사용해요</div>
  <div class="flow" style="margin-bottom:26px">
    ${steps.map(s=>`<div class="step"><div class="n">${s[0]}</div><div class="h">${s[1]}</div><div class="s">${s[2]}</div></div>`).join('')}
  </div>
  <div class="seclabel">업무 영역</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(258px,1fr));gap:16px">
    ${areas.map(a=>`<div class="card"><div class="pad">
      <div style="display:flex;align-items:center;gap:11px;margin-bottom:11px">
        <div style="width:40px;height:40px;border-radius:11px;background:var(${a.bg});color:var(${a.fg});display:flex;align-items:center;justify-content:center;flex:0 0 40px">
          <svg width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${a.icon}</svg>
        </div>
        <div style="flex:1;font-size:15.5px;font-weight:700">${a.title}</div>
        ${a.badge?`<span class="badge ${a.badgeC}">${a.badge}</span>`:''}
      </div>
      <div style="color:var(--ink-2);font-size:13px;line-height:1.65;min-height:42px">${a.desc}</div>
      <div class="quick" style="margin-top:13px">${a.links}</div>
    </div></div>`).join('')}
  </div>
  <div class="muted" style="font-size:12.5px;margin-top:22px;display:flex;align-items:flex-start;gap:7px;line-height:1.6">
    <svg width="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex:0 0 15px;margin-top:2px"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    <span>처음이시면 <b style="font-weight:600;color:var(--ink-2)">국내영업 → 대시보드</b>부터 살펴보시길 추천해요. 좌측 상단 로고를 누르면 언제든 이 홈으로 돌아옵니다.</span>
  </div>`;
}

function vDomDash(){
  setHead('대시보드','국내영업 · '+state.domField);
  const ags=curAgencies();
  const totalRecv=ags.reduce((s,a)=>s+a.recv,0);
  const totalSales=ags.reduce((s,a)=>s+a.sales,0);
  const recvCount=ags.filter(a=>a.recv>0).length;
  const meta=fieldMeta[state.domField];
  const alerts=[...data.userAlerts, ...alertsByField[state.domField]];
  const stages=['제안','견적','협상','계약','납품'];
  const pipeline=pipelineByField[state.domField];
  // 출하완료는 포털이 모르므로 '대기 건수' 대신 오늘 들어온 주문 수를 보여줍니다(조회 전용)
  const shipToday=medOrders.filter(o=>o.kind==='주문'&&o.date===TODAY.toISOString().slice(0,10)).length;
  return `
  ${fieldTabs()}
  <div class="kpis" style="margin-bottom:20px">
    <div class="kpi"><div class="lab">당월 매출</div><div class="val">${won(totalSales)}</div><div class="sub">${state.domField} 분야</div></div>
    <div class="kpi" data-view="dom-agencies" style="cursor:pointer"><div class="lab">미수금 총액</div><div class="val warn">${won(totalRecv)}</div><div class="sub">${recvCount}곳 · 미수금 관리 →</div></div>
    <div class="kpi" data-view="dom-shipping" style="cursor:pointer"><div class="lab">오늘 주문</div><div class="val">${shipToday}건</div><div class="sub">출고 현황 (조회) →</div></div>
  </div>
  <div class="seclabel">영업 일지 <span class="muted" style="font-weight:400">· 오늘 한 일을 적으면 유형별로 자동 분류돼 알림·Follow-up으로 갑니다</span></div>
  <div class="card"><div class="pad">
    <div style="display:flex;gap:8px">
      <input id="journalInput" class="search" style="flex:1" placeholder="예) 한백에 미수금 월말 분할입금 요청하고 왔어 / 부산 정형 반품 2건 접수" onkeydown="if(event.key==='Enter')journalSubmit()">
      <button class="btn primary" onclick="journalSubmit()">기록</button>
    </div>
    <div style="margin-top:4px">${data.journal.length?data.journal.slice(0,6).map(j=>`<div style="display:flex;align-items:flex-start;gap:9px;padding:9px 0;border-bottom:1px solid var(--border)"><span class="badge ${typeColor(j.type)}" style="margin-top:1px">${j.type}</span><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">${j.summary}</div><div class="muted" style="font-size:11.5px">입력: ${j.raw} · ${j.when}</div></div></div>`).join(''):'<div class="muted" style="font-size:12.5px;padding:10px 2px">아직 기록이 없어요. 막 적어도 돼요 — 예) “한백에 미수금 100만원씩 월말에 입금하라고 말하고 왔어” → <b style="color:var(--ink-2)">[미수금] 한백 월말 100만원 입금 확인</b> 으로 정리·분류됩니다.</div>'}</div>
  </div></div>
  <div class="seclabel" style="margin-top:22px">알림 <span class="muted" style="font-weight:400">· 영업 일지에서 분류된 항목이 자동으로 올라옵니다</span></div>
  <div class="card"><div class="pad"><div class="ledger-list">
    ${alerts.map(x=>`<div class="li"><span class="dotmark" style="background:var(--${x.tag})"></span><div class="ti"><div style="font-size:13px;font-weight:600">${x.t}</div><div class="muted" style="font-size:12px">${x.s}</div></div></div>`).join('')}
  </div></div></div>
  <div class="seclabel" style="margin-top:22px">영업 파이프라인 (단계별)</div>
  <div class="row" style="overflow:auto;flex-wrap:nowrap;gap:10px;margin-bottom:6px">
    ${stages.map(s=>{const deals=pipeline[s]||[];const sum=deals.reduce((a,d)=>a+d.amt,0);
      return `<div style="flex:1;min-width:148px">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 11px;background:var(--surface-2);border:1px solid var(--border);border-bottom:none;border-radius:8px 8px 0 0"><b style="font-size:13px">${s}</b><span class="badge muted">${deals.length}</span></div>
        <div style="border:1px solid var(--border);border-top:none;border-radius:0 0 8px 8px;padding:8px;background:var(--surface);min-height:96px">
          ${deals.map(d=>`<div style="border:1px solid var(--border);border-radius:7px;padding:9px 10px;margin-bottom:7px;background:#fff"><b style="font-size:12.5px">${d.n}</b><div class="muted" style="font-size:11.5px;margin-top:2px">${won(d.amt)}</div></div>`).join('')||'<div class="muted" style="font-size:12px;padding:6px">-</div>'}
          <div style="font-size:11px;color:var(--ink-3);text-align:right">소계 ${won(sum)}</div>
        </div>
      </div>`;}).join('')}
  </div>
  <div class="muted" style="font-size:12px;margin-bottom:6px">발굴 센터에서 이관된 기회가 자동으로 단계에 표시됩니다.</div>`;
}

function vAgencies(){
  setHead('미수금 관리','국내영업 · '+state.domField);
  const ags=curAgencies();
  const totalRecv=ags.reduce((s,a)=>s+a.recv,0);
  const recvList=ags.filter(a=>a.recv>0).sort((x,y)=>new Date(x.pay)-new Date(y.pay));
  const recvCount=recvList.length;
  const avgDays=recvCount?Math.round(recvList.reduce((s,a)=>s+Math.max(0,-daysUntil(a.pay)),0)/recvCount):0;
  const tab=state.recvTab||'미수 현황';
  const tabs=['미수 현황','원장 발송','채권채무조회서 발송'];
  const fu=data.recvFollowups;
  const fuOpen=fu.filter(f=>f.status!=='회수완료').length;
  const fuCard=`<div class="card"><div class="pad">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px"><div class="seclabel" style="margin:0">회수 Follow-up</div><span class="badge ${fuOpen?'warn':'ok'}">미회수 ${fuOpen}</span></div>
    <div style="display:flex;gap:6px;margin-bottom:10px"><input id="recvFuInput" class="search" style="flex:1;font-size:12.5px" placeholder="회수 메모 추가…" onkeydown="if(event.key==='Enter')recvFuAdd()"><button class="btn sm primary" onclick="recvFuAdd()">추가</button></div>
    <div style="max-height:360px;overflow:auto">${fu.length?fu.map((f,i)=>`<div style="display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)"><button class="btn sm" style="padding:2px 7px;white-space:nowrap;${f.status==='회수완료'?'background:var(--ok-soft);border-color:#A9DCC4;color:var(--ok)':''}" onclick="recvFuToggle(${i})">${f.status==='회수완료'?'✓ 완료':'미회수'}</button><div style="flex:1;min-width:0;font-size:12.5px;${f.status==='회수완료'?'color:var(--ink-3);text-decoration:line-through':''}">${f.agency?'<b>'+f.agency+'</b> · ':''}${f.note}</div></div>`).join(''):'<div class="muted" style="font-size:12.5px;padding:8px 0">회수 항목이 없어요. 대시보드 <b>영업 일지</b>에 미수 관련 내용을 적으면 자동으로 올라옵니다.</div>'}</div>
  </div></div>`;
  let main;
  if(tab==='미수 현황'){
    main=`
    <div class="seclabel">거래처별 미수 현황</div>
    <div class="card ov"><table>
      <thead><tr><th>업체</th><th class="num">미수금</th><th>마지막 입금일</th><th>경과</th><th></th></tr></thead>
      <tbody>${recvList.length?recvList.map(a=>{const b=ageBucket(a.pay); return `<tr class="clickable" data-agency="${a.id}"><td><b>${a.name}</b></td><td class="num" style="color:var(--warn);font-weight:600">${won(a.recv)}</td><td class="muted">${dispDate(a.pay)}</td><td><span class="badge ${b.c}">${b.l}</span></td><td class="num"><button class="btn sm" data-doc="${a.id}">조회서</button></td></tr>`;}).join(''):'<tr><td colspan="5" class="muted" style="padding:14px;text-align:center">미수금 없음</td></tr>'}</tbody>
    </table></div>
    <div class="muted" style="font-size:12px;margin-top:8px">행 클릭 → 대리점 상세(원장 조회 포함), ‘조회서’ → 채권채무조회서 미리보기.</div>
    <div class="seclabel" style="margin-top:18px">거래처 검색</div>
    <div style="position:relative;max-width:440px"><input id="agencySearch" class="search" style="width:100%" placeholder="거래처 이름·지역 검색…" autocomplete="off" oninput="domAgencySearch(this.value)" onfocus="domAgencySearch(this.value)"><div id="agencyResults" class="searchdrop" style="display:none"></div></div>
    <div class="muted" style="font-size:12.5px;margin-top:8px">업체명을 클릭하면 상세로 들어갑니다.</div>`;
  } else if(tab==='원장 발송'){
    main=`<div class="card"><div class="pad" style="padding-top:14px">${ledgerSection('원장')}</div></div>`;
  } else {
    main=`<div class="card"><div class="pad" style="padding-top:14px">${ledgerSection('채권채무조회서')}</div></div>`;
  }
  return `
  ${fieldTabs()}
  <div class="pagehead"><div><div class="t">미수금 관리</div><div class="d">${state.domField} · 미수 현황·원장/채권채무조회서 발송·회수 Follow-up을 한 화면에서.</div></div></div>
  ${sorNotice()}
  <div class="kpis" style="margin-bottom:16px">
    <div class="kpi"><div class="lab">미수금 총액</div><div class="val warn">${won(totalRecv)}</div><div class="sub">${ags.length}곳 중 ${recvCount}곳</div></div>
    <div class="kpi"><div class="lab">미수 거래처</div><div class="val">${recvCount}곳</div></div>
    <div class="kpi"><div class="lab">평균 경과일</div><div class="val ${avgDays>=30?'warn':''}">${avgDays}일</div></div>
  </div>
  <div class="card" style="margin-bottom:14px"><div class="tabs">${tabs.map(t=>`<button class="${t===tab?'active':''}" onclick="setRecvTab('${t}')">${t}</button>`).join('')}</div></div>
  <div class="row" style="align-items:flex-start;gap:14px">
    <div style="flex:1;min-width:300px">${main}</div>
    <div style="flex:0 0 290px;min-width:260px">${fuCard}</div>
  </div>`;
}
function domAgencySearch(q){
  const box=document.getElementById('agencyResults'); if(!box) return;
  q=(q||'').trim();
  if(!q){ box.style.display='none'; box.innerHTML=''; return; }
  const list=curAgencies().filter(a=>a.name.includes(q)||a.region.includes(q));
  box.style.display='block';
  if(!list.length){ box.innerHTML='<div class="muted" style="font-size:12.5px;padding:10px 12px">‘'+q+'’ 검색 결과가 없습니다.</div>'; return; }
  box.innerHTML=list.map(a=>`<div class="opt clickable" data-agency="${a.id}"><div style="flex:1;min-width:0"><b style="font-size:13px">${a.name}</b> <span class="muted" style="font-size:12px">· ${a.region} · ${a.grade}등급</span></div><span class="num" style="font-size:12.5px;white-space:nowrap;${a.recv>0?'color:var(--warn);font-weight:600':'color:var(--ink-3)'}">${a.recv>0?won(a.recv):'미수 없음'}</span></div>`).join('');
}

/* ---------------- 거래처 등록·수정·조회 (DUZONE 일반거래처등록 스타일) ---------------- */
let clients = [
  {code:'00001', name:'한백', short:'한백', biz:'221-11-80344', ceo:'김우영', sector:'도소매', item:'의료기기', zip:'24239', addr:'인천광역시 미추홀구 경인로 100', tel:'032-123-4567', fax:'032-123-4568', email:'hanbaek@example.kr', region:'인천·경기', grade:'A', since:'2021-03-02', use:'사용', log:[]},
  {code:'00002', name:'대성 메디칼', short:'대성', biz:'113-81-00045', ceo:'박성호', sector:'도소매', item:'의료기기', zip:'06236', addr:'서울특별시 강남구 테헤란로 201', tel:'02-555-1200', fax:'02-555-1201', email:'sales@daesung.kr', region:'서울', grade:'A+', since:'2019-07-10', use:'사용', log:[]},
  {code:'00003', name:'심플렉스인터넷(카페24)', short:'카페24', biz:'117-81-40065', ceo:'이재석', sector:'서비스', item:'전자상거래', zip:'07242', addr:'서울특별시 영등포구 은행로 11', tel:'1644-0010', fax:'', email:'help@cafe24.com', region:'서울', grade:'B', since:'2022-01-05', use:'사용', log:[]},
  {code:'00004', name:'부산 정형', short:'부산정형', biz:'605-12-77821', ceo:'정대훈', sector:'도소매', item:'의료기기', zip:'47007', addr:'부산광역시 부산진구 중앙대로 700', tel:'051-700-3000', fax:'051-700-3001', email:'', region:'부산·경남', grade:'B', since:'2020-11-18', use:'사용', log:[]},
  {code:'00005', name:'우리 헬스케어', short:'우리헬스', biz:'504-23-66110', ceo:'한지원', sector:'도소매', item:'의료기기', zip:'41937', addr:'대구광역시 중구 동덕로 50', tel:'053-200-7700', fax:'', email:'care@woori.kr', region:'대구', grade:'B', since:'2023-02-21', use:'사용', log:[]},
  {code:'00006', name:'중부 의료기', short:'중부', biz:'305-10-22034', ceo:'오세훈', sector:'도소매', item:'의료기기', zip:'34111', addr:'대전광역시 유성구 대학로 99', tel:'042-600-1200', fax:'', email:'', region:'대전·충청', grade:'C', since:'2024-05-09', use:'미사용', log:[]},
];
function clientFind(code){ return clients.find(c=>c.code===code); }
function clientNextCode(){ const mx=clients.reduce((m,c)=>Math.max(m, parseInt(c.code,10)||0),0); return String(mx+1).padStart(5,'0'); }
function nowStamp(){ const d=new Date(); const p=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }
function clientListHTML(q){
  const list=clients.filter(c=>!q||c.name.includes(q)||c.code.includes(q)||(c.ceo||'').includes(q));
  return list.length? list.map(c=>`<div class="clrow ${c.code===state.clientSel&&!state.clientNew?'on':''}" onclick="clientSelect('${c.code}')"><span class="muted" style="font-size:11.5px;width:42px;flex:0 0 42px">${c.code}</span><b style="flex:1;min-width:0;font-size:13px;${c.use==='미사용'?'color:var(--ink-3);text-decoration:line-through':''}">${c.name}</b>${c.grade?gradeBadge(c.grade):''}</div>`).join('')
    : '<div class="muted" style="font-size:12.5px;padding:12px">검색 결과가 없습니다.</div>';
}
function clientListFilter(q){ const box=document.getElementById('clientList'); if(box) box.innerHTML=clientListHTML((q||'').trim()); }
function clientSelect(code){ state.clientSel=code; state.clientNew=false; state.clientOcr=null; render(); }
function clientNewForm(){ state.clientNew=true; state.clientOcr=null; render(); }
function clientOcr(input){
  const f=input.files&&input.files[0]; if(!f) return;
  const st=document.getElementById('ocrStatus'); if(st) st.innerHTML='<span class="badge warn">인식 중… '+f.name+'</span>';
  const img=(f.type||'').startsWith('image/')?URL.createObjectURL(f):'';
  // (프로토타입) 실제 OCR 대신 사업자등록증에서 읽어온 것처럼 결과를 채웁니다.
  setTimeout(function(){
    state.clientNew=true;
    state.clientOcr={ name:'메디라인 주식회사', biz:'215-87-43210', ceo:'김도윤', sector:'도매 및 소매업', item:'의료용품', addr:'경기도 성남시 분당구 판교로 256', since:'2018-04-15',
      _img:img, _file:f.name, _fields:['name','biz','ceo','sector','item','addr','since'] };
    toast('사업자등록증을 자동 인식했어요 — 내용을 확인·수정 후 등록하세요');
    render();
  }, 850);
}
function clientSave(){
  const g=id=>{const e=document.getElementById(id); return e?e.value.trim():'';};
  const data={ name:g('c_name'), short:g('c_short'), biz:g('c_biz'), ceo:g('c_ceo'), sector:g('c_sector'), item:g('c_item'), zip:g('c_zip'), addr:g('c_addr'), tel:g('c_tel'), fax:g('c_fax'), email:g('c_email'), region:g('c_region'), grade:g('c_grade'), since:g('c_since'), use:g('c_use') };
  if(!data.name){ toast('거래처명은 필수입니다'); return; }
  if(state.clientNew){
    const code=clientNextCode();
    clients.push(Object.assign({code, log:[{when:nowStamp(), items:['신규 등록']}]}, data));
    state.clientSel=code; state.clientNew=false;
    toast('거래처 '+code+' 신규 등록되었습니다');
  } else {
    const c=clientFind(state.clientSel); if(!c){ toast('대상을 찾을 수 없습니다'); return; }
    const labels={name:'거래처명',short:'약칭',biz:'사업자등록번호',ceo:'대표자',sector:'업태',item:'종목',zip:'우편번호',addr:'주소',tel:'전화',fax:'팩스',email:'메일',region:'지역',grade:'등급',since:'거래시작일',use:'사용여부'};
    const items=[];
    Object.keys(data).forEach(k=>{ if((c[k]||'')!==(data[k]||'')){ items.push(`${labels[k]}: ‘${c[k]||'-'}’ → ‘${data[k]||'-'}’`); c[k]=data[k]; } });
    if(!items.length){ toast('변경된 내용이 없습니다'); return; }
    c.log=c.log||[]; c.log.unshift({when:nowStamp(), items});
    toast('수정되었습니다 ('+items.length+'개 항목)');
  }
  state.clientOcr=null;
  render();
}

/* ---------------- 영업 일지 (자동 분류) ---------------- */
function typeColor(t){ return {회수:'warn',출고:'teal',반품:'danger',계약:'info',일반:'muted'}[t]||'muted'; }
function allAgencyNames(){ return clients.map(c=>c.name).concat(Object.keys(agenciesByField).reduce((a,k)=>a.concat(agenciesByField[k].map(x=>x.name)),[])); }
function classifyLog(t){
  let type='일반';
  if(/미수|입금|수금|채권|받을|결제|미납|회수/.test(t)) type='회수';
  else if(/출고|배송|납품|선적|재고|발주/.test(t)) type='출고';
  else if(/반품|교환|불량|클레임|하자|파손/.test(t)) type='반품';
  else if(/계약|갱신|단가|견적|입찰/.test(t)) type='계약';
  let agency='';
  for(const nm of allAgencyNames()){ if(nm && t.includes(nm)){ agency=nm; break; } }
  return {type, agency};
}
function lotToDate(lot){ const m=String(lot||'').match(/^(\d{4})(\d{2})(\d{2})/); return m?`${m[1]}-${m[2]}-${m[3]}`:(lot||'—'); }
// 막 적은 메모 → 업무 용어로 정리 ([유형] 거래처 시점 금액 핵심)
function summarizeLog(t, type, agency){
  const tag={회수:'미수금',출고:'출고',반품:'반품',계약:'계약',일반:'활동'}[type];
  let amount=''; const am=t.match(/([0-9][0-9,]*)\s*(억원|억|만원|만|천원|천|원)/);
  if(am){ const num=am[1].replace(/,/g,''); const unit=/억/.test(am[2])?'억원':/만/.test(am[2])?'만원':/천/.test(am[2])?'천원':'원'; amount=num+unit; }
  let timing=''; const tk=['월말','말일','매월','분기말','반기말','연말','이번 주','이번주','다음 주','다음주','금주','오늘','내일','모레'];
  for(const k of tk){ if(t.includes(k)){ timing=k.replace('이번주','이번 주').replace('다음주','다음 주'); break; } }
  const dm=t.match(/D[-–]?\s?(\d+)/i); if(dm) timing='D-'+dm[1];
  let qty=''; const qm=t.match(/([0-9]+)\s*(건|개|박스|롤|EA|ea)/); if(qm) qty=qm[1]+(qm[2]==='ea'?'EA':qm[2]);
  let action='';
  if(type==='회수'){
    if(/못\s*받|안\s*받|미입금|연체|밀린|아직[^.]*(안|않|못)|입금\s*(안|못|전)|안\s*들어|미회수/.test(t)) action='미입금';
    else if(/입금\s*완료|입금됨|입금\s*받|입금\s*됐|받았|들어왔|수금\s*완료|완납|결제\s*완료|회수\s*완료|정산\s*완료/.test(t)) action='입금 완료';
    else if(/한대|한다고|하기로|하겠|할게|줄게|준다고|준대|예정|약속|확약/.test(t)) action='입금 예정';
    else if(/하라고|요청|독촉|달라고|부탁|당부|말하고|얘기|안내|통보|협의/.test(t)) action='입금 요청';
    else action='회수 예정';
  }
  else if(type==='출고') action=/납품/.test(t)?'납품':/발송|보냄|보냈/.test(t)?'발송':'출고';
  else if(type==='반품') action=/교환/.test(t)?'교환 접수':'반품 접수';
  else if(type==='계약') action=/갱신/.test(t)?'계약 갱신':/견적/.test(t)?'견적 발송':/단가/.test(t)?'단가 협의':'계약 협의';
  const parts=[agency, timing, amount, qty, action].filter(Boolean);
  return `[${tag}] ${parts.join(' ')}`.replace(/\s+/g,' ').trim();
}
function journalSubmit(){
  const inp=document.getElementById('journalInput'); const v=(inp&&inp.value||'').trim(); if(!v) return;
  const r=classifyLog(v);
  const summary=summarizeLog(v, r.type, r.agency);
  data.journal.unshift({when:nowStamp(), raw:v, summary, type:r.type, agency:r.agency});
  data.userAlerts.unshift({tag:typeColor(r.type), t:summary, s:v});
  if(r.type==='회수') data.recvFollowups.unshift({agency:r.agency||'', note:summary.replace(/^\[[^\]]+\]\s*/, ''), status:'미회수'});
  toast('영업 일지 정리 → '+summary);
  render();
}
/* ---------------- 미수금 회수 Follow-up ---------------- */
function recvFuAdd(){ const inp=document.getElementById('recvFuInput'); const v=(inp&&inp.value||'').trim(); if(!v){ toast('내용을 입력하세요'); return; } data.recvFollowups.unshift({agency:'', note:v, status:'미회수'}); toast('회수 Follow-up에 추가했습니다'); render(); }
function recvFuToggle(i){ const f=data.recvFollowups[i]; if(!f) return; f.status=f.status==='회수완료'?'미회수':'회수완료'; render(); }
function setRecvTab(t){ state.recvTab=t; render(); }
function setShipMode(m){ state.shipMode=m; render(); }
/* ---------------- 출고현황 (출고 내역 리스트 — 언제·무엇·수량) ---------------- */
const shipRecords=[
  {date:'2026-06-13', no:'IS2606000412', agency:'한백', code:'NPC-2P-GR', item:'NAC 캐스트 2"', qty:100, price:1200},
  {date:'2026-06-13', no:'IS2606000412', agency:'한백', code:'NHRS-3450N', item:'롤 스플린트 3"', qty:50, price:33700},
  {date:'2026-06-12', no:'IS2606000388', agency:'대성 메디칼', code:'NPC-3P-GR', item:'NAC 캐스트 3"', qty:80, price:1700},
  {date:'2026-06-12', no:'IS2606000388', agency:'대성 메디칼', code:'NHPS-3014N', item:'(프리컷) NHPS-3014', qty:40, price:3800},
  {date:'2026-06-10', no:'IS2606000351', agency:'현대의료홀딩스', code:'MDCAAA-0307-BL', item:'(알파)NAC-2F-BL', qty:30, price:1200},
  {date:'2026-06-10', no:'IS2606000351', agency:'현대의료홀딩스', code:'MDCAAA-0407-GR', item:'(알파)NAC-3F-GR', qty:100, price:1700},
  {date:'2026-06-09', no:'IS2606000333', agency:'우리 헬스케어', code:'NPC-4P-GR', item:'NAC 캐스트 4"', qty:60, price:1900},
  {date:'2026-06-05', no:'IS2606000290', agency:'부산 정형', code:'NHRS-4450N', item:'롤 스플린트 4"', qty:30, price:40000},
  {date:'2026-06-03', no:'IS2606000251', agency:'한백', code:'NUP-3100', item:'언더패드 3"', qty:20, price:22000},
  {date:'2026-05-29', no:'IS2605000902', agency:'대성 메디칼', code:'NPC-2P-GR', item:'NAC 캐스트 2"', qty:120, price:1200},
  {date:'2026-05-23', no:'IS2605000844', agency:'중부 의료기', code:'NHPS-4034N', item:'(프리컷) NHPS-4034', qty:25, price:9500},
  {date:'2026-05-16', no:'IS2605000770', agency:'현대의료홀딩스', code:'NPC-5P-GR', item:'NAC 캐스트 5"', qty:50, price:2300},
];
function shipStatusList(){ const f=state.shipFilter||'전체'; return f==='전체'?shipRecords:shipRecords.filter(r=>r.agency===f); }
function shipSetFilter(v){ state.shipFilter=v; render(); }
function shipToggle(k){ if(state.shipChk.has(k)) state.shipChk.delete(k); else state.shipChk.add(k); render(); }
function shipCheckAll(){ const keys=shipStatusList().map(r=>r.no+'-'+r.code); const allOn=keys.every(k=>state.shipChk.has(k)); keys.forEach(k=>allOn?state.shipChk.delete(k):state.shipChk.add(k)); render(); }
function sendOk(key){ var h=0; for(var i=0;i<key.length;i++) h=(h*31+key.charCodeAt(i))>>>0; return (h%5)!==0; }
function statusBadge(s){ if(s==='전송중') return '<span class="badge info">전송중…</span>'; if(s==='성공') return '<span class="badge ok">발송 성공</span>'; if(s==='실패') return '<span class="badge danger">실패 · 재발송</span>'; return '<span class="muted">미발송</span>'; }
function shipSend(){
  const sel=shipStatusList().filter(r=>state.shipChk.has(r.no+'-'+r.code));
  if(!sel.length){ toast('발송할 출고 건을 선택하세요'); return; }
  const vv=(document.getElementById('shipVia')||{}).value||'팩스'; const via=vv==='팩스'?'하나팩스':'다우오피스 메일';
  const keys=sel.map(r=>r.no+'-'+r.code);
  const retry={}; keys.forEach(k=>{ retry[k]=data.shipStatus[k]==='실패'; data.shipStatus[k]='전송중'; });
  toast(keys.length+'건 출고현황 발송 중… ('+via+')'); render();
  setTimeout(function(){ var ok=0,fail=0; keys.forEach(function(k,i){ var s=retry[k]?true:(i%5!==4); data.shipStatus[k]=s?'성공':'실패'; if(s){state.shipChk.delete(k);ok++;}else fail++; }); render(); toast('출고현황 발송 완료 — 성공 '+ok+(fail?(' / 실패 '+fail+' (재발송하면 성공)'):'')+' ('+via+')'); }, 1000);
}
function shipStatusSection(){
  const recs=shipStatusList();
  const agencies=[...new Set(shipRecords.map(r=>r.agency))];
  const f=state.shipFilter||'전체';
  const keys=recs.map(r=>r.no+'-'+r.code);
  const allOn=keys.length&&keys.every(k=>state.shipChk.has(k));
  const selN=keys.filter(k=>state.shipChk.has(k)).length;
  return `
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
      <select class="search" style="width:auto;font-size:12.5px" onchange="shipSetFilter(this.value)"><option ${f==='전체'?'selected':''}>전체</option>${agencies.map(a=>`<option ${a===f?'selected':''}>${a}</option>`).join('')}</select>
      <span class="muted" style="font-size:12px">파일형식</span><select id="shipFmt" class="search" style="width:auto;font-size:12.5px"><option>PDF</option><option>엑셀</option></select>
      <span class="muted" style="font-size:12px">전송방법</span><select id="shipVia" class="search" style="width:auto;font-size:12.5px"><option>팩스</option><option>메일</option></select>
      <div style="flex:1"></div>
      <button class="btn primary" onclick="shipSend()">선택 발송 (${selN})</button>
    </div>
    <div class="ov" style="border:1px solid var(--border);border-radius:8px;overflow-x:auto"><table>
      <thead><tr><th style="width:34px"><input type="checkbox" ${allOn?'checked':''} onclick="shipCheckAll()"></th><th>출고일자</th><th>출고번호</th><th>거래처</th><th>품번</th><th>품명</th><th class="num">출고수량</th><th class="num">금액</th><th>발송 상태</th></tr></thead>
      <tbody>${recs.map(r=>{const k=r.no+'-'+r.code; return `<tr><td><input type="checkbox" ${state.shipChk.has(k)?'checked':''} onclick="shipToggle('${k}')"></td><td>${r.date}</td><td>${r.no}</td><td><b>${r.agency}</b></td><td class="muted" style="font-size:12px">${r.code}</td><td>${r.item}</td><td class="num">${fmt(r.qty)}</td><td class="num">${won(r.qty*r.price)}</td><td>${statusBadge(data.shipStatus[k])}</td></tr>`;}).join('')}</tbody>
    </table></div>
    <div class="muted" style="font-size:12px;margin-top:8px">언제·무엇이·얼마나 나갔는지 출고 내역입니다. 체크 → [선택 발송]이면 끝 (<b style="font-weight:600">팩스는 하나팩스, 메일은 다우오피스 API</b>로 자동 발송).</div>`;
}
/* ---------------- 발송 섹션 공용 (원장/출고현황/채권채무조회서) ---------------- */
function ledgerSection(group){
  const now=new Date(); const mLabel=(now.getMonth()+1)+'월';
  const list=ledgerTargets[group]||[];
  const keys=list.map(t=>group+'::'+t.name);
  const allOn=keys.length&&keys.every(k=>state.ledgerChk.has(k));
  const selN=keys.filter(k=>state.ledgerChk.has(k)).length;
  const isRecv=group==='채권채무조회서';
  const desc={'원장':'매달 원장 — 매출 마감 후 발송. 거래처별 파일형식(엑셀/PDF/둘다)·전송방법(팩스/메일)·경로가 다릅니다.','출고현황':'매달 출고현황 — 월말 발송. 거래처별 파일형식·전송방법·경로 적용.','채권채무조회서':'반기말(6/30·12/31) 기준 잔액 보유 거래처에 발송. 회신처 FAX 031-629-5216.'}[group];
  return `
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
      <span class="badge teal">${isRecv?'기준 '+now.getFullYear()+'년 반기말':'기준 '+now.getFullYear()+'년 '+mLabel+' 마감'}</span>
      <span class="muted" style="font-size:12px">${desc}</span>
      <div style="flex:1"></div>
      <label class="btn" style="cursor:pointer"><input type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="ledgerUpload(this,'${isRecv?'잔액':'마감 자료'}')">${isRecv?'잔액 업로드 (엑셀)':'마감 자료 업로드 (엑셀)'}</label>${uploadBadge('extract')}
    </div>
    <div class="ov" style="border:1px solid var(--border);border-radius:8px;overflow-x:auto"><table>
      <thead><tr><th style="width:34px"><input type="checkbox" ${allOn?'checked':''} onclick="ledgerCheckAll('${group}')"></th><th>거래처</th><th>등급</th>${isRecv?'<th class="num">미수 잔액</th>':'<th>특이</th>'}<th>파일형식</th><th>전송방법</th><th>경로</th><th>발송 상태</th></tr></thead>
      <tbody>${list.map(t=>{const k=group+'::'+t.name; return `<tr>
        <td><input type="checkbox" ${state.ledgerChk.has(k)?'checked':''} onclick="ledgerToggle('${k}')"></td>
        <td><b>${t.name}</b></td>
        <td>${t.grade?gradeBadge(t.grade):'<span class="muted">—</span>'}</td>
        ${isRecv?`<td class="num" style="color:var(--warn);font-weight:600">${won(t.recv)}</td>`:`<td>${t.note?'<span class="badge warn">'+t.note+'</span>':'<span class="muted">—</span>'}</td>`}
        <td><select onchange="ledgerSet('${group}','${t.name}','fmt',this.value)" style="border:1px solid var(--border-2);border-radius:6px;padding:3px 6px;font-family:inherit;font-size:12px">${['엑셀','PDF','둘다'].map(o=>`<option ${t.fmt===o?'selected':''}>${o}</option>`).join('')}</select></td>
        <td><select onchange="ledgerSet('${group}','${t.name}','via',this.value)" style="border:1px solid var(--border-2);border-radius:6px;padding:3px 6px;font-family:inherit;font-size:12px">${['팩스','메일'].map(o=>`<option ${t.via===o?'selected':''}>${o}</option>`).join('')}</select></td>
        <td class="muted" style="font-size:12px">${t.dest}</td>
        <td>${statusBadge(data.ledgerStatus[k])}</td>
      </tr>`;}).join('')}</tbody>
    </table></div>
    <div class="quick" style="margin-top:13px"><button class="btn primary" onclick="ledgerSend('${group}')">선택 발송 (${selN})</button><button class="btn" onclick="histModal()">발송 기록</button></div>
    <div class="muted" style="font-size:12px;margin-top:8px">잔액·마감 자료는 <b style="font-weight:600">영림원에서 내보낸 엑셀을 업로드</b>해 채웁니다(반자동 · 영림원 API 미지원). 발송은 <b style="font-weight:600">팩스=하나팩스, 메일=다우오피스</b>로 자동 처리됩니다.</div>`;
}
/* ---------------- 보험수가표·견적서 ---------------- */
function vPricing(){
  setHead('보험수가표 · 견적서','국내영업');
  return `
  <div class="pagehead"><div><div class="t">보험수가표 · 견적서</div><div class="d">메디컬 보험수가표(${data.sugaSource.label})를 확인하고, 거래처 등급에 맞춰 견적서를 발송합니다.</div></div>
    <button class="btn primary" data-view="quote">견적서 작성</button></div>
  ${sugaUploadCard()}
  ${sugaTableHTML()}`;
}
/* ---------------- 계약 관리 ---------------- */
let contracts=[
  {no:'C-2026-018', agency:'대성 메디칼', title:'연간 공급계약 2026', start:'2026-01-01', end:'2026-12-31', amount:120000000, status:'유효'},
  {no:'C-2026-011', agency:'한백', title:'연간 공급계약 2026', start:'2026-01-01', end:'2026-12-31', amount:84000000, status:'유효'},
  {no:'C-2025-204', agency:'우리 헬스케어', title:'대리점 거래계약', start:'2024-07-01', end:'2026-08-31', amount:36000000, status:'갱신 임박'},
  {no:'C-2025-180', agency:'부산 정형', title:'대리점 거래계약', start:'2023-09-01', end:'2025-08-31', amount:24000000, status:'만료'},
];
function contractNew(){ toast('새 계약서 작성 (프로토타입) — 거래처·기간·금액 입력 후 생성'); }
function vContracts(){
  setHead('계약 관리','국내영업');
  const soon=contracts.filter(c=>{const d=daysUntil(c.end); return d>=0&&d<=90;}).length;
  const expired=contracts.filter(c=>daysUntil(c.end)<0||c.status==='만료').length;
  const sc={'유효':'ok','갱신 임박':'warn','만료':'danger'};
  return `
  <div class="pagehead"><div><div class="t">계약 관리</div><div class="d">거래처별 계약을 한눈에 보고, 만료·갱신을 관리하며 새 계약서를 작성합니다.</div></div>
    <button class="btn primary" onclick="contractNew()">+ 새 계약서</button></div>
  <div class="kpis" style="margin-bottom:20px">
    <div class="kpi"><div class="lab">전체 계약</div><div class="val">${contracts.length}건</div></div>
    <div class="kpi"><div class="lab">갱신 임박 (90일↓)</div><div class="val ${soon?'warn':''}">${soon}건</div></div>
    <div class="kpi"><div class="lab">만료</div><div class="val ${expired?'danger':''}">${expired}건</div></div>
  </div>
  <div class="card ov"><table>
    <thead><tr><th>계약번호</th><th>거래처</th><th>계약명</th><th>기간</th><th class="num">계약금액</th><th>상태</th><th></th></tr></thead>
    <tbody>${contracts.map(c=>{const dl=daysUntil(c.end); return `<tr><td>${c.no}</td><td><b>${c.agency}</b></td><td>${c.title}</td><td class="muted">${c.start} ~ ${c.end}${dl>=0&&dl<=90?` <span class="badge warn">D-${dl}</span>`:''}</td><td class="num">${won(c.amount)}</td><td><span class="badge ${sc[c.status]||'muted'}">${c.status}</span></td><td class="num"><button class="btn sm" onclick="toast('${c.no} 계약서 열기 (프로토타입)')">열기</button></td></tr>`;}).join('')}</tbody>
  </table></div>
  <div class="muted" style="font-size:12px;margin-top:10px">개별 계약 작성·조회는 거래처 상세 ‘계약’ 탭과도 연동됩니다.</div>`;
}
function vClients(){
  setHead('거래처 등록','국내영업 · 거래처 정보');
  if(state.clientSel===undefined) state.clientSel=clients[0].code;
  const isNew=!!state.clientNew;
  const ocr=isNew?(state.clientOcr||null):null;
  const c=isNew?(state.clientOcr||{}):(clientFind(state.clientSel)||{});
  const autoSet=new Set((ocr&&ocr._fields)||[]);
  const fld=(id,label,val,ph)=>{const auto=autoSet.has(id.slice(2));return `<div class="frow"><label class="muted">${label}${auto?' <span class="badge ok" style="padding:0 5px;font-size:9.5px">인식</span>':''}</label><input id="${id}" value="${(val||'').replace(/"/g,'&quot;')}" ${ph?`placeholder="${ph}"`:''} style="flex:1;min-width:0;border:1px solid ${auto?'#9CD3B6':'var(--border-2)'};${auto?'background:var(--ok-soft);':''}border-radius:7px;padding:7px 10px;font-family:inherit;font-size:13px;box-sizing:border-box"></div>`;};
  const sel=(id,label,val,opts)=>`<div class="frow"><label class="muted">${label}</label><select id="${id}" style="flex:1;min-width:0;border:1px solid var(--border-2);border-radius:7px;padding:7px 10px;font-family:inherit;font-size:13px">${opts.map(o=>`<option ${val===o?'selected':''}>${o}</option>`).join('')}</select></div>`;
  return `
  <div class="pagehead"><div><div class="t">거래처 등록 · 수정 · 조회</div><div class="d">좌측에서 거래처를 찾아 선택하면 정보가 뜨고, 고친 뒤 저장하면 수정 이력이 남습니다. 신규 등록도 여기서 합니다.</div></div>
    <div class="quick"><button class="btn" onclick="clientNewForm()">+ 신규</button><button class="btn primary" onclick="clientSave()">저장</button></div>
  </div>
  <div class="card" style="margin-bottom:14px"><div class="pad" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:14px 16px">
    <label style="display:inline-flex;align-items:center;gap:11px;border:1.5px dashed var(--border-2);border-radius:10px;padding:11px 15px;cursor:pointer;background:var(--surface-2)">
      <input type="file" accept="image/*,.pdf" style="display:none" onchange="clientOcr(this)">
      <svg width="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color:var(--teal-d);flex:0 0 22px"><path d="M2 7.5a2 2 0 0 1 2-2h2.2l1.3-2h6.6l1.3 2H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><circle cx="12" cy="12" r="3.4"/></svg>
      <div><b style="font-size:13px">사업자등록증 올리기 → 자동 입력</b>${uploadBadge('keep')}<div class="muted" style="font-size:12px">사진·PDF를 올리면 상호·등록번호·대표자·주소·업태·종목을 자동 인식합니다. 원본은 거래처당 1장만 증빙 보관합니다.</div></div>
    </label>
    <div id="ocrStatus" style="flex:1;min-width:150px;font-size:12.5px">${ocr?'<span class="badge ok">자동 인식 완료 · '+(ocr._file||'')+'</span>':'<span class="muted">아직 올린 파일이 없습니다.</span>'}</div>
  </div></div>
  ${ocr?`<div class="card" style="margin-bottom:14px;border-left:3px solid var(--ok)"><div class="pad" style="display:flex;align-items:center;gap:13px;padding:13px 16px">
    ${ocr._img?`<img src="${ocr._img}" style="width:58px;height:40px;object-fit:cover;border-radius:7px;border:1px solid var(--border)">`:'<span class="badge teal">PDF</span>'}
    <div style="flex:1"><b style="font-size:13px">사업자등록증에서 자동 인식했어요</b><div class="muted" style="font-size:12px">초록색 ‘인식’ 항목을 확인·수정한 뒤 <b>저장</b>하면 등록됩니다. 전화·팩스·메일·약칭·지역·등급은 직접 입력하세요.</div></div>
  </div></div>`:''}
  <div class="row clientsplit" style="align-items:flex-start;gap:14px">
    <div class="card clientlist"><div class="pad" style="padding:12px">
      <input class="search" style="width:100%;margin-bottom:8px" placeholder="거래처명·코드·대표자 검색…" oninput="clientListFilter(this.value)">
      <div id="clientList" style="max-height:560px;overflow:auto">${clientListHTML('')}</div>
    </div></div>
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:14px">
      <div class="card"><div class="pad">
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:14px;flex-wrap:wrap;min-width:0">
          <span class="badge ${isNew?'teal':'muted'}">${isNew?(ocr?'신규 · 자동 인식':'신규 등록'):'거래처코드 '+(c.code||'')}</span>
          <b style="font-size:15px;min-width:0;overflow-wrap:anywhere">${isNew?(c.name||'새 거래처'):(c.name||'')}</b>
        </div>
        ${fld('c_name','거래처명',c.name)}
        ${fld('c_short','거래처약칭',c.short)}
        ${fld('c_biz','사업자등록번호',c.biz,'000-00-00000')}
        ${fld('c_ceo','대표자성명',c.ceo)}
        ${fld('c_sector','업태',c.sector)}
        ${fld('c_item','종목',c.item)}
        ${fld('c_zip','우편번호',c.zip)}
        ${fld('c_addr','사업장주소',c.addr)}
        ${fld('c_tel','전화번호',c.tel)}
        ${fld('c_fax','팩스번호',c.fax)}
        ${fld('c_email','메일주소',c.email)}
        ${fld('c_region','지역',c.region)}
        ${sel('c_grade','거래처등급',c.grade||'B',['A+','A','B','C'])}
        ${fld('c_since','거래시작일',c.since,'YYYY-MM-DD')}
        ${sel('c_use','사용여부',c.use||'사용',['사용','미사용'])}
        <div class="quick" style="margin-top:6px"><button class="btn primary" onclick="clientSave()">저장</button>${isNew?'':`<button class="btn" onclick="clientNewForm()">+ 신규</button>`}</div>
      </div></div>
      <div class="card"><div class="pad">
        <div class="seclabel">수정 이력</div>
        ${isNew?'<div class="muted" style="font-size:12.5px">신규 등록 후 이력이 쌓입니다.</div>':((c.log&&c.log.length)?`<div class="ledger-list">${c.log.map(l=>`<div class="li"><div class="ti" style="font-size:12.5px">${l.items.map(it=>`<div>${it}</div>`).join('')}</div><span class="muted" style="font-size:11.5px;white-space:nowrap;margin-left:10px">${l.when}</span></div>`).join('')}</div>`:'<div class="muted" style="font-size:12.5px">수정 이력이 없습니다.</div>')}
      </div></div>
    </div>
  </div>`;
}

function vAgencyDetail(){
  const a = findAgency(state.agency);
  setHead(a.name,'국내영업 · 대리점 상세');
  const tabs = ['개요','거래처원장','매출·주문','클레임·품질','계약','문서함','활동'];
  let body='';
  if(state.aTab==='개요'){
    body = `
    <div class="kpis" style="margin:18px 0">
      <div class="kpi"><div class="lab">당월 매출</div><div class="val">${won(a.sales)}</div></div>
      <div class="kpi"><div class="lab">미수금</div><div class="val ${a.recv>0?'warn':''}">${a.recv>0?won(a.recv):'-'}</div></div>
      <div class="kpi"><div class="lab">진행 주문</div><div class="val">7건</div></div>
      <div class="kpi"><div class="lab">미처리 클레임</div><div class="val ${a.name==='한백'?'danger':''}">${a.name==='한백'?'2건':'0건'}</div></div>
    </div>
    <div class="seclabel">빠른 작업</div>
    <div class="quick" style="margin-bottom:20px">
      <button class="btn" data-doc="${a.id}">채권채무조회서</button>
      <button class="btn" onclick="toast('견적서 작성 화면 (프로토타입)')">견적서 작성</button>
      <button class="btn" onclick="toast('Follow-up 등록 (프로토타입)')">Follow-up 등록</button>
    </div>
    <div class="seclabel">최근 활동</div>
    <div class="card"><div class="pad ledger-list">
      ${[['견적서 v2 발송 — 수액세트 외 3종','06/09'],['통화 — 6월 정기 발주 협의','06/05'],['클레임 접수 — 포장 불량 2건, 처리중','06/02']].map(x=>`<div class="li"><div class="ti">${x[0]}</div><span class="muted" style="font-size:12px">${x[1]}</span></div>`).join('')}
    </div></div>`;
  } else if(state.aTab==='거래처원장'){
    const rows = ledger[a.id] || ledger.a1;
    const sum = rows.reduce((s,r)=>s+r.qty*r.price,0);
    const qsum = rows.reduce((s,r)=>s+r.qty,0);
    const carry=1250000, paid=2000000;
    body = `
    <div class="pagehead" style="margin:18px 0 14px">
      <div><div style="font-weight:700">거래처원장 · 출고현황</div><div class="d">조회 기간 2026.05.01 ~ 05.31</div></div>
      <div class="quick">
        <button class="btn sm" onclick="toast('PDF로 이메일 발송 (프로토타입)')">이메일 전송</button>
        <button class="btn sm" onclick="toast('PDF로 팩스 발송 (프로토타입)')">팩스 전송</button>
      </div>
    </div>
    <div class="kpis" style="margin-bottom:16px">
      <div class="kpi"><div class="lab">이월 잔액</div><div class="val" style="font-size:20px">${won(carry)}</div></div>
      <div class="kpi"><div class="lab">당기 출고액</div><div class="val" style="font-size:20px">${won(sum)}</div></div>
      <div class="kpi"><div class="lab">당기 입금액</div><div class="val" style="font-size:20px">${won(paid)}</div></div>
      <div class="kpi"><div class="lab">미수 잔액</div><div class="val warn" style="font-size:20px">${won(carry+sum-paid)}</div></div>
    </div>
    <div class="card ov"><table>
      <thead><tr><th>출고일</th><th>주문품목</th><th class="num">수량</th><th class="num">단가</th><th class="num">총액</th></tr></thead>
      <tbody>
        ${rows.map(r=>`<tr><td>${r.d}</td><td>${r.item}</td><td class="num">${fmt(r.qty)}</td><td class="num">${won(r.price)}</td><td class="num">${won(r.qty*r.price)}</td></tr>`).join('')}
        <tr class="total" style="font-weight:700;background:var(--surface-2)"><td colspan="2">합계</td><td class="num">${fmt(qsum)}</td><td></td><td class="num">${won(sum)}</td></tr>
      </tbody>
    </table></div>`;
  } else if(state.aTab==='매출·주문'){
    const orders=[['06/09','수액세트 10cc','500','₩600,000','납품완료'],['06/05','안전주사기 23G','1,000','₩280,000','배송중'],['05/29','멸균거즈 4x4','800','₩256,000','납품완료']];
    body=`<div style="margin-top:18px" class="card ov"><table><thead><tr><th>주문일</th><th>품목</th><th class="num">수량</th><th class="num">금액</th><th>상태</th></tr></thead><tbody>${orders.map(o=>`<tr><td>${o[0]}</td><td>${o[1]}</td><td class="num">${o[2]}</td><td class="num">${o[3]}</td><td><span class="badge ${o[4]==='납품완료'?'ok':'info'}">${o[4]}</span></td></tr>`).join('')}</tbody></table></div><div class="quick" style="margin-top:14px"><button class="btn" data-doc="${a.id}">채권채무조회서</button><button class="btn" onclick="toast('견적서 작성 (프로토타입)')">견적서 작성</button></div>`;
  } else if(state.aTab==='클레임·품질'){
    const claims = a.name==='한백' ? [['06/02','포장 불량 2건','진행중','warn']] : [];
    const ag = returnsData.filter(r=>r.agency===a.name);
    body=`<div style="margin-top:18px"><div class="seclabel">클레임</div>${claims.length?`<div class="card ov"><table><thead><tr><th>접수일</th><th>내용</th><th>상태</th></tr></thead><tbody>${claims.map(c=>`<tr><td>${c[0]}</td><td>${c[1]}</td><td><span class="badge ${c[3]}">${c[2]}</span></td></tr>`).join('')}</tbody></table></div>`:`<div class="card"><div class="pad muted">등록된 클레임이 없습니다.</div></div>`}
    <div class="seclabel" style="margin-top:16px">반품·교환 / 불량 피드백처리요청서 <span class="muted" style="font-weight:400">· ‘반품·교환 내역’에서 기안된 건 반영(읽기 전용)</span></div>
    ${ag.length?`<div class="card ov"><table><thead><tr><th>일자</th><th>구분</th><th>제품</th><th class="num">수량</th><th>사유</th><th>LOT</th><th>피드백처리요청서</th></tr></thead><tbody>${ag.map(r=>`<tr><td>${r.date}</td><td>${r.type}</td><td>${r.prod}</td><td class="num">${r.qty}</td><td>${r.reason}</td><td>${r.lot||'—'}</td><td>${r.defect?(r.fb?'<span class="badge ok">기안됨</span>':'<span class="badge warn">미기안</span>'):'<span class="muted">해당없음</span>'}</td></tr>`).join('')}</tbody></table></div>`:`<div class="card"><div class="pad muted">반품·교환 내역이 없습니다.</div></div>`}
    <div class="muted" style="font-size:12px;margin-top:8px">※ 피드백처리요청서 입력은 ‘반품·교환 내역’ 메뉴에서만 가능합니다(여기서는 입력 불가).</div></div>`;
  } else if(state.aTab==='계약'){
    body=`<div style="margin-top:18px"><div class="seclabel">계약</div><div class="card ov"><table><thead><tr><th>계약명</th><th>기간</th><th>상태</th></tr></thead><tbody><tr><td>연간 공급 계약 2026</td><td>2026.01 ~ 2026.12</td><td><span class="badge ok">유효</span></td></tr></tbody></table></div><div class="seclabel" style="margin-top:16px">보험수가표 배포 이력</div><div class="card"><div class="pad" style="font-size:13px">2026.01 배포 · v2</div></div><div class="quick" style="margin-top:14px"><button class="btn" onclick="toast('계약서 관리 (프로토타입)')">계약서</button><button class="btn" onclick="toast('보험수가표 배포 (프로토타입)')">보험수가표</button></div></div>`;
  } else if(state.aTab==='문서함'){
    const docs=[['ISO 13485 인증서','인증 허브','2027.03 만료'],['제품 카탈로그 2026','카탈로그','—'],['보험수가표 v2','보험','2026.01']];
    body=`<div style="margin-top:18px"><div class="seclabel">거래처 공유 문서 (인증 허브 연동)</div><div class="card"><div class="pad ledger-list">${docs.map(d=>`<div class="li"><div class="ti"><b style="font-weight:600">${d[0]}</b> <span class="muted" style="font-size:12px">· ${d[1]}</span></div><span class="muted" style="font-size:12px">${d[2]}</span></div>`).join('')}</div></div></div>`;
  } else {
    body=`<div style="margin-top:18px"><div class="seclabel">활동 로그</div><div class="card"><div class="pad ledger-list">${[['방문','정기 미팅 — 6월 발주','06/09'],['통화','납기 협의','06/05'],['메일','견적서 v2 발송','06/03']].map(x=>`<div class="li"><span class="badge muted">${x[0]}</span><div class="ti">${x[1]}</div><span class="muted" style="font-size:12px">${x[2]}</span></div>`).join('')}</div></div></div>`;
  }
  return `
    <div class="back" data-view="dom-agencies">← 미수금 관리</div>
    <div class="actor" style="margin-bottom:6px">
      <div class="av">${a.name.slice(0,2)}</div>
      <div><div style="font-size:18px;font-weight:700">${a.name}</div>
      <div class="muted" style="font-size:13px">${a.region} · 단가 등급 ${a.grade}</div></div>
    </div>
    <div class="card" style="margin-top:14px">
      <div class="tabs" id="aTabs">${tabs.map(t=>`<button class="${t===state.aTab?'active':''}" data-tab="${t}">${t}</button>`).join('')}</div>
      <div class="pad" style="padding-top:4px">${body}</div>
    </div>`;
}

function vPipeline(){
  setHead('영업 파이프라인','국내영업');
  const cols={'제안':['한백','우리 헬스케어'],'견적':['대성 메디칼'],'협상':['부산 정형'],'계약':['중부 의료기'],'납품':['세종 메디텍 (이관)']};
  return `<div class="pagehead"><div><div class="t">영업 파이프라인</div><div class="d">발굴 센터에서 이관된 기회가 자동으로 표시됩니다.</div></div></div>
  <div class="row" style="overflow:auto">
    ${Object.entries(cols).map(([k,v])=>`<div style="flex:1;min-width:170px">
      <div class="seclabel">${k} · ${v.length}</div>
      ${v.map(n=>`<div class="card pad" style="margin-bottom:10px;padding:13px"><b style="font-size:13.5px">${n}</b><div class="muted" style="font-size:12px;margin-top:4px">예상 ${won(([12,32,18,40,9][Math.floor(Math.random()*5)])*1000000)}</div></div>`).join('')}
    </div>`).join('')}
  </div>`;
}

function vDiscDash(){
  setHead('발굴 동선 · 대시보드','고객 발굴 센터');
  const steps=[['01','시장분석 · STP','국가·지역·조건 입력'],['02','탐색 + AI 비서','대화로 후보 좁히기'],['03','잠재 거래처 리스트','리드 등록·관리'],['04','리드 상세','검증 후 영업 이관']];
  return `
  <div class="pagehead"><div><div class="t">고객 발굴 센터</div><div class="d">잠재 거래처를 검증해 국내영업으로 이관하는 동선입니다.</div></div></div>
  <div class="flow" style="margin-bottom:24px">
    ${steps.map(s=>`<div class="step"><div class="n">${s[0]}</div><div class="h">${s[1]}</div><div class="s">${s[2]}</div></div>`).join('')}
  </div>
  <div class="kpis" style="margin-bottom:20px">
    <div class="kpi"><div class="lab">신규 리드</div><div class="val">12</div></div>
    <div class="kpi"><div class="lab">심사 대기</div><div class="val warn">5</div></div>
    <div class="kpi"><div class="lab">제안 발송</div><div class="val">8</div></div>
    <div class="kpi"><div class="lab">전환율</div><div class="val ok">34%</div></div>
  </div>
  <div class="pagehead" style="margin-bottom:10px"><div style="font-weight:700">잠재 거래처</div><button class="btn primary sm" data-view="disc-leads">전체 리스트 →</button></div>
  ${leadsTable(leads.slice(0,3))}`;
}
function leadsTable(list){
  return `<div class="card ov"><table>
    <thead><tr><th>회사명</th><th>지역</th><th>유형</th><th>발굴 채널</th><th>적격성</th><th class="num">우선순위</th><th>상태</th></tr></thead>
    <tbody>${list.map(l=>`<tr class="clickable" data-lead="${l.id}">
      <td><b>${l.name}</b></td><td>${l.region}</td><td>${l.type}</td><td class="muted">${l.channel}</td>
      <td>${l.elig}</td><td class="num"><b>${l.score}</b></td>
      <td><span class="badge ${l.status==='제안'?'teal':l.status==='심사'?'warn':'muted'}">${l.status}</span></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}
function vDiscLeads(){ setHead('잠재 거래처 리스트','고객 발굴 센터'); 
  return `<div class="pagehead"><div><div class="t">잠재 거래처 리스트</div><div class="d">탐색에서 등록된 리드. 행을 클릭하면 리드 상세로 이동합니다.</div></div><button class="btn">신규 리드 등록</button></div>${leadsTable(leads)}`; }

function vLeadDetail(){
  const l = leads.find(x=>x.id===state.lead);
  setHead(l.name,'고객 발굴 센터 · 리드 상세');
  const checks=[['연 매출액','120억 원','ok'],['종업원 수','45명','ok'],['홈페이지 보유','있음','ok'],['의료기기 판매업 신고','확인 필요','warn']];
  return `
  <div class="back" data-view="disc-leads">← 잠재 거래처 리스트</div>
  <div class="actor" style="margin-bottom:14px">
    <div class="av">${l.name.slice(0,2)}</div>
    <div style="flex:1"><div style="font-size:18px;font-weight:700">${l.name} <span class="muted" style="font-size:13px;font-weight:400">(후보)</span></div>
    <div class="muted" style="font-size:13px">${l.region} · ${l.type} · 발굴 채널: ${l.channel}</div></div>
    <span class="badge info">우선순위 ${l.score}</span>
  </div>
  <div class="kpis" style="margin-bottom:20px">
    <div class="kpi"><div class="lab">우선순위 점수</div><div class="val">${l.score} <span class="muted" style="font-size:14px">/ 100</span></div></div>
    <div class="kpi"><div class="lab">예상 연 거래</div><div class="val" style="font-size:21px">3.2억 원</div></div>
    <div class="kpi"><div class="lab">적격성</div><div class="val" style="font-size:21px">${l.elig}</div></div>
  </div>
  <div class="row">
    <div class="card" style="flex:1;min-width:280px"><div class="pad">
      <div class="seclabel">적격성 체크</div>
      <div class="checklist">${checks.map(c=>`<div class="ci"><span class="dotmark" style="background:var(--${c[2]})"></span><span class="nm">${c[0]}</span><span class="${c[2]==='warn'?'':'muted'}" style="font-size:13px;${c[2]==='warn'?'color:var(--warn);font-weight:600':''}">${c[1]}</span></div>`).join('')}</div>
    </div></div>
    <div class="card" style="flex:1;min-width:280px"><div class="pad">
      <div class="seclabel">AI 신용조사 (참고용)</div>
      <p style="font-size:13.5px;margin:0 0 12px;line-height:1.7">공개 자료 기준 매출 규모 중견, 최근 3년 부정 이슈 없음. 판매 진행에 큰 리스크는 보이지 않음. 정식 신용보고서는 아님.</p>
      <button class="btn sm" onclick="toast('AI 신용조사 재실행 (프로토타입)')">신용조사 다시 실행</button>
    </div></div>
  </div>
  <div class="seclabel" style="margin-top:20px">빠른 작업</div>
  <div class="quick">
    <button class="btn" data-view="proposal">맞춤 제안서 생성</button>
    <button class="btn" onclick="toast('AI 신용조사 재실행 (프로토타입)')">신용조사 실행</button>
    <button class="btn primary" id="convertBtn">국내영업으로 이관</button>
    <button class="btn" id="ovConvertBtn">해외 신규 고객 등록</button>
  </div>
  <div class="row" style="margin-top:20px">
    <div class="card" style="flex:1;min-width:280px"><div class="pad">
      <div class="seclabel">제안 발송 이력</div>
      <div class="ledger-list">
        <div class="li"><div class="ti">제품소개서 발송</div><span class="badge ok">열람함</span><span class="muted" style="font-size:12px;margin-left:8px">06/08</span></div>
        <div class="li"><div class="ti">맞춤 제안서 v1</div><span class="muted" style="font-size:12px">미열람 · 06/10</span></div>
      </div>
    </div></div>
    <div class="card" style="flex:1;min-width:280px"><div class="pad">
      <div class="seclabel">진입 요건 (인증 허브)</div>
      <div class="checklist">
        <div class="ci"><span class="dotmark" style="background:var(--warn)"></span><span class="nm">의료기기 판매업 신고</span><span style="font-size:13px;color:var(--warn);font-weight:600">확인 필요</span></div>
        <div class="ci"><span class="dotmark" style="background:var(--ok)"></span><span class="nm">ISO 13485 (당사)</span><span class="muted" style="font-size:13px">유효</span></div>
      </div>
    </div></div>
  </div>`;
}

/* ---------------- 채권채무조회서 doc ---------------- */
function docHTML(a, bulk){
  const today='2026년 6월 30일';
  return `<div class="doc">
    <h2>채권·채무조회서</h2>
    <div class="meta"><div><b>(주) ${a.name}</b> 귀하</div><div>${today}</div></div>
    <div class="intro">귀사의 번창하심을 축원하오며, 평소 각별하신 애호와 협조에 감사합니다. 2026년 6월 30일 현재 귀사에 대한 당사의 채권·채무 잔액과 내용을 확인하고자 하오니, 귀사의 장부와 대조·확인하시고 아래 확인통지란에 서명·날인하여 회신 바랍니다. (FAX 031-629-5216 또는 E-MAIL fys@bl-tech.co.kr)</div>
    <table><caption>1. 당사가 받을 금액</caption>
      <thead><tr><th style="width:38%">계정과목</th><th>적요</th><th class="num" style="width:26%">금액</th><th style="width:14%">비고</th></tr></thead>
      <tbody>${recvAccounts.map((ac,i)=>`<tr><td>${ac}</td><td></td><td class="num">${i===0&&a.recv>0?fmt(a.recv):''}</td><td></td></tr>`).join('')}
        <tr class="total"><td colspan="2">합계</td><td class="num">${a.recv>0?fmt(a.recv):'0'}</td><td></td></tr></tbody>
    </table>
    <table><caption>2. 당사가 지급할 금액</caption>
      <thead><tr><th style="width:38%">계정과목</th><th>적요</th><th class="num" style="width:26%">금액</th><th style="width:14%">비고</th></tr></thead>
      <tbody>${payAccounts.map(ac=>`<tr><td>${ac}</td><td></td><td class="num"></td><td></td></tr>`).join('')}
        <tr class="total"><td colspan="2">합계</td><td class="num">0</td><td></td></tr></tbody>
    </table>
    <div class="notice">확인통지</div>
    <div class="reply">
      1. 위 조회서에 기재된 금액과 내용은 당사 장부와 일치하고 있으므로 이에 서명·날인하여 통지합니다.<br>
      2. 아래와 같은 상위점이 있음을 알려드립니다 (명세·내용·금액 기재, 지면 부족 시 별첨).
    </div>
    <div class="sign">
      <div>${today}<br><br>주소 _______________________<br><br>회사(기관)명 _______________<br><br>대표자 성명 ____________ (인)</div>
      <div class="stamp"><b>문의처</b> : 이연선<br>BL TECH 주식회사<br>TEL 033-264-2686<br>FAX 031-629-5216<br>조회서번호 32</div>
    </div>
  </div>`;
}
function vDoc(){
  const a=findAgency(state.docAgency);
  setHead('채권채무조회서','국내영업 · 문서 미리보기');
  return `<div class="back" data-view="dom-agencies">← 미수금 관리로</div>
  <div class="pagehead"><div><div class="t">채권채무조회서 미리보기</div><div class="d">거래처명과 외상매출금(미수 잔액)이 자동으로 입력되었습니다.</div></div>
    <button class="btn primary" onclick="toast('${a.name} 앞으로 하나팩스로 발송 (프로토타입)')">하나팩스로 발송</button></div>
  ${docHTML(a,false)}`;
}

/* ---------------- bulk modal ---------------- */
function bulkModal(){
  const list=curAgencies().filter(a=>state.checked.has(a.id));
  openModal(`
    <div class="mh"><b>채권채무조회서 일괄 발송</b><button class="x" onclick="closeModal()">×</button></div>
    <div class="mb">
      <div class="muted" style="font-size:12.5px;margin-bottom:12px">선택한 거래처에 거래처명·잔액(외상매출금)이 자동 입력되어 팩스로 발송됩니다. 기준일 2026-06-30.</div>
      ${list.map(a=>`<div class="check-row"><div style="flex:1"><b>(주) ${a.name}</b> <span class="muted" style="font-size:12px">· ${a.region}</span></div>
        <div class="num" style="font-weight:600;color:${a.recv>0?'var(--warn)':'var(--ink-3)'}">${a.recv>0?won(a.recv):'잔액 없음'}</div>
        <button class="btn sm" data-doc="${a.id}" onclick="closeModal()">미리보기</button></div>`).join('')}
    </div>
    <div class="mf"><button class="btn" onclick="closeModal()">취소</button>
      <button class="btn primary" id="bulkSend">${list.length}곳에 팩스 발송</button></div>`);
}

function vMarket(){
  setHead('시장분석 · STP','고객 발굴 센터 · 국내·해외 공용');
  const m=state.market;
  const regions=regionsOf(m.country);
  const list=mktList();
  if(!m.chat.length){ m.chat.push({r:'ai',t:`막연한 시장이어도 괜찮아요 — 일단 후보 ${list.length}곳을 찾아왔어요. 국가·지역·규모·라이선스·취급 품목으로 함께 좁혀가요. (예: “일본에서 캐스트 취급 중견만”)`}); }
  const opt=(arr,sel)=>arr.map(x=>`<option ${x===sel?'selected':''}>${x}</option>`).join('');
  const results=`
    <div id="mktResults" class="row" style="margin-top:16px">
      <div class="card" style="flex:1.4;min-width:300px"><div class="pad">
        <div class="pagehead" style="margin-bottom:10px"><div style="font-weight:700">탐색 결과 · 후보 ${list.length}곳 <span class="muted" style="font-weight:400">· ${m.country==='전 세계 (미정)'?'전 세계':m.country}${m.region!=='전체'?' · '+m.region:''}</span></div>
          <button class="btn primary sm" onclick="toast('선택 후보를 최종 잠재 거래처 리스트에 확정했습니다');setTimeout(()=>go('disc-leads'),750)">최종 리스트에 확정 →</button></div>
        <div class="ov" style="border:1px solid var(--border);border-radius:8px;overflow-x:auto"><table>
          <thead><tr><th style="width:30px"><input type="checkbox" class="chk" checked></th><th>회사명</th><th>국가</th><th>지역</th><th>규모</th><th>라이선스</th><th class="num">적합도</th></tr></thead>
          <tbody>${list.length?list.map(f=>`<tr><td><input type="checkbox" class="chk" checked></td><td><b>${f.name}</b></td><td>${f.country}</td><td>${f.region}</td><td>${f.size}</td><td>${f.lic?'<span class="badge ok">보유</span>':'<span class="badge warn">확인</span>'}</td><td class="num"><b>${f.fit}</b></td></tr>`).join(''):`<tr><td colspan="7" class="muted" style="padding:18px;text-align:center">조건에 맞는 후보가 없어요. 우측 AI 비서로 조건을 완화하거나 국가를 ‘전 세계 (미정)’로 바꿔보세요.</td></tr>`}</tbody>
        </table></div>
      </div></div>
      <div class="card" style="flex:1;min-width:280px;display:flex"><div class="pad" style="display:flex;flex-direction:column;flex:1;width:100%">
        <div class="seclabel">AI 탐색 비서</div>
        <div class="chat" id="mktChat">${m.chat.map(c=>`<div class="msg ${c.r}">${c.t}</div>`).join('')}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0">
          <button class="btn sm" onclick="mktAsk('mid','중견 이상만')">중견 이상만</button>
          <button class="btn sm" onclick="mktAsk('lic','라이선스 보유만')">라이선스 보유만</button>
          <button class="btn sm" onclick="mktAsk('cast','캐스트 취급만')">캐스트 취급만</button>
          <button class="btn sm" onclick="mktReset()">초기화</button>
        </div>
        <div style="display:flex;gap:8px">
          <input class="search" id="mktInput" style="flex:1;width:auto" placeholder="예: 일본에서 매출 큰 곳만" onkeydown="if(event.key==='Enter')mktSend()">
          <button class="btn primary sm" onclick="mktSend()">보내기</button>
        </div>
      </div></div>
    </div>`;
  return `
  <div class="pagehead"><div><div class="t">시장분석 · STP</div><div class="d">막연한 시장이라도 바로 탐색부터. 아래 결과를 보며 AI 비서와 대화로 국가·지역·STP 조건을 좁혀갑니다.</div></div></div>
  <div class="card"><div class="pad">
    <div style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:14px">
      <div style="flex:1;min-width:200px"><div class="seclabel">국가 <span class="muted" style="font-weight:400">· 미정이면 전 세계 탐색</span></div>
        <select class="search" style="width:100%" onchange="mktCountry(this.value)">${opt(['전 세계 (미정)'].concat(worldCountries),m.country)}</select></div>
      <div style="flex:1;min-width:200px"><div class="seclabel">지역 <span class="muted" style="font-weight:400">· 전체 가능</span></div>
        <select class="search" style="width:100%" onchange="mktRegion(this.value)">${opt(regions,m.region)}</select></div>
    </div>
    <div class="seclabel">STP 타깃 조건 <span class="muted" style="font-weight:400">· 우측 AI 비서로 좁힙니다</span></div>
    <div style="display:flex;gap:9px;flex-wrap:wrap;align-items:center">
      <span class="badge teal">유형: 종합병원 납품 유통사</span><span class="badge teal">취급: 캐스트·하이드로겔</span>
      ${m.filters.includes('mid')?'<span class="badge info">중견 이상</span>':''}${m.filters.includes('lic')?'<span class="badge info">라이선스 보유</span>':''}${m.filters.includes('cast')?'<span class="badge info">캐스트 취급</span>':''}
      <div style="flex:1"></div><button class="btn sm" onclick="mktReset()">조건 초기화</button>
    </div>
  </div></div>
  ${results}`;
}

function vSearch(){
  setHead('잠재 거래처 탐색','고객 발굴 센터');
  const narrowed = state.narrowed;
  const all=[
    {name:'서울 메디플러스', region:'서울', size:'중견', lic:'보유', src:'B2B 디렉터리', fit:88},
    {name:'경기 헬스라인', region:'경기', size:'중소', lic:'확인 필요', src:'AI 리서치', fit:64},
    {name:'인천 정형유통', region:'인천', size:'중견', lic:'보유', src:'전시회 명단', fit:81},
    {name:'수원 메디칼상사', region:'경기', size:'중견', lic:'보유', src:'B2B 디렉터리', fit:79},
  ];
  const list = narrowed ? all.filter(f=>f.fit>=78) : all;
  const steps=['조건 입력','검색 결과','조건 수정(세부)','최종 확정'];
  const active = narrowed?2:1;
  return `
  <div class="pagehead"><div><div class="t">잠재 거래처 탐색</div><div class="d">조건 입력 → 검색 → 세부 조건으로 좁힘 → 최종 리스트 확정.</div></div></div>
  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:18px">
    ${steps.map((s,i)=>`<span class="badge ${i<=active?'teal':'muted'}">${i+1}. ${s}</span>${i<3?'<span style="color:var(--ink-3)">›</span>':''}`).join('')}
  </div>
  <div class="card" style="margin-bottom:18px"><div class="pad">
    <div class="seclabel">검색 조건 ${narrowed?'<span class="badge teal" style="margin-left:4px">세부 조건 적용됨</span>':'<span class="muted" style="font-weight:400">· STP에서 전달</span>'}</div>
    <div style="display:flex;gap:9px;flex-wrap:wrap;margin-bottom:14px">
      <span class="badge teal">지역: 수도권</span><span class="badge teal">유형: 종합병원 납품 유통사</span><span class="badge teal">취급: 캐스트·하이드로겔</span>
      ${narrowed?'<span class="badge teal">규모: 중견 이상</span><span class="badge teal">판매 라이선스: 보유</span><span class="badge teal">적합도 ≥ 78</span>':''}
    </div>
    <div class="seclabel">세부 조건 추가</div>
    <div style="display:flex;gap:9px;flex-wrap:wrap;margin-bottom:14px">
      <span class="badge">규모(매출·인원)</span><span class="badge">판매 라이선스 보유</span><span class="badge">취급 품목 일치도</span><span class="badge">거래 이력</span>
    </div>
    <div class="quick">
      <button class="btn primary" onclick="state.narrowed=true;render();toast('세부 조건을 반영해 후보를 좁혔습니다')">${narrowed?'조건 재적용':'세부 조건으로 좁히기'}</button>
      ${narrowed?'<button class="btn" onclick="state.narrowed=false;render()">조건 초기화</button>':'<button class="btn" onclick="toast(\'수동 추가 — 명함·문의 (프로토타입)\')">수동 추가</button>'}
    </div>
  </div></div>
  <div class="pagehead" style="margin-bottom:10px"><div style="font-weight:700">검색 결과 · 후보 ${list.length}곳</div>
    <button class="btn primary sm" onclick="toast('선택한 후보를 최종 잠재 거래처 리스트에 확정했습니다');setTimeout(()=>go('disc-leads'),750)">최종 리스트에 확정 →</button></div>
  <div class="card ov"><table>
    <thead><tr><th style="width:34px"><input type="checkbox" class="chk" checked></th><th>회사명</th><th>지역</th><th>규모</th><th>판매 라이선스</th><th class="num">적합도</th><th>출처</th></tr></thead>
    <tbody>${list.map(f=>`<tr><td><input type="checkbox" class="chk" checked></td><td><b>${f.name}</b></td><td>${f.region}</td><td>${f.size}</td>
      <td>${f.lic==='보유'?'<span class="badge ok">보유</span>':'<span class="badge warn">확인 필요</span>'}</td>
      <td class="num"><b>${f.fit}</b></td><td class="muted">${f.src}</td></tr>`).join('')}</tbody>
  </table></div>
  <div class="muted" style="font-size:12px;margin-top:10px">결과를 보며 세부 조건을 더해 좁히고, 만족스러우면 선택 후보를 최종 리스트에 확정합니다. 기존 리드·거래처 중복은 자동 제외.</div>`;
}

function vProposal(){
  const l = leads.find(x=>x.id===state.lead) || leads[0];
  setHead('제품소개서 · 제안서 작성','고객 발굴 센터');
  return `
  <div class="back" data-view="lead">← 리드 상세</div>
  <div class="pagehead"><div><div class="t">맞춤 제안서 작성</div><div class="d">대상: ${l.name} · 제품 마스터·인증 정보가 자동 반영됩니다.</div></div>
    <button class="btn primary" onclick="toast('${l.name} 앞으로 제안서를 발송했습니다')">이메일 발송</button></div>
  <div class="row">
    <div class="card" style="flex:0 0 230px"><div class="pad">
      <div class="seclabel">템플릿</div>
      <div class="ledger-list">
        <div class="li"><span class="badge teal">선택</span><div class="ti">기본 제품소개서</div></div>
        <div class="li"><div class="ti muted">맞춤 제안서</div></div>
        <div class="li"><div class="ti muted">가격 제안</div></div>
      </div>
      <div class="seclabel" style="margin-top:14px">자동 반영</div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start">
        <span class="badge">제품군 카탈로그</span><span class="badge">ISO 13485 인증서</span><span class="badge">CE MDR 선언</span>
      </div>
    </div></div>
    <div class="card" style="flex:1"><div class="pad">
      <div class="doc" style="box-shadow:none;border:1px solid var(--border);max-width:none;padding:28px">
        <h2 style="letter-spacing:.1em;padding:0;font-size:18px">제품 소개 · 제안서</h2>
        <p style="font-size:13px">${l.name} 귀중</p>
        <p style="font-size:13px;line-height:1.7">BL TECH는 ISO 13485 품질경영시스템과 FDA·CE MDR 인증을 보유한 정형 고정재 전문 제조사입니다. 캐스트·스플린트·하이드로겔 전 라인업을 안정적 납기로 공급합니다.</p>
        <table style="margin-top:12px"><thead><tr><th>제품군</th><th>대표 품목</th><th>인증</th></tr></thead>
          <tbody><tr><td>캐스팅 테이프</td><td>NEAL Casting Tape</td><td>ISO·CE</td></tr>
          <tr><td>스플린트</td><td>NEAL Splint</td><td>ISO·CE</td></tr>
          <tr><td>하이드로겔</td><td>Hydrogel 시리즈</td><td>ISO·FDA</td></tr></tbody></table>
      </div>
    </div></div>
  </div>`;
}

// 주문 조회용 데이터(카페24 유입). 재고·출하완료는 포털이 보유하지 않습니다.
const medOrders=[
  {no:'C26-10482', cust:'대성 메디칼', code:'NPC-2P-GR', item:'NEAL 캐스트 2"', qty:80, date:'2026-06-13', kind:'주문'},
  {no:'C26-10483', cust:'우리 헬스케어', code:'NHRS-3450N', item:'롤 스플린트 3"', qty:60, date:'2026-06-13', kind:'주문'},
  {no:'C26-10485', cust:'한백', code:'NPC-3P-GR', item:'NEAL 캐스트 3"', qty:30, date:'2026-06-13', kind:'주문'},
  {no:'C26-10470', cust:'세정코리아', code:'NHC-2F-WH', item:'하이드로겔 커버 2"', qty:100, date:'2026-06-11', kind:'주문'},
  {no:'C26-10460', cust:'메디홀스', code:'NHPS-3014N', item:'프리컷 3"(샘플)', qty:5, date:'2026-06-13', kind:'샘플요청'},
  {no:'C26-10461', cust:'케이알닥터스', code:'NPC-2P-GR', item:'불량 대체품', qty:6, date:'2026-06-13', kind:'불량대체품'},
];
function vShipping(){
  setHead('출고 현황','국내영업');
  const mode=state.shipMode||'의뢰';
  const modeTabs=`<div class="card" style="margin-bottom:14px"><div class="tabs">${['의뢰','현황'].map(m=>`<button class="${m===mode?'active':''}" onclick="setShipMode('${m}')">${m==='의뢰'?'주문 · 출고 내역 (조회)':'출고현황 발송'}</button>`).join('')}</div></div>`;
  if(mode==='현황'){ return `
    <div class="pagehead"><div><div class="t">출고 현황</div><div class="d">언제·무엇이·얼마나 나갔는지 출고 내역을 보고, 체크해서 거래처에 발송합니다.</div></div></div>
    ${modeTabs}
    <div class="card"><div class="pad" style="padding-top:14px">${shipStatusSection()}</div></div>`; }
  const today=TODAY.toISOString().slice(0,10);
  const todayOrders=medOrders.filter(o=>o.kind==='주문'&&o.date===today).length;
  const etcCnt=medOrders.filter(o=>['샘플요청','불량대체품','맞교환'].includes(o.kind)).length;
  const tab = state.shipTab || '메디컬';
  let body;
  if(tab==='메디컬'){
    body=`
    <div class="card" style="margin:16px 0;border-left:3px solid var(--ok)"><div class="pad" style="display:flex;align-items:center;gap:12px">
      <span class="dotmark" style="background:var(--ok)"></span>
      <div style="flex:1"><b style="font-size:13.5px">카페24 주문 실시간 연동됨</b><div class="muted" style="font-size:12px">마지막 동기화 06/13 11:40 · OAuth 연결 정상 · 주문 내역만 조회합니다</div></div>
      <button class="btn sm" onclick="toast('카페24에서 주문을 다시 가져왔습니다')">지금 동기화</button>
    </div></div>
    <div class="card ov"><table>
      <thead><tr><th>주문번호</th><th>거래처</th><th>품목(코드)</th><th class="num">수량</th><th>구분</th></tr></thead>
      <tbody>${medOrders.map(o=>`<tr><td>${o.no}<div class="muted" style="font-size:11px">${o.date===today?'당일':o.date.slice(5)}</div></td><td><b>${o.cust}</b></td><td>${o.item}<div class="muted" style="font-size:11px">${o.code}</div></td><td class="num">${fmt(o.qty)}</td><td><span class="badge ${o.kind==='주문'?'info':'muted'}">${o.kind}</span></td></tr>`).join('')}</tbody>
    </table></div>
    <div class="muted" style="font-size:12px;margin-top:10px">메디컬은 카페24 주문이 자동으로 넘어옵니다. <b style="font-weight:600">재고 판정·출고 진행·출하완료는 수주~출고 시스템의 몫</b>이라 이 화면에서는 조회만 합니다.</div>`;
  } else {
    const po=[
      {code:'DAOC-2F-BL', internal:'NHC-2F-BL', color:'파랑', qty:30},
      {code:'DAOC-2F-WH', internal:'NHC-2F-WH', color:'흰색', qty:170},
      {code:'DAOC-3F-WH', internal:'NHC-3F-WH', color:'흰색', qty:170},
      {code:'DAOC-4F-BK', internal:'NHC-4F-BK', color:'검정', qty:40},
      {code:'DAOC-9X-NN', internal:'미매칭', color:'-', qty:10},
    ];
    body=`
    <div class="pagehead" style="margin:16px 0 10px"><div><div style="font-weight:700">${tab} · PO → 생산출고의뢰서 자동화</div><div class="d">발주 코드를 내부 품명으로 자동 매칭합니다. 미매칭은 등록 후 진행됩니다.</div></div></div>
    <label style="display:block;border:1.5px dashed var(--border-2);border-radius:10px;padding:18px;text-align:center;cursor:pointer;background:var(--surface-2);margin-bottom:12px">
      <input type="file" accept=".pdf,.xls,.xlsx,image/*" multiple style="display:none" onchange="poUpload(this)">
      <div style="font-weight:600;font-size:13px">PO 파일 업로드</div>
      <div class="muted" style="font-size:12px;margin-top:3px">PDF · 엑셀 · 사진(캡쳐본) — 클릭해서 선택 (여러 개 가능)</div>
    </label>
    <div id="poFiles" style="margin-bottom:12px"></div>
    <div class="card ov"><table>
      <thead><tr><th>발주 코드 (PO)</th><th>내부 품명</th><th>색상</th><th class="num">수량</th><th>상태</th></tr></thead>
      <tbody>${po.map(r=>`<tr><td>${r.code}</td><td>${r.internal==='미매칭'?'<span class="muted">—</span>':'<b>'+r.internal+'</b>'}</td><td>${r.color}</td><td class="num">${r.qty}</td>
        <td>${r.internal==='미매칭'?'<span class="badge danger">미매칭</span>':'<span class="badge ok">매칭됨</span>'}</td></tr>`).join('')}</tbody>
    </table></div>
    <div class="quick" style="margin-top:14px">
      <button class="btn" onclick="toast('미매칭 코드 등록 (1회 등록 후 자동 매칭)')">미매칭 코드 등록</button>
      <button class="btn primary" onclick="toast('생산출고의뢰서가 생성되었습니다 (색상 자동 반영)')">생산출고의뢰서 생성</button>
    </div>
    <div class="muted" style="font-size:12px;margin-top:10px">색상은 거래처 기본값으로 자동 입력되며, PO가 없는 건 등 예외는 수기로 처리합니다.</div>`;
  }
  return `
  <div class="pagehead"><div><div class="t">출고 현황</div><div class="d">출고 내역 조회와 출고현황 발송을 한 메뉴에서 처리합니다. 상단 요약은 오늘(${today.slice(5).replace('-','/')}) 기준입니다.</div></div></div>
  ${modeTabs}
  ${shipReadonlyNotice()}
  <div class="kpis" style="margin-bottom:18px">
    <div class="kpi"><div class="lab">오늘 총 주문</div><div class="val">${todayOrders}건</div><div class="sub">카페24 당일 주문</div></div>
    <div class="kpi"><div class="lab">기타 출고</div><div class="val">${etcCnt}건</div><div class="sub">샘플·불량대체·맞교환</div></div>
  </div>
  <div class="card"><div class="tabs" id="shipTabs">
    ${['메디컬','케미컬','하이드로겔'].map(t=>`<button class="${t===tab?'active':''}" data-shiptab="${t}">${t}</button>`).join('')}
  </div><div class="pad" style="padding-top:6px">${body}</div></div>`;
}

function vFollowup(){
  setHead('Follow-up & 알림','국내영업');
  const fu=[
    {date:'06/14', agency:'대성 메디칼', type:'계약 갱신', note:'D-9, 갱신 협의 통화', tag:'warn'},
    {date:'06/15', agency:'한백', type:'미수금', note:'30일 초과 — 채권채무조회 대상', tag:'danger'},
    {date:'06/18', agency:'우리 헬스케어', type:'재방문', note:'견적 후속', tag:'teal'},
    {date:'06/20', agency:'부산 정형', type:'정기 접촉', note:'미접촉 21일', tag:'muted'},
  ];
  return `
  <div class="pagehead"><div><div class="t">Follow-up &amp; 알림</div><div class="d">규칙 기반 자동 알림이 한곳에 모입니다.</div></div></div>
  <div class="card ov"><table>
    <thead><tr><th>예정일</th><th>거래처</th><th>유형</th><th>내용</th><th></th></tr></thead>
    <tbody>${fu.map(f=>`<tr><td><b>${f.date}</b></td><td>${f.agency}</td><td><span class="badge ${f.tag}">${f.type}</span></td><td class="muted">${f.note}</td>
      <td class="num"><button class="btn sm" onclick="toast('완료 처리했습니다')">완료</button></td></tr>`).join('')}</tbody>
  </table></div>
  <div class="card" style="margin-top:16px"><div class="pad">
    <div class="seclabel">알림 규칙</div>
    <div class="muted" style="font-size:13px;line-height:1.9">· 미접촉 N일 경과 · 견적 발송 후 무응답 N일 · 계약 갱신 D-30 · 미수금 기한 초과 · 인증 만료 임박</div>
  </div></div>`;
}

function vCertHub(){
  setHead('인증·규제 관리 허브','공통');
  const certs=[
    {n:'ISO 13485', scope:'품질경영시스템', issue:'2024-03-15', exp:'2027-03-14'},
    {n:'CE MDR',    scope:'유럽 시장 적합성', issue:'2023-06-01', exp:'2028-05-31'},
    {n:'FDA 등록',  scope:'미국 시장 등록',   issue:'2025-08-20', exp:'2026-08-20'},
    {n:'일본 현지 등록', scope:'PMDA 등록', issue:'-', exp:'진행중'},
  ];
  const cstat=exp=>{ if(exp==='진행중') return {l:'진행중',c:'info'}; const du=daysUntil(exp); if(du<0) return {l:'만료',c:'danger'}; if(du<=90) return {l:'만료 임박 · D-'+du,c:'warn'}; return {l:'유효',c:'ok'}; };
  const docClasses=[
    {g:'A', tag:'danger', rule:'항상 전달', docs:'FDA·ISO·CE 인증서'},
    {g:'B', tag:'warn',   rule:'필요 시',  docs:'CFS (식약처 발급)'},
    {g:'C', tag:'muted',  rule:'특수 필요 시', docs:'현지 요구 인증'},
  ];
  const folders=[
    {n:'하이드로겔', by:'효과별 분류', items:'인증서 · 시험데이터 · 카탈로그'},
    {n:'캐스트 · 스플린트', by:'용도별 분류', items:'인증서 · 기술문서 · 카탈로그'},
  ];
  return `
  <div class="pagehead"><div><div class="t">인증·규제 관리 허브</div><div class="d">ISO 13485·FDA·CE MDR을 한곳에서 관리하고, 거래처 배포 문서를 제품군별로 정리합니다.</div></div></div>

  <div class="seclabel">보유 인증 현황</div>
  <div class="card ov" style="margin-bottom:22px"><table>
    <thead><tr><th>인증</th><th>범위</th><th>발급일</th><th>만료일</th><th>상태</th></tr></thead>
    <tbody>${certs.map(c=>{const s=cstat(c.exp); return `<tr><td><b>${c.n}</b></td><td class="muted">${c.scope}</td><td class="muted">${c.issue}</td><td class="muted">${c.exp}</td><td><span class="badge ${s.c}">${s.l}</span></td></tr>`;}).join('')}</tbody>
  </table></div>

  <div class="seclabel">거래처 전송 서류 분류</div>
  <div class="row" style="margin-bottom:22px">
    ${docClasses.map(d=>`<div class="card" style="flex:1;min-width:200px"><div class="pad">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span class="badge ${d.tag}">${d.g}</span><b>${d.rule}</b></div>
      <div class="muted" style="font-size:13px">${d.docs}</div>
    </div></div>`).join('')}
  </div>

  <div class="seclabel">문서 공유함 (제품군별 폴더링)</div>
  <div class="card"><div class="pad ledger-list">
    ${folders.map(f=>`<div class="li"><svg width="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg><div class="ti"><b style="font-weight:600">${f.n}</b> <span class="muted" style="font-size:12px">· ${f.by}</span><div class="muted" style="font-size:12px">${f.items}</div></div><button class="btn sm" onclick="toast('거래처에 공유 (프로토타입)')">공유</button></div>`).join('')}
  </div></div>
  <div class="muted" style="font-size:12px;margin-top:10px">발굴 센터는 진입 가능 여부 판단에, 국내·해외영업은 거래처 배포 문서로 이 허브를 참조합니다.</div>`;
}

function histModal(){
  const hist=[
    {date:'2025-12-31', cnt:4, ch:'팩스', reply:'회신 3 / 미회신 1'},
    {date:'2025-06-30', cnt:5, ch:'팩스', reply:'회신 5 / 미회신 0'},
    {date:'2024-12-31', cnt:4, ch:'팩스', reply:'회신 4 / 미회신 0'},
    {date:'2024-06-30', cnt:3, ch:'팩스', reply:'회신 3 / 미회신 0'},
  ];
  openModal(`
    <div class="mh"><b>채권채무조회서 발송 기록</b><button class="x" onclick="closeModal()">×</button></div>
    <div class="mb">
      <div class="muted" style="font-size:12.5px;margin-bottom:12px">반기 정기(6월말·12월말) 발송 이력입니다. 행을 누르면 해당 회차의 대상·회신 상세를 볼 수 있습니다.</div>
      <div class="ov" style="border:1px solid var(--border);border-radius:8px;overflow-x:auto"><table>
        <thead><tr><th>발송일</th><th class="num">대상</th><th>채널</th><th>회신 현황</th><th></th></tr></thead>
        <tbody>${hist.map(h=>`<tr class="clickable" onclick="toast('${h.date} 회차 상세 (프로토타입)')"><td><b>${h.date}</b></td><td class="num">${h.cnt}곳</td><td>${h.ch}</td><td class="muted">${h.reply}</td><td class="num"><span class="badge ${h.reply.includes('미회신 1')||h.reply.includes('미회신 2')?'warn':'ok'}">${h.reply.includes('미회신 0')?'완료':'진행'}</span></td></tr>`).join('')}</tbody>
      </table></div>
    </div>
    <div class="mf"><button class="btn" onclick="closeModal()">닫기</button></div>`);
}

function unitOf(n){ return n.indexOf('Pre-Cut')>=0?'EA':(n.indexOf('Roll')>=0||n==='Cast')?'Roll':'1EA'; }
function sendQuote(){ const el=document.getElementById('quoteEmail'); const v=(el&&el.value||'').trim(); if(!v){ toast('받는 사람 이메일을 입력하세요'); return; } const src=data.quoteUpload?'첨부 파일 ‘'+data.quoteUpload.name+'’':'자동 생성 견적서'; toast(v+' 앞으로 '+src+'를 발송했습니다 (다우오피스)'); }
function vQuote(){
  const st=state.suga, idx=sugaGi[st.grade];
  const now=new Date(), pad=n=>String(n).padStart(2,'0');
  const y=now.getFullYear(), m=now.getMonth()+1, d=now.getDate();
  const docno='BL-DT-'+y+pad(m)+pad(d);
  setHead('견적서 작성','국내영업 · 견적서');
  let qrows = sugaCommon.map(x=>({name:st.brand+' '+x.n, spec:x.spec, unit:unitOf(x.n), suga:fmt(sugaCommonRate(x,st.brand)), price:fmt(x.p[idx])}));
  if(st.brand==='NEAL' && st.premold) qrows=qrows.concat(premoldLine.map(x=>({name:'NEAL '+x.n, spec:'', unit:'1EA', suga:premoldRate(x)!=null?fmt(premoldRate(x)):'–', price:fmt(x.price)})));
  if(st.brand==='NEAL' && st.cover) qrows=qrows.concat(coverLine.map(x=>({name:'NEAL '+x.n, spec:'', unit:'EA', suga:'비급여', price:fmt(x.price)})));
  const incl=[]; if(st.brand==='NEAL'){ if(st.premold) incl.push('프리몰드'); if(st.cover) incl.push('닐커버'); }
  return `
  <div class="back" data-view="dom-pricing">← 보험수가표 · 견적서</div>
  <div class="card" style="margin-bottom:16px"><div class="pad">
   <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <div style="flex:1;min-width:180px"><b>견적서</b> <span class="muted">· ${st.brand} · 단가 등급 ${st.grade}${incl.length?' · '+incl.join('·')+' 포함':''}</span></div>
    <input class="search" id="quoteEmail" style="min-width:230px" placeholder="받는 사람 이메일 (다우오피스)">
    <label class="btn" style="cursor:pointer"><input type="file" accept=".pdf,.xlsx,.xls" style="display:none" onchange="quoteUpload(this)">견적서 파일 업로드</label>${uploadBadge('keep')}
    <button class="btn" onclick="toast('견적서 PDF 다운로드 (프로토타입)')">PDF 다운로드</button>
    <button class="btn primary" onclick="sendQuote()">다우오피스로 발송</button>
   </div>
   ${data.quoteUpload?`<div style="margin-top:11px;display:flex;align-items:center;gap:8px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-size:12.5px"><svg width="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg><b>${data.quoteUpload.name}</b><span class="muted">· 첨부됨 · 발송 시 이 파일로 전송 · ${data.quoteUpload.at}</span><button class="btn sm" style="margin-left:auto" onclick="quoteClear()">제거</button></div>`:`<div class="muted" style="font-size:11.5px;margin-top:9px">아래 자동 생성 견적서를 발송하거나, 직접 만든 <b>견적서 파일(.pdf/.xlsx)</b>을 업로드해 다우오피스로 보낼 수 있습니다.</div>`}
  </div></div>
  <div class="doc">
    <div style="text-align:center"><b style="font-size:19px">비엘테크(주)</b></div>
    <div class="muted" style="text-align:center;font-size:11px;margin-bottom:16px">(우) 200-944 강원도 춘천시 퇴계농공로 84 · 전화 033-264-2686 · 팩스 031-629-5216</div>
    <h2 style="letter-spacing:.3em;padding-left:.3em">견 적 서</h2>
    <div class="meta">
      <div>수신 : <input id="quoteTo" value="국내대리점 발주담당자 귀하" style="border:none;border-bottom:1px solid #9aa;font-size:13px;width:220px;font-family:inherit;padding:2px;background:#FAFBFC"><br>제목 : 정형외과용 부목 견적서</div>
      <div style="text-align:right">문서번호 : ${docno}<br>시행일자 : ${y}년 ${m}월 ${d}일</div>
    </div>
    <div class="intro">1. 귀사의 무궁한 발전을 기원합니다.<br>2. 제품 공급가격표(부가세 포함) · NEAL · SMILE 브랜드 견적가 동일</div>
    <table>
      <thead><tr><th>품명</th><th>규격</th><th>단위</th><th class="num">보험수가</th><th class="num">견적가</th></tr></thead>
      <tbody>${qrows.map(r=>`<tr><td>${r.name}</td><td>${r.spec}</td><td>${r.unit}</td><td class="num">${r.suga}</td><td class="num"><b>${r.price}</b></td></tr>`).join('')}</tbody>
    </table>
    <div class="reply" style="margin-top:6px">
      3. 결제조건 : 현금 결제 (익월 말일 현금 결제 / 결제 조건 변동 시 계약단가 변동)<br>
      &nbsp;&nbsp;&nbsp;결제계좌 : 기업은행 547-000007-01-026 (예금주 : 비엘테크(주))<br>
      4. 납품조건 : 발주일 출고(매일 14:00 주문마감, 재고 보유 시) · 발주 단위 Cast 100EA / Roll Splint 8EA(6" 4EA), 10만원 미만 발주 시 착불<br>
      5. 기존 자사제품 납품 병원에 대한 영업행위는 삼가 주시기 바랍니다.<br>
      6. 거래 조건에 대하여 확인 부탁드립니다.
    </div>
    <div style="text-align:center;margin-top:18px;letter-spacing:.2em;color:var(--ink-2)">＊＊＊ 감사합니다 ＊＊＊</div>
  </div>`;
}

/* ---------------- router ---------------- */
/* ================= 반품·교환 / 출고현황·원장 ================= */
const returnsData=[
  {date:'2026-02-11', type:'반품', agency:'케이알닥터스', prod:'NPC-3P-GR', qty:6, reason:'불량-개봉전경화', lot:'20251104', defect:true, fb:false, note:'처리 진행'},
  {date:'2026-03-02', type:'반품', agency:'현대의료홀딩스', prod:'NHRS-4450N', qty:2, reason:'불량-실링미처리', lot:'20251220', defect:true, fb:false, note:''},
  {date:'2026-04-18', type:'교환', agency:'엠앤엠', prod:'NHPS-3014N', qty:10, reason:'사이즈 오발주', lot:'', defect:false, fb:false, note:'처리 완료'},
  {date:'2026-05-09', type:'반품', agency:'한백', prod:'NHC-2F-WH', qty:50, reason:'오발주', lot:'', defect:false, fb:false, note:'국제바로병원 직송'},
  {date:'2026-05-27', type:'반품', agency:'포스메드', prod:'NPC-2P-GR', qty:3, reason:'불량-개봉전경화', lot:'20260119', defect:true, fb:true, note:'피드백처리요청서 기안 완료'},
  {date:'2026-06-04', type:'반품', agency:'한백', prod:'NHRS-3450N', qty:3, reason:'불량-개봉전경화', lot:'20260318', defect:true, fb:true, note:'피드백처리요청서 기안 완료'},
  {date:'2025-01-24', type:'반품', agency:'케이알닥터스', prod:'NPC-2P-GR', qty:1, reason:'불량-개봉전경화', lot:'20240318', defect:true, fb:false, note:'처리 완료 · 불량 원인 안내'},
  {date:'2025-02-06', type:'반품', agency:'현대의료홀딩스', prod:'NPC-2P-GR', qty:14, reason:'불량-개봉전경화', lot:'20240726', defect:true, fb:false, note:'20EA 처리'},
  {date:'2025-02-06', type:'반품', agency:'현대의료홀딩스', prod:'NHRS-4450N', qty:1, reason:'불량-개봉전경화', lot:'20230620', defect:true, fb:false, note:'처리 완료'},
  {date:'2025-01-24', type:'반품', agency:'케이알닥터스', prod:'NHRS-3450N', qty:1, reason:'불량-실링미처리', lot:'20210403', defect:true, fb:false, note:'재발 방지 요청'},
  {date:'2025-03-04', type:'반품', agency:'한백', prod:'NHRS-3450N', qty:3, reason:'불량-개봉전경화', lot:'20240903', defect:true, fb:true, note:'피드백처리요청서 기안 완료'},
  {date:'2025-01-08', type:'반품', agency:'포스메드', prod:'NHRS-4450F', qty:2, reason:'오발주', lot:'', defect:false, fb:false, note:'원주21세기병원 직송'},
  {date:'2025-01-15', type:'반품', agency:'한백', prod:'NHC-2F-GR', qty:100, reason:'오발주', lot:'', defect:false, fb:false, note:'국제바로병원 석고실 직송'},
  {date:'2025-02-03', type:'반품', agency:'엠앤엠', prod:'NHRS-5450N', qty:1, reason:'오발주', lot:'', defect:false, fb:false, note:'처리 완료'},
  {date:'2025-02-12', type:'교환', agency:'메디트라', prod:'NHPS-2012N', qty:5, reason:'사용자 퇴사', lot:'', defect:false, fb:false, note:'처리 완료'},
  {date:'2025-08-20', type:'반품', agency:'피앤씨메디컬', prod:'NHC-3F-BL', qty:40, reason:'색상오발주', lot:'', defect:false, fb:false, note:'색상 끝자리 확인 권고'},
];
function setReturnFilter(f){ state.retFilter=f; render(); }
function feedbackModal(i){
  const r=returnsData[i];
  openModal(`<div class="mh"><b>피드백처리요청서 — 다우오피스 전자결재 기안</b><button class="x" onclick="closeModal()">×</button></div>
    <div class="mb">
      <div class="muted" style="font-size:12px;margin-bottom:12px">아래 내용이 다우오피스 「피드백처리요청서」 양식에 자동 입력되어 기안 화면이 열립니다.</div>
      <table style="width:100%;font-size:13px"><tbody>
        <tr><td class="muted" style="width:96px;padding:5px 0">거래처</td><td><b>${r.agency}</b></td></tr>
        <tr><td class="muted" style="padding:5px 0">구분</td><td>${r.type}</td></tr>
        <tr><td class="muted" style="padding:5px 0">제품코드</td><td>${r.prod}</td></tr>
        <tr><td class="muted" style="padding:5px 0">LOT 번호</td><td>${r.lot||'—'}</td></tr>
        <tr><td class="muted" style="padding:5px 0">수량</td><td>${r.qty}</td></tr>
        <tr><td class="muted" style="padding:5px 0">불량 사유</td><td>${r.reason}</td></tr>
        <tr><td class="muted" style="padding:5px 0">발생일</td><td>${r.date}</td></tr>
      </tbody></table>
      <div style="margin-top:12px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-size:11.5px;color:var(--ink-2);word-break:break-all">연동: 전자결재 기안 API (POST · api.daouoffice.com) → 「피드백처리요청서」 양식 자동 입력 · 기안 상신<br>예시 문서 URL: https://bl-tech.daouoffice.com/gw/app/approval/document/1513473522788470784</div>
      <div class="muted" style="font-size:11px;margin-top:6px">※ 사전 준비: OpenAPI 인증키 발급 + 해당 양식 외부연동 설정(관리자)</div>
    </div>
    <div class="mf"><button class="btn" onclick="closeModal()">취소</button><button class="btn primary" onclick="submitFeedback(${i})">다우오피스에서 기안 상신</button></div>`);
}
function submitFeedback(i){ returnsData[i].fb=true; closeModal(); toast('피드백처리요청서 기안 상신 — 대리점 상세 ‘클레임·품질’에 반영되었습니다'); render(); }
function setRetYear(y){ state.retYear=y; render(); }
function vReturns(){
  setHead('반품 · 교환 처리','국내영업');
  const filt=state.retFilter||'전체';
  const year=state.retYear||'2026';
  const years=[...new Set(returnsData.map(r=>r.date.slice(0,4)))].sort().reverse();
  const inYear=returnsData.filter(r=>r.date.slice(0,4)===year);
  let rows=returnsData.map((r,i)=>({...r,i})).filter(r=>r.date.slice(0,4)===year);
  if(filt==='반품') rows=rows.filter(r=>r.type==='반품');
  else if(filt==='교환') rows=rows.filter(r=>r.type==='교환');
  const returnCnt=inYear.filter(r=>r.type==='반품').length;
  const exchCnt=inYear.filter(r=>r.type==='교환').length;
  const chkN=rows.filter(r=>state.returnChk.has(r.i)).length;
  const allOn=rows.length&&rows.every(r=>state.returnChk.has(r.i));
  return `
  <div class="pagehead"><div><div class="t">반품 · 교환 처리</div><div class="d">국내 반품/교환 접수 내역. 행을 체크하고 ‘피드백 정보처리요청서 작성’을 누르면 다우오피스 전자결재로 넘어갑니다.</div></div>
    <select class="search" style="width:auto" onchange="setRetYear(this.value)">${years.map(y=>`<option value="${y}" ${y===year?'selected':''}>${y}년</option>`).join('')}</select></div>
  <div class="kpis" style="margin-bottom:18px">
    <div class="kpi"><div class="lab">총 내역 (${year})</div><div class="val">${inYear.length}건</div><div class="sub">반품·교환</div></div>
    <div class="kpi"><div class="lab">반품</div><div class="val">${returnCnt}건</div></div>
    <div class="kpi"><div class="lab">교환</div><div class="val">${exchCnt}건</div></div>
    <div class="kpi"><div class="lab">선택됨</div><div class="val ${chkN?'info':''}">${chkN}건</div><div class="sub">피드백요청서 대상</div></div>
  </div>
  <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;align-items:center">
    ${['전체','반품','교환'].map(f=>`<button class="btn" style="${f===filt?'background:var(--navy);border-color:var(--navy);color:#fff':''}" onclick="setReturnFilter('${f}')">${f}</button>`).join('')}
    <div style="flex:1"></div>
    <button class="btn" onclick="toast('엑셀 다운로드 (반품·교환 내역)')">엑셀 다운로드</button>
    <button class="btn" onclick="openFeedbackDoc()">피드백 정보처리요청서 작성${chkN?' ('+chkN+')':''}</button>
    <button class="btn primary" data-view="dom-return-new">반품/교환 등록</button>
  </div>
  <div class="card ov"><table>
    <thead><tr><th style="width:34px"><input type="checkbox" ${allOn?'checked':''} onclick="returnCheckAll('${year}','${filt}')"></th><th>일자</th><th>구분</th><th>업체명</th><th>제품</th><th class="num">수량</th><th>사유</th><th>LOT</th><th>비고</th><th>피드백요청서</th></tr></thead>
    <tbody>${rows.length?rows.map(r=>`<tr><td><input type="checkbox" ${state.returnChk.has(r.i)?'checked':''} onclick="returnToggle(${r.i})"></td><td>${r.date}</td><td><span class="badge ${r.type==='교환'?'info':'muted'}">${r.type}</span></td><td><b>${r.agency}</b></td><td>${r.prod}</td><td class="num">${r.qty}</td><td>${/불량/.test(r.reason)?'<span class="badge danger">'+r.reason+'</span>':r.reason}</td><td class="muted">${r.lot||'—'}</td><td class="muted" style="font-size:11.5px">${r.note||''}</td><td>${r.fb?'<span class="badge ok">기안됨</span>':'<span class="muted">—</span>'}</td></tr>`).join(''):`<tr><td colspan="10" class="muted" style="padding:16px;text-align:center">${year}년 내역이 없습니다.</td></tr>`}</tbody>
  </table></div>
  <div class="muted" style="font-size:12px;margin-top:10px">불량은 반품/교환의 한 ‘사유’로 표시됩니다(별도 구분 없음). 체크 후 ‘피드백 정보처리요청서 작성’ → 다우오피스 전자결재 상신.</div>`;
}
function returnToggle(i){ if(state.returnChk.has(i)) state.returnChk.delete(i); else state.returnChk.add(i); render(); }
function returnCheckAll(year,filt){ let rows=returnsData.map((r,i)=>({...r,i})).filter(r=>r.date.slice(0,4)===year); if(filt==='반품') rows=rows.filter(r=>r.type==='반품'); else if(filt==='교환') rows=rows.filter(r=>r.type==='교환'); const allOn=rows.every(r=>state.returnChk.has(r.i)); rows.forEach(r=>allOn?state.returnChk.delete(r.i):state.returnChk.add(r.i)); render(); }
function openFeedbackDoc(){ if(!state.returnChk.size){ toast('피드백 요청서를 작성할 내역을 체크하세요'); return; } go('dom-feedback'); }
function feedbackSubmit(){ const n=state.returnChk.size; [...state.returnChk].forEach(i=>{ if(returnsData[i]) returnsData[i].fb=true; }); state.returnChk=new Set(); toast(n+'건 다우오피스 「피드백 정보처리요청서」 상신 완료 — 대리점 상세 ‘클레임·품질’에 반영'); go('dom-returns'); }
function vFeedbackDoc(){
  setHead('피드백 정보처리요청서','국내영업 · 반품·교환');
  const items=[...state.returnChk].map(i=>returnsData[i]).filter(Boolean);
  if(!items.length) return `<div class="back" data-view="dom-returns">← 반품 · 교환 처리</div><div class="card" style="margin-top:14px"><div class="pad muted">선택된 내역이 없습니다. 반품·교환 처리에서 체크 후 다시 시도하세요.</div></div>`;
  const agency=items[0].agency;
  const totalQty=items.reduce((s,r)=>s+r.qty,0);
  return `
  <div class="back" data-view="dom-returns">← 반품 · 교환 처리</div>
  <div class="pagehead"><div><div class="t">피드백 정보처리요청서</div><div class="d">체크한 ${items.length}건으로 자동 작성됐어요. 확인 후 다우오피스 전자결재로 상신합니다.</div></div>
    <button class="btn primary" onclick="feedbackSubmit()">다우오피스로 상신</button></div>
  <div class="doc" style="max-width:780px">
    <h2 style="letter-spacing:.1em;font-size:21px;padding:0;margin-bottom:20px">Feedback 정보처리 요청서</h2>
    <div style="display:flex;gap:14px;margin-bottom:16px;flex-wrap:wrap;align-items:stretch">
      <table style="flex:1;min-width:250px;margin:0"><tbody>
        <tr><th style="width:84px;background:#EEF2F5">문서번호</th><td>영업팀-2026-00071</td></tr>
        <tr><th style="background:#EEF2F5">기 안 일</th><td>2026-06-25(목)</td></tr>
        <tr><th style="background:#EEF2F5">소속부서</th><td>영업팀</td></tr>
        <tr><th style="background:#EEF2F5">기 안 자</th><td>진은명</td></tr>
      </tbody></table>
      <table style="flex:0 0 330px;margin:0"><thead><tr><th>팀원</th><th>팀장</th><th>이사</th><th>대표이사</th></tr></thead>
        <tbody><tr>${['진은명','이연선','양나경','배진우'].map(n=>`<td style="text-align:center;vertical-align:top;padding:8px 4px"><div style="width:30px;height:30px;border-radius:50%;border:1.3px solid var(--danger);color:var(--danger);font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto">승인</div><div style="font-size:11px;margin-top:4px">${n}</div></td>`).join('')}</tr></tbody></table>
    </div>
    <table style="margin-bottom:14px"><tbody>
      <tr><th style="width:84px;background:#EEF2F5">제 목</th><td colspan="3" style="text-align:center"><b>불량 검수 요청의 건 - ${agency} (260625)</b></td></tr>
      <tr><th style="background:#EEF2F5">접수번호</th><td></td><th style="width:84px;background:#EEF2F5">접수일자</th><td>${items[0].date}</td></tr>
      <tr><th style="background:#EEF2F5">회답부서</th><td>품질경영팀</td><th style="background:#EEF2F5">회신요청일</th><td>2026-06-30</td></tr>
      <tr><th style="background:#EEF2F5">구 분</th><td>☑ 국내　☐ 해외</td><th style="background:#EEF2F5">업 체 명</th><td><b>${agency}</b></td></tr>
    </tbody></table>
    <table style="margin-bottom:14px"><caption>제품정보</caption>
      <thead><tr><th>제품명</th><th>제조일자(LOT)</th><th class="num">출고수량</th><th class="num">불량/반품수량</th></tr></thead>
      <tbody>${items.map(r=>`<tr><td>${r.prod}</td><td>${lotToDate(r.lot)}</td><td class="num">—</td><td class="num">${r.qty}</td></tr>`).join('')}</tbody>
    </table>
    <table><caption>접수내용</caption><tbody>
      <tr><td style="line-height:1.95;padding:12px 14px">접수일: ${items[0].date}<br>회수 수량: ${totalQty}EA<br><br>[피드백 내용]<br>${[...new Set(items.map(r=>r.reason))].join(', ')}<br><br>[처리]<br>${[...new Set(items.map(r=>r.note).filter(Boolean))].join(' / ')||'접수 후 처리 진행'}<br><br>[소견]<br>해당 LOT 생산 조건 점검 후 품질경영팀 회신 예정.</td></tr>
    </tbody></table>
  </div>`;
}
function vReturnNew(){
  setHead('반품/교환 내역 등록','국내영업');
  const today=TODAY.toISOString().slice(0,10);
  return `
  <div class="back" data-view="dom-returns">← 반품 · 교환 내역</div>
  <div class="pagehead"><div><div class="t">반품/교환 내역 등록</div><div class="d">아래 양식을 입력해 새 내역을 추가합니다. 사유에 ‘불량’이 포함되면 등록 후 피드백처리요청서 입력 버튼이 활성화됩니다.</div></div></div>
  <div class="card" style="max-width:680px"><div class="pad">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:11px"><label class="muted" style="width:90px;font-size:13px">일자</label><input id="rnDate" type="date" value="${today}" style="flex:1;border:1px solid var(--border-2);border-radius:7px;padding:8px 10px;font-family:inherit;font-size:13px;box-sizing:border-box"></div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:11px"><label class="muted" style="width:90px;font-size:13px">구분</label><select id="rnType" style="flex:1;border:1px solid var(--border-2);border-radius:7px;padding:8px 10px;font-family:inherit;font-size:13px"><option>반품</option><option>교환</option></select></div>
    ${[['rnAgency','업체명',''],['rnProd','제품(코드)',''],['rnQty','수량','number'],['rnLot','LOT 번호',''],['rnReason','사유',''],['rnNote','비고','']].map(f=>`<div style="display:flex;align-items:center;gap:12px;margin-bottom:11px"><label class="muted" style="width:90px;font-size:13px">${f[1]}</label><input id="${f[0]}" type="${f[2]==='number'?'number':'text'}" ${f[0]==='rnReason'?'placeholder=\"예) 불량-개봉전경화 / 오발주 / 사이즈 교환\"':''} style="flex:1;border:1px solid var(--border-2);border-radius:7px;padding:8px 10px;font-family:inherit;font-size:13px;box-sizing:border-box"></div>`).join('')}
    <div class="quick" style="margin-top:8px"><button class="btn" data-view="dom-returns">취소</button><button class="btn primary" onclick="saveReturn()">등록</button></div>
  </div></div>`;
}
function saveReturn(){
  const g=id=>document.getElementById(id);
  const date=g('rnDate').value, type=g('rnType').value, agency=g('rnAgency').value.trim(),
        prod=g('rnProd').value.trim(), qty=+g('rnQty').value||0, lot=g('rnLot').value.trim(),
        reason=g('rnReason').value.trim(), note=g('rnNote').value.trim();
  if(!date||!agency||!prod){ toast('일자·업체명·제품은 필수입니다'); return; }
  const defect=/불량/.test(reason);
  returnsData.unshift({date,type,agency,prod,qty,reason,lot,defect,fb:false,note});
  state.retYear=date.slice(0,4);
  toast('반품·교환 내역이 등록되었습니다');
  go('dom-returns');
}

const ledgerTargets={
  '원장':[
    {name:'수성위재', grade:'B', note:'당월만', fmt:'PDF', via:'팩스', dest:'02-xxx-1234'},
    {name:'한독메디텍', grade:'C', note:'', fmt:'엑셀', via:'메일', dest:'order@handok.kr'},
    {name:'케이알닥터스', grade:'A', note:'', fmt:'둘다', via:'메일', dest:'krd@krdoctors.kr'},
    {name:'제이알(JR)메디칼', grade:'', note:'말일 전', fmt:'PDF', via:'팩스', dest:'031-xxx-5678'},
    {name:'한백메디칼', grade:'', note:'당월만', fmt:'PDF', via:'팩스', dest:'02-xxx-9001'},
    {name:'에스메디텍', grade:'', note:'', fmt:'엑셀', via:'메일', dest:'sm@smeditech.kr'},
  ],
  '출고현황':[
    {name:'세정코리아', grade:'A', note:'', fmt:'엑셀', via:'메일', dest:'sj@sjkorea.kr'},
    {name:'수성위재', grade:'', note:'', fmt:'PDF', via:'팩스', dest:'02-xxx-1234'},
    {name:'한스메디션', grade:'A', note:'', fmt:'둘다', via:'메일', dest:'hans@hms.kr'},
    {name:'제이원메딕스', grade:'B', note:'', fmt:'PDF', via:'팩스', dest:'051-xxx-2345'},
    {name:'데이케어(한강메디칼)', grade:'B', note:'', fmt:'엑셀', via:'메일', dest:'daycare@hg.kr'},
    {name:'메디홀스', grade:'B', note:'', fmt:'PDF', via:'팩스', dest:'02-xxx-6789'},
  ],
  '채권채무조회서':[
    {name:'한백', grade:'A+', note:'미수 잔액', fmt:'PDF', via:'팩스', dest:'02-xxx-9001', recv:8400000},
    {name:'대성 메디칼', grade:'A', note:'미수 잔액', fmt:'엑셀', via:'메일', dest:'daesung@dm.kr', recv:3200000},
    {name:'부산 정형', grade:'B', note:'미수 잔액', fmt:'PDF', via:'팩스', dest:'051-xxx-2345', recv:1500000},
  ],
};
const ledgerTabs=['원장','출고현황','채권채무조회서'];
const fmtBadge=f=>({'엑셀':'ok','PDF':'info','둘다':'teal'}[f]||'muted');
function setLedgerTab(t){ state.ledgerTab=t; render(); }
// 추출용: 엑셀에서 수치만 읽어 반영하고 원본 파일은 보관하지 않음 (Storage에 쌓이지 않게)
function ledgerUpload(input, kind){ const f=input.files&&input.files[0]; if(!f) return; toast('영림원 '+kind+' 엑셀 ‘'+f.name+'’ 반영 완료 — 수치만 반영, 원본 미보관'); input.value=''; }
function ledgerToggle(k){ const y=window.scrollY; if(state.ledgerChk.has(k)) state.ledgerChk.delete(k); else state.ledgerChk.add(k); render(); window.scrollTo(0,y); }
function ledgerCheckAll(group){ const y=window.scrollY; const keys=ledgerTargets[group].map(t=>group+'::'+t.name); const allOn=keys.every(k=>state.ledgerChk.has(k)); keys.forEach(k=>{ allOn?state.ledgerChk.delete(k):state.ledgerChk.add(k); }); render(); window.scrollTo(0,y); }
function ledgerSet(group,name,field,val){ const y=window.scrollY; const it=ledgerTargets[group].find(t=>t.name===name); if(it) it[field]=val; render(); window.scrollTo(0,y); }
function ledgerSend(group){
  const sel=[...state.ledgerChk].filter(k=>k.startsWith(group+'::'));
  if(!sel.length){ toast('발송할 거래처를 선택하세요'); return; }
  const faxN=sel.filter(k=>{const n=k.split('::')[1]; const it=ledgerTargets[group].find(t=>t.name===n); return it&&it.via==='팩스';}).length;
  const retry={}; sel.forEach(k=>{ retry[k]=data.ledgerStatus[k]==='실패'; data.ledgerStatus[k]='전송중'; });
  toast(group+' '+sel.length+'개사 발송 중… (하나팩스 '+faxN+' / 다우오피스 메일 '+(sel.length-faxN)+')'); render();
  setTimeout(function(){ var ok=0,fail=0; sel.forEach(function(k,i){ var s=retry[k]?true:(i%5!==4); data.ledgerStatus[k]=s?'성공':'실패'; if(s){state.ledgerChk.delete(k);ok++;}else fail++; }); render(); toast(group+' 발송 완료 — 성공 '+ok+(fail?(' / 실패 '+fail+' (재발송하면 성공)'):'')); }, 1000);
}
function vLedger(){
  const isShip = state.view==='dom-shipstatus';
  const tabsHere = isShip ? ['출고현황'] : ['원장','채권채무조회서'];
  if(!tabsHere.includes(state.ledgerTab)) state.ledgerTab=tabsHere[0];
  setHead(isShip?'출고현황 발송':'원장 · 채권채무조회서 발송','국내영업');
  const now=new Date(); const mLabel=(now.getMonth()+1)+'월';
  const tab=state.ledgerTab;
  const list=ledgerTargets[tab];
  const keys=list.map(t=>tab+'::'+t.name);
  const allOn=keys.every(k=>state.ledgerChk.has(k));
  const selN=keys.filter(k=>state.ledgerChk.has(k)).length;
  const isRecv=tab==='채권채무조회서';
  const desc={'원장':'매달 원장 — 매출 마감 후 발송. 거래처별 파일형식(엑셀/PDF/둘다)·전송방법(팩스/메일)·경로가 다릅니다.','출고현황':'매달 출고현황 — 월말 발송. 거래처별 파일형식·전송방법·경로 적용.','채권채무조회서':'반기말(6/30·12/31) 기준 잔액 보유 거래처에 발송(미수금 관리에서 이동). 회신처 FAX 031-629-5216.'}[tab];
  return `
  <div class="pagehead"><div><div class="t">${isShip?'출고현황 발송':'원장 · 채권채무조회서 발송'}</div><div class="d">${isShip?'매달 출고현황을 거래처별 파일형식(엑셀/PDF/둘다)·전송방법(팩스/메일)·경로로 발송합니다.':'원장·채권채무조회서를 탭으로 나눠 발송합니다. 파일형식(엑셀/PDF/둘다)은 ‘보내는 파일’, 팩스/메일은 ‘보내는 방법’이며 거래처별로 다릅니다.'}</div></div></div>
  ${sorNotice()}
  <div class="card">${tabsHere.length>1?`<div class="tabs" id="ledgerTabs">${tabsHere.map(t=>`<button class="${t===tab?'active':''}" onclick="setLedgerTab('${t}')">${t}</button>`).join('')}</div>`:''}
  <div class="pad" style="padding-top:${tabsHere.length>1?'8px':'14px'}">
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
      <span class="badge teal">${isRecv?'기준 '+now.getFullYear()+'년 반기말':'기준 '+now.getFullYear()+'년 '+mLabel+' 마감'}</span>
      <span class="muted" style="font-size:12px">${desc}</span>
      <div style="flex:1"></div>
      <label class="btn" style="cursor:pointer"><input type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="ledgerUpload(this,'${isRecv?'잔액':'마감 자료'}')">${isRecv?'잔액 업로드 (엑셀)':'마감 자료 업로드 (엑셀)'}</label>${uploadBadge('extract')}
    </div>
    <div class="ov" style="border:1px solid var(--border);border-radius:8px;overflow-x:auto"><table>
      <thead><tr><th style="width:34px"><input type="checkbox" ${allOn?'checked':''} onclick="ledgerCheckAll('${tab}')"></th><th>거래처</th><th>등급</th>${isRecv?'<th class="num">미수 잔액</th>':'<th>특이</th>'}<th>파일형식</th><th>전송방법</th><th>경로</th></tr></thead>
      <tbody>${list.map(t=>{const k=tab+'::'+t.name; return `<tr>
        <td><input type="checkbox" ${state.ledgerChk.has(k)?'checked':''} onclick="ledgerToggle('${k}')"></td>
        <td><b>${t.name}</b></td>
        <td>${t.grade?gradeBadge(t.grade):'<span class="muted">—</span>'}</td>
        ${isRecv?`<td class="num" style="color:var(--warn);font-weight:600">${won(t.recv)}</td>`:`<td>${t.note?'<span class="badge warn">'+t.note+'</span>':'<span class="muted">—</span>'}</td>`}
        <td><select onchange="ledgerSet('${tab}','${t.name}','fmt',this.value)" style="border:1px solid var(--border-2);border-radius:6px;padding:3px 6px;font-family:inherit;font-size:12px">${['엑셀','PDF','둘다'].map(o=>`<option ${t.fmt===o?'selected':''}>${o}</option>`).join('')}</select></td>
        <td><select onchange="ledgerSet('${tab}','${t.name}','via',this.value)" style="border:1px solid var(--border-2);border-radius:6px;padding:3px 6px;font-family:inherit;font-size:12px">${['팩스','메일'].map(o=>`<option ${t.via===o?'selected':''}>${o}</option>`).join('')}</select></td>
        <td class="muted" style="font-size:12px">${t.dest}</td>
      </tr>`;}).join('')}</tbody>
    </table></div>
    <div class="quick" style="margin-top:13px"><button class="btn primary" onclick="ledgerSend('${tab}')">선택 발송 (${selN})</button><button class="btn" onclick="histModal()">발송 기록</button></div>
    <div class="muted" style="font-size:12px;margin-top:8px">파일형식·전송방법은 거래처별로 저장됩니다(셀렉트 변경 시 적용). 발송은 각 거래처의 형식·경로로 일괄 처리됩니다.</div>
  </div></div>`;
}


/* 국내영업 포털 + 공통 화면 등록 (해외 화면은 overseas.js 가 등록) */
Object.assign(VIEWS,{ 'home':vHome,'dom-dash':vDomDash,'dom-agencies':vAgencies,'dom-clients':vClients,'dom-pipeline':vPipeline,'agency':vAgencyDetail,
  'dom-shipping':vShipping,'dom-returns':vReturns,'dom-return-new':vReturnNew,'dom-ledger':vLedger,'dom-shipstatus':vLedger,'dom-pricing':vPricing,
  'dom-contracts':vContracts,'dom-feedback':vFeedbackDoc,'dom-followup':vFollowup,'cert-hub':vCertHub,'quote':vQuote,
  'disc-dash':vDiscDash,'disc-leads':vDiscLeads,'disc-market':vMarket,'disc-search':vSearch,'lead':vLeadDetail,'proposal':vProposal,'doc':vDoc });

/* 사이드바 메뉴 — 포털 + 역할에 따라 그려집니다 */
function renderNav(){
  const nav=document.getElementById('nav'); if(!nav) return;
  nav.innerHTML=PORTAL.nav.map(it=>{
    if(it.grp) return `<div class="grp">${it.grp}</div>`;
    if(!roleOk(it)) return '';
    const ic=it.icon?`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICONS[it.icon]}</svg>`:'';
    return `<a data-view="${it.v}" class="${it.sub?'sub':''}">${ic}${it.t}</a>`;
  }).join('');
  const brand=document.getElementById('brand');
  if(brand) brand.innerHTML=`<div class="logo">BL</div><div><b>${PORTAL.name}</b><span>${PORTAL.sub}</span></div>`;
  // 포털 전환은 관리자만 (실제 사용자는 자기 포털만 보입니다)
  const foot=document.getElementById('foot');
  if(!foot) return;
  const isAdmin = state.role==='관리자';
  foot.innerHTML=`
    ${isAdmin?`<a class="footlink" href="${OTHER.id==='domestic'?'index.html':'overseas.html'}">${OTHER.sub} →</a>`:''}
    <div class="footrole"><span>역할</span>
      <select id="roleSel">${ROLES.map(r=>`<option ${r===state.role?'selected':''}>${r}</option>`).join('')}</select>
    </div>
    <div class="footnote">Phase 1 프로토타입 · 샘플 데이터</div>`;
}

function render(){
  const c=document.getElementById('content');
  renderNav();
  if(!portalOk()){
    c.innerHTML=`<div class="card" style="max-width:520px;margin:40px auto"><div class="pad" style="text-align:center">
      <div style="font-size:34px;margin-bottom:8px">🔒</div>
      <div style="font-weight:700;font-size:15px;margin-bottom:6px">이 포털에 접근 권한이 없습니다</div>
      <div class="muted" style="font-size:13px;line-height:1.7">현재 역할 <b>${state.role}</b> 은(는) ${PORTAL.sub}을 볼 수 없어요.<br>${OTHER.sub}로 이동하거나 관리자에게 권한을 요청하세요.</div>
      <a href="${OTHER.id==='domestic'?'index.html':'overseas.html'}" class="btn primary" style="margin-top:14px;display:inline-block;text-decoration:none">${OTHER.sub} 로 이동</a>
    </div></div>`;
    const tb0=document.getElementById('tabbar'); if(tb0) tb0.innerHTML='';
    return;
  }
  c.innerHTML=(VIEWS[state.view]||VIEWS[PORTAL.home]||vDomDash)();
  c.scrollTop=0;
  const ch=document.getElementById('mktChat'); if(ch) ch.scrollTop=ch.scrollHeight;
  // active nav (하위 화면은 부모 메뉴를 켬)
  const navParent={ 'dom-return-new':'dom-returns','dom-feedback':'dom-returns',
    'agency':'dom-agencies','doc':'dom-agencies','quote':'dom-pricing',
    'lead':'disc-leads','proposal':'disc-leads' };
  const activeView=navParent[state.view]||state.view;
  document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('active', a.dataset.view===activeView));
  // 열린 화면 탭바
  const tb=document.getElementById('tabbar');
  if(tb){ tb.innerHTML=state.tabs.map(t=>`<div class="tab ${t.id===state.activeTab?'active':''} ${t.view===PORTAL.home?'home':''} ${navParent[t.view]?'':'pri'}" data-tabid="${t.id}"><span class="lb">${t.label}</span>${t.view===PORTAL.home?'':`<span class="x" data-closetab="${t.id}" title="닫기">×</span>`}</div>`).join(''); }
}
const TAB_LABELS={ home:'메인 화면','dom-dash':'대시보드','dom-agencies':'미수금 관리','dom-clients':'거래처 등록','dom-shipping':'출고 현황','dom-returns':'반품 · 교환 처리','dom-return-new':'반품 등록','dom-ledger':'원장 · 채권채무조회서 발송','dom-shipstatus':'출고현황 발송','dom-pricing':'보험수가표 · 견적서','dom-contracts':'계약 관리','dom-feedback':'피드백 요청서','dom-followup':'Follow-up','dom-pipeline':'파이프라인','quote':'견적서 작성','cert-hub':'인증·규제 허브',
  'ov-dash':'해외 현황','ov-pricelist':'신규 고객','ov-orders':'수주·생산','ov-agencies':'해외 거래처','ov-shipping':'선적·물류','ov-docs':'수출서류',
  'disc-dash':'발굴 동선','disc-leads':'잠재 거래처','disc-market':'시장분석','disc-search':'탐색','proposal':'제안서 작성' };
function tabMeta(v){
  if(v==='agency'){ const a=findAgency(state.agency); return {id:'agency:'+state.agency, label:(a?a.name:'거래처')+' 상세', ctx:{agency:state.agency, aTab:state.aTab}}; }
  if(v==='lead'){ const l=leads.find(x=>x.id===state.lead); return {id:'lead:'+state.lead, label:(l?l.name:'리드')+' 상세', ctx:{lead:state.lead}}; }
  if(v==='doc'){ return {id:'doc:'+(state.docAgency||''), label:'채권채무조회서', ctx:{docAgency:state.docAgency}}; }
  return {id:v, label:TAB_LABELS[v]||v, ctx:null};
}
function go(v){
  if(!allowedView(v)){ toast('이 화면은 '+OTHER.sub+'에 있습니다'); return; }  // 포털 경계
  if(!viewRoleOk(v)){ toast('‘'+state.role+'’ 역할은 이 화면을 볼 수 없습니다'); return; }  // 역할 경계
  state.view=v;
  const m=tabMeta(v);
  const t=state.tabs.find(x=>x.id===m.id);
  if(t){ t.label=m.label; t.ctx=m.ctx; t.view=v; }
  else state.tabs.push({id:m.id, view:v, label:m.label, ctx:m.ctx});
  state.activeTab=m.id;
  render();
}
function activateTab(id){
  const t=state.tabs.find(x=>x.id===id); if(!t) return;
  if(t.ctx) Object.assign(state, t.ctx);
  state.view=t.view; state.activeTab=id; render();
}
function closeTab(id){
  const i=state.tabs.findIndex(x=>x.id===id); if(i<0) return;
  const wasActive=state.activeTab===id;
  state.tabs.splice(i,1);
  if(!state.tabs.length){ go(PORTAL.home); return; }
  if(wasActive) activateTab(state.tabs[Math.max(0,i-1)].id);
  else render();
}

/* ---------------- events ---------------- */
document.getElementById('nav').addEventListener('click',e=>{ const a=e.target.closest('a'); if(a){ go(a.dataset.view);} });
document.getElementById('brand').addEventListener('click',()=>go(PORTAL.home));
// 역할 전환 (프로토타입) — Auth 붙이면 로그인 사용자의 role 클레임으로 대체됩니다
document.getElementById('side').addEventListener('change',e=>{ if(e.target.id==='roleSel'){ state.role=e.target.value; render(); toast('역할 전환 — '+state.role); } });
document.getElementById('tabbar').addEventListener('click',e=>{
  const close=e.target.closest('[data-closetab]'); if(close){ e.stopPropagation(); closeTab(close.dataset.closetab); return; }
  const tab=e.target.closest('[data-tabid]'); if(tab) activateTab(tab.dataset.tabid);
});
document.getElementById('content').addEventListener('click',e=>{
  const nav=e.target.closest('[data-view]'); if(nav){ go(nav.dataset.view); return; }
  const back=e.target.closest('[data-back]'); if(back){ go(back.dataset.back==='agency'?'agency':'dom-agencies'); return; }
  const doc=e.target.closest('[data-doc]'); if(doc){ state.docAgency=doc.dataset.doc; go('doc'); return; }
  const tab=e.target.closest('[data-tab]'); if(tab){ state.aTab=tab.dataset.tab; render(); return; }
  const stab=e.target.closest('[data-shiptab]'); if(stab){ state.shipTab=stab.dataset.shiptab; render(); return; }
  const arow=e.target.closest('[data-agency]'); if(arow){ state.agency=arow.dataset.agency; state.aTab='개요'; go('agency'); return; }
  const lrow=e.target.closest('[data-lead]'); if(lrow){ state.lead=lrow.dataset.lead; go('lead'); return; }
  if(e.target.id==='checkAll'){ const on=e.target.checked; curAgencies().forEach(a=>on?state.checked.add(a.id):state.checked.delete(a.id)); render(); return; }
  if(e.target.classList.contains('rowchk')){ const id=e.target.dataset.id; e.target.checked?state.checked.add(id):state.checked.delete(id); render(); return; }
  if(e.target.id==='bulkBtn'){ bulkModal(); return; }
  if(e.target.id==='histBtn'){ histModal(); return; }
  if(e.target.id==='exportBtn'){ toast('대리점 목록 엑셀 다운로드 (프로토타입)'); return; }
  if(e.target.id==='convertBtn'){ toast('국내영업 대리점으로 이관되었습니다'); setTimeout(()=>go('dom-agencies'),700); return; }
  if(e.target.id==='ovConvertBtn'){ toast('해외 신규 고객으로 등록되었습니다'); setTimeout(()=>go('ov-pricelist'),700); return; }
});
document.getElementById('modal').addEventListener('click',e=>{
  const doc=e.target.closest('[data-doc]'); if(doc){ state.docAgency=doc.dataset.doc; go('doc'); }
  if(e.target.id==='bulkSend'){ const n=state.checked.size; closeModal(); toast(n+'곳에 채권채무조회서를 발송했습니다'); }
});
document.getElementById('modalBg').addEventListener('click',e=>{ if(e.target.id==='modalBg') closeModal(); });
// mobile menu — 배경 탭으로 닫기 + 메뉴 선택 시 자동 닫기
const mq=window.matchMedia('(max-width:820px)');
// 버튼 노출은 CSS(#menuBtn)가 담당. 여기선 데스크톱으로 넓어질 때 열린 메뉴만 정리합니다.
function syncMenu(){ if(!mq.matches) navOpen(false); }
mq.addEventListener('change',syncMenu);
const navBackdrop=document.createElement('div');
navBackdrop.className='navbackdrop';
document.body.appendChild(navBackdrop);
function navOpen(on){
  const side=document.getElementById('side');
  side.classList.toggle('open', on);
  document.body.classList.toggle('navopen', on);
  // 클래스만으로 두지 않고 인라인으로도 지정합니다.
  // (일부 환경에서 상태 클래스 규칙이 반영되지 않아 메뉴가 안 열리는 경우가 있었음)
  // 열 때만 인라인으로 밀어넣고, 닫을 때는 인라인을 지워 CSS 기본값으로 되돌립니다.
  // (닫힘 상태를 인라인으로 박아두면 데스크톱으로 넓어졌을 때 사이드바가 숨은 채 남습니다)
  if(on && mq.matches) side.style.transform = 'translateX(0)';
  else                 side.style.transform = '';
  navBackdrop.style.opacity       = on ? '1' : '0';
  navBackdrop.style.pointerEvents = on ? 'auto' : 'none';
}
document.getElementById('menuBtn').addEventListener('click',()=>navOpen(!document.getElementById('side').classList.contains('open')));
navBackdrop.addEventListener('click',()=>navOpen(false));
// 모바일에서 메뉴를 고르면 사이드바가 계속 덮고 있지 않도록 닫아줍니다
document.getElementById('nav').addEventListener('click',e=>{ if(e.target.closest('a') && mq.matches) navOpen(false); });
document.getElementById('brand').addEventListener('click',()=>{ if(mq.matches) navOpen(false); });

/* 부팅 — 포털 기본 화면으로 시작.
   setTimeout(0) 으로 미뤄서, overseas.js 같은 포털 스크립트가 VIEWS 등록을 끝낸 뒤 실행되게 합니다. */
function boot(){
  const h=PORTAL.home;
  state.view=h; state.activeTab=h;
  state.tabs=[{id:h, view:h, label:TAB_LABELS[h]||'대시보드', ctx:null}];
  render();
}
setTimeout(boot,0);
