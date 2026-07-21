/* =============================================================
   사내 규정 챗봇 — Cloud Function (/api/chat)
   -------------------------------------------------------------
   로컬 server.js 의 handleChat 을 그대로 옮긴 것입니다.
   달라진 점 2가지:
     1) API 키를 .env 가 아니라 Google Secret Manager 에서 읽습니다.
        (defineSecret → 배포 시 Secret Manager 에 바인딩)
     2) Firebase Auth ID 토큰을 검증하고, 허용 이메일만 통과시킵니다.
        ★ 이게 없으면 주소를 아는 누구나 호출해 OpenAI 요금을 태울 수 있습니다.
   ============================================================= */
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
const fs = require('node:fs');
const path = require('node:path');

admin.initializeApp();

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

/* ── 챗봇을 쓸 수 있는 사람 ──────────────────────────────
   여기에 없는 계정은 로그인해도 거부됩니다.
   추가하려면 이메일을 넣고 다시 배포하세요.            */
const ALLOWED_EMAILS = [
  'emj0114@gmail.com',
];

const MODEL = 'gpt-5.5';
const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const OK_IMAGE = ['image/png','image/jpeg','image/webp','image/gif'];
const OK_DOC   = ['application/pdf'];

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

let rulesCache = null;
function loadRegulations(){
  if(rulesCache != null) return rulesCache;
  try{ rulesCache = fs.readFileSync(path.join(__dirname, 'regulations.md'), 'utf8'); }
  catch{ rulesCache = ''; }
  return rulesCache;
}

function toContent(m){
  const files = Array.isArray(m.files) ? m.files : [];
  if(!files.length) return m.content;
  const parts = [{ type:'text', text: m.content || '첨부한 문서를 판독해 주세요.' }];
  for(const f of files){
    const url = String(f.dataUrl || '');
    if(OK_IMAGE.includes(f.mime))    parts.push({ type:'image_url', image_url:{ url } });
    else if(OK_DOC.includes(f.mime)) parts.push({ type:'file', file:{ filename: f.name || 'document.pdf', file_data: url } });
  }
  return parts;
}

function validateFiles(msgs){
  for(const m of msgs){
    const files = Array.isArray(m.files) ? m.files : [];
    if(files.length > MAX_FILES) return `첨부는 한 번에 ${MAX_FILES}개까지 가능합니다.`;
    for(const f of files){
      if(!OK_IMAGE.includes(f.mime) && !OK_DOC.includes(f.mime))
        return `지원하지 않는 형식입니다: ${f.mime || '알 수 없음'} (이미지 PNG·JPG·WEBP·GIF 또는 PDF만 가능)`;
      const url = String(f.dataUrl || '');
      if(!url.startsWith('data:')) return '첨부 파일 형식이 올바르지 않습니다.';
      const b64 = url.slice(url.indexOf(',') + 1);
      if(b64.length * 0.75 > MAX_FILE_BYTES) return `파일이 너무 큽니다: ${f.name || ''} (최대 10MB)`;
    }
  }
  return null;
}

exports.chat = onRequest(
  { region:'us-central1', secrets:[OPENAI_API_KEY], memory:'512MiB', timeoutSeconds:120, maxInstances:5 },
  async (req, res) => {
    if(req.method !== 'POST') return res.status(405).json({ error:'METHOD', message:'POST 만 지원합니다.' });

    /* ── 1) 로그인 확인 ── */
    const authz = req.get('Authorization') || '';
    if(!authz.startsWith('Bearer '))
      return res.status(401).json({ error:'NO_AUTH', message:'로그인이 필요합니다.' });

    let user;
    try{
      user = await admin.auth().verifyIdToken(authz.slice(7));
    }catch{
      return res.status(401).json({ error:'BAD_TOKEN', message:'로그인이 만료되었습니다. 다시 로그인해 주세요.' });
    }

    /* ── 2) 허용 명단 확인 ── */
    const email = (user.email || '').toLowerCase();
    if(!user.email_verified || !ALLOWED_EMAILS.map(e=>e.toLowerCase()).includes(email)){
      logger.warn('허용되지 않은 접근 시도', { email, uid:user.uid });
      return res.status(403).json({ error:'NOT_ALLOWED', message:`${email} 계정은 사용 권한이 없습니다. 관리자에게 요청하세요.` });
    }

    /* ── 3) 입력 검증 ── */
    const payload = req.body || {};
    const msgs = Array.isArray(payload.messages) ? payload.messages.slice(-10) : [];
    if(!msgs.length) return res.status(400).json({ error:'NO_MESSAGE', message:'질문이 비어 있습니다.' });
    for(const m of msgs){
      if(typeof m?.content !== 'string' || m.content.length > 4000)
        return res.status(400).json({ error:'BAD_MESSAGE', message:'질문이 너무 깁니다(4000자 이내).' });
    }
    const bad = validateFiles(msgs);
    if(bad) return res.status(400).json({ error:'BAD_FILE', message: bad });
    const hasFiles = msgs.some(m => Array.isArray(m.files) && m.files.length);

    const rules = loadRegulations();
    if(!rules.trim())
      return res.status(503).json({ error:'NO_RULES', message:'사내 규정 문서가 비어 있습니다.' });

    /* ── 4) OpenAI 호출 (키는 Secret Manager 에서) ── */
    try{
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${OPENAI_API_KEY.value()}` },
        // gpt-5.x 는 max_tokens/temperature 를 거부합니다 (max_completion_tokens 사용, temperature 기본값만 허용)
        body: JSON.stringify({
          model: MODEL,
          max_completion_tokens: hasFiles ? 2500 : 1200,
          reasoning_effort: hasFiles ? 'medium' : 'low',
          messages: [
            { role:'system', content: `${SYSTEM_PROMPT}\n\n<사내규정>\n${rules}\n</사내규정>` },
            ...msgs.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: toContent(m) })),
          ],
        }),
      });

      if(!r.ok){
        let detail=''; try{ detail=(await r.json())?.error?.message || ''; }catch{}
        logger.error('OpenAI 오류', { status:r.status, detail });   // ★ 키가 섞일 수 있어 클라이언트로 그대로 넘기지 않음
        const msg = r.status===401 ? 'API 키가 유효하지 않습니다. 관리자에게 문의하세요.'
                  : r.status===429 ? '요청이 많거나 크레딧이 부족합니다. 잠시 후 다시 시도하세요.'
                  : `OpenAI 오류(${r.status})가 발생했습니다.`;
        return res.status(502).json({ error:'OPENAI_ERROR', message: msg });
      }

      const data = await r.json();
      const choice = data?.choices?.[0];
      let reply = choice?.message?.content?.trim() || '';
      if(!reply){
        reply = choice?.finish_reason === 'length'
          ? '답변이 길어 잘렸습니다. 질문을 조금 더 구체적으로 나눠서 물어봐 주세요.'
          : '답변을 생성하지 못했습니다. 다시 시도해 주세요.';
      }
      logger.info('응답 완료', { email, hasFiles, tokens: data?.usage?.total_tokens });
      return res.status(200).json({ reply });

    }catch(err){
      logger.error('프록시 오류', err);
      return res.status(500).json({ error:'PROXY_ERROR', message:'서버에서 OpenAI 호출에 실패했습니다.' });
    }
  }
);
