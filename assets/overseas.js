/* ==========================================================
   해외영업 포털 — overseas.html 에서만 로드됩니다.
   국내영업 포털(index.html)은 이 파일을 내려받지 않습니다.
   공통 셸(state/helpers/render/tabbar)은 app.js 를 그대로 씁니다.
   ========================================================== */
const nealCatalog=[
  {grp:'Casting Tape · Rigid (P)', moq:'500 Rolls', items:[['NPC-1P','1"×2.4yd',1.10,0.99],['NPC-2P','2"×4yd',1.50,1.35],['NPC-3P','3"×4yd',1.70,1.53],['NPC-4P','4"×4yd',2.00,1.80],['NPC-5P','5"×4yd',2.30,2.07],['NPC-6P','6"×4yd',2.50,2.25]]},
  {grp:'Casting Tape · Rigid Fiberglass (F)', moq:'500 Rolls', items:[['NPC-1F','1"×2.4yd',1.30,1.17],['NPC-2F','2"×4yd',1.60,1.44],['NPC-3F','3"×4yd',1.80,1.62],['NPC-4F','4"×4yd',2.10,1.89],['NPC-5F','5"×4yd',2.40,2.16],['NPC-6F','6"×4yd',2.60,2.34]]},
  {grp:'Casting Tape · Soft Polyester (S)', moq:'500 Rolls', items:[['NPS-1P','1"×2.4yd',1.20,1.08],['NPS-2P','2"×4yd',1.60,1.44],['NPS-3P','3"×4yd',1.80,1.62],['NPS-4P','4"×4yd',2.10,1.89],['NPS-5P','5"×4yd',2.40,2.16],['NPS-6P','6"×4yd',2.60,2.34]]},
  {grp:'Roll Splint · Non-woven', moq:'50 Rolls', items:[['NHRS-2450N','2"×15ft',26.00,23.40],['NHRS-3450N','3"×15ft',32.00,28.80],['NHRS-4450N','4"×15ft',40.00,36.00],['NHRS-5450N','5"×15ft',46.00,41.40],['NHRS-6450N','6"×15ft',53.00,47.70]]},
  {grp:'Roll Splint · Fiberglass', moq:'50 Rolls', items:[['NHRS-2450F','2"×15ft',28.60,25.74],['NHRS-3450F','3"×15ft',35.20,31.68],['NHRS-4450F','4"×15ft',44.00,39.60],['NHRS-5450F','5"×15ft',50.60,45.54],['NHRS-6450F','6"×15ft',58.30,52.47]]},
  {grp:'Roll Splint · Single Polyester', moq:'50 Rolls', items:[['NHRS-2450SP','2"×15ft',26.00,23.40],['NHRS-3450SP','3"×15ft',32.00,28.80],['NHRS-4450SP','4"×15ft',40.00,36.00],['NHRS-5450SP','5"×15ft',46.00,41.40],['NHRS-6450SP','6"×15ft',53.00,47.70]]},
  {grp:'Precut Splint · Non-woven', moq:'20 Boxes', items:[['NHPS-2012N','2"×12"',3.20,2.88],['NHPS-3014N','3"×14"',4.00,3.60],['NHPS-3040N','3"×40"',9.50,8.55],['NHPS-4018N','4"×18"',5.50,4.95],['NHPS-4034N','4"×34"',9.50,8.55],['NHPS-5034N','5"×34"',11.00,9.90],['NHPS-5050N','5"×50"',15.50,13.95],['NHPS-6034N','6"×34"',13.00,11.70],['NHPS-6050N','6"×50"',17.50,15.75]]},
  {grp:'Precut Splint · Fiberglass', moq:'20 Boxes', items:[['NHPS-2012F','2"×12"',3.52,3.17],['NHPS-3014F','3"×14"',4.40,3.96],['NHPS-3040F','3"×40"',10.45,9.41],['NHPS-4018F','4"×18"',6.05,5.45],['NHPS-4034F','4"×34"',10.45,9.41],['NHPS-5034F','5"×34"',12.10,10.89],['NHPS-5050F','5"×50"',17.05,15.35],['NHPS-6034F','6"×34"',14.30,12.87],['NHPS-6050F','6"×50"',19.25,17.33]]},
  {grp:'Precut Splint · Single Polyester', moq:'20 Boxes', items:[['NHPS-2012SP','2"×12"',3.20,2.88],['NHPS-3014SP','3"×14"',4.00,3.60],['NHPS-3040SP','3"×40"',9.50,8.55],['NHPS-4018SP','4"×18"',5.50,4.95],['NHPS-4034SP','4"×34"',9.50,8.55],['NHPS-5034SP','5"×34"',11.00,9.90],['NHPS-5050SP','5"×50"',15.50,13.95],['NHPS-6034SP','6"×34"',13.00,11.70],['NHPS-6050SP','6"×50"',17.50,15.75]]},
  {grp:'Under-pad · Roll', moq:'6~16 Rolls', items:[['NUP-1100','1"×33ft',13.50,12.15],['NUP-2100','2"×33ft',17.00,15.30],['NUP-3100','3"×33ft',22.00,19.80],['NUP-4100','4"×33ft',27.50,24.75],['NUP-5100','5"×33ft',33.00,29.70],['NUP-6100','6"×33ft',38.50,34.65]]},
  {grp:'Under-pad · Pcs', moq:'20 Boxes', items:[['NUPP-2050','2"×20"',1.00,0.90],['NUPP-2080','2"×32"',1.40,1.26],['NUPP-3050','3"×20"',1.20,1.08],['NUPP-3080','3"×32"',1.90,1.71],['NUPP-4050','4"×20"',1.50,1.35],['NUPP-4080','4"×32"',2.30,2.07],['NUPP-5080','5"×32"',2.80,2.52],['NUPP-5120','5"×48"',4.10,3.69],['NUPP-6080','6"×32"',3.20,2.88],['NUPP-6120','6"×48"',4.70,4.23]]},
];
const ovAgencies = [
  {id:'o1', name:'Tokyo Medical Co.', country:'일본', field:'메디컬', inco:'FOB', pay:'T/T', cur:'JPY', fwd:'우리 지정 포워더(오셔) · 해상 FCL', cycle:30, lastDays:18},
  {id:'o2', name:'DAONSA', country:'멕시코', field:'하이드로겔', inco:'FOB', pay:'T/T', cur:'USD', fwd:'고객사 포워더 수배 · 해상', cycle:45, lastDays:47},
  {id:'o3', name:"YOVANN'S CO", country:'프랑스', field:'메디컬', inco:'DAP', pay:'T/T', cur:'USD', fwd:'우리 지정 포워더 · 항공', cycle:35, lastDays:30},
  {id:'o4', name:'Oce Inc.', country:'미국', field:'메디컬', inco:'EXW', pay:'T/T', cur:'USD', fwd:'고객사 포워더 수배', cycle:28, lastDays:33},
  {id:'o5', name:'Rakesh Surgicals', country:'인도', field:'케미컬', inco:'FOB', pay:'T/T', cur:'USD', fwd:'고객사 포워더 수배 · 해상', cycle:21, lastDays:38},
  {id:'o6', name:'Gulf Plant Materials', country:'UAE', field:'플랜트', inco:'CIF', pay:'L/C', cur:'USD', fwd:'우리 지정 포워더 · 해상 CIF', cycle:60, lastDays:20},
];
const ovOrders = [
  {pi:'P12810', agency:'Tokyo Medical Co.', country:'일본', field:'메디컬', cur:'JPY', amount:3850000, inco:'FOB', stage:'선적', dep:true, bal:false, etd:'06/18'},
  {pi:'P12747', agency:'DAONSA', country:'멕시코', field:'하이드로겔', cur:'USD', amount:48200, inco:'FOB', stage:'생산', dep:true, bal:false, etd:'06/22'},
  {pi:'P12760', agency:"YOVANN'S CO", country:'프랑스', field:'메디컬', cur:'USD', amount:12600, inco:'DAP', stage:'PI 발행', dep:false, bal:false, etd:'06/30'},
  {pi:'P12733', agency:'Oce Inc.', country:'미국', field:'메디컬', cur:'USD', amount:21400, inco:'EXW', stage:'수출서류', dep:true, bal:true, etd:'06/12'},
  {pi:'P12790', agency:'Rakesh Surgicals', country:'인도', field:'케미컬', cur:'USD', amount:9800, inco:'FOB', stage:'정산', dep:true, bal:true, etd:'06/05'},
  {pi:'P12771', agency:'Gulf Plant Materials', country:'UAE', field:'플랜트', cur:'USD', amount:64500, inco:'CIF', stage:'생산', dep:true, bal:false, etd:'06/27'},
];
const ovPOInbox = [
  {id:0, from:'DAONSA', mail:'po@daonsa.mx', subj:'Purchase Order P12747 - Hydrogel', date:'06/12', matched:false,
   body:`Dear BL TECH,\n\nPlease find attached our purchase order P12747.\nKindly confirm the PI and lead time.\n\nItems:\n- DAOC-2010  x 2,000 pcs\n- DAOC-3012  x 1,500 pcs\n- DAOC-9988  x 500 pcs (new item)\n\nIncoterm: FOB Busan\nPayment: T/T 30/70\n\nBest regards,\nDAONSA Purchasing`,
   atts:[{name:'PO-Orden_de_compra_P12747.pdf', type:'pdf'}],
   pi:{no:'P12747', cur:'USD', inco:'FOB', lines:[['DAOC-2010 → NHC-2010','하이드로겔 커버 2010',2000,'BL'],['DAOC-3012 → NHC-3012','하이드로겔 커버 3012',1500,'WH'],['DAOC-9988 → ?','미매칭 코드',500,'?']]}},
  {id:1, from:'Tokyo Medical', mail:'order@tokyomed.jp', subj:'PO-219996 June Tokyo', date:'06/10', matched:true,
   body:`BL TECH 영업팀 귀하\n\n6월 주문서(PO-219996) 송부드립니다. 첨부 확인 부탁드립니다.\n\nNPC-2P x 500 Rolls\nNHRS-3450N x 50 Rolls\n\nIncoterm: FOB Busan / T/T 30/70\n\nTokyo Medical Co.`,
   atts:[{name:'PO-219996_June_Tokyo.xls', type:'xls'},{name:'생산출고의뢰서_시그맥스.xlsx', type:'xls'}],
   pi:{no:'P12811', cur:'JPY', inco:'FOB', lines:[['NPC-2P','Rigid Casting 2"',500,'—'],['NHRS-3450N','Roll Splint NW 3"',50,'—']]}},
  {id:2, from:'Rakesh Surgicals', mail:'rakesh@surgicals.in', subj:'New PO - chemical line', date:'06/09', matched:true,
   body:`Hello,\n\nNew PO attached. Please proceed.\n\nThank you,\nRakesh`,
   atts:[{name:'PO_Rakesh_0609.pdf', type:'pdf'}],
   pi:{no:'P12812', cur:'USD', inco:'FOB', lines:[['NHPS-5034N','Precut Splint 5"×34"',200,'—']]}},
];
function ovField(){ return state.ovField||'메디컬'; }
function setOvField(f){ state.ovField=f; render(); }
function ovFieldTabs(){ return `<div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap">${['메디컬','케미컬','하이드로겔','플랜트'].map(f=>`<button class="btn" style="${f===ovField()?'background:var(--navy);border-color:var(--navy);color:#fff':''}" onclick="setOvField('${f}')">${f}</button>`).join('')}</div>`; }
function ovMoney(n,cur){ return (cur==='USD'?'$':cur==='JPY'?'¥':'₩')+fmt(n); }
function payBadge(ok){ return ok?'<span class="badge ok">입금완료</span>':'<span class="badge danger">미입금</span>'; }
function ovSend(inputId,label){ const el=document.getElementById(inputId); const v=(el&&el.value||'').trim(); if(!v){ toast('받는 사람 이메일을 입력하세요'); return; } toast(v+' 앞으로 '+label+'을(를) 발송했습니다 (Outlook)'); }
function fxSet(r){ const y=window.scrollY; state.fxRange=r; render(); window.scrollTo(0,y); }
function fxSeries(range){
  const n={'1W':7,'1M':30,'3M':45,'1Y':52}[range]||30;
  const stepDays={'1W':1,'1M':1,'3M':2,'1Y':7}[range]||1;
  const usd=[],jpy=[],labels=[];
  for(let i=n-1;i>=0;i--){
    const d=new Date(TODAY); d.setDate(d.getDate()-i*stepDays); const t=n-1-i;
    const u=1382 + Math.sin(t/4)*13 + Math.sin(t/9)*20 + (((t*37)%11)-5);
    const j=905 + Math.cos(t/5)*8 + Math.sin(t/11)*12 + (((t*23)%9)-4);
    usd.push(Math.round(u*10)/10); jpy.push(Math.round(j*10)/10);
    labels.push((d.getMonth()+1)+'/'+d.getDate());
  }
  return {labels,usd,jpy};
}
function fxChart(h){
  h=h||210; const s=fxSeries(state.fxRange||'1M');
  const all=s.usd.concat(s.jpy); let mn=Math.min.apply(null,all), mx=Math.max.apply(null,all);
  const pd=(mx-mn)*0.18||10; mn-=pd; mx+=pd;
  const W=720,H=h,L=46,Rp=14,Tp=10,Bp=22, pw=W-L-Rp, ph=H-Tp-Bp, n=s.labels.length;
  const X=i=> L + (n<=1?pw/2:i*(pw/(n-1)));
  const Y=v=> Tp + ph - ((v-mn)/(mx-mn))*ph;
  const line=arr=>arr.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  let grid=''; for(let g=0;g<=4;g++){ const yy=Tp+ph*g/4, val=mx-(mx-mn)*g/4; grid+=`<line x1="${L}" y1="${yy.toFixed(1)}" x2="${W-Rp}" y2="${yy.toFixed(1)}" stroke="var(--border)"/><text x="${L-6}" y="${(yy+3).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--ink-3)">${Math.round(val)}</text>`; }
  let xl=''; const stp=Math.max(1,Math.round(n/6)); for(let i=0;i<n;i+=stp){ xl+=`<text x="${X(i).toFixed(1)}" y="${H-6}" text-anchor="middle" font-size="10" fill="var(--ink-3)">${s.labels[i]}</text>`; }
  const dots=(arr,lab)=>arr.map((v,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="6" fill="transparent"><title>${s.labels[i]} · ${lab} ${fmt(v)}원</title></circle>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:760px;display:block">${grid}<path d="${line(s.usd)}" fill="none" stroke="var(--teal)" stroke-width="2.2"/><path d="${line(s.jpy)}" fill="none" stroke="var(--navy-2)" stroke-width="2.2"/>${dots(s.usd,'USD')}${dots(s.jpy,'100엔')}${xl}</svg>`;
}

function vOvDash(){
  setHead('대시보드','해외영업 · '+ovField());
  const f=ovField(), orders=ovOrders.filter(o=>o.field===f);
  const usdSales=orders.filter(o=>o.cur==='USD').reduce((s,o)=>s+o.amount,0);
  const jpySales=orders.filter(o=>o.cur==='JPY').reduce((s,o)=>s+o.amount,0);
  const noDep=orders.filter(o=>!o.dep).length;
  const noBal=orders.filter(o=>o.dep&&!o.bal).length;
  const inShip=orders.filter(o=>['생산','선적','수출서류'].includes(o.stage)).length;
  const s=fxSeries(state.fxRange||'1M'); const usdT=s.usd[s.usd.length-1], jpyT=s.jpy[s.jpy.length-1];
  const reorder=ovAgencies.filter(a=>a.field===f && a.lastDays>=a.cycle*0.9).sort((x,y)=>y.lastDays/y.cycle-x.lastDays/x.cycle);
  const alerts=[
    {tag:'danger',t:"PI 미발행 — P12760 (YOVANN'S CO)",s:'PO 수령됨 · PI 자동생성 대기'},
    {tag:'warn',t:'잔금 미입금 — P12810 (Tokyo Medical)',s:'B/L 발행 예정 · 잔금 70% 확인'},
    {tag:'warn',t:'선적 D-3 — P12747 (DAONSA)',s:'ETD 06/22 · 포워더 스케줄 확정'},
  ];
  return `
  ${ovFieldTabs()}
  <div class="kpis" style="margin-bottom:20px">
    <div class="kpi"><div class="lab">수출 매출 (진행 PI)</div><div class="val">$${fmt(usdSales)}</div><div class="sub">${jpySales?'+ ¥'+fmt(jpySales)+' · ':''}${f}</div></div>
    <div class="kpi"><div class="lab">선금 미입금 PI</div><div class="val ${noDep?'danger':''}">${noDep}건</div><div class="sub">PI 넘버 기준</div></div>
    <div class="kpi"><div class="lab">잔금 미입금 PI</div><div class="val ${noBal?'warn':''}">${noBal}건</div><div class="sub">B/L 발행 후 70%</div></div>
    <div class="kpi"><div class="lab">진행 선적</div><div class="val">${inShip}건</div><div class="sub">생산·선적·수출서류</div></div>
  </div>
  <div class="row">
    <div class="card" style="flex:1.4;min-width:330px"><div class="pad">
      <div class="seclabel">재주문 알림 (주문 주기 기준)</div>
      <div class="ov" style="border:1px solid var(--border);border-radius:8px;overflow-x:auto"><table>
        <thead><tr><th>거래처</th><th class="num">평균 주기</th><th class="num">경과</th><th>상태</th><th></th></tr></thead>
        <tbody>${reorder.length?reorder.map(a=>{const due=a.lastDays>=a.cycle; return `<tr><td><b>${a.name}</b><div class="muted" style="font-size:11px">${a.country}</div></td><td class="num">${a.cycle}일</td><td class="num">${a.lastDays}일</td><td><span class="badge ${due?'danger':'warn'}">${due?'재주문 도래':'임박'}</span></td><td class="num"><button class="btn sm" data-view="ov-agencies">거래처 보기</button></td></tr>`;}).join(''):'<tr><td colspan="5" class="muted" style="padding:14px;text-align:center">재주문 임박 거래처 없음</td></tr>'}</tbody>
      </table></div>
      <div class="muted" style="font-size:12px;margin-top:8px">거래처별 평균 주문 주기 대비 경과일로 재주문 시점을 알려줍니다(국내 주문 주기 알림과 동일).</div>
    </div></div>
    <div class="card" style="flex:1;min-width:260px"><div class="pad">
      <div class="seclabel">알림</div>
      <div class="ledger-list">${alerts.map(x=>`<div class="li"><span class="dotmark" style="background:var(--${x.tag})"></span><div class="ti"><div style="font-size:13px;font-weight:600">${x.t}</div><div class="muted" style="font-size:12px">${x.s}</div></div></div>`).join('')}</div>
    </div></div>
  </div>
  <div class="card" style="margin:18px 0"><div class="pad">
    <div class="seclabel">PI 입금 현황 (선금 30 / 잔금 70)</div>
    <div class="ov" style="border:1px solid var(--border);border-radius:8px;overflow-x:auto"><table>
      <thead><tr><th>PI No.</th><th>거래처</th><th class="num">금액</th><th>선금</th><th>잔금</th><th>단계</th></tr></thead>
      <tbody>${orders.map(o=>`<tr><td><b>${o.pi}</b></td><td>${o.agency}<div class="muted" style="font-size:11px">${o.country}</div></td><td class="num">${ovMoney(o.amount,o.cur)}</td><td>${payBadge(o.dep)}</td><td>${payBadge(o.bal)}</td><td><span class="badge ${o.stage==='정산'?'ok':o.stage==='PI 발행'?'muted':'info'}">${o.stage}</span></td></tr>`).join('')}</tbody>
    </table></div>
    <div class="muted" style="font-size:12px;margin-top:8px">입금 루틴이 거래처마다 달라, PI 넘버로 선금·잔금 입금 여부를 확인합니다.</div>
  </div></div>
  <div class="card"><div class="pad">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:4px">
      <div class="seclabel" style="margin:0">환율 <span class="muted" style="font-weight:400">· USD ${fmt(usdT)}원 · 100엔 ${fmt(jpyT)}원</span></div>
      <select class="search" style="width:auto;padding:5px 9px;font-size:12px" onchange="fxSet(this.value)">${[['1W','1주'],['1M','1개월'],['3M','3개월'],['1Y','1년']].map(([v,l])=>`<option value="${v}" ${(state.fxRange||'1M')===v?'selected':''}>${l}</option>`).join('')}</select>
    </div>
    ${fxChart(120)}
    <div class="muted" style="font-size:11px;margin-top:2px">점에 마우스를 올리면 일자·환율이 표시됩니다. USD 기본 + 엔화 동시 표시. (실데이터는 환율 API 연동)</div>
  </div></div>`;
}

function setPlMode(m){ state.plMode=m; render(); }
function vOvPricelist(){
  setHead('신규 고객','해외영업');
  const mode=state.plMode||'기존', y=new Date(), pad=n=>String(n).padStart(2,'0');
  const docno='BL-PL-'+y.getFullYear()+pad(y.getMonth()+1)+pad(y.getDate());
  const newCustomers=[
    {name:'MedGulf Trading', country:'사우디', src:'발굴 센터 이관', date:'06/13', sent:false},
    {name:'AndesMed', country:'칠레', src:'발굴 센터 이관', date:'06/11', sent:true},
  ];
  const body = mode==='기존'
    ? `<table><thead><tr><th>Code</th><th>Size</th><th class="num">Factory (USD)</th><th class="num">40ft 컨테이너가</th></tr></thead><tbody>${nealCatalog.map(g=>`<tr class="grouphdr"><td colspan="4"><b>${g.grp}</b> <span class="muted" style="font-weight:400">· MOQ ${g.moq}</span></td></tr>${g.items.map(it=>`<tr><td>${it[0]}</td><td>${it[1]}</td><td class="num">$${it[2].toFixed(2)}</td><td class="num">$${it[3].toFixed(2)}</td></tr>`).join('')}`).join('')}</tbody></table>`
    : `<table><thead><tr><th>Item</th><th>Spec</th><th>Unit</th><th class="num">Unit Price (USD)</th></tr></thead><tbody>${[0,1,2,3,4,5].map(()=>`<tr>${[0,1,2,3].map(i=>`<td class="${i===3?'num':''}"><input style="border:none;border-bottom:1px dashed #bbb;width:${i===0?'150px':i===3?'90px':'70px'};font-family:inherit;font-size:12.5px;${i===3?'text-align:right':''}" placeholder="${['품명','규격','단위','단가'][i]}"></td>`).join('')}</tr>`).join('')}</tbody></table>`;
  return `
  <div class="pagehead"><div><div class="t">신규 고객</div><div class="d">발굴 센터에서 이관된 신규 고객 관리와 Price List 발송(아웃룩). OEM/ODM 신규 코드는 빈 양식에 수기 입력합니다.</div></div></div>
  <div class="seclabel">신규 고객 (발굴 센터 등록)</div>
  <div class="card ov" style="margin-bottom:18px"><table>
    <thead><tr><th>고객</th><th>국가</th><th>등록 경로</th><th>등록일</th><th>Price List</th></tr></thead>
    <tbody>${newCustomers.map(c=>`<tr><td><b>${c.name}</b></td><td>${c.country}</td><td><span class="badge muted">${c.src}</span></td><td class="muted">${c.date}</td><td>${c.sent?'<span class="badge ok">발송완료</span>':'<span class="badge warn">미발송</span>'}</td></tr>`).join('')}</tbody>
  </table></div>
  <div class="card" style="margin-bottom:16px"><div class="pad" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <div style="display:flex;gap:6px">
      <button class="btn" style="${mode==='기존'?'background:var(--navy);border-color:var(--navy);color:#fff':''}" onclick="setPlMode('기존')">2026 NEAL 카탈로그</button>
      <button class="btn" style="${mode==='신규'?'background:var(--navy);border-color:var(--navy);color:#fff':''}" onclick="setPlMode('신규')">OEM/ODM 신규 (빈 양식)</button>
    </div>
    <div style="flex:1"></div>
    <input class="search" id="plEmail" style="min-width:220px" placeholder="받는 사람 이메일 (Outlook)">
    <button class="btn primary" onclick="ovSend('plEmail','Price List')">Outlook으로 발송</button>
  </div></div>
  <div class="doc" style="max-width:760px">
    <div style="text-align:center"><b style="font-size:19px">BL TECH Co., Ltd.</b></div>
    <div class="muted" style="text-align:center;font-size:11px;margin-bottom:14px">84, Toegyenonggong-ro, Chuncheon-si, Gangwon-do, KOREA · T +82-33-264-2686 · F +82-31-629-5216</div>
    <h2 style="letter-spacing:.22em;padding-left:.22em">2026 PRICE LIST</h2>
    <div class="meta"><div>To : <input value="${mode==='기존'?'New Customer':''}" style="border:none;border-bottom:1px solid #9aa;font-size:13px;width:200px;font-family:inherit;background:#FAFBFC;padding:2px"></div><div style="text-align:right">No. : ${docno}<br>Date : ${y.getFullYear()}-${pad(y.getMonth()+1)}-${pad(y.getDate())}</div></div>
    <div class="intro">All prices in USD (FOB Busan). Factory Price / 40ft container (big-order) price. Payment: T/T 30% deposit / 70% after B/L. MOQ as noted. Validity 30 days.</div>
    ${body}
    <div class="reply">※ OEM/ODM 신규 코드는 빈칸으로 두고 수기 입력하며, 첫 등록 시 내부 품명과 매핑됩니다. HS Code·Incoterms·Bank·Signature는 PI 단계에서 포함됩니다.</div>
  </div>`;
}

function setSelPO(i){ state.ovSelPO=i; state.ovPreview=null; render(); }
function togglePreview(name){ state.ovPreview = (state.ovPreview===name?null:name); render(); }
function attPreview(name, sel){
  return `<div style="font-size:12px;color:var(--ink-2);margin-bottom:8px">${name} · 자동 인식 결과</div>
   <div class="ov" style="border:1px solid var(--border);border-radius:6px"><table style="margin:0"><thead><tr><th>발주 코드</th><th class="num">수량</th><th>색상(끝자리)</th></tr></thead>
   <tbody>${sel.pi.lines.map(l=>`<tr><td>${l[0].split(' → ')[0]}</td><td class="num">${fmt(l[2])}</td><td>${l[3]==='?'?'<span class="badge warn">확인</span>':l[3]}</td></tr>`).join('')}</tbody></table></div>
   <div class="muted" style="font-size:11px;margin-top:8px">실제 구현 시 PDF·엑셀 원본이 이 영역에 그대로 렌더링됩니다.</div>`;
}
function vOvOrders(){
  setHead('수주 · 생산','해외영업');
  const idx=state.ovSelPO||0; const sel=ovPOInbox[idx]||ovPOInbox[0];
  const steps=[['1','PO 수령','Outlook 수신'],['2','PI 발행','자동 인식'],['3','생산출고의뢰서','자동 인식'],['4','선적','포워더 메일'],['5','수출서류','PI·CI·PL·C/O'],['6','정산','PI별 입금']];
  return `
  <div class="pagehead"><div><div class="t">수주 · 생산</div><div class="d">메일 원문·첨부를 이 화면에서 바로 확인하고, 오른쪽에서 PI를 자동 생성합니다. (메일함을 따로 오갈 필요 없음)</div></div></div>
  <div class="row" style="margin-bottom:18px">${steps.map(s=>`<div class="step"><div class="n">STEP ${s[0]}</div><div class="h">${s[1]}</div><div class="muted" style="font-size:11.5px;margin-top:2px">${s[2]}</div></div>`).join('')}</div>
  <div class="seclabel">PO 수신함 (Outlook)</div>
  <div class="card ov" style="margin-bottom:16px"><table>
    <thead><tr><th>발신</th><th>제목</th><th>첨부</th><th>수신일</th><th>코드 매칭</th></tr></thead>
    <tbody>${ovPOInbox.map((p,i)=>`<tr class="clickable" style="${i===idx?'background:var(--teal-soft)':''}" onclick="setSelPO(${i})"><td><b>${p.from}</b><div class="muted" style="font-size:11px">${p.mail}</div></td><td>${p.subj}</td><td class="num">${p.atts.length}개</td><td class="muted">${p.date}</td><td>${p.matched?'<span class="badge ok">매칭 완료</span>':'<span class="badge danger">미매칭 있음</span>'}</td></tr>`).join('')}</tbody>
  </table></div>
  <div class="row">
    <div class="card" style="flex:1.2;min-width:330px"><div class="pad">
      <div class="seclabel">메일 원문</div>
      <div style="font-size:13px;font-weight:700;margin-bottom:2px">${sel.subj}</div>
      <div class="muted" style="font-size:12px;margin-bottom:10px">From ${sel.from} &lt;${sel.mail}&gt; · ${sel.date}</div>
      <div style="white-space:pre-wrap;font-size:12.5px;line-height:1.65;border:1px solid var(--border);border-radius:8px;padding:13px;background:#fff">${sel.body}</div>
      <div style="margin-top:12px"><div class="muted" style="font-size:12px;margin-bottom:6px">첨부파일 (클릭하면 아래에 미리보기)</div>
        ${sel.atts.map(a=>`<button class="btn sm" style="${state.ovPreview===a.name?'border-color:var(--teal);color:var(--teal-d)':''}" onclick="togglePreview('${a.name}')">📎 ${a.name}</button>`).join(' ')}
      </div>
      ${state.ovPreview?`<div style="margin-top:12px;border:1px solid var(--teal);border-radius:8px;overflow:hidden">
        <div style="background:var(--teal-soft);color:var(--teal-d);font-size:12px;font-weight:600;padding:7px 11px">미리보기 · ${state.ovPreview}</div>
        <div style="padding:12px">${attPreview(state.ovPreview, sel)}</div></div>`:''}
    </div></div>
    <div class="card" style="flex:1;min-width:300px"><div class="pad">
      <div class="seclabel">PI 자동 생성</div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px;margin-bottom:8px"><div><b>${sel.pi.no}</b> · ${sel.pi.inco} · ${sel.pi.cur}</div><div>${sel.matched?'<span class="badge ok">자동 인식 완료</span>':'<span class="badge danger">미매칭 있음</span>'}</div></div>
      <div class="ov" style="border:1px solid var(--border);border-radius:8px;overflow-x:auto"><table>
        <thead><tr><th>코드 (매핑)</th><th>품명</th><th class="num">수량</th><th>색상</th></tr></thead>
        <tbody>${sel.pi.lines.map(l=>`<tr><td style="font-size:11.5px">${l[0]}</td><td>${l[1]}</td><td class="num">${fmt(l[2])}</td><td>${l[3]==='?'?'<span class="badge warn">확인</span>':l[3]}</td></tr>`).join('')}</tbody>
      </table></div>
      <div class="quick" style="margin-top:12px">
        ${sel.matched?'':`<button class="btn" onclick="toast('미매칭 코드 등록 (이후 자동 매칭)')">미매칭 코드 등록</button>`}
        <button class="btn primary" onclick="toast('${sel.pi.no} PI 발행 → 생산출고의뢰서 생성')">PI 발행 · 생산출고의뢰서</button>
      </div>
      <div class="muted" style="font-size:11.5px;margin-top:10px">발주코드↔내부 품명 매핑은 첫 등록만 Price List(신규 고객)에서 수기 입력하고, 이후 PO→PI 단계에서 동일하게 자동 인식됩니다.</div>
    </div></div>
  </div>`;
}

function vOvAgencies(){
  setHead('거래처 관리','해외영업 · '+ovField());
  const f=ovField(), list=ovAgencies.filter(a=>a.field===f);
  const active=ovOrders.filter(o=>o.field===f && o.stage!=='정산');
  const byAgency={}; active.forEach(o=>{(byAgency[o.agency]=byAgency[o.agency]||[]).push(o);});
  const projAgencies=Object.keys(byAgency);
  const unpaid=ovOrders.filter(o=>o.field===f && (!o.dep||!o.bal));
  return `
  ${ovFieldTabs()}
  <div class="pagehead"><div><div class="t">거래처 관리</div><div class="d">${f} · 거래처 정보와 진행 프로젝트, 선금/잔금 현황을 한 화면에서 봅니다.</div></div></div>
  <div class="seclabel">진행 중인 프로젝트 (거래처별)</div>
  <div class="row" style="margin-bottom:22px">${projAgencies.length?projAgencies.map(name=>{const ors=byAgency[name]; const a=ovAgencies.find(x=>x.name===name)||{}; return `
    <div style="flex:1;min-width:240px;border:1.5px solid var(--teal);border-radius:12px;overflow:hidden;box-shadow:var(--shadow)">
      <div style="padding:10px 13px;background:var(--teal);color:#fff;font-weight:700;font-size:13px">${name} <span style="font-weight:400;opacity:.85">· ${a.country||''}</span></div>
      <div style="padding:8px 13px;background:#fff">${ors.map(o=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border)"><div><b style="font-size:12.5px">${o.pi}</b> <span class="muted" style="font-size:11px">ETD ${o.etd}</span><div class="muted" style="font-size:11px">${ovMoney(o.amount,o.cur)}</div></div><span class="badge info">${o.stage}</span></div>`).join('')}</div>
    </div>`;}).join(''):'<div class="muted">진행 중인 프로젝트가 없습니다.</div>'}</div>
  <div class="row">
    <div class="card" style="flex:1.6;min-width:340px"><div class="pad">
      <div class="seclabel">거래처 리스트</div>
      <div class="ov" style="border:1px solid var(--border);border-radius:8px;overflow-x:auto"><table>
        <thead><tr><th>거래처</th><th>국가</th><th>인코텀즈</th><th>결제</th><th>통화</th><th>진행 PI</th></tr></thead>
        <tbody>${list.length?list.map(a=>{const ors=ovOrders.filter(o=>o.agency===a.name); return `<tr class="clickable" onclick="ovStatement('${a.id}')"><td><b>${a.name}</b></td><td>${a.country}</td><td><span class="badge muted">${a.inco}</span></td><td>${a.pay}</td><td>${a.cur}</td><td>${ors.length}건</td></tr>`;}).join(''):'<tr><td colspan="6" class="muted" style="padding:14px;text-align:center">해당 분야 거래처 없음</td></tr>'}</tbody>
      </table></div>
      <div class="muted" style="font-size:12px;margin-top:8px">행을 클릭하면 거래처별 PI 정산(선금/잔금) 현황이 열립니다.</div>
    </div></div>
    <div class="card" style="flex:1;min-width:260px"><div class="pad">
      <div class="seclabel">선금 / 잔금 현황</div>
      <div class="ledger-list">${unpaid.length?unpaid.map(o=>`<div class="li"><span class="dotmark" style="background:var(--${!o.dep?'danger':'warn'})"></span><div class="ti"><div style="font-size:13px;font-weight:600">${o.agency} · ${o.pi}</div><div class="muted" style="font-size:12px">${!o.dep?'선금 미입금':'잔금 미입금'} · ${ovMoney(o.amount,o.cur)}</div></div></div>`).join(''):'<div class="muted" style="font-size:12.5px">미입금 건 없음</div>'}</div>
    </div></div>
  </div>`;
}
function ovStatement(id){
  const a=ovAgencies.find(x=>x.id===id); if(!a) return;
  const ors=ovOrders.filter(o=>o.agency===a.name);
  openModal(`<div class="mh"><b>${a.name} · 정산 현황</b><button class="x" onclick="closeModal()">×</button></div>
    <div class="mb">
      <div class="muted" style="font-size:12.5px;margin-bottom:12px">${a.country} · ${a.inco} · ${a.pay} · ${a.cur}</div>
      <div class="ov" style="border:1px solid var(--border);border-radius:8px;overflow-x:auto"><table>
        <thead><tr><th>PI No.</th><th class="num">금액</th><th>선금 30%</th><th>잔금 70%</th><th>단계</th></tr></thead>
        <tbody>${ors.length?ors.map(o=>`<tr><td><b>${o.pi}</b></td><td class="num">${ovMoney(o.amount,o.cur)}</td><td>${payBadge(o.dep)}</td><td>${payBadge(o.bal)}</td><td class="muted">${o.stage}</td></tr>`).join(''):'<tr><td colspan="5" class="muted" style="padding:12px;text-align:center">진행 PI 없음</td></tr>'}</tbody>
      </table></div>
    </div>
    <div class="mf"><button class="btn" onclick="closeModal()">닫기</button></div>`);
}

function setShipAgency(id){ state.shipAgency=id; render(); }
function vOvShipping(){
  setHead('선적 · 물류','해외영업');
  const aid=state.shipAgency||'o1'; const a=ovAgencies.find(x=>x.id===aid)||ovAgencies[0];
  const routeStages=['공장 출고','수출통관','POL 선적','주(主)운송','POD 양하','수입통관','도착지 인도'];
  const incoResp={'EXW':{upto:0,note:'공장 인도 — 이후 전 과정 매수인 수배'},'FOB':{upto:2,note:'지정 선적항 본선 적재까지 매도인'},'CIF':{upto:4,note:'도착항까지 운임·보험 매도인 부담(위험은 본선 적재 시 이전)'},'DAP':{upto:6,ex:[5],note:'도착지 인도까지 매도인 · 수입통관/관세는 매수인'},'DDP':{upto:6,note:'수입통관·관세까지 전 과정 매도인'}};
  const ir=incoResp[a.inco]||incoResp['FOB'];
  const caseKey=a.fwd.indexOf('고객사')>=0?'fob-customer':(a.fwd.indexOf('항공')>=0?'dap-air':'fob-korea');
  const cases={
    'fob-customer':{label:'FOB · 고객사 포워더 컨택요청', to:'rakesh@surgicals.in', subj:'Cargo Ready Notice',
      body:`Hello,\n\nThe products will be ready on June 18th.\n\n10 pallets\n110*110*195cm  6 pallets\n110*110*215cm  1 pallet\n(외 3 pallets)\nTotal: 4,944.20 kg\n\nPlease contact your forwarder and arrange the vessel.\n\nThank you.\nBL TECH Overseas Sales`},
    'fob-korea':{label:'FOB/EXW · 지정 한국 포워더 스케줄 요청', to:'choi@ocean-fwd.co.kr', subj:'ECD 해상 FCL 스케줄 문의',
      body:`안녕하세요 책임님,\n비엘테크 해외영업팀입니다.\n\nECD 해상 FCL 스케줄 문의드립니다.\n\nEXW / NY PORT\nFCL 20FT x 1\n3,221.30 KG\nCARGO READY : 06/18 (목) — 하루 이틀 조정 가능\n\n가능한 타겟 스케줄 먼저 공유 부탁드립니다.\n감사합니다.`},
    'dap-air':{label:'DAP · 항공 지정 포워더 스케줄+운임', to:'song@air-fwd.co.kr', subj:'항공 DAP 스케줄·운임 문의',
      body:`안녕하세요 부장님,\n비엘테크 해외영업팀입니다.\n\n항공 DAP 스케줄 및 운임 문의드립니다 (주말 도착 제외).\n\n1 pallet / 110*110*159cm / 471.04 kg\n출고 가능일 : 04/13 (월)\n\n[고객사 주소]\nYOVANN'S CO. 19 RUE VERTE 76000 ROUEN - FRANCE\n\n스케줄과 운임 함께 회신 부탁드립니다.\n감사합니다.`},
  };
  const cur=cases[caseKey];
  return `
  <div class="pagehead"><div><div class="t">선적 · 물류</div><div class="d">거래처를 선택하면 인코텀즈와 포워더 운영 방식, 우리가 책임지는 구간이 바로 표시됩니다.</div></div></div>
  <div class="card" style="margin-bottom:16px"><div class="pad">
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px">
      <span class="muted" style="font-size:12px">거래처</span>
      <select class="search" style="width:auto" onchange="setShipAgency(this.value)">${ovAgencies.map(x=>`<option value="${x.id}" ${x.id===aid?'selected':''}>${x.name} · ${x.country}</option>`).join('')}</select>
      <span class="badge teal">인코텀즈 ${a.inco}</span><span class="badge muted">결제 ${a.pay}</span><span class="badge muted">${a.cur}</span>
    </div>
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:12.5px;font-weight:700;margin-bottom:3px">인코텀즈 ${a.inco} — 우리(매도인) 책임 구간</div>
      <div class="muted" style="font-size:12px;margin-bottom:12px">${ir.note} · 포워더 운영: ${a.fwd}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        ${routeStages.map((s,i)=>{const own=i<=ir.upto && !((ir.ex||[]).includes(i)); return `<div style="padding:9px 9px;border-radius:7px;font-size:11.5px;font-weight:600;${own?'background:var(--teal);color:#fff':'background:#fff;color:var(--ink-3);border:1px solid var(--border)'}">${s}</div>${i<routeStages.length-1?'<span style="color:var(--ink-3)">›</span>':''}`;}).join('')}
      </div>
      <div style="display:flex;gap:16px;margin-top:11px;font-size:11.5px"><span><span style="display:inline-block;width:11px;height:11px;background:var(--teal);border-radius:3px;vertical-align:middle"></span> 매도인(우리) 책임</span><span><span style="display:inline-block;width:11px;height:11px;background:#fff;border:1px solid var(--border);border-radius:3px;vertical-align:middle"></span> 매수인 책임</span></div>
    </div>
    <div class="quick" style="margin-top:14px">
      <button class="btn primary" onclick="toast('Packing List 생성 (PI 데이터 자동 반영)')">PL 생성</button>
      <button class="btn" onclick="toast('C/O(원산지증명) 발급 요청 — 상공회의소')">C/O 요청</button>
    </div>
  </div></div>
  <div class="seclabel">포워더 요청 (서브) · ${cur.label}</div>
  <div class="card"><div class="pad">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">
      <div style="flex:1;min-width:160px"><label class="muted" style="font-size:12px">받는 사람</label><input class="search" id="shipTo" value="${cur.to}" style="width:100%;margin-top:4px"></div>
      <div style="flex:2;min-width:220px"><label class="muted" style="font-size:12px">제목</label><input class="search" id="shipSubj" value="${cur.subj}" style="width:100%;margin-top:4px"></div>
    </div>
    <textarea id="shipBody" style="width:100%;min-height:230px;font-family:inherit;font-size:12.5px;line-height:1.6;border:1px solid var(--border-2);border-radius:8px;padding:12px;resize:vertical;box-sizing:border-box">${cur.body}</textarea>
    <div class="quick" style="margin-top:12px"><button class="btn" onclick="toast('PI · Packing List 자동 첨부 (프로토타입)')">서류 첨부</button><button class="btn primary" onclick="ovSend('shipTo','포워더 메일')">Outlook으로 발송</button></div>
  </div></div>`;
}

function vOvDocs(){
  setHead('수출서류','해외영업');
  const gen=['PI (Proforma Invoice)','CI (Commercial Invoice)','Packing List','C/O (원산지증명)'];
  const up=['B/L (선하증권)','수출신고필증','보험증권','CFS (자유판매증명)'];
  return `
  <div class="pagehead"><div><div class="t">수출서류</div><div class="d">PI·CI·Packing List·C/O는 포털에서 생성하고, B/L·수출신고필증·보험증권·CFS는 업로드 보관합니다.</div></div></div>
  <div class="row">
    <div class="card" style="flex:1;min-width:300px"><div class="pad">
      <div class="seclabel">포털 생성 서류</div>
      ${gen.map(g=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600">${g}</div><button class="btn sm primary" onclick="toast('${g} 생성 (PI 데이터 자동 반영)')">생성</button></div>`).join('')}
      <div class="muted" style="font-size:12px;margin-top:10px">PI 항목(HS코드·인코텀즈·통화·은행정보·서명)이 각 서류에 자동 반영됩니다.</div>
    </div></div>
    <div class="card" style="flex:1;min-width:300px"><div class="pad">
      <div class="seclabel">업로드 보관 (외부 발행)</div>
      ${up.map(u=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600">${u}</div><label class="btn sm" style="cursor:pointer"><input type="file" accept=".pdf,.xls,.xlsx,image/*" style="display:none" onchange="poUpload(this)">업로드</label></div>`).join('')}
      <div id="poFiles" style="margin-top:10px"></div>
      <div class="muted" style="font-size:12px;margin-top:10px">포워더·관세사 등 외부 발행 서류는 PDF·엑셀·사진으로 업로드해 PI별로 보관합니다.</div>
    </div></div>
  </div>`;
}

/* 이 포털의 화면을 라우터에 등록 */
Object.assign(VIEWS,{ 'ov-dash':vOvDash,'ov-pricelist':vOvPricelist,'ov-orders':vOvOrders,'ov-agencies':vOvAgencies,'ov-shipping':vOvShipping,'ov-docs':vOvDocs });
