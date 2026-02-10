# AIKit CIBoard Example

CIBoard(CodeIgniter) integration example for AIKit - Universal AI API Client Framework.

## 📁 파일 구조
```
ciboard/
├── application/
│   ├── controllers/
│   │   └── Aikit.php       # AI API 요청 처리
│   └── views/
│       └── aikit/
│           └── index.php   # 채팅 UI
└── assets/
    └── js/
        └── aikit-chat.js   # 프론트엔드 로직
```

## 🚀 적용 방법

### 1. 파일 복사
```bash
# CIBoard 루트 기준
cp application/controllers/Aikit.php  {ciboard}/application/controllers/
cp -r application/views/aikit         {ciboard}/application/views/
cp assets/js/aikit-chat.js            {ciboard}/assets/js/
```

### 2. 접속
```
http://your-ciboard-url/aikit
```

## 🏗️ Architecture
```
Browser
    ↓ FormData (AJAX)
CIBoard Controller (Aikit.php)
    ↓ cURL
AI Provider (OpenAI/Claude/Gemini)
```

## ⚡ Laravel과의 차이점

| 항목 | Laravel | CIBoard |
|------|---------|---------|
| HTTP 클라이언트 | Guzzle | cURL |
| 요청 형식 | JSON | FormData |
| 보안 | CSRF Token | AJAX 체크 |
| 라우팅 | routes/web.php | Controller URL |

## 🔑 API Keys

- OpenAI: https://platform.openai.com/api-keys
- Claude: https://console.anthropic.com/
- Gemini: https://makersuite.google.com/app/apikey