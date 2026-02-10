# AIKit React Example

React integration example for AIKit - Universal AI API Client Framework.

## ⚠️ CORS 제약사항

브라우저에서 AI API를 직접 호출할 수 없습니다 (CORS 정책).
프록시 서버를 통해 API를 호출해야 합니다.

## 🚀 Quick Start

### 1. 프록시 서버 시작
```bash
# 터미널 1
cd examples/proxy-server
npm install
npm start
```

프록시 서버가 `http://localhost:3000`에서 실행됩니다.

### 2. React 앱 실행
```bash
# 터미널 2  
cd examples/react
npm install
npm run dev
```

React 앱이 `http://localhost:5173`에서 실행됩니다.

## 📖 Usage

1. 프록시 서버가 실행 중인지 확인 (`http://localhost:3000`)
2. React 앱에서 AI provider 선택
3. API 키 입력
4. 메시지 전송

## 🏗️ Architecture
```
Browser (React App)
    ↓ HTTP Request
Proxy Server (Express)
    ↓ API Call
AI Provider (OpenAI/Claude/Gemini)
```

## 🔑 API Keys

Get your API keys from:
- OpenAI: https://platform.openai.com/api-keys
- Claude: https://console.anthropic.com/
- Gemini: https://makersuite.google.com/app/apikey

## 🔧 Configuration

프록시 서버 URL 변경:
```javascript
// src/App.jsx
const res = await fetch('http://localhost:3000/api/chat' // 변경 가능
```

## 📦 Dependencies
```json
{
  "dependencies": {
    "@lukaplayground/aikit": "^1.0.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

## 🔗 Links

- [AIKit Documentation](https://lukaplayground.github.io/aikit/)
- [npm Package](https://www.npmjs.com/package/@lukaplayground/aikit)
- [GitHub Repository](https://github.com/lukaPlayground/aikit)