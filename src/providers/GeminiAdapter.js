/**
 * GeminiAdapter - Adapter for Google Gemini API
 * @class
 * @extends BaseAdapter
 */
import BaseAdapter from './BaseAdapter.js';

class GeminiAdapter extends BaseAdapter {
    constructor() {
        super();
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
        this.defaultModel = 'gemini-pro';
    }

    /**
     * Send chat request to Gemini
     * @override
     */
    async chat(request) {
        this.validateRequest(request);

        const { message, apiKey, options = {} } = request;
        const model = options.model || this.defaultModel;

        const requestBody = {
            contents: this.buildContents(message, options),
            generationConfig: {
                temperature: options.temperature ?? 0.9,
                topK: options.topK || options.top_k,
                topP: (options.topP || options.top_p) ?? 1,
                maxOutputTokens: options.maxTokens || options.max_tokens || options.maxOutputTokens,
                stopSequences: options.stopSequences || options.stop
            }
        };

        // Add safety settings if provided
        if (options.safetySettings) {
            requestBody.safetySettings = options.safetySettings;
        }

        // Remove undefined values
        if (requestBody.generationConfig) {
            Object.keys(requestBody.generationConfig).forEach(key => {
                if (requestBody.generationConfig[key] === undefined) {
                    delete requestBody.generationConfig[key];
                }
            });
        }

        const url = `${this.baseURL}/models/${model}:generateContent?key=${apiKey}`;

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        };

        const rawResponse = await this.withRetry(() => 
            this.makeRequest(url, fetchOptions)
        );

        return this.normalizeResponse(rawResponse);
    }

    /**
     * Build contents array from user message
     * @private
     */
    buildContents(message, options) {
        const contents = [];

        // Add conversation history if provided
        if (options.history && Array.isArray(options.history)) {
            options.history.forEach(msg => {
                contents.push({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                });
            });
        }

        // Add current user message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        return contents;
    }

    /**
     * Extract text from Gemini response
     * @override
     */
    extractText(rawResponse) {
        if (!rawResponse.candidates || rawResponse.candidates.length === 0) {
            throw new Error('Invalid Gemini response: no candidates returned');
        }

        const candidate = rawResponse.candidates[0];
        
        if (!candidate.content || !candidate.content.parts) {
            throw new Error('Invalid Gemini response: no content parts');
        }

        // Combine all text parts
        const textParts = candidate.content.parts
            .filter(part => part.text)
            .map(part => part.text);

        return textParts.join('\n');
    }

    /**
     * Extract usage information
     * @override
     */
    extractUsage(rawResponse) {
        const metadata = rawResponse.usageMetadata || {};
        
        return {
            promptTokens: metadata.promptTokenCount || 0,
            completionTokens: metadata.candidatesTokenCount || 0,
            totalTokens: metadata.totalTokenCount || 0,
            // Normalized names for compatibility
            input: metadata.promptTokenCount || 0,
            output: metadata.candidatesTokenCount || 0,
            total: metadata.totalTokenCount || 0
        };
    }

    /**
     * Extract model name
     * @override
     */
    extractModel(rawResponse) {
        return rawResponse.modelVersion || this.defaultModel;
    }

    /**
     * Extract finish reason
     * @override
     */
    extractFinishReason(rawResponse) {
        if (!rawResponse.candidates || rawResponse.candidates.length === 0) {
            return 'unknown';
        }

        return rawResponse.candidates[0].finishReason || 'STOP';
    }

    /**
     * Stream chat (for future implementation)
     * @param {Object} request - Request object
     * @param {Function} onChunk - Callback for each chunk
     */
    async streamChat(request, onChunk) {
        // TODO: Implement streaming support
        throw new Error('Streaming is not yet implemented for Gemini adapter');
    }

    /**
     * Get available models
     */
    getAvailableModels() {
        return [
            {
                id: 'gemini-pro',
                name: 'Gemini Pro',
                description: 'Best for text generation',
                maxTokens: 8192
            },
            {
                id: 'gemini-pro-vision',
                name: 'Gemini Pro Vision',
                description: 'Multimodal model for text and images',
                maxTokens: 4096
            },
            {
                id: 'gemini-ultra',
                name: 'Gemini Ultra',
                description: 'Most capable model (limited access)',
                maxTokens: 8192
            }
        ];
    }

    /**
     * List models via API
     * @param {string} apiKey - API key
     */
    async listModels(apiKey) {
        const url = `${this.baseURL}/models?key=${apiKey}`;

        const fetchOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const response = await this.makeRequest(url, fetchOptions);
        
        return response.models
            .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
            .map(model => ({
                id: model.name.replace('models/', ''),
                displayName: model.displayName,
                description: model.description,
                inputTokenLimit: model.inputTokenLimit,
                outputTokenLimit: model.outputTokenLimit
            }));
    }

    /**
     * Count tokens
     * @param {string} text - Text to count tokens for
     * @param {string} apiKey - API key
     * @param {string} model - Model name
     */
    async countTokens(text, apiKey, model = this.defaultModel) {
        const url = `${this.baseURL}/models/${model}:countTokens?key=${apiKey}`;

        const requestBody = {
            contents: [{
                role: 'user',
                parts: [{ text }]
            }]
        };

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        };

        const response = await this.makeRequest(url, fetchOptions);
        
        return {
            totalTokens: response.totalTokens || 0
        };
    }

    /**
     * Generate embeddings
     * @param {string} text - Text to embed
     * @param {string} apiKey - API key
     */
    async createEmbedding(text, apiKey) {
        const model = 'embedding-001';
        const url = `${this.baseURL}/models/${model}:embedContent?key=${apiKey}`;

        const requestBody = {
            content: {
                parts: [{ text }]
            }
        };

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        };

        const response = await this.makeRequest(url, fetchOptions);
        
        return {
            embedding: response.embedding.values,
            model: model
        };
    }
}

// Export
//if (typeof module !== 'undefined' && module.exports) {
//    module.exports = GeminiAdapter;
//}
export default GeminiAdapter;
