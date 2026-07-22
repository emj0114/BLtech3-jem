/* =============================================================
   사내 규정 관리 — 챗봇이 답변 근거로 쓰는 문서를 여기서 고칩니다.
   -------------------------------------------------------------
   저장하면 Firestore(settings/regulations)에 들어가고,
   챗봇 함수가 요청마다 그걸 읽으므로 재배포 없이 즉시 반영됩니다.

   ★ 실제 권한 차단은 firestore.rules 가 합니다(관리자 이메일만 쓰기 가능).
     이 화면의 메뉴 숨김은 편의일 뿐입니다.
   ============================================================= */
const RULES_DOC = 'settings/regulations';

state.rules = { loading:false, loaded:false, text:'', orig:'', meta:null, msg:null, err:null, history:[], showHistory:false };

let _fs = null;   // firestore 모듈 캐시
async function rulesFs(){
  if(_fs) return _fs;
  if(!window.__fbApp) throw new Error('로그인이 준비되지 않았습니다. 잠시 후 다시 시도하세요.');
  const m = await import('https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js');
  _fs = { ...m, db: m.getFirestore(window.__fbApp) };
  return _fs;
}
function rulesUser(){ return (state.bot && state.bot.auth && state.bot.auth.user) || null; }

/* ---------- 불러오기 ---------- */
async function rulesLoad(force){
  if(state.rules.loading) return;
  if(state.rules.loaded && !force) return;
  state.rules.loading = true; state.rules.err = null; render();
  try{
    const f = await rulesFs();
    const snap = await f.getDoc(f.doc(f.db, 'settings', 'regulations'));
    if(snap.exists()){
      const d = snap.data();
      state.rules.text = d.content || '';
      state.rules.meta = { by:d.updatedBy || '—', at:d.updatedAt ? d.updatedAt.toDate().toLocaleString('ko-KR') : '—' };
    }else{
      state.rules.text = '';
      state.rules.meta = null;
    }
    state.rules.orig = state.rules.text;
    state.rules.loaded = true;
  }catch(e){
    state.rules.err = rulesErrMsg(e);
  }
  state.rules.loading = false; render();
}

function rulesErrMsg(e){
  const c = e && e.code || '';
  if(/permission-denied/.test(c)) return '권한이 없습니다. 관리자 계정으로 로그인했는지 확인하세요.';
  if(/unauthenticated/.test(c))   return '로그인이 필요합니다.';
  return (e && e.message) || '알 수 없는 오류';
}

/* ---------- 저장 ---------- */
async function rulesSave(){
  const u = rulesUser();
  if(!u){ state.rules.err='로그인이 필요합니다.'; render(); return; }
  const el = document.getElementById('rulesText');
  const text = el ? el.value : state.rules.text;
  if(!text.trim()){ state.rules.err='내용이 비어 있습니다. 규정을 입력하세요.'; render(); return; }

  state.rules.loading = true; state.rules.err=null; state.rules.msg=null; render();
  try{
    const f = await rulesFs();
    // 본문 저장
    await f.setDoc(f.doc(f.db,'settings','regulations'), {
      content: text, updatedBy: u.email, updatedAt: f.serverTimestamp(),
    });
    // 이력 남기기 (누가 언제 몇 자로 바꿨는지)
    await f.addDoc(f.collection(f.db,'regulationsHistory'), {
      content: text, updatedBy: u.email, updatedAt: f.serverTimestamp(), size: text.length,
    });
    state.rules.text = text; state.rules.orig = text;
    state.rules.meta = { by:u.email, at:new Date().toLocaleString('ko-KR') };
    state.rules.msg = '저장했습니다. 챗봇에 바로 반영됩니다.';
    state.rules.history = [];            // 이력 목록은 다시 불러오게
    toast('사내 규정을 저장했습니다 — 챗봇에 즉시 반영');
  }catch(e){
    state.rules.err = rulesErrMsg(e);
  }
  state.rules.loading = false; render();
}

