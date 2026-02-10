# AIKit Proxy Server

CORS 프록시 서버 - 브라우저 기반 AIKit 예제를 위한 백엔드 서버

## 🎯 목적

브라우저에서는 AI API를 직접 호출할 수 없습니다 (CORS 정책). 
이 프록시 서버는 브라우저와 AI API 사이의 중개자 역할을 합니다.
```
Browser → Proxy Server → AI API (OpenAI/Claude/Gemini)
```

## 🚀 Quick Start
```bash
# 의존성 설치
npm install

# 서버 시작
npm start

# 또는 개발 모드 (자동 재시작)
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 📡 API Endpoints

### GET `/`
서버 상태 확인

**Response:**
```json
{
  "status": "ok",
  "message": "AIKit Proxy Server is running",
  "endpoints": {
    "chat": "POST /api/chat",
    "health": "GET /"
  }
}
```

### POST `/api/chat`
AI 채팅 요청

**Request Body:**
```json
{
  "provider": "openai",
  "apiKey": "your-api-key",
  "message": "Hello, AI!",
  "options": {
    "enableCache": true,
    "enableCostTracking": true
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "content": "Hello! How can I help you?",
    "model": "gpt-3.5-turbo",
    "usage": { ... }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔧 프론트엔드 연동

### React Example
```javascript
const handleSubmit = async () => {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'openai',
      apiKey: apiKey,
      message: message
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log(result.data.content);
  }
};
```

### Vue Example
```javascript
const handleSubmit = async () => {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: provider.value,
      apiKey: apiKey.value,
      message: message.value
    })
  });

  const result = await response.json();
  
  if (result.success) {
    response.value = result.data.content;
  }
};
```

## 🔐 보안 주의사항

⚠️ **이 서버는 개발/데모 용도입니다!**

프로덕션 환경에서는:

1. **API 키를 서버 환경 변수로 관리**
```javascript
   const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
```

2. **인증 추가**
   - JWT 토큰
   - API 키 검증
   - Rate limiting

3. **HTTPS 사용**

4. **입력 검증 강화**
   - 메시지 길이 제한
   - XSS 방지
   - SQL Injection 방지

## 📦 Dependencies
```json
{
  "@lukaplayground/aikit": "^1.0.1",
  "express": "^4.18.2",
  "cors": "^2.8.5"
}
```

## 🔗 Related

- [React Example](../react)
- [Vue Example](../vue)
- [AIKit Documentation](https://lukaplayground.github.io/aikit/)