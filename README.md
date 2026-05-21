# 이력서 RESTful API Mock

이동완 이력서를 RESTful API 구조의 Mock 데이터로 구성한 정적 웹사이트입니다.

## 특징

- 백엔드 없이 정적 JSON 파일로 API Mock 데이터 제공
- `file://` 프로토콜 지원 — 압축 해제 후 `index.html`을 열면 바로 동작 (Mac/Windows)
- 8개 API 엔드포인트로 이력서 데이터 세분화
- Swagger 스타일 API 문서 페이지 포함
- **다크 테마 포트폴리오 페이지 + Build Pipeline 미니게임** (`portfolio.html`)
- 반응형 디자인 + 인쇄 스타일시트

## 3-Layer 사이트 구조

| 페이지 | 정체 | 용도 |
|---|---|---|
| `index.html` | 한국식 정식 이력서 (A4 인쇄용) | 채용 담당자 표준 제출 |
| `portfolio.html` | Build Pipeline 미니게임 + 다크 포트폴리오 | 인터랙티브 자기 어필 |
| `api-docs.html` | Swagger 스타일 엔드포인트 문서 | RESTful API Mock 컨셉 보완 |

`portfolio.html` 진입 시 6단계 CI/CD 파이프라인(Setup → Lint → Test → Build → Containerize → Deploy)이 약 9초간 시각화되며, `Skip` 버튼·`ESC` 키·`?skip=1` 쿼리·재방문(localStorage) 시 즉시 우회됩니다.

## 파일 구조

```
├── index.html              # 정식 이력서 (A4 인쇄)
├── portfolio.html          # 다크 포트폴리오 + Build Pipeline 게임
├── api-docs.html           # Swagger 스타일 API 문서
├── css/
│   ├── style.css           # 정식 이력서 스타일
│   ├── portfolio.css       # 다크 테마 + 터미널 + 파이프라인 스타일
│   └── swagger.css         # API 문서 스타일
├── js/
│   ├── app.js              # 정식 이력서 렌더링
│   ├── portfolio.js        # 다크 포트폴리오 렌더링 + scroll reveal
│   ├── build-pipeline.js   # 미니게임 엔진 (CI/CD stage runner)
│   └── swagger.js          # API 문서 렌더링
├── api/                    # Mock API 데이터 (window.ResumeAPI)
│   ├── profile.js/json
│   ├── summary.js/json
│   ├── skills.js/json
│   ├── education.js/json
│   ├── career.js/json      # 경력 (10개 회사)
│   ├── projects.js/json    # 오픈소스 프로젝트
│   ├── about.js/json
│   └── military.js/json
├── images/
└── docs/
```

## 사용법

### 바로 열기 (서버 불필요)
`index.html`을 브라우저에서 더블클릭하면 바로 볼 수 있습니다.

### HTTP 서버로 열기
```bash
python -m http.server 8765
# http://localhost:8765 접속
```

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/profile | 기본 인적사항 |
| GET | /api/summary | 요약 정보 |
| GET | /api/skills | 기술 스택 목록 |
| GET | /api/education | 학력 상세 |
| GET | /api/career | 경력 상세 |
| GET | /api/about | 자기소개서 |
| GET | /api/military | 병역/취업우대사항 |

API 상세 문서는 `api-docs.html`에서 확인할 수 있습니다.

## 기술 구현

### file:// 호환성
브라우저에서 `file://`로 열면 `fetch()`가 CORS 제한으로 동작하지 않습니다.
이를 해결하기 위해 JSON 데이터를 JS 파일로 래핑하여 `<script>` 태그로 로드합니다.

```javascript
// api/profile.js
window.ResumeAPI = window.ResumeAPI || {};
window.ResumeAPI.profile = { name: "이동완", ... };
```

순수 `.json` 파일도 함께 제공하여 HTTP 서버 환경에서는 `fetch()`로도 사용 가능합니다.

## PDF 생성

Playwright를 사용하여 HTML에서 PDF를 생성합니다.

```bash
# 1) 최초 1회
npm install playwright
npx playwright install chromium

# 2) PDF 생성
node scripts/generate-pdf.js
# → 이력서_이동완.pdf (A4, 여백 12mm, printBackground)
```
