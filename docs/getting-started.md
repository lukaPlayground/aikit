# Getting Started with AIKit

AIKit을 사용하여 단 몇 줄의 코드로 여러 AI 제공자를 통합할 수 있습니다.

## 설치

### CDN 사용 (가장 빠름)

```html
<script src="https://cdn.jsdelivr.net/gh/lukaPlayground/aikit@latest/dist/aikit.min.js"></script>
```

### NPM 설치

```bash
npm install @lukaplayground/aikit
```

### 직접 다운로드

[GitHub Releases](https://github.com/lukaPlayground/aikit/releases)에서 최신 버전을 다운로드하세요.

## 기본 사용법

### 1. 간단한 예제

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/gh/lukaPlayground/aikit@latest/dist/aikit.min.js"></script>
</head>
<body>
    <script>
        const ai = new AIKit({
            provider: 'openai',
            apiKey: 'your-openai-api-key'
        });

        ai.chat('Hello, AI!').then(response => {
            console.log(response.text);
        });
    </script>
</body>
</html>
```

### 2. 멀티 프로바이더 설정

여러 AI 제공자를 설정하고 자동 폴백을 활성화할 수 있습니다:

```javascript
const ai = new AIKit({
    providers: [
        { name: 'openai', apiKey: 'key1', priority: 1 },
        { name: 'claude', apiKey: 'key2', priority: 2 },
        { name: 'gemini', apiKey: 'key3', priority: 3 }
    ],
    autoFallback: true  // 자동으로 다음 제공자로 전환
});
```

### 3. 응답 검증

QA 기능을 활용한 응답 검증:

```javascript
const response = await ai.chat('파이썬에 대해 설명해주세요', {
    validate: {
        minLength: 100,        // 최소 100자
        maxLength: 1000,       // 최대 1000자
        mustInclude: ['파이썬', '프로그래밍'],  // 필수 키워드
        language: 'korean'     // 한국어 응답
    }
});
```

### 4. 비용 추적

API 사용 비용을 실시간으로 추적:

```javascript
const ai = new AIKit({
    provider: 'openai',
    apiKey: 'your-key',
    enableCostTracking: true
});

await ai.chat('Hello');

// 비용 리포트 확인
const report = ai.getCostReport();
console.log(report);
// {
//   total: "0.0023",
//   totalUSD: "$0.0023",
//   byProvider: { openai: "$0.0023" },
//   totalRequests: 1,
//   ...
// }
```

### 5. 캐싱 활용

중복 요청을 방지하여 비용 절감:

```javascript
const ai = new AIKit({
    provider: 'openai',
    apiKey: 'your-key',
    enableCache: true
});

// 첫 번째 요청 - API 호출
await ai.chat('2+2는?');

// 같은 질문 - 캐시에서 반환 (비용 없음)
await ai.chat('2+2는?');
```

## 옵션 설명

### AIKit 생성자 옵션

```javascript
new AIKit({
    // 필수
    provider: 'openai',           // 'openai', 'claude', 'gemini'
    apiKey: 'your-key',

    // 선택 (기본값 표시)
    enableCache: true,            // 캐싱 활성화
    enableCostTracking: true,     // 비용 추적 활성화
    maxRetries: 3,                // 최대 재시도 횟수
    timeout: 30000,               // 타임아웃 (ms)
    autoFallback: false,          // 자동 폴백 활성화

    // 멀티 프로바이더 (provider/apiKey 대신 사용)
    providers: [
        { name: 'openai', apiKey: 'key1', priority: 1 }
    ]
});
```

### chat() 메서드 옵션

```javascript
ai.chat('your message', {
    // 모델 설정
    model: 'gpt-4',              // 사용할 모델
    temperature: 0.7,             // 0.0 ~ 1.0 (창의성)
    maxTokens: 1000,              // 최대 토큰 수

    // 대화 이력
    history: [
        { role: 'user', content: '안녕' },
        { role: 'assistant', content: '안녕하세요!' }
    ],

    // 시스템 메시지
    systemMessage: 'You are a helpful assistant.',

    // 응답 검증
    validate: {
        minLength: 10,
        maxLength: 1000,
        mustInclude: ['keyword'],
        mustNotInclude: ['bad'],
        format: 'json',           // 'json', 'email', 'url', 'markdown'
        language: 'korean',       // 'korean', 'english', 'japanese'
        regex: '^Hello'           // 정규식 패턴
    },

    // 캐시 제어
    skipCache: false              // true면 캐시 무시
});
```

## 제공자별 특징

### OpenAI (GPT)
```javascript
{
    provider: 'openai',
    model: 'gpt-4',              // 또는 'gpt-3.5-turbo'
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0
}
```

### Claude (Anthropic)
```javascript
{
    provider: 'claude',
    model: 'claude-3-sonnet-20240229',  // 또는 'opus', 'haiku'
    temperature: 1.0,
    topP: 1,
    topK: 40
}
```

### Gemini (Google)
```javascript
{
    provider: 'gemini',
    model: 'gemini-pro',
    temperature: 0.9,
    topK: 40,
    topP: 1,
    safetySettings: [...]        // 안전 설정
}
```

## 유틸리티 메서드

```javascript
// 통계 확인
const stats = ai.getStats();
console.log(stats);
// { totalRequests: 5, successfulRequests: 4, ... }

// 비용 리포트
const cost = ai.getCostReport();

// 캐시 초기화
ai.clearCache();

// 설정 업데이트
ai.updateConfig({
    provider: 'claude',
    maxRetries: 5
});
```

## 다음 단계

- [API Reference](./api-reference.md) - 전체 API 문서
- [Examples](../examples) - 더 많은 예제
- [Advanced Usage](./advanced.md) - 고급 기능

## 문제 해결

### API 키 오류
```
Error: API key is required
```
→ API 키가 올바르게 설정되었는지 확인하세요.

### 네트워크 오류
```
Network error: Unable to reach API endpoint
```
→ 인터넷 연결을 확인하세요. CORS 문제일 수도 있습니다.

### 검증 실패
```
Validation failed: Response exceeds maximum length
```
→ validate 옵션의 제약 조건을 조정하세요.

## 지원

- [GitHub Issues](https://github.com/lukaPlayground/aikit/issues)
- [Documentation](https://github.com/lukaPlayground/aikit)
- Blog: [Luka's Playground](https://luka-playground.tistory.com)
