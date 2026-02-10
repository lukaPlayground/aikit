/**
 * AIKit - Universal AI API Client
 * @class
 */
import OpenAIAdapter from '../providers/OpenAIAdapter.js';
import ClaudeAdapter from '../providers/ClaudeAdapter.js';
import GeminiAdapter from '../providers/GeminiAdapter.js';
import CacheManager from '../utils/CacheManager.js';
import CostTracker from '../utils/CostTracker.js';
import ResponseValidator from '../utils/ResponseValidator.js';

class AIKit {
    /**
     * @param {Object} config - Configuration object
     * @param {string} config.provider - AI provider name ('openai', 'claude', 'gemini')
     * @param {string} config.apiKey - API key for the provider
     * @param {Object} [config.options] - Additional options
     */
    constructor(config) {
        this.validateConfig(config);
        
        this.config = {
            provider: config.provider,
            apiKey: config.apiKey,
            options: config.options || {},
            autoFallback: config.autoFallback || false,
            enableCache: config.enableCache !== false,
            enableCostTracking: config.enableCostTracking !== false,
            maxRetries: config.maxRetries || 3,
            timeout: config.timeout || 30000
        };

        // 멀티 프로바이더 설정
        this.providers = config.providers || [
            { name: config.provider, apiKey: config.apiKey, priority: 1 }
        ];

        this.currentProviderIndex = 0;
        
        // 모듈 초기화
        this.adapter = this.loadAdapter(this.config.provider);
        this.cache = this.config.enableCache ? new CacheManager() : null;
        this.costTracker = this.config.enableCostTracking ? new CostTracker() : null;
        this.validator = new ResponseValidator();
        
        // 통계
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            cachedResponses: 0
        };
    }

    /**
     * 설정 유효성 검사
     * @private
     */
    validateConfig(config) {
        if (!config) {
            throw new Error('AIKit: Configuration is required');
        }

        if (config.providers) {
            // 멀티 프로바이더 모드
            if (!Array.isArray(config.providers) || config.providers.length === 0) {
                throw new Error('AIKit: providers must be a non-empty array');
            }
            
            config.providers.forEach((p, i) => {
                if (!p.name || !p.apiKey) {
                    throw new Error(`AIKit: Provider at index ${i} must have 'name' and 'apiKey'`);
                }
            });
        } else {
            // 싱글 프로바이더 모드
            if (!config.provider) {
                throw new Error('AIKit: provider is required');
            }

            if (!config.apiKey) {
                throw new Error('AIKit: apiKey is required');
            }
        }
    }

    /**
     * 프로바이더 어댑터 로드
     * @private
     */
    loadAdapter(provider) {
        const adapterMap = {
            'openai': OpenAIAdapter,
            'claude': ClaudeAdapter,
            'gemini': GeminiAdapter
        };

        const AdapterClass = adapterMap[provider.toLowerCase()];
        if (!AdapterClass) {
            throw new Error(`Unknown provider: ${provider}`);
        }
        
        return new AdapterClass();
    }

    /**
     * AI 채팅 요청
     * @param {string} message - User message
     * @param {Object} [options] - Request options
     * @returns {Promise<Object>} Response object
     */
    async chat(message, options = {}) {
        this.stats.totalRequests++;

        // 캐시 체크
        if (this.cache && !options.skipCache) {
            const cacheKey = this.cache.generateKey(message, options);
            const cached = this.cache.get(cacheKey);
            
            if (cached) {
                this.stats.cachedResponses++;
                return {
                    ...cached,
                    fromCache: true,
                    timestamp: new Date().toISOString()
                };
            }
        }

        // 검증 옵션 추출
        const validation = options.validate || {};
        delete options.validate;

        // 재시도 로직
        let lastError;
        for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
            try {
                const response = await this.makeRequest(message, options);
                
                // 응답 검증
                if (Object.keys(validation).length > 0) {
                    const validationResult = this.validator.validate(response, validation);
                    if (!validationResult.isValid) {
                        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
                    }
                }

                // 캐시 저장
                if (this.cache && !options.skipCache) {
                    const cacheKey = this.cache.generateKey(message, options);
                    this.cache.set(cacheKey, response);
                }

                // 비용 추적
                if (this.costTracker) {
                    this.costTracker.track({
                        provider: this.config.provider,
                        tokens: response.usage || {},
                        timestamp: new Date().toISOString()
                    });
                }

                this.stats.successfulRequests++;
                
                return {
                    ...response,
                    fromCache: false,
                    timestamp: new Date().toISOString()
                };

            } catch (error) {
                lastError = error;
                console.warn(`AIKit: Attempt ${attempt + 1} failed:`, error.message);
                
                // Auto fallback to next provider
                if (this.config.autoFallback && this.providers.length > 1) {
                    const switched = await this.switchToNextProvider();
                    if (!switched) break;
                } else {
                    // Wait before retry
                    if (attempt < this.config.maxRetries - 1) {
                        await this.sleep(Math.pow(2, attempt) * 1000);
                    }
                }
            }
        }

        this.stats.failedRequests++;
        throw new Error(`AIKit: All attempts failed. Last error: ${lastError.message}`);
    }

    /**
     * API 요청 실행
     * @private
     */
    async makeRequest(message, options) {
        const provider = this.providers[this.currentProviderIndex];
        
        const requestData = {
            message,
            apiKey: provider.apiKey,
            options: {
                ...this.config.options,
                ...options
            }
        };

        return await this.adapter.chat(requestData);
    }

    /**
     * 다음 프로바이더로 전환
     * @private
     */
    async switchToNextProvider() {
        this.currentProviderIndex++;
        
        if (this.currentProviderIndex >= this.providers.length) {
            this.currentProviderIndex = 0;
            return false; // 모든 프로바이더 시도 완료
        }

        const nextProvider = this.providers[this.currentProviderIndex];
        console.log(`AIKit: Switching to provider '${nextProvider.name}'`);
        
        this.adapter = this.loadAdapter(nextProvider.name);
        this.config.provider = nextProvider.name;
        
        return true;
    }

    /**
     * Sleep utility
     * @private
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 비용 리포트 가져오기
     */
    getCostReport() {
        if (!this.costTracker) {
            return { error: 'Cost tracking is disabled' };
        }
        return this.costTracker.getReport();
    }

    /**
     * 통계 가져오기
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * 캐시 초기화
     */
    clearCache() {
        if (this.cache) {
            this.cache.clear();
            return true;
        }
        return false;
    }

    /**
     * 설정 업데이트
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        
        if (newConfig.provider && newConfig.provider !== this.config.provider) {
            this.adapter = this.loadAdapter(newConfig.provider);
        }
    }
}

// Export for different module systems
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = AIKit;
// }
export default AIKit;
