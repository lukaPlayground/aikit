// Language translations
const translations = {
    ko: {
        // Navbar
        'nav.features': '기능',
        'nav.demo': '데모',
        'nav.docs': '문서',
        'nav.github': 'GitHub',

        // Hero
        'hero.title': '범용 AI API 클라이언트',
        'hero.subtitle': 'OpenAI, Claude, Gemini를 하나의 인터페이스로.<br>순수 JavaScript로 제작. 의존성 없음.',
        'hero.tryDemo': '데모 체험',
        'hero.viewGithub': 'GitHub 보기',

        // Features
        'features.title': '주요 기능',
        'feature.autoFallback.title': '자동 대체',
        'feature.autoFallback.desc': 'API 실패 시 자동으로 백업 제공자로 전환',
        'feature.smartCaching.title': '스마트 캐싱',
        'feature.smartCaching.desc': 'LocalStorage 기반 캐싱으로 중복 요청 방지',
        'feature.costTracking.title': '비용 추적',
        'feature.costTracking.desc': 'API 사용 비용 실시간 모니터링',
        'feature.validation.title': '응답 검증',
        'feature.validation.desc': 'QA 중심의 길이, 형식, 내용 검증',
        'feature.universal.title': '범용성',
        'feature.universal.desc': '모든 언어와 프레임워크에서 사용 가능',
        'feature.zeroDeps.title': '의존성 제로',
        'feature.zeroDeps.desc': '순수 JavaScript, 외부 라이브러리 불필요',

        // Demo
        'demo.title': '인터랙티브 데모',
        'demo.subtitle': '브라우저에서 바로 AIKit 체험하기',
        'demo.note': '참고: 테스트하려면 자신의 API 키가 필요합니다.',
        'demo.getKey': '에서 키를 발급받으세요',

        // Docs
        'docs.title': '문서',
        'docs.gettingStarted.title': '시작하기',
        'docs.gettingStarted.desc': '설치 및 기본 사용법',
        'docs.apiRef.title': 'API 레퍼런스',
        'docs.apiRef.desc': '완전한 API 문서',
        'docs.examples.title': '예제',
        'docs.examples.desc': 'React, Vue, 바닐라 JS 예제',
        'docs.blog.title': '블로그',
        'docs.blog.desc': '튜토리얼 및 사용 사례',

        // Install
        'install.title': '빠른 설치',
        'install.cdn': 'CDN',
        'install.npm': 'NPM',
        'install.github': 'GitHub',

        // Footer
        'footer.createdBy': '제작자',
        'footer.blog': '블로그',
        'footer.license': 'MIT 라이선스',
        'footer.note': 'AIKit은 OpenAI, Anthropic, Google과 제휴하지 않습니다'
    },
    en: {
        // Navbar
        'nav.features': 'Features',
        'nav.demo': 'Demo',
        'nav.docs': 'Docs',
        'nav.github': 'GitHub',

        // Hero
        'hero.title': 'Universal AI API Client',
        'hero.subtitle': 'One interface for OpenAI, Claude, and Gemini.<br>Built with pure JavaScript. No dependencies.',
        'hero.tryDemo': 'Try Demo',
        'hero.viewGithub': 'View on GitHub',

        // Features
        'features.title': 'Features',
        'feature.autoFallback.title': 'Auto Fallback',
        'feature.autoFallback.desc': 'Automatically switch to backup providers when API fails',
        'feature.smartCaching.title': 'Smart Caching',
        'feature.smartCaching.desc': 'LocalStorage-based caching prevents duplicate requests',
        'feature.costTracking.title': 'Cost Tracking',
        'feature.costTracking.desc': 'Real-time monitoring of API usage costs',
        'feature.validation.title': 'Response Validation',
        'feature.validation.desc': 'QA-focused validation for length, format, and content',
        'feature.universal.title': 'Universal',
        'feature.universal.desc': 'Works with any language or framework',
        'feature.zeroDeps.title': 'Zero Dependencies',
        'feature.zeroDeps.desc': 'Pure JavaScript, no external libraries needed',

        // Demo
        'demo.title': 'Interactive Demo',
        'demo.subtitle': 'Try AIKit right in your browser',
        'demo.note': 'Note: You\'ll need your own API key to test. Get one from',
        'demo.getKey': '',

        // Docs
        'docs.title': 'Documentation',
        'docs.gettingStarted.title': 'Getting Started',
        'docs.gettingStarted.desc': 'Installation and basic usage',
        'docs.apiRef.title': 'API Reference',
        'docs.apiRef.desc': 'Complete API documentation',
        'docs.examples.title': 'Examples',
        'docs.examples.desc': 'React, Vue, and vanilla JS examples',
        'docs.blog.title': 'Blog',
        'docs.blog.desc': 'Tutorials and use cases',

        // Install
        'install.title': 'Quick Install',
        'install.cdn': 'CDN',
        'install.npm': 'NPM',
        'install.github': 'GitHub',

        // Footer
        'footer.createdBy': 'Created by',
        'footer.blog': 'Blog',
        'footer.license': 'MIT License',
        'footer.note': 'AIKit is not affiliated with OpenAI, Anthropic, or Google'
    }
};

// Language switcher functionality
class LanguageSwitcher {
    constructor() {
        this.currentLang = localStorage.getItem('aikit_lang') || 'en';
        this.init();
    }

    init() {
        // Create language toggle button
        this.createToggleButton();
        
        // Apply saved language
        this.applyLanguage(this.currentLang);
        
        // Update toggle button state
        this.updateToggleButton();
    }

    createToggleButton() {
        const toggle = document.createElement('div');
        toggle.className = 'lang-toggle';
        toggle.innerHTML = `
            <button id="langToggleBtn" class="lang-toggle-btn" title="Switch Language">
                <span class="lang-flag">🌐</span>
                <span class="lang-text">EN</span>
            </button>
        `;
        document.body.appendChild(toggle);

        // Add click event
        document.getElementById('langToggleBtn').addEventListener('click', () => {
            this.toggleLanguage();
        });
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'ko' : 'en';
        localStorage.setItem('aikit_lang', this.currentLang);
        this.applyLanguage(this.currentLang);
        this.updateToggleButton();
    }

    applyLanguage(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang][key]) {
                element.innerHTML = translations[lang][key];
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = lang;
    }

    updateToggleButton() {
        const btn = document.getElementById('langToggleBtn');
        const textSpan = btn.querySelector('.lang-text');
        
        if (this.currentLang === 'en') {
            textSpan.textContent = 'EN';
            btn.title = 'Switch to Korean (한국어로 전환)';
        } else {
            textSpan.textContent = 'KO';
            btn.title = 'Switch to English (영어로 전환)';
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new LanguageSwitcher();
});
