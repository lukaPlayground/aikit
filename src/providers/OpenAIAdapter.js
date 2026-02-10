/**
 * OpenAIAdapter - Adapter for OpenAI API
 * @class
 * @extends BaseAdapter
 */
import BaseAdapter from './BaseAdapter.js';

class OpenAIAdapter extends BaseAdapter {
    constructor() {
        super();
        this.baseURL = 'https://api.openai.com/v1';
        this.defaultModel = 'gpt-3.5-turbo';
    }

    /**
     * Send chat request to OpenAI
     * @override
     */
    async chat(request) {
        this.validateRequest(request);

        const { message, apiKey, options = {} } = request;

        const requestBody = {
            model: options.model || this.defaultModel,
            messages: this.buildMessages(message, options),
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens || options.max_tokens,
            top_p: options.topP || options.top_p,
            frequency_penalty: options.frequencyPenalty || options.frequency_penalty,
            presence_penalty: options.presencePenalty || options.presence_penalty,
            stream: false
        };

        // Remove undefined values
        Object.keys(requestBody).forEach(key => {
            if (requestBody[key] === undefined) {
                delete requestBody[key];
            }
        });

        const fetchOptions = {
            method: 'POST',
            headers: this.buildHeaders(apiKey),
            body: JSON.stringify(requestBody)
        };

        const rawResponse = await this.withRetry(() => 
            this.makeRequest(`${this.baseURL}/chat/completions`, fetchOptions)
        );

        return this.normalizeResponse(rawResponse);
    }

    /**
     * Build messages array from user message
     * @private
     */
    buildMessages(message, options) {
        const messages = [];

        // Add system message if provided
        if (options.systemMessage) {
            messages.push({
                role: 'system',
                content: options.systemMessage
            });
        }

        // Add conversation history if provided
        if (options.history && Array.isArray(options.history)) {
            messages.push(...options.history);
        }

        // Add current user message
        messages.push({
            role: 'user',
            content: message
        });

        return messages;
    }

    /**
     * Extract text from OpenAI response
     * @override
     */
    extractText(rawResponse) {
        if (!rawResponse.choices || rawResponse.choices.length === 0) {
            throw new Error('Invalid OpenAI response: no choices returned');
        }

        const firstChoice = rawResponse.choices[0];
        return firstChoice.message?.content || '';
    }

    /**
     * Extract usage information
     * @override
     */
    extractUsage(rawResponse) {
        const usage = rawResponse.usage || {};
        
        return {
            promptTokens: usage.prompt_tokens || 0,
            completionTokens: usage.completion_tokens || 0,
            totalTokens: usage.total_tokens || 0,
            // Normalized names for compatibility
            input: usage.prompt_tokens || 0,
            output: usage.completion_tokens || 0,
            total: usage.total_tokens || 0
        };
    }

    /**
     * Extract model name
     * @override
     */
    extractModel(rawResponse) {
        return rawResponse.model || this.defaultModel;
    }

    /**
     * Extract finish reason
     * @override
     */
    extractFinishReason(rawResponse) {
        if (!rawResponse.choices || rawResponse.choices.length === 0) {
            return 'unknown';
        }

        return rawResponse.choices[0].finish_reason || 'unknown';
    }

    /**
     * Stream chat (for future implementation)
     * @param {Object} request - Request object
     * @param {Function} onChunk - Callback for each chunk
     */
    async streamChat(request, onChunk) {
        // TODO: Implement streaming support
        throw new Error('Streaming is not yet implemented for OpenAI adapter');
    }

    /**
     * List available models
     * @param {string} apiKey - API key
     */
    async listModels(apiKey) {
        const fetchOptions = {
            method: 'GET',
            headers: this.buildHeaders(apiKey)
        };

        const response = await this.makeRequest(`${this.baseURL}/models`, fetchOptions);
        
        // Filter to chat models only
        const chatModels = response.data.filter(model => 
            model.id.includes('gpt') || model.id.includes('turbo')
        );

        return chatModels.map(model => ({
            id: model.id,
            created: model.created,
            ownedBy: model.owned_by
        }));
    }

    /**
     * Generate embeddings
     * @param {string} text - Text to embed
     * @param {string} apiKey - API key
     * @param {Object} options - Options
     */
    async createEmbedding(text, apiKey, options = {}) {
        const requestBody = {
            model: options.model || 'text-embedding-ada-002',
            input: text
        };

        const fetchOptions = {
            method: 'POST',
            headers: this.buildHeaders(apiKey),
            body: JSON.stringify(requestBody)
        };

        const response = await this.makeRequest(`${this.baseURL}/embeddings`, fetchOptions);
        
        return {
            embedding: response.data[0].embedding,
            model: response.model,
            usage: response.usage
        };
    }
}

// Export
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = OpenAIAdapter;
// }
export default OpenAIAdapter;
