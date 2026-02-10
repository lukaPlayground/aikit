# AIKit Vue Example

Vue 3 integration example for AIKit - Universal AI API Client Framework.

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

### 2. Vue 앱 실행
```bash
# 터미널 2  
cd examples/vue
npm install
npm run dev
```

Vue 앱이 `http://localhost:5173`에서 실행됩니다.

## 📖 Usage

1. 프록시 서버가 실행 중인지 확인 (`http://localhost:3000`)
2. Vue 앱에서 AI provider 선택
3. API 키 입력
4. 메시지 전송

## 🏗️ Architecture
```
Browser (Vue App)
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
// src/App.vue
const PROXY_URL = 'http://localhost:3000/api/chat'; // 변경 가능
```

## 📦 Dependencies
```json
{
  "dependencies": {
    "vue": "^3.3.0"
  }
}
```

**Note:** `@lukaplayground/aikit`는 프록시 서버에서 사용됩니다.

## 🎨 Features

- ✅ Vue 3 Composition API
- ✅ Proxy server for CORS bypass
- ✅ Provider selection
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design

## 🔗 Links

- [Proxy Server](../proxy-server)
- [AIKit Documentation](https://lukaplayground.github.io/aikit/)
- [npm Package](https://www.npmjs.com/package/@lukaplayground/aikit)

## 💡 Code Structure
```
vue/
├── src/
│   ├── App.vue          # Main component with chat interface
│   ├── main.js          # Vue app initialization
│   └── style.css        # Global styles
├── package.json
└── README.md
```

## 🎓 Learning Points

This example demonstrates:
- Using AIKit in Vue 3 Composition API
- Reactive state with `ref()`
- Form handling with `@submit.prevent`
- Conditional rendering with `v-if`
- Two-way binding with `v-model`
- Async/await error handling