/* ---------- 파일에서 불러오기 ---------- */
function rulesPick(input){
  const f = input.files && input.files[0]; if(!f) return;
  const okText = /\.(md|txt|csv)$/i.test(f.name);
  const okXls  = /\.(xlsx|xls)$/i.test(f.name);
  if(!okText && !okXls){
    state.rules.err = '지원 형식: .md · .txt · .csv · .xlsx (워드/PDF는 텍스트로 복사해 붙여넣어 주세요)';
    input.value=''; render(); return;
  }
  if(f.size > 2*1024*1024){ state.rules.err='파일이 너무 큽니다(최대 2MB).'; input.value=''; render(); return; }

  const reader = new FileReader();
  reader.onload = e => {
    try{
      let text;
      if(okXls){
        if(typeof XLSX==='undefined') throw new Error('엑셀 파서를 불러오지 못했습니다.');
        const wb = XLSX.read(new Uint8Array(e.target.result), {type:'array'});
        // 시트를 사람이 읽는 문단으로 변환 (질문/답변·항목 형태 모두 무난하게)
        text = wb.SheetNames.map(sn=>{
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], {header:1, defval:''});
          const body = rows.filter(r=>r.some(c=>String(c).trim()))
                           .map(r=>r.map(c=>String(c).trim()).filter(Boolean).join(' · ')).join('\n');
          return `## ${sn}\n${body}`;
        }).join('\n\n');
      }else{
        text = e.target.result;
      }
      const ta = document.getElementById('rulesText');
      if(ta) ta.value = text;
      state.rules.text = text;
      state.rules.msg = `‘${f.name}’ 내용을 불러왔습니다. 확인 후 [저장]을 눌러야 반영됩니다.`;
      state.rules.err = null;
    }catch(err){
      state.rules.err = '파일을 읽지 못했습니다: ' + (err.message||err);
    }
    render();
  };
  reader.onerror = ()=>{ state.rules.err='파일을 읽지 못했습니다.'; render(); };
  if(okXls) reader.readAsArrayBuffer(f); else reader.readAsText(f, 'utf-8');
  input.value='';
}

/* ---------- 이력 ---------- */
async function rulesHistory(){
  state.rules.showHistory = !state.rules.showHistory;
  if(!state.rules.showHistory || state.rules.history.length){ render(); return; }
  state.rules.loading=true; render();
  try{
    const f = await rulesFs();
    const q = f.query(f.collection(f.db,'regulationsHistory'), f.orderBy('updatedAt','desc'), f.limit(20));
    const snap = await f.getDocs(q);
    state.rules.history = snap.docs.map(d=>{ const x=d.data(); return {
      by:x.updatedBy||'—', at:x.updatedAt?x.updatedAt.toDate().toLocaleString('ko-KR'):'—',
      size:x.size||0, content:x.content||'' }; });
  }catch(e){ state.rules.err = rulesErrMsg(e); }
  state.rules.loading=false; render();
}
function rulesRestore(i){
  const h = state.rules.history[i]; if(!h) return;
  const ta=document.getElementById('rulesText'); if(ta) ta.value=h.content;
  state.rules.text=h.content;
  state.rules.msg=`${h.at} 버전을 편집칸에 불러왔습니다. [저장]을 눌러야 실제로 되돌아갑니다.`;
  render();
}
function rulesReset(){
  const ta=document.getElementById('rulesText'); if(ta) ta.value=state.rules.orig;
  state.rules.text=state.rules.orig; state.rules.msg=null; state.rules.err=null; render();
}
function rulesTrack(el){ state.rules.text=el.value; const n=document.getElementById('rulesCount'); if(n) n.textContent=el.value.length.toLocaleString()+'자'; }

