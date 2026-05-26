# 이력서 RESTful API Mock

이동완 이력서를 **RESTful API 구조의 Mock 데이터**로 구성한 정적 웹사이트입니다.
백엔드 없이 HTML/CSS/JS와 JSON만으로 동작하며, 로컬 파일(`file://`)에서도 그대로 열립니다.

---

## 핵심 특징

- **백엔드 불필요** — 정적 JSON / JS 래퍼만으로 API Mock 데이터 제공
- **`file://` 호환** — 압축 해제 후 `index.html` 더블클릭으로 즉시 동작 (Mac / Windows)
- **3-Layer 사이트 구조** — 정식 이력서 + 다크 포트폴리오 + Swagger 스타일 API 문서
- **8개 RESTful 엔드포인트** — 이력서 데이터를 도메인별로 분리
- **CRT 글리치 전환** — 이력서 → 포트폴리오 자동 전환 연출
- **반응형 + 인쇄 스타일시트** — 화면 / A4 인쇄 동시 대응
- **Playwright PDF 생성** — HTML을 그대로 PDF로 출력

---

## 3-Layer 사이트 구조

| 페이지 | 정체 | 용도 |
|---|---|---|
| `index.html` | 한국식 정식 이력서 (A4 인쇄용) | 채용 담당자 표준 제출 |
| `portfolio.html` | 다크 포트폴리오 | 인터랙티브 자기 어필 |
| `api-docs.html` | Swagger 스타일 엔드포인트 문서 | RESTful API Mock 컨셉 보완 |

`index.html`을 열면 약 3초 후 **CRT 글리치 전환**이 시작되어 자동으로 `portfolio.html`로 이동합니다.

---

## 파일 구조

```
├── index.html              # 정식 이력서 (A4 인쇄)
├── portfolio.html          # 다크 포트폴리오
├── api-docs.html           # Swagger 스타일 API 문서
│
├── css/
│   ├── style.css           # 정식 이력서 스타일 (화면 + 인쇄)
│   ├── portfolio.css       # 다크 포트폴리오 스타일
│   └── swagger.css         # API 문서 스타일
│
├── js/
│   ├── app.js                  # 정식 이력서 렌더링
│   ├── portfolio.js            # 다크 포트폴리오 렌더링 + scroll reveal
│   ├── glitch-transition.js    # CRT 글리치 자동 전환 연출
│   └── swagger.js              # API 문서 렌더링
│
├── api/                    # Mock API 데이터 (window.ResumeAPI 네임스페이스)
│   ├── profile.{js,json}       # 기본 인적사항
│   ├── summary.{js,json}       # 요약
│   ├── skills.{js,json}        # 기술 스택
│   ├── education.{js,json}     # 학력
│   ├── career.{js,json}        # 경력 (회사별 상세)
│   ├── projects.{js,json}      # 개인 프로젝트 · 오픈소스
│   ├── about.{js,json}         # 자기소개서
│   └── military.{js,json}      # 병역 / 취업우대사항
│
├── images/                 # 참여 게임 키 비주얼
├── docs/                   # 스크린샷 · 데모 · 참고 자료
├── scripts/                # PDF 생성 스크립트 (Playwright)
└── package.json
```

---

## 사용법

### 1) 그냥 열기 (서버 불필요)
`index.html`을 브라우저에 더블클릭하면 끝입니다. `file://` 프로토콜에서도 모든 API Mock이 동작합니다.

### 2) HTTP 서버로 열기
```bash
python -m http.server 8765
# http://localhost:8765 접속
```

### 3) 자동 전환 건너뛰기
포트폴리오를 바로 보고 싶다면 `portfolio.html`에 직접 접속하면 됩니다.

---

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/profile`   | 기본 인적사항 |
| GET | `/api/summary`   | 요약 정보 |
| GET | `/api/skills`    | 기술 스택 목록 |
| GET | `/api/education` | 학력 상세 |
| GET | `/api/career`    | 경력 상세 (회사별) |
| GET | `/api/projects`  | 개인 프로젝트 · 오픈소스 |
| GET | `/api/about`     | 자기소개서 |
| GET | `/api/military`  | 병역 / 취업우대사항 |

API 상세 문서와 응답 예시는 `api-docs.html`에서 확인할 수 있습니다.

---

## 기술 구현

### `file://` 호환성 트릭
브라우저에서 `file://`로 열면 `fetch()`가 CORS 제한으로 동작하지 않습니다.
이를 해결하기 위해 JSON 데이터를 JS 파일로 래핑하여 `<script>` 태그로 로드합니다.

```javascript
// api/profile.js
window.ResumeAPI = window.ResumeAPI || {};
window.ResumeAPI.profile = { name: "이동완", /* ... */ };
```

순수 `.json` 파일도 함께 제공하므로 HTTP 서버 환경에서는 `fetch()`로도 사용 가능합니다.

### CRT 글리치 전환
`js/glitch-transition.js`가 `<canvas>` + `<div>` 오버레이로 VHS 노이즈 · 스캔라인 · 플래시를 합성해
이력서 → 포트폴리오 자동 전환을 연출합니다. 인쇄 시에는 CSS로 숨김 처리됩니다.

---

## PDF 생성

Playwright(headless Chromium)로 HTML을 그대로 A4 PDF로 출력합니다.

```bash
# 최초 1회
npm install
npx playwright install chromium

# 이력서 PDF
node scripts/generate-pdf.js
# → 이력서_이동완.pdf (A4, 여백 12mm, printBackground)

# 회사별 맞춤 PDF (예시)
node scripts/generate-krafton-pdf.js
node scripts/generate-krafton-cover-letter-pdf.js
```

---

## 라이선스

ISC
