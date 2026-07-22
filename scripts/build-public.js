/* =============================================================
   Firebase Hosting 에 올릴 파일만 public/ 로 복사합니다.
   -------------------------------------------------------------
   ★ 저장소 루트를 그대로 public 으로 지정하면
     .env · 서비스 계정 키(*.json) · 사내 규정 문서까지 전 세계에 공개됩니다.
     그래서 "올릴 것만 화이트리스트로 고르는" 방식을 씁니다.

   실행:  node scripts/build-public.js
   ============================================================= */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const OUT  = path.join(ROOT, 'public');

/* 공개해도 되는 것만 나열 (여기 없는 파일은 절대 배포되지 않습니다) */
const ALLOW = [
  'index.html',
  'overseas.html',
  'assets/app.js',
  'assets/chatbot.js',
  'assets/rules-admin.js',
  'assets/overseas.js',
  'assets/styles.css',
];

/* 실수 방지용 — 절대 공개하면 안 되는 패턴 */
const FORBIDDEN = [/\.env/i, /firebase-adminsdk/i, /service-account/i, /^server\.js$/i, /^data\//i, /\.git/i];

function assertSafe(rel){
  for(const re of FORBIDDEN){
    if(re.test(rel)) throw new Error(`공개 금지 파일이 목록에 있습니다: ${rel}`);
  }
}

// 이전 결과 정리
fs.rmSync(OUT, { recursive:true, force:true });
fs.mkdirSync(OUT, { recursive:true });

let n = 0;
for(const rel of ALLOW){
  assertSafe(rel);
  const src = path.join(ROOT, rel);
  if(!fs.existsSync(src)){ console.error(`  ✗ 없음: ${rel}`); process.exitCode = 1; continue; }
  const dst = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dst), { recursive:true });
  fs.copyFileSync(src, dst);
  n++;
}

/* 배포될 파일 목록을 눈으로 확인 */
function walk(dir, base=''){
  return fs.readdirSync(dir, { withFileTypes:true }).flatMap(e=>{
    const rel = base ? `${base}/${e.name}` : e.name;
    return e.isDirectory() ? walk(path.join(dir, e.name), rel) : [rel];
  });
}
const shipped = walk(OUT);
console.log(`public/ 준비 완료 — ${n}개 파일`);
shipped.forEach(f=>console.log('   ', f));

/* 마지막 방어선: 결과물에 비밀이 섞였는지 검사 */
const leaked = shipped.filter(f => FORBIDDEN.some(re=>re.test(f)));
if(leaked.length){ console.error('배포 중단 — 비밀 파일 발견:', leaked); process.exit(1); }
for(const f of shipped){
  const txt = fs.readFileSync(path.join(OUT, f), 'utf8');
  if(/sk-proj-[A-Za-z0-9_-]{20}|BEGIN PRIVATE KEY/.test(txt)){
    console.error(`배포 중단 — ${f} 안에 키 문자열이 있습니다`); process.exit(1);
  }
}
console.log('비밀 파일·키 문자열 검사 통과');

/* 사내 규정 문서를 함수 쪽으로 동기화 (단일 소스: data/regulations.md)
   ★ Hosting(public/)에는 넣지 않습니다 — 규정은 공개 대상이 아닙니다. */
const rulesSrc = path.join(ROOT, 'data', 'regulations.md');
const rulesDst = path.join(ROOT, 'functions', 'regulations.md');
if(fs.existsSync(rulesSrc)){
  fs.mkdirSync(path.dirname(rulesDst), { recursive:true });
  fs.copyFileSync(rulesSrc, rulesDst);
  console.log('functions/regulations.md 동기화 완료');
}else{
  console.error('경고: data/regulations.md 가 없습니다 — 챗봇이 규정을 못 읽습니다');
}
