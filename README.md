# AIKit

> Universal AI API Client Framework - One interface for all AI providers

AIKit은 순수 JavaScript로 작성된 경량 라이브러리로, 여러 AI API 제공자를 통일된 인터페이스로 사용할 수 있게 해줍니다.

## 🎯 주요 특징

- **언어 중립적**: HTML, CSS, JavaScript만으로 동작
- **Provider Agnostic**: OpenAI, Claude, Gemini 등을 같은 방식으로 사용
- **자동 Fallback**: API 실패 시 자동으로 다른 제공자로 전환
- **비용 추적**: 실시간 API 사용 비용 모니터링
- **캐싱**: LocalStorage 기반 중복 요청 방지
- **QA 검증**: 응답 검증 및 자동 재시도

## 🚀 빠른 시작

### CDN 사용
```html
<script src="https://cdn.jsdelivr.net/gh/lukaPlayground/aikit@latest/dist/aikit.min.js"></script>

<script>
    const ai = new AIKit({
        provider: 'openai',
        apiKey: 'your-api-key'
    });

    ai.chat('Hello, AI!').then(response => {
        console.log(response);
    });
</script>
```

### NPM 설치
```bash
npm install @lukaplayground/aikit
```

```javascript
import AIKit from '@lukaplayground/aikit';

const ai = new AIKit({
    provider: 'claude',
    apiKey: 'your-api-key'
});
```

## 📖 문서

- [Getting Started](./docs/getting-started.md)
- [API Reference](./docs/api-reference.md)
- [Examples](./examples)

## 🛠️ 개발

```bash
# 클론
git clone https://github.com/lukaPlayground/aikit.git

# 의존성 설치
npm install

# 개발 서버
npm run dev

# 빌드
npm run build

# 테스트
npm test
```

## 📝 라이센스

MIT License

## 👨‍💻 제작자

[Luka](https://github.com/lukaPlayground)

---

**Blog**: [Luka's Playground](https://luka-playground.tistory.com)