/* ---------- 화면 ---------- */
function vRulesAdmin(){
  setHead('사내 규정 관리','공통 · 챗봇');
  const r=state.rules, u=rulesUser();

  // 로컬 개발 환경에는 Firebase 설정이 없어 저장소에 접근할 수 없습니다
  if(state.bot.auth.mode==='none'){
    return `<div class="pagehead"><div><div class="t">사내 규정 관리</div><div class="d">챗봇이 근거로 쓰는 사내 규정을 여기서 수정합니다.</div></div></div>
    <div class="card" style="max-width:620px"><div class="pad" style="padding:26px 20px">
      <div style="font-weight:700;margin-bottom:8px">배포된 주소에서 사용하세요</div>
      <div class="muted" style="font-size:13px;line-height:1.8">
        이 화면은 로그인과 Firestore 저장소가 필요해서 <b>배포본에서만</b> 동작합니다.<br>
        지금은 로컬 개발 서버(localhost)라 규정을 불러올 수 없어요.<br><br>
        👉 <b>https://bltech-jem-practice.web.app</b> 에서 관리자 계정으로 로그인 후 이용하세요.<br>
        (로컬 챗봇은 <code>data/regulations.md</code> 파일을 그대로 씁니다)
      </div>
    </div></div>`;
  }
  if(state.bot.auth.mode==='required' && !u){
    return `<div class="pagehead"><div><div class="t">사내 규정 관리</div><div class="d">챗봇이 근거로 쓰는 사내 규정을 여기서 수정합니다.</div></div></div>
    <div class="card" style="max-width:560px"><div class="pad" style="text-align:center;padding:34px 18px">
      <div style="font-size:32px;margin-bottom:10px">🔒</div>
      <div style="font-weight:700;margin-bottom:6px">로그인이 필요합니다</div>
      <div class="muted" style="font-size:13px;line-height:1.7;margin-bottom:14px">관리자 계정으로 로그인해야 규정을 볼 수 있습니다.</div>
      <button class="btn primary" onclick="botLogin()">Google 계정으로 로그인</button>
    </div></div>`;
  }
  if(!r.loaded && !r.loading && !r.err) setTimeout(()=>rulesLoad(),0);

  const dirty = r.text !== r.orig;
  return `
  <div class="pagehead"><div><div class="t">사내 규정 관리</div><div class="d">챗봇이 답변 근거로 쓰는 문서입니다. 저장하면 <b>재배포 없이 즉시</b> 반영됩니다.</div></div>
    <div class="quick">
      <button class="btn" onclick="rulesHistory()">${r.showHistory?'이력 닫기':'수정 이력'}</button>
      <button class="btn" onclick="rulesLoad(true)" ${r.loading?'disabled':''}>다시 불러오기</button>
    </div></div>

  ${r.err?`<div style="background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;border-radius:9px;padding:11px 14px;font-size:13px;margin-bottom:14px">⚠️ ${escapeHtml(r.err)}</div>`:''}
  ${r.msg?`<div style="background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46;border-radius:9px;padding:11px 14px;font-size:13px;margin-bottom:14px">${escapeHtml(r.msg)}</div>`:''}

  ${r.showHistory?`
  <div class="card" style="margin-bottom:14px"><div class="pad">
    <div class="seclabel">수정 이력 (최근 20건)</div>
    ${r.history.length? r.history.map((h,i)=>`
      <div class="check-row"><div style="flex:1;min-width:0">
        <b style="font-size:13px">${escapeHtml(h.at)}</b>
        <div class="muted" style="font-size:12px">${escapeHtml(h.by)} · ${h.size.toLocaleString()}자</div>
      </div><button class="btn sm" onclick="rulesRestore(${i})">이 버전 불러오기</button></div>`).join('')
      : `<div class="muted" style="font-size:13px;padding:6px 0">${r.loading?'불러오는 중…':'아직 이력이 없습니다.'}</div>`}
  </div></div>`:''}

  <div class="card"><div class="pad">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
      <div style="flex:1;min-width:180px">
        <div class="seclabel" style="margin:0">규정 본문</div>
        <div class="muted" style="font-size:12px;margin-top:3px">
          ${r.meta?`마지막 수정 : <b style="color:var(--ink)">${escapeHtml(r.meta.at)}</b> · ${escapeHtml(r.meta.by)}`
                  :'<span style="color:var(--warn)">아직 저장된 규정이 없습니다 — 저장 전까지는 기본 샘플이 사용됩니다.</span>'}
        </div>
      </div>
      <label class="btn" style="cursor:pointer">
        <input type="file" accept=".md,.txt,.csv,.xlsx,.xls" hidden onchange="rulesPick(this)">파일에서 불러오기
      </label>
    </div>

    <textarea id="rulesText" oninput="rulesTrack(this)" spellcheck="false"
      placeholder="사내 규정을 붙여넣거나 입력하세요.&#10;&#10;예)&#10;## 2. 연차휴가&#10;2.1 1년간 80% 이상 출근한 직원에게 15일의 유급 연차휴가를 부여한다."
      style="width:100%;min-height:420px;resize:vertical;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;line-height:1.75;
             border:1px solid var(--border-2);border-radius:9px;padding:13px 14px;color:var(--ink);background:var(--surface)"
      ${r.loading?'disabled':''}>${escapeHtml(r.text)}</textarea>

    <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:11px">
      <span class="muted" style="font-size:12px"><span id="rulesCount">${r.text.length.toLocaleString()}자</span>${dirty?' · <b style="color:var(--warn)">저장 안 된 변경사항</b>':''}</span>
      <div style="flex:1"></div>
      ${dirty?`<button class="btn" onclick="rulesReset()">되돌리기</button>`:''}
      <button class="btn primary" onclick="rulesSave()" ${r.loading||!dirty?'disabled':''}>${r.loading?'저장 중…':'저장'}</button>
    </div>
  </div></div>

  <div class="muted" style="font-size:11.5px;margin-top:11px;line-height:1.8;max-width:820px">
    · 저장 즉시 챗봇이 새 규정으로 답합니다. <b>배포나 재시작이 필요 없습니다.</b><br>
    · 워드·PDF는 파일 업로드가 안 됩니다 — 내용을 복사해 위 칸에 붙여넣어 주세요. (.md · .txt · .csv · .xlsx 는 불러오기 가능)<br>
    · 규정에 없는 내용을 챗봇이 지어내지 않도록 되어 있으니, <b>빠진 항목은 그냥 "확인되지 않습니다"라고 답합니다.</b><br>
    · 수정할 때마다 이력이 남습니다(누가·언제·몇 자). 이력에서 이전 버전을 불러와 되돌릴 수 있습니다.
  </div>`;
}

VIEWS['rules-admin'] = vRulesAdmin;
