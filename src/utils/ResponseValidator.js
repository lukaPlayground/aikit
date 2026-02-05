/**
 * ResponseValidator - Validate AI responses based on rules
 * QA-focused validation layer
 * @class
 */
class ResponseValidator {
    constructor() {
        this.rules = new Map();
        this.loadDefaultRules();
    }

    /**
     * Load default validation rules
     * @private
     */
    loadDefaultRules() {
        // Length validation
        this.addRule('maxLength', (response, limit) => {
            const text = this.extractText(response);
            if (text.length > limit) {
                return {
                    valid: false,
                    error: `Response exceeds maximum length (${text.length} > ${limit})`
                };
            }
            return { valid: true };
        });

        this.addRule('minLength', (response, limit) => {
            const text = this.extractText(response);
            if (text.length < limit) {
                return {
                    valid: false,
                    error: `Response below minimum length (${text.length} < ${limit})`
                };
            }
            return { valid: true };
        });

        // Content validation
        this.addRule('mustInclude', (response, keywords) => {
            const text = this.extractText(response).toLowerCase();
            const missing = keywords.filter(kw => !text.includes(kw.toLowerCase()));
            
            if (missing.length > 0) {
                return {
                    valid: false,
                    error: `Response missing required keywords: ${missing.join(', ')}`
                };
            }
            return { valid: true };
        });

        this.addRule('mustNotInclude', (response, keywords) => {
            const text = this.extractText(response).toLowerCase();
            const found = keywords.filter(kw => text.includes(kw.toLowerCase()));
            
            if (found.length > 0) {
                return {
                    valid: false,
                    error: `Response contains forbidden keywords: ${found.join(', ')}`
                };
            }
            return { valid: true };
        });

        // Format validation
        this.addRule('format', (response, format) => {
            const text = this.extractText(response);
            
            const formats = {
                json: () => {
                    try {
                        JSON.parse(text);
                        return { valid: true };
                    } catch (e) {
                        return { valid: false, error: 'Response is not valid JSON' };
                    }
                },
                email: () => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const hasEmail = emailRegex.test(text);
                    return hasEmail 
                        ? { valid: true }
                        : { valid: false, error: 'Response does not contain valid email' };
                },
                url: () => {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const hasUrl = urlRegex.test(text);
                    return hasUrl 
                        ? { valid: true }
                        : { valid: false, error: 'Response does not contain valid URL' };
                },
                number: () => {
                    const hasNumber = /\d+/.test(text);
                    return hasNumber 
                        ? { valid: true }
                        : { valid: false, error: 'Response does not contain numbers' };
                },
                markdown: () => {
                    const hasMarkdown = /[#*_`\[\]]/.test(text);
                    return hasMarkdown 
                        ? { valid: true }
                        : { valid: false, error: 'Response does not contain markdown formatting' };
                }
            };

            const validator = formats[format.toLowerCase()];
            if (!validator) {
                return { valid: false, error: `Unknown format: ${format}` };
            }

            return validator();
        });

        // Language validation
        this.addRule('language', (response, lang) => {
            const text = this.extractText(response);
            
            const patterns = {
                korean: /[가-힣]/,
                english: /[a-zA-Z]/,
                japanese: /[ぁ-んァ-ン]/,
                chinese: /[\u4e00-\u9fff]/,
                numbers: /\d/
            };

            const pattern = patterns[lang.toLowerCase()];
            if (!pattern) {
                return { valid: false, error: `Unknown language: ${lang}` };
            }

            if (!pattern.test(text)) {
                return {
                    valid: false,
                    error: `Response does not contain ${lang} characters`
                };
            }

            return { valid: true };
        });

        // Sentiment validation
        this.addRule('sentiment', (response, expectedSentiment) => {
            const text = this.extractText(response).toLowerCase();
            
            const sentimentWords = {
                positive: ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', '좋', '훌륭', '멋진'],
                negative: ['bad', 'poor', 'terrible', 'awful', 'horrible', '나쁜', '끔찍', '최악'],
                neutral: ['okay', 'fine', 'acceptable', '괜찮', '무난']
            };

            const words = sentimentWords[expectedSentiment.toLowerCase()] || [];
            const hasSentiment = words.some(word => text.includes(word));

            if (!hasSentiment) {
                return {
                    valid: false,
                    error: `Response does not match expected sentiment: ${expectedSentiment}`
                };
            }

            return { valid: true };
        });

        // Custom regex validation
        this.addRule('regex', (response, pattern) => {
            const text = this.extractText(response);
            const regex = new RegExp(pattern);
            
            if (!regex.test(text)) {
                return {
                    valid: false,
                    error: `Response does not match pattern: ${pattern}`
                };
            }
            
            return { valid: true };
        });
    }

    /**
     * Extract text from response object
     * @private
     */
    extractText(response) {
        if (typeof response === 'string') {
            return response;
        }
        
        if (response.text) return response.text;
        if (response.content) return response.content;
        if (response.message) return response.message;
        
        return JSON.stringify(response);
    }

    /**
     * Add custom validation rule
     */
    addRule(name, validator) {
        this.rules.set(name, validator);
    }

    /**
     * Remove validation rule
     */
    removeRule(name) {
        this.rules.delete(name);
    }

    /**
     * Validate response against rules
     */
    validate(response, validationConfig) {
        const errors = [];
        
        for (const [ruleName, ruleValue] of Object.entries(validationConfig)) {
            const validator = this.rules.get(ruleName);
            
            if (!validator) {
                console.warn(`AIKit Validator: Unknown rule '${ruleName}'`);
                continue;
            }

            const result = validator(response, ruleValue);
            
            if (!result.valid) {
                errors.push(result.error);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            validatedAt: new Date().toISOString()
        };
    }

    /**
     * Validate with custom function
     */
    validateCustom(response, customFn) {
        try {
            const result = customFn(response);
            return {
                isValid: result === true || (result && result.valid === true),
                errors: result.errors || (result === false ? ['Custom validation failed'] : []),
                validatedAt: new Date().toISOString()
            };
        } catch (error) {
            return {
                isValid: false,
                errors: [`Custom validation error: ${error.message}`],
                validatedAt: new Date().toISOString()
            };
        }
    }

    /**
     * Get available validation rules
     */
    getAvailableRules() {
        return Array.from(this.rules.keys());
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponseValidator;
}
