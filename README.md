# 이력서 RESTful API Mock

이동완 이력서를 RESTful API 구조의 Mock 데이터로 구성한 정적 웹사이트입니다.

## 특징

- 백엔드 없이 정적 JSON 파일로 API Mock 데이터 제공
- `file://` 프로토콜 지원 — 압축 해제 후 `index.html`을 열면 바로 동작 (Mac/Windows)
- 8개 API 엔드포인트로 이력서 데이터 세분화
- Swagger 스타일 API 문서 페이지 포함
- 반응형 디자인 + 인쇄 스타일시트

## 파일 구조

```
├── index.html          # 이력서 메인 페이지
├── api-docs.html       # Swagger 스타일 API 문서
├── css/
│   ├── style.css       # 이력서 스타일
│   └── swagger.css     # API 문서 스타일
├── js/
│   ├── app.js          # 이력서 렌더링 로직
│   └── swagger.js      # API 문서 렌더링 로직
├── api/                # Mock API 데이터
│   ├── profile.js/json     # 기본 인적사항
│   ├── summary.js/json     # 요약 정보
│   ├── skills.js/json      # 기술 스택
│   ├── education.js/json   # 학력
│   ├── career.js/json      # 경력 (10개 회사)
│   ├── about.js/json       # 자기소개서
│   └── military.js/json    # 병역/취업우대사항
├── images/             # 이미지 리소스
└── docs/이력서/        # 원본 PDF
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

Playwright를 사용하여 HTML에서 PDF를 생성할 수 있습니다.

```javascript
await page.pdf({
  path: '이력서_이동완.pdf',
  format: 'A4',
  printBackground: true,
  margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }
});
```
