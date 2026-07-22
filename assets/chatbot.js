/* =============================================================
   사내 규정 챗봇 — 화면 오른쪽 아래 떠 있는 위젯
   -------------------------------------------------------------
   ★ 이 파일에는 API 키가 없습니다. 있어서도 안 됩니다.
     서버(/api/chat)가 .env 에서 키를 읽어 OpenAI 를 호출합니다.
     Firebase 전환 시 아래 ENDPOINT 만 Cloud Function URL 로 바꾸면 됩니다.

   ★ 위젯은 #content 바깥(body)에 붙습니다.
     app.js 의 render() 가 #content 를 통째로 갈아끼우기 때문에,
     안에 두면 메뉴를 옮길 때마다 대화가 날아갑니다.
     그래서 renderBot() 으로 위젯만 따로 그립니다.

   첨부: 이미지(PNG·JPG·WEBP·GIF) + PDF — 영수증·거래명세서·사업자등록증 판독용.
     파일 선택 / 붙여넣기(Ctrl+V) / 드래그&드롭 지원.
   ============================================================= */
const CHAT_ENDPOINT = '/api/chat';

const BOT_MAX_FILES = 5;
const BOT_MAX_BYTES = 10 * 1024 * 1024;                                   // 파일당 10MB
const BOT_OK_MIME = ['image/png','image/jpeg','image/webp','image/gif','application/pdf'];

// 대화·첨부는 UI 임시상태 (새로고침 시 초기화, Firestore 대상 아님)
state.bot = { open:false, msgs:[], files:[], draft:'', busy:false, error:null, unread:false,
  auth:{ mode:'loading', user:null, err:null } };   // mode: loading | none(로컬) | required(배포)

/* ---------- Firebase 로그인 ----------
   배포본(Firebase Hosting)에서는 /__/firebase/init.json 이 설정을 자동 제공합니다.
   → 그 값이 있으면 "로그인 필수" 모드로 동작하고, ID 토큰을 서버에 보냅니다.
   로컬(localhost)에는 그 경로가 없으므로 로그인 없이 그대로 씁니다.
   ※ 여기 나오는 apiKey 는 비밀이 아닙니다(공개용). 실제 보호는 함수의 토큰 검증 + 허용명단입니다. */
let botAuth = null;
(async function initAuth(){
  try{
    const r = await fetch('/__/firebase/init.json');
    if(!r.ok) throw new Error('no config');
    const cfg = await r.json();
    const [{ initializeApp }, authMod] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js'),
    ]);
    const app = initializeApp(cfg);
    botAuth = { ...authMod, auth: authMod.getAuth(app) };
    window.__fbApp = app;              // 규정 관리 화면(rules-admin.js)이 같은 앱·로그인을 재사용
    state.bot.auth.mode = 'required';
    botAuth.onAuthStateChanged(botAuth.auth, u=>{
      state.bot.auth.user = u ? { email:u.email, name:u.displayName, photo:u.photoURL } : null;
      renderBot();
    });
  }catch{
    state.bot.auth.mode = 'none';        // 로컬 개발 — 로그인 없이 사용
  }
  renderBot();
})();

