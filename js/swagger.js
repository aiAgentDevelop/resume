var API_DOCS = [
  {
    method: "GET",
    path: "/api/profile",
    summary: "기본 인적사항 조회",
    description: "이력서 소유자의 이름, 성별, 생년, 연락처, 주소 등 기본 프로필 정보를 반환합니다.",
    tags: ["Profile"],
    parameters: [],
    response: {
      status: 200,
      description: "프로필 정보 반환 성공",
      schema: {
        type: "object",
        properties: {
          "name": { type: "string", description: "이름", example: "이동완" },
          "gender": { type: "string", description: "성별", example: "남" },
          "birthYear": { type: "integer", description: "출생년도", example: 1980 },
          "age": { type: "integer", description: "만 나이", example: 45 },
          "phone": { type: "string", description: "휴대폰 번호", example: "010-4001-4444" },
          "email": { type: "string", description: "이메일 주소", example: "hanwoolchunsa@gmail.com" },
          "address": { type: "string", description: "주소", example: "경기도 용인시 처인구 고림로 162번길 15 ..." },
          "photo": { type: "string", description: "프로필 사진 경로", example: "images/profile.jpg" },
          "title": { type: "string", description: "이력서 제목", example: "토스뱅크 Node.js Developer 지원" }
        }
      }
    }
  },
  {
    method: "GET",
    path: "/api/summary",
    summary: "요약 정보 조회",
    description: "학력, 경력, 인턴·대외활동, 자격증/어학 요약 정보를 반환합니다.",
    tags: ["Summary"],
    parameters: [],
    response: {
      status: 200,
      description: "요약 정보 반환 성공",
      schema: {
        type: "object",
        properties: {
          "education": {
            type: "object",
            description: "학력 요약",
            properties: {
              "school": { type: "string", example: "마산대학" },
              "degree": { type: "string", example: "대학(2,3년)" },
              "status": { type: "string", example: "졸업" }
            }
          },
          "career": {
            type: "object",
            description: "경력 요약",
            properties: {
              "company": { type: "string", example: "트리노드" },
              "status": { type: "string", example: "재직 중" },
              "totalExperience": { type: "string", example: "총 18년 1개월" }
            }
          },
          "internship": { type: "string", description: "인턴·대외활동", example: "-" },
          "certification": { type: "string", description: "자격증/어학", example: "-" }
        }
      }
    }
  },
  {
    method: "GET",
    path: "/api/skills",
    summary: "기술 스택 목록 조회",
    description: "보유 기술 스택 목록을 배열 형태로 반환합니다.",
    tags: ["Skills"],
    parameters: [],
    response: {
      status: 200,
      description: "기술 스택 목록 반환 성공",
      schema: {
        type: "array",
        items: { type: "string" },
        example: '["Ajax", "Apache", "MySQL", "Node.js", "PHP", "XML", "Python", "Linux", "GoLang", "Nest.js", "TypeORM", "AI Agent", "Claude Code", "AI Orchestration", "Harness Skill"]'
      }
    }
  },
  {
    method: "GET",
    path: "/api/education",
    summary: "학력 상세 조회",
    description: "학력 정보를 배열 형태로 반환합니다. 각 항목에는 기간, 학교명, 전공, 졸업 상태가 포함됩니다.",
    tags: ["Education"],
    parameters: [],
    response: {
      status: 200,
      description: "학력 정보 반환 성공",
      schema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            "period": { type: "string", description: "재학 기간", example: "1999. 03 ~ 2004. 02" },
            "school": { type: "string", description: "학교명", example: "마산대학" },
            "major": { type: "string|null", description: "전공 (고등학교는 null)", example: "컴퓨터전기공학" },
            "status": { type: "string", description: "졸업 상태", example: "졸업" }
          }
        }
      }
    }
  },
  {
    method: "GET",
    path: "/api/career",
    summary: "경력 상세 조회",
    description: "전체 경력 정보를 배열 형태로 반환합니다. 각 항목에는 재직 기간, 회사명, 부서, 주요직무, 프로젝트 목록이 포함됩니다.",
    tags: ["Career"],
    parameters: [],
    response: {
      status: 200,
      description: "경력 정보 반환 성공",
      schema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            "period": { type: "string", description: "재직 기간", example: "2021. 03 ~ 재직중" },
            "duration": { type: "string", description: "근무 기간", example: "재직중" },
            "company": { type: "string", description: "회사명", example: "트리노드" },
            "department": { type: "string", description: "부서/팀", example: "Live실 포코팡 서버팀" },
            "role": { type: "string", description: "주요직무", example: "게임개발자" },
            "projects": {
              type: "array",
              description: "프로젝트 목록",
              items: {
                type: "object",
                properties: {
                  "title": { type: "string", description: "프로젝트명" },
                  "description": { type: "array", description: "상세 설명 (문자열 배열)" },
                  "techStack": { type: "array", description: "사용 기술 스택 (문자열 배열)" }
                }
              }
            }
          }
        }
      }
    }
  },
  {
    method: "GET",
    path: "/api/about",
    summary: "자기소개서 조회",
    description: "자기소개서 전문을 섹션별로 반환합니다.",
    tags: ["About"],
    parameters: [],
    response: {
      status: 200,
      description: "자기소개서 반환 성공",
      schema: {
        type: "object",
        properties: {
          "title": { type: "string", description: "제목", example: "자기소개서" },
          "sections": {
            type: "array",
            description: "자기소개서 섹션 목록",
            items: {
              type: "object",
              properties: {
                "heading": { type: "string", description: "섹션 제목", example: "자기소개서" },
                "content": { type: "string", description: "섹션 본문 내용" }
              }
            }
          }
        }
      }
    }
  },
  {
    method: "GET",
    path: "/api/military",
    summary: "병역 및 취업우대사항 조회",
    description: "병역사항, 보훈대상, 취업보호대상, 고용지원금대상, 장애 여부 정보를 반환합니다.",
    tags: ["Military"],
    parameters: [],
    response: {
      status: 200,
      description: "병역/취업우대사항 반환 성공",
      schema: {
        type: "object",
        properties: {
          "veteranStatus": { type: "string", description: "보훈대상 여부", example: "-" },
          "employmentProtection": { type: "string", description: "취업보호대상 여부", example: "-" },
          "employmentSubsidy": { type: "string", description: "고용지원금대상 여부", example: "-" },
          "military": {
            type: "object",
            description: "병역사항",
            properties: {
              "status": { type: "string", example: "군필" },
              "period": { type: "string", example: "2001. 03 ~ 2003. 07" },
              "type": { type: "string", example: "공익" },
              "rank": { type: "string", example: "이병" },
              "discharge": { type: "string", example: "제대" }
            }
          },
          "disability": { type: "string", description: "장애여부", example: "-" }
        }
      }
    }
  }
];

