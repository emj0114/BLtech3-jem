# BL TECH 영업 포털 (초안)

BL TECH 영업 포털 프로토타입입니다. 빌드 과정이 필요 없는 **정적 사이트**로, 순수 HTML/CSS/JS로만 구성되어 있습니다.

## 구조

```
.
├── index.html          # 마크업 (페이지 골격)
├── assets/
│   ├── styles.css      # 전체 스타일
│   └── app.js          # 화면 렌더링 및 동작 로직
├── .gitignore
└── README.md
```

폰트는 [Pretendard](https://github.com/orioncactus/pretendard) CDN을 사용합니다 (`index.html`의 `<link>`).

## 로컬에서 실행

별도의 빌드 도구나 설치가 필요 없습니다. 아래 중 편한 방법을 사용하세요.

- **가장 간단한 방법**: `index.html` 파일을 브라우저에서 직접 엽니다.
- **로컬 서버로 실행** (권장 — 일부 브라우저의 파일 경로 제약 회피):

  ```bash
  # Python 3
  python -m http.server 8000

  # 또는 Node (npx 사용)
  npx serve .
  ```

  이후 브라우저에서 `http://localhost:8000` 접속.

## Vercel 배포

이 프로젝트는 정적 사이트라 별도 설정 없이 그대로 배포됩니다.

### 방법 1 — Vercel 대시보드 (GitHub 연동)

1. 이 저장소를 GitHub에 푸시합니다.
2. [vercel.com](https://vercel.com)에 로그인 후 **Add New… → Project**를 선택합니다.
3. 해당 GitHub 저장소를 **Import** 합니다.
4. 빌드 설정은 기본값 그대로 둡니다.
   - **Framework Preset**: `Other`
   - **Build Command**: 비워둠 (없음)
   - **Output Directory**: 비워둠 (루트의 `index.html`을 그대로 서빙)
5. **Deploy**를 누르면 배포가 완료되고 도메인이 발급됩니다.

이후 GitHub의 기본 브랜치에 푸시할 때마다 자동으로 재배포됩니다.

### 방법 2 — Vercel CLI

```bash
# CLI 설치 (최초 1회)
npm i -g vercel

# 프로젝트 루트에서
vercel          # 미리보기 배포
vercel --prod   # 프로덕션 배포
```

처음 실행 시 안내에 따라 로그인 및 프로젝트 연결을 진행하면 됩니다. 빌드 명령/출력 디렉터리는 비워두면 됩니다.
