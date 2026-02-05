/**
 * BaseAdapter - Base class for all AI provider adapters
 * Defines the interface that all adapters must implement
 * @class
 */
class BaseAdapter {
    constructor() {
        if (new.target === BaseAdapter) {
            throw new Error('BaseAdapter is an abstract class and cannot be instantiated directly');
        }
    }

    /**
     * Send chat request to AI provider
     * Must be implemented by subclasses
     * @abstract
     * @param {Object} request - Request object
     * @param {string} request.message - User message
     * @param {string} request.apiKey - API key
     * @param {Object} request.options - Additional options
     * @returns {Promise<Object>} Normalized response
     */
    async chat(request) {
        throw new Error('chat() must be implemented by subclass');
    }

    /**
     * Normalize response to standard format
     * @protected
     * @param {Object} rawResponse - Raw API response
     * @returns {Object} Normalized response
     */
    normalizeResponse(rawResponse) {
        return {
            text: this.extractText(rawResponse),
            raw: rawResponse,
            usage: this.extractUsage(rawResponse),
            model: this.extractModel(rawResponse),
            finishReason: this.extractFinishReason(rawResponse)
        };
    }

    /**
     * Extract text from raw response
     * @abstract
     * @protected
     */
    extractText(rawResponse) {
        throw new Error('extractText() must be implemented by subclass');
    }

    /**
     * Extract usage information from raw response
     * @abstract
     * @protected
     */
    extractUsage(rawResponse) {
        throw new Error('extractUsage() must be implemented by subclass');
    }

    /**
     * Extract model name from raw response
     * @abstract
     * @protected
     */
    extractModel(rawResponse) {
        throw new Error('extractModel() must be implemented by subclass');
    }

    /**
     * Extract finish reason from raw response
     * @abstract
     * @protected
     */
    extractFinishReason(rawResponse) {
        throw new Error('extractFinishReason() must be implemented by subclass');
    }

    /**
     * Build request headers
     * @protected
     * @param {string} apiKey - API key
     * @returns {Object} Headers object
     */
    buildHeaders(apiKey) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };
    }

    /**
     * Make HTTP request
     * @protected
     * @param {string} url - API endpoint URL
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    async makeRequest(url, options) {
        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `HTTP ${response.status}: ${errorData.error?.message || response.statusText}`
                );
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to reach API endpoint');
            }
            throw error;
        }
    }

    /**
     * Validate request parameters
     * @protected
     * @param {Object} request - Request object
     */
    validateRequest(request) {
        if (!request.message || typeof request.message !== 'string') {
            throw new Error('Message is required and must be a string');
        }

        if (!request.apiKey || typeof request.apiKey !== 'string') {
            throw new Error('API key is required and must be a string');
        }

        if (request.message.trim().length === 0) {
            throw new Error('Message cannot be empty');
        }
    }

    /**
     * Handle rate limiting with exponential backoff
     * @protected
     * @param {Function} fn - Function to retry
     * @param {number} maxRetries - Maximum retry attempts
     * @returns {Promise<any>} Function result
     */
    async withRetry(fn, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                
                // Check if it's a rate limit error
                const isRateLimit = error.message.includes('429') || 
                                   error.message.includes('rate limit');
                
                if (!isRateLimit) throw error;

                // Exponential backoff
                const delay = Math.pow(2, i) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * Get provider name
     * @returns {string} Provider name
     */
    getProviderName() {
        return this.constructor.name.replace('Adapter', '').toLowerCase();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseAdapter;
}
