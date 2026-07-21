/* =============================================================
   BL TECH 영업 포털 — 로컬 개발 서버 (의존성 0개, Node 18+)
   -------------------------------------------------------------
   역할 2가지
     1) 정적 파일 서빙 (index.html · overseas.html · assets/*)
     2) POST /api/chat  — 사내 규정 챗봇 프록시

   ★ API 키는 이 서버(=서버 사이드)에서만 읽습니다.
     브라우저로는 절대 내려가지 않습니다.

   Firebase 전환 시: 이 파일의 handleChat() 로직을 Cloud Function 으로 옮기고
     readEnv().OPENAI_API_KEY  →  Secret Manager 에서 읽기
     로만 바꾸면 됩니다. 프론트(assets/chatbot.js)는 수정 불필요.
   ============================================================= */
const http = require('node:http');
const fs   = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;

/* ---------- .env 파서 (dotenv 없이) ---------- */
function readEnv(){
  const out = {};
  try{
    const raw = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    for(const line of raw.split(/\r?\n/)){
      const s = line.trim();
      if(!s || s.startsWith('#')) continue;
      const i = s.indexOf('=');
      if(i < 0) continue;
      out[s.slice(0, i).trim()] = s.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  }catch{ /* .env 없으면 process.env 로 폴백 */ }
  return { ...process.env, ...out };
}

/* 키가 실제로 설정됐는지 (자리표시자면 미설정 취급) */
function keyReady(k){ return !!k && k.startsWith('sk-') && !k.includes('여기에'); }

/* ---------- 사내 규정 로드 ---------- */
function loadRegulations(){
  try{ return fs.readFileSync(path.join(ROOT, 'data', 'regulations.md'), 'utf8'); }
  catch{ return ''; }
}

/* ---------- 챗봇 ---------- */
const SYSTEM_PROMPT = `당신은 비엘테크(주)의 사내 업무 도우미입니다. 두 가지 일을 합니다.

[1] 사내 규정 질문 답변
- 아래 <사내규정> 안의 내용만 근거로 답하세요.
- 규정에 없는 내용은 지어내지 말고 "사내 규정 문서에서 확인되지 않습니다. 경영지원팀에 문의해 주세요."라고 답하세요.
- 답변 끝에 근거가 된 항목 번호를 "근거: ..." 형식으로 붙이세요.

[2] 첨부 문서(영수증·거래명세서·사업자등록증 등) 판독
- 첨부된 이미지/PDF에서 읽은 항목을 정리해 주세요.
  영수증: 상호 · 날짜 · 품목 · 공급가액 · 부가세 · 합계
  거래명세서: 거래처 · 일자 · 품목/수량/단가 · 공급가액 · 합계
  사업자등록증: 상호 · 등록번호 · 대표자 · 주소 · 업태/종목
- 흐릿하거나 잘려서 확실하지 않은 값은 추측하지 말고 "판독 불가"로 표시하세요.
- 금액은 원본 표기 그대로 쓰고, 합계가 맞지 않으면 그 사실을 알려주세요.
- 규정과 관련되면(예: 출장비 한도 초과 여부) 규정 근거와 함께 알려주세요.

공통: 한국어로 간결하게. 급여·징계 등 민감 사안은 반드시 담당 부서 확인을 함께 안내하세요.`;

/* 첨부 제한 — 과금·남용 방지 */
const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;      // 파일당 10MB
const OK_IMAGE = ['image/png','image/jpeg','image/webp','image/gif'];
const OK_DOC   = ['application/pdf'];

/* 프론트에서 온 메시지({content, files[]})를 OpenAI content part 로 변환 */
function toContent(m){
  const files = Array.isArray(m.files) ? m.files : [];
  if(!files.length) return m.content;
  const parts = [{ type:'text', text: m.content || '첨부한 문서를 판독해 주세요.' }];
  for(const f of files){
    const url = String(f.dataUrl || '');
    if(OK_IMAGE.includes(f.mime))      parts.push({ type:'image_url', image_url:{ url } });
    else if(OK_DOC.includes(f.mime))   parts.push({ type:'file', file:{ filename: f.name || 'document.pdf', file_data: url } });
  }
  return parts;
}

/* 첨부 검증 — 통과 못하면 사유 문자열 반환 */
function validateFiles(msgs){
  for(const m of msgs){
    const files = Array.isArray(m.files) ? m.files : [];
    if(files.length > MAX_FILES) return `첨부는 한 번에 ${MAX_FILES}개까지 가능합니다.`;
    for(const f of files){
      if(!OK_IMAGE.includes(f.mime) && !OK_DOC.includes(f.mime))
        return `지원하지 않는 형식입니다: ${f.mime || '알 수 없음'} (이미지 PNG·JPG·WEBP·GIF 또는 PDF만 가능)`;
      const url = String(f.dataUrl || '');
      if(!url.startsWith('data:')) return '첨부 파일 형식이 올바르지 않습니다.';
      // base64 길이 → 실제 바이트 근사
      const b64 = url.slice(url.indexOf(',') + 1);
      if(b64.length * 0.75 > MAX_FILE_BYTES) return `파일이 너무 큽니다: ${f.name || ''} (최대 10MB)`;
    }
  }
  return null;
}

async function handleChat(req, res, body){
  const env = readEnv();
  const key = env.OPENAI_API_KEY;

  if(!keyReady(key)){
    return json(res, 503, {
      error: 'NO_API_KEY',
      message: 'OpenAI API 키가 설정되지 않았습니다. 프로젝트 루트의 .env 파일에 OPENAI_API_KEY 를 넣고 서버를 다시 시작하세요.'
    });
  }

  let payload;
  try{ payload = JSON.parse(body || '{}'); }
  catch{ return json(res, 400, { error:'BAD_JSON', message:'요청 형식이 올바르지 않습니다.' }); }

  // 입력 방어 — 과금/남용 방지
  const msgs = Array.isArray(payload.messages) ? payload.messages.slice(-10) : [];
  if(!msgs.length) return json(res, 400, { error:'NO_MESSAGE', message:'질문이 비어 있습니다.' });
  for(const m of msgs){
    if(typeof m?.content !== 'string' || m.content.length > 4000){
      return json(res, 400, { error:'BAD_MESSAGE', message:'질문이 너무 깁니다(4000자 이내).' });
    }
  }
  const bad = validateFiles(msgs);
  if(bad) return json(res, 400, { error:'BAD_FILE', message: bad });
  const hasFiles = msgs.some(m => Array.isArray(m.files) && m.files.length);

  const rules = loadRegulations();
  if(!rules.trim()){
    return json(res, 503, { error:'NO_RULES', message:'data/regulations.md 에 사내 규정이 비어 있습니다.' });
  }

  try{
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${key}` },
      // ★ gpt-5.x 계열은 max_tokens/temperature 를 거부합니다.
      //   max_completion_tokens 사용 + temperature 생략(기본값 1만 허용).
      //   추론 토큰이 100~200 소모되므로 예산을 넉넉히 잡습니다.
      body: JSON.stringify({
        model: env.OPENAI_MODEL || 'gpt-5.5',
        max_completion_tokens: hasFiles ? 2500 : 1200,
        reasoning_effort: hasFiles ? 'medium' : 'low',   // 문서 판독은 추론을 조금 더
        messages: [
          { role:'system', content: `${SYSTEM_PROMPT}\n\n<사내규정>\n${rules}\n</사내규정>` },
          ...msgs.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: toContent(m) })),
        ],
      }),
    });

    if(!r.ok){
      // ★ 원문 에러에 키가 섞여 나갈 수 있으므로 그대로 전달하지 않습니다
      let detail = '';
      try{ const e = await r.json(); detail = e?.error?.message || ''; }catch{}
      console.error('[OpenAI 오류]', r.status, detail);
      const msg = r.status === 401 ? 'API 키가 유효하지 않습니다. .env 의 OPENAI_API_KEY 를 확인하세요.'
                : r.status === 429 ? '요청이 많거나 크레딧이 부족합니다. 잠시 후 다시 시도하세요.'
                : `OpenAI 오류(${r.status})가 발생했습니다.`;
      return json(res, 502, { error:'OPENAI_ERROR', message: msg });
    }

    const dataRes = await r.json();
    const choice = dataRes?.choices?.[0];
    let reply = choice?.message?.content?.trim() || '';
    // 추론 토큰이 예산을 다 써서 본문이 비는 경우 안내 (gpt-5.x 특성)
    if(!reply){
      reply = choice?.finish_reason === 'length'
        ? '답변이 길어 잘렸습니다. 질문을 조금 더 구체적으로 나눠서 물어봐 주세요.'
        : '답변을 생성하지 못했습니다. 다시 시도해 주세요.';
    }
    return json(res, 200, { reply });

  }catch(err){
    console.error('[프록시 오류]', err);
    return json(res, 500, { error:'PROXY_ERROR', message:'서버에서 OpenAI 호출에 실패했습니다.' });
  }
}

/* ---------- 정적 파일 ---------- */
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.md':'text/markdown; charset=utf-8',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.ico':'image/x-icon' };

function json(res, code, obj){
  res.writeHead(code, { 'Content-Type':'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function serveStatic(req, res){
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if(rel === '/' ) rel = '/index.html';
  // 경로 탈출(../) 차단 — .env 같은 파일이 절대 노출되지 않도록
  const file = path.normalize(path.join(ROOT, rel));
  if(!file.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  // 비밀 파일은 어떤 경우에도 서빙 금지
  const base = path.basename(file).toLowerCase();
  if(base === '.env' || base.includes('firebase-adminsdk') || base.includes('service-account')){
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(file, (err, buf)=>{
    if(err){ res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); return res.end('404 Not Found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control':'no-cache, no-store, must-revalidate' });
    res.end(buf);
  });
}

/* ---------- 서버 ---------- */
const server = http.createServer((req, res)=>{
  if(req.url.split('?')[0] === '/api/chat'){
    if(req.method !== 'POST') return json(res, 405, { error:'METHOD', message:'POST 만 지원합니다.' });
    // ★ Buffer 로 모은 뒤 한 번에 UTF-8 디코딩.
    //   문자열로 이어붙이면 한글(멀티바이트)이 청크 경계에서 깨집니다.
    const chunks = []; let size = 0, tooBig = false;
    req.on('data', c => {
      size += c.length; chunks.push(c);
      // 이미지/PDF 첨부(base64)를 감안한 상한 — 초과 시 안내 후 차단
      if(size > 40 * 1024 * 1024){ tooBig = true; req.destroy(); }
    });
    req.on('end', ()=>{
      if(tooBig) return json(res, 413, { error:'TOO_LARGE', message:'첨부 용량이 너무 큽니다. 파일 크기를 줄여 주세요.' });
      handleChat(req, res, Buffer.concat(chunks).toString('utf8'));
    });
    return;
  }
  serveStatic(req, res);
});

const env = readEnv();
const PORT = Number(env.PORT) || 8000;
server.listen(PORT, ()=>{
  console.log(`\n  BL TECH 영업 포털`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  국내 포털  http://localhost:${PORT}/`);
  console.log(`  해외 포털  http://localhost:${PORT}/overseas.html`);
  console.log(`  규정 챗봇  ${keyReady(env.OPENAI_API_KEY) ? '✅ API 키 감지됨' : '⚠️  .env 에 OPENAI_API_KEY 미설정 (챗봇만 비활성)'}`);
  console.log('');
});