document.addEventListener('DOMContentLoaded', function () {
  renderSwaggerHeader();
  renderEndpoints();
  bindToggle();
});

function renderSwaggerHeader() {
  var el = document.getElementById('swagger-header');
  el.innerHTML =
    '<div class="swagger-title">' +
      '<h1>이력서 API</h1>' +
      '<span class="swagger-version">v1.0.0</span>' +
    '</div>' +
    '<p class="swagger-desc">이동완 이력서 RESTful API Mock 문서. ' +
    '백엔드 없이 정적 JSON 파일로 제공되는 Mock API입니다.</p>' +
    '<div class="swagger-info">' +
      '<span class="swagger-base-url">Base URL: <code>./api/</code></span>' +
      '<a href="index.html" class="swagger-link">이력서 보기</a>' +
    '</div>';
}

function renderEndpoints() {
  var container = document.getElementById('swagger-endpoints');
  var html = '';

  API_DOCS.forEach(function (endpoint, idx) {
    html += '<div class="endpoint" id="endpoint-' + idx + '">' +
      '<div class="endpoint-header" data-idx="' + idx + '">' +
        '<span class="method method-' + endpoint.method.toLowerCase() + '">' + endpoint.method + '</span>' +
        '<span class="path">' + escapeH(endpoint.path) + '</span>' +
        '<span class="summary">' + escapeH(endpoint.summary) + '</span>' +
        '<span class="toggle-icon">+</span>' +
      '</div>' +
      '<div class="endpoint-body" id="body-' + idx + '">' +
        '<p class="endpoint-desc">' + escapeH(endpoint.description) + '</p>' +
        renderParameters(endpoint.parameters) +
        renderResponse(endpoint.response) +
        renderTryIt(endpoint, idx) +
      '</div>' +
    '</div>';
  });

  container.innerHTML = html;
}

function renderParameters(params) {
  if (!params || params.length === 0) {
    return '<div class="section-label">Parameters</div>' +
      '<p class="no-params">파라미터 없음</p>';
  }
  return '';
}