async function botLogin(){
  if(!botAuth) return;
  state.bot.auth.err=null; renderBot();
  try{
    const p = new botAuth.GoogleAuthProvider();
    p.setCustomParameters({ prompt:'select_account' });
    await botAuth.signInWithPopup(botAuth.auth, p);
  }catch(e){
    if(e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request')
      state.bot.auth.err = '로그인에 실패했습니다: ' + (e?.code || e?.message || '');
    renderBot();
  }
}
async function botLogout(){
  if(!botAuth) return;
  await botAuth.signOut(botAuth.auth);
  state.bot.msgs=[]; state.bot.files=[]; renderBot();
}
async function botIdToken(){
  if(!botAuth || !botAuth.auth.currentUser) return null;
  return await botAuth.auth.currentUser.getIdToken();
}

const BOT_SAMPLES = ['연차 며칠?', '재택근무 조건', '출장 일비'];

/* ---------- 열기/닫기 ---------- */
function botToggle(){
  state.bot.open = !state.bot.open;
  if(state.bot.open) state.bot.unread = false;
  renderBot();
  if(state.bot.open){ const i=document.getElementById('botInput'); if(i) i.focus(); }
}
function botReset(){ state.bot.msgs=[]; state.bot.files=[]; state.bot.error=null; renderBot(); }
function botFmtSize(b){ return b>=1024*1024 ? (b/1024/1024).toFixed(1)+'MB' : Math.max(1,Math.round(b/1024))+'KB'; }
function botIsImg(m){ return String(m).startsWith('image/'); }
function botDraft(el){ state.bot.draft = el.value; }   // 재렌더 시 입력 내용 보존

/* ---------- 첨부 ---------- */
function botAddFiles(fileList){
  const files=[...fileList];
  if(!files.length) return;
  if(state.bot.files.length + files.length > BOT_MAX_FILES){
    state.bot.error=`첨부는 한 번에 ${BOT_MAX_FILES}개까지 가능합니다.`; renderBot(); return;
  }
  let pending=files.length;
  const done=()=>{ if(--pending===0) renderBot(); };
  files.forEach(f=>{
    if(!BOT_OK_MIME.includes(f.type)){ state.bot.error=`지원하지 않는 형식입니다: ${f.name} (이미지 또는 PDF만 가능)`; return done(); }
    if(f.size > BOT_MAX_BYTES){ state.bot.error=`파일이 너무 큽니다: ${f.name} (최대 10MB)`; return done(); }
    const fr=new FileReader();
    fr.onload=()=>{ state.bot.files.push({ name:f.name, mime:f.type, size:f.size, dataUrl:fr.result }); done(); };
    fr.onerror=()=>{ state.bot.error=`파일을 읽지 못했습니다: ${f.name}`; done(); };
    fr.readAsDataURL(f);
  });
}
function botPick(input){ botAddFiles(input.files); input.value=''; }
function botDropFile(i){ state.bot.files.splice(i,1); renderBot(); }
function botPaste(e){ const f=[...(e.clipboardData?.files||[])]; if(f.length){ e.preventDefault(); botAddFiles(f); } }
function botDrag(e,on){ e.preventDefault(); e.stopPropagation();
  const z=document.getElementById('botDrop'); if(z) z.style.opacity = on?'1':'0'; }
function botDrop(e){ e.preventDefault(); e.stopPropagation();
  const z=document.getElementById('botDrop'); if(z) z.style.opacity='0';
  if(e.dataTransfer?.files?.length) botAddFiles(e.dataTransfer.files); }

/* ---------- 전송 ---------- */
function botAsk(q){
  const el=document.getElementById('botInput');
  const text=(q!=null?q:(el?el.value:state.bot.draft)||'').trim();
  const files=state.bot.files.slice();
  if((!text && !files.length) || state.bot.busy) return;

  state.bot.msgs.push({ role:'user', content:text || '첨부한 문서를 판독해 주세요.', files });
  state.bot.files=[]; state.bot.draft=''; state.bot.busy=true; state.bot.error=null;
  renderBot();

  botIdToken().then(token=>fetch(CHAT_ENDPOINT,{
    method:'POST',
    headers: token ? {'Content-Type':'application/json','Authorization':'Bearer '+token}
                   : {'Content-Type':'application/json'},
    body:JSON.stringify({ messages: state.bot.msgs })
  }))
  .then(async r=>{ const d=await r.json().catch(()=>({}));
    if(r.status===404 || r.status===501){
      // Hosting 만 배포된 상태 — 챗봇 백엔드(Cloud Functions)가 아직 없음
      throw new Error('챗봇 서버가 아직 배포되지 않았습니다. 현재는 화면만 배포된 상태이고, 챗봇은 로컬(localhost:8000)에서 동작합니다.');
    }
    if(!r.ok) throw new Error(d.message || ('서버 오류 ('+r.status+')')); return d; })
  .then(d=>{ state.bot.msgs.push({role:'assistant', content:d.reply}); if(!state.bot.open) state.bot.unread=true; })
  .catch(e=>{ state.bot.error = e.message || '요청에 실패했습니다.'; })
  .finally(()=>{ state.bot.busy=false; renderBot();
    const b=document.getElementById('botLog'); if(b) b.scrollTop=b.scrollHeight;
    const i=document.getElementById('botInput'); if(i) i.focus(); });
}
function botKey(e){ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); botAsk(); } }

/* ---------- 조각 ---------- */
function botAttachChip(f, i){
  const rm = i==null ? '' : `<button class="botchip-x" onclick="botDropFile(${i})" title="빼기">×</button>`;
  if(botIsImg(f.mime))
    return `<div class="botchip"><img src="${f.dataUrl}" alt="${escapeHtml(f.name)}">${rm}</div>`;
  return `<div class="botchip botchip-doc">
    <svg width="13" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
    <span class="nm">${escapeHtml(f.name)}</span><span class="sz">${botFmtSize(f.size)}</span>${rm}</div>`;
}

