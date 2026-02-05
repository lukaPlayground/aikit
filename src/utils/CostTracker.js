/**
 * CostTracker - Track API usage costs
 * @class
 */
class CostTracker {
    constructor(options = {}) {
        this.storageKey = options.storageKey || 'aikit_cost_tracker';
        this.storage = typeof window !== 'undefined' && window.localStorage 
            ? window.localStorage 
            : new Map();
        
        // 토큰당 가격 (USD) - 2024년 기준 근사치
        this.pricing = {
            openai: {
                'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
                'gpt-4-turbo': { input: 0.01 / 1000, output: 0.03 / 1000 },
                'gpt-3.5-turbo': { input: 0.0005 / 1000, output: 0.0015 / 1000 }
            },
            claude: {
                'claude-3-opus': { input: 0.015 / 1000, output: 0.075 / 1000 },
                'claude-3-sonnet': { input: 0.003 / 1000, output: 0.015 / 1000 },
                'claude-3-haiku': { input: 0.00025 / 1000, output: 0.00125 / 1000 }
            },
            gemini: {
                'gemini-pro': { input: 0.00025 / 1000, output: 0.0005 / 1000 },
                'gemini-ultra': { input: 0.0005 / 1000, output: 0.001 / 1000 }
            }
        };

        this.loadData();
    }

    /**
     * Load existing tracking data
     * @private
     */
    loadData() {
        try {
            if (this.storage instanceof Map) {
                this.data = this.storage.get(this.storageKey) || this.initializeData();
            } else {
                const stored = this.storage.getItem(this.storageKey);
                this.data = stored ? JSON.parse(stored) : this.initializeData();
            }
        } catch (error) {
            console.warn('AIKit CostTracker: Error loading data', error);
            this.data = this.initializeData();
        }
    }

    /**
     * Initialize empty data structure
     * @private
     */
    initializeData() {
        return {
            total: 0,
            byProvider: {},
            byModel: {},
            requests: [],
            startDate: new Date().toISOString()
        };
    }

    /**
     * Save tracking data
     * @private
     */
    saveData() {
        try {
            if (this.storage instanceof Map) {
                this.storage.set(this.storageKey, this.data);
            } else {
                this.storage.setItem(this.storageKey, JSON.stringify(this.data));
            }
        } catch (error) {
            console.warn('AIKit CostTracker: Error saving data', error);
        }
    }

    /**
     * Track a request
     * @param {Object} request
     */
    track(request) {
        const { provider, model, tokens = {}, timestamp } = request;
        
        // Calculate cost
        const cost = this.calculateCost(provider, model, tokens);
        
        // Update totals
        this.data.total += cost;
        
        // Update by provider
        if (!this.data.byProvider[provider]) {
            this.data.byProvider[provider] = 0;
        }
        this.data.byProvider[provider] += cost;
        
        // Update by model
        const modelKey = `${provider}:${model || 'default'}`;
        if (!this.data.byModel[modelKey]) {
            this.data.byModel[modelKey] = 0;
        }
        this.data.byModel[modelKey] += cost;
        
        // Add to request history (keep last 100)
        this.data.requests.push({
            provider,
            model,
            tokens,
            cost,
            timestamp: timestamp || new Date().toISOString()
        });
        
        if (this.data.requests.length > 100) {
            this.data.requests.shift();
        }
        
        this.saveData();
        
        return cost;
    }

    /**
     * Calculate cost for a request
     * @private
     */
    calculateCost(provider, model, tokens) {
        const providerPricing = this.pricing[provider.toLowerCase()];
        if (!providerPricing) {
            console.warn(`AIKit CostTracker: Unknown provider '${provider}'`);
            return 0;
        }

        // Find matching model pricing
        let modelPricing;
        if (model) {
            const modelKey = Object.keys(providerPricing).find(key => 
                model.toLowerCase().includes(key)
            );
            modelPricing = providerPricing[modelKey];
        }
        
        // Fallback to first available pricing
        if (!modelPricing) {
            modelPricing = Object.values(providerPricing)[0];
        }

        const inputCost = (tokens.input || tokens.prompt_tokens || 0) * modelPricing.input;
        const outputCost = (tokens.output || tokens.completion_tokens || 0) * modelPricing.output;
        
        return inputCost + outputCost;
    }

    /**
     * Get cost report
     */
    getReport() {
        const daysSinceStart = Math.ceil(
            (new Date() - new Date(this.data.startDate)) / (1000 * 60 * 60 * 24)
        );

        return {
            total: this.data.total.toFixed(4),
            totalUSD: `$${this.data.total.toFixed(4)}`,
            byProvider: Object.entries(this.data.byProvider).reduce((acc, [key, value]) => {
                acc[key] = `$${value.toFixed(4)}`;
                return acc;
            }, {}),
            byModel: Object.entries(this.data.byModel).reduce((acc, [key, value]) => {
                acc[key] = `$${value.toFixed(4)}`;
                return acc;
            }, {}),
            totalRequests: this.data.requests.length,
            averageCostPerRequest: this.data.requests.length > 0 
                ? `$${(this.data.total / this.data.requests.length).toFixed(6)}`
                : '$0',
            dailyAverage: `$${(this.data.total / Math.max(daysSinceStart, 1)).toFixed(4)}`,
            startDate: this.data.startDate,
            lastRequest: this.data.requests.length > 0 
                ? this.data.requests[this.data.requests.length - 1].timestamp
                : null
        };
    }

    /**
     * Get recent requests
     */
    getRecentRequests(limit = 10) {
        return this.data.requests.slice(-limit).reverse();
    }

    /**
     * Reset all tracking data
     */
    reset() {
        this.data = this.initializeData();
        this.saveData();
    }

    /**
     * Update pricing for a provider/model
     */
    updatePricing(provider, model, inputPrice, outputPrice) {
        if (!this.pricing[provider]) {
            this.pricing[provider] = {};
        }
        
        this.pricing[provider][model] = {
            input: inputPrice,
            output: outputPrice
        };
    }

    /**
     * Export data as JSON
     */
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    /**
     * Import data from JSON
     */
    importData(jsonString) {
        try {
            this.data = JSON.parse(jsonString);
            this.saveData();
            return true;
        } catch (error) {
            console.error('AIKit CostTracker: Error importing data', error);
            return false;
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CostTracker;
}