function renderResponse(response) {
  var html = '<div class="section-label">Responses</div>' +
    '<div class="response-block">' +
      '<div class="response-status">' +
        '<span class="status-code">' + response.status + '</span>' +
        '<span class="status-desc">' + escapeH(response.description) + '</span>' +
      '</div>' +
      '<div class="response-schema">' +
        '<div class="schema-title">Response Schema</div>' +
        '<div class="schema-content">' + renderSchema(response.schema, 0) + '</div>' +
      '</div>' +
    '</div>';
  return html;
}

function renderSchema(schema, depth) {
  if (!schema) return '';
  var indent = depth * 20;
  var html = '';

  if (schema.type === 'array' && schema.items) {
    if (schema.example) {
      html += '<div class="schema-row" style="padding-left:' + indent + 'px">' +
        '<span class="schema-type">[' + (schema.items.type || 'object') + ']</span>' +
        '</div>';
      html += '<pre class="schema-example">' + escapeH(schema.example) + '</pre>';
    } else {
      html += '<div class="schema-row" style="padding-left:' + indent + 'px">' +
        '<span class="schema-type">array of objects:</span></div>';
      html += renderSchemaProperties(schema.items.properties, depth + 1);
    }
  } else if (schema.type === 'object' && schema.properties) {
    html += renderSchemaProperties(schema.properties, depth);
  }
  return html;
}

function renderSchemaProperties(properties, depth) {
  if (!properties) return '';
  var indent = depth * 20;
  var html = '';

  Object.keys(properties).forEach(function (key) {
    var prop = properties[key];
    html += '<div class="schema-row" style="padding-left:' + indent + 'px">';
    html += '<span class="schema-key">' + escapeH(key) + '</span>';

    if (prop.type === 'object' && prop.properties) {
      html += '<span class="schema-type">{object}</span>';
      if (prop.description) html += '<span class="schema-desc">' + escapeH(prop.description) + '</span>';
      html += '</div>';
      html += renderSchemaProperties(prop.properties, depth + 1);
    } else if (prop.type === 'array') {
      html += '<span class="schema-type">[array]</span>';
      if (prop.description) html += '<span class="schema-desc">' + escapeH(prop.description) + '</span>';
      html += '</div>';
      if (prop.items && prop.items.properties) {
        html += renderSchemaProperties(prop.items.properties, depth + 1);
      }
    } else {
      html += '<span class="schema-type">' + escapeH(prop.type || 'string') + '</span>';
      if (prop.description) html += '<span class="schema-desc">' + escapeH(prop.description) + '</span>';
      if (prop.example !== undefined) html += '<span class="schema-example-inline">예: ' + escapeH(String(prop.example)) + '</span>';
      html += '</div>';
    }
  });
  return html;
}

function renderTryIt(endpoint, idx) {
  var jsonFile = endpoint.path.replace('/api/', 'api/') + '.json';
  return '<div class="try-it">' +
    '<button class="try-btn" data-file="' + jsonFile + '" data-idx="' + idx + '">Try it out</button>' +
    '<div class="try-result" id="result-' + idx + '"></div>' +
  '</div>';
}

function bindToggle() {
  document.addEventListener('click', function (e) {
    var header = e.target.closest('.endpoint-header');
    if (header) {
      var idx = header.getAttribute('data-idx');
      var body = document.getElementById('body-' + idx);
      var icon = header.querySelector('.toggle-icon');
      if (body.classList.contains('open')) {
        body.classList.remove('open');
        icon.textContent = '+';
      } else {
        body.classList.add('open');
        icon.textContent = '-';
      }
      return;
    }

    var btn = e.target.closest('.try-btn');
    if (btn) {
      var file = btn.getAttribute('data-file');
      var resultIdx = btn.getAttribute('data-idx');
      var resultEl = document.getElementById('result-' + resultIdx);

      // Try fetch (works with HTTP server), fallback to ResumeAPI
      var apiKey = file.replace('api/', '').replace('.json', '');
      var data = window.ResumeAPI && window.ResumeAPI[apiKey];
      if (data) {
        resultEl.innerHTML = '<div class="result-header"><span class="status-code">200</span> Response</div>' +
          '<pre class="result-body">' + escapeH(JSON.stringify(data, null, 2)) + '</pre>';
        resultEl.classList.add('open');
      }
    }
  });
}

function escapeH(text) {
  if (text == null) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(String(text)));
  return div.innerHTML;
}