# AIKit Laravel Example

Laravel integration example for AIKit - Universal AI API Client Framework.

## 🚀 Quick Start

### 1. 의존성 설치
```bash
composer install
composer require guzzlehttp/guzzle
```

### 2. 환경 설정
```bash
cp .env.example .env
php artisan key:generate
```

### 3. 서버 실행
```bash
php artisan serve
```

브라우저에서 `http://localhost:8000/aikit` 접속

## 🏗️ Architecture
```
Browser
    ↓ HTTP Request (AJAX)
Laravel Controller (AIKitController)
    ↓ HTTP Request (Guzzle)
AI Provider (OpenAI/Claude/Gemini)
```

## 📡 Routes

| Method | URL | Description |
|--------|-----|-------------|
| GET | /aikit | 채팅 페이지 |
| POST | /aikit/chat | 채팅 요청 처리 |

## 🔑 API Keys

- OpenAI: https://platform.openai.com/api-keys
- Claude: https://console.anthropic.com/
- Gemini: https://makersuite.google.com/app/apikey

## 📦 Dependencies
```json
{
    "guzzlehttp/guzzle": "^7.0"
}
```

## 🔗 Links

- [AIKit Documentation](https://lukaplayground.github.io/aikit/)
- [npm Package](https://www.npmjs.com/package/@lukaplayground/aikit)