function botPanelHTML(){
  const b=state.bot;
  // 배포본(required)에서 로그인 안 했으면 로그인 화면. 로컬(none)은 그대로 사용.
  const needLogin = b.auth.mode==='required' && !b.auth.user;
  const bubbles = b.msgs.map(m=>{
    const mine = m.role==='user';
    const atts = (m.files&&m.files.length)
      ? `<div class="botatt">${m.files.map(f=>botAttachChip(f,null)).join('')}</div>` : '';
    return `<div class="botrow ${mine?'me':''}"><div class="botbub ${mine?'me':''}">${atts}${escapeHtml(m.content)}</div></div>`;
  }).join('');

  const empty = `<div class="botempty">
      사내 규정을 묻거나<br><b>영수증 · 거래명세서</b>를 올려보세요
      <div class="botsamples">${BOT_SAMPLES.map(s=>`<button class="btn sm" onclick="botAsk('${s.replace(/'/g,"\\'")}')">${s}</button>`).join('')}</div>
    </div>`;

  return `
  <div class="botpanel" ondragover="botDrag(event,true)" ondragleave="botDrag(event,false)" ondrop="botDrop(event)">
    <div id="botDrop" class="botdrop">여기에 놓으면 첨부됩니다</div>

    <div class="bothead">
      <svg width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <b>사내 규정 챗봇</b>
      <div style="flex:1"></div>
      ${b.auth.user?`<button class="botico" onclick="botLogout()" title="${escapeHtml(b.auth.user.email)} · 로그아웃"><svg width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg></button>`:''}
      ${b.msgs.length?`<button class="botico" onclick="botReset()" title="대화 지우기"><svg width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>`:''}
      <button class="botico" onclick="botToggle()" title="닫기"><svg width="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>

    ${needLogin ? `
    <div class="botbody" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px">
      <svg width="38" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" stroke-width="1.6"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      <div style="font-size:13px;line-height:1.8;color:var(--ink-2)">
        <b style="color:var(--ink)">회사 계정으로 로그인하세요</b><br>
        <span style="font-size:12px">허용된 직원만 사용할 수 있습니다</span>
      </div>
      <button class="btn primary" onclick="botLogin()">Google 계정으로 로그인</button>
      ${b.auth.err?`<div class="boterr" style="margin-top:4px">⚠️ ${escapeHtml(b.auth.err)}</div>`:''}
    </div>` : `
    <div id="botLog" class="botbody">
      ${b.msgs.length?bubbles:empty}
      ${b.busy?`<div class="botrow"><div class="botbub muted">${b.msgs.some(m=>m.files&&m.files.length)?'문서 판독 중…':'답변 작성 중…'}</div></div>`:''}
      ${b.error?`<div class="boterr">⚠️ ${escapeHtml(b.error)}</div>`:''}
    </div>

    ${b.files.length?`<div class="botatt pad">${b.files.map((f,i)=>botAttachChip(f,i)).join('')}</div>`:''}

    <div class="botfoot">
      <label class="botico file" title="이미지 · PDF 첨부">
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" multiple hidden onchange="botPick(this)">
        <svg width="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.4 11.05 12.25 20.2a5.5 5.5 0 0 1-7.78-7.78l9.2-9.2a3.67 3.67 0 1 1 5.18 5.18l-9.2 9.2a1.83 1.83 0 1 1-2.6-2.6l8.5-8.48"/></svg>
      </label>
      <input id="botInput" placeholder="무엇이든 물어보세요" value="${escapeHtml(b.draft)}"
             oninput="botDraft(this)" onkeydown="botKey(event)" onpaste="botPaste(event)" ${b.busy?'disabled':''}>
      <button class="botsend" onclick="botAsk()" ${b.busy?'disabled':''} title="보내기">
        <svg width="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>
      </button>
    </div>`}
  </div>`;
}

function botFabHTML(){
  return `<button class="botfab" onclick="botToggle()" title="사내 규정 챗봇">
    <svg width="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    ${state.bot.unread?'<span class="botdot"></span>':''}
  </button>`;
}

/* ---------- 위젯만 다시 그리기 (본문 render() 와 독립) ---------- */
function renderBot(){
  const root=document.getElementById('botWidget'); if(!root) return;
  const wasFocused = document.activeElement && document.activeElement.id==='botInput';
  root.innerHTML = state.bot.open ? botPanelHTML() : botFabHTML();
  const log=document.getElementById('botLog'); if(log) log.scrollTop=log.scrollHeight;
  if(wasFocused){ const i=document.getElementById('botInput'); if(i){ i.focus(); i.setSelectionRange(i.value.length,i.value.length); } }
}

/* 마운트 — body 에 붙여서 화면 전환에도 살아남게 */
(function mountBot(){
  const d=document.createElement('div');
  d.id='botWidget';
  document.body.appendChild(d);
  renderBot();
})();
