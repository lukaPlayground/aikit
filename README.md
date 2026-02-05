# AIKit

> Universal AI API Client Framework - One interface for all AI providers

**🌐 [Live Demo](https://lukaPlayground.github.io/aikit/)** | 
**📖 [Documentation](https://lukaPlayground.github.io/aikit/getting-started.html)** | 
**🎮 [Playground](https://lukaPlayground.github.io/aikit/demo/playground.html)**

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

## 📝 Blog Series

AIKit 개발 과정과 활용법을 블로그 시리즈로 정리했습니다:

1. [왜 AI API 통합 라이브러리를 만들었나?](https://lukaplayground.tistory.com/9) - 프로젝트 시작기
2. 순수 JavaScript로 멀티 프로바이더 지원하기 - 아키텍처 (작성 예정)
3. QA 개발자가 만든 AI 라이브러리 - 검증과 테스트 (작성 예정)
4. 5분 만에 AI 챗봇 만들기 - 바닐라 JS 튜토리얼 (작성 예정)
5. PHP 개발자를 위한 AIKit 연동 가이드 (작성 예정)
6. 모던 프레임워크에서 AIKit 사용하기 - React & Vue (작성 예정)
7. AI API 비용 90% 줄이기 - 최적화 전략 (작성 예정)
8. 첫 오픈소스 프로젝트 만들기 - 개발 회고 (작성 예정)

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

**Blog**: [Luka's Playground](https://lukaplayground.tistory.com)
