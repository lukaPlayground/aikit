/**
 * ClaudeAdapter - Adapter for Anthropic Claude API
 * @class
 * @extends BaseAdapter
 */
class ClaudeAdapter extends BaseAdapter {
    constructor() {
        super();
        this.baseURL = 'https://api.anthropic.com/v1';
        this.defaultModel = 'claude-3-sonnet-20240229';
        this.apiVersion = '2023-06-01';
    }

    /**
     * Send chat request to Claude
     * @override
     */
    async chat(request) {
        this.validateRequest(request);

        const { message, apiKey, options = {} } = request;

        const requestBody = {
            model: options.model || this.defaultModel,
            messages: this.buildMessages(message, options),
            max_tokens: options.maxTokens || options.max_tokens || 1024,
            temperature: options.temperature ?? 1.0,
            top_p: options.topP || options.top_p,
            top_k: options.topK || options.top_k,
            stream: false
        };

        // Add system message if provided
        if (options.systemMessage) {
            requestBody.system = options.systemMessage;
        }

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
            this.makeRequest(`${this.baseURL}/messages`, fetchOptions)
        );

        return this.normalizeResponse(rawResponse);
    }

    /**
     * Build headers for Claude API
     * @override
     */
    buildHeaders(apiKey) {
        return {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': this.apiVersion
        };
    }

    /**
     * Build messages array from user message
     * @private
     */
    buildMessages(message, options) {
        const messages = [];

        // Add conversation history if provided
        if (options.history && Array.isArray(options.history)) {
            // Claude uses 'user' and 'assistant' roles
            messages.push(...options.history.map(msg => ({
                role: msg.role === 'system' ? 'user' : msg.role,
                content: msg.content
            })));
        }

        // Add current user message
        messages.push({
            role: 'user',
            content: message
        });

        return messages;
    }

    /**
     * Extract text from Claude response
     * @override
     */
    extractText(rawResponse) {
        if (!rawResponse.content || rawResponse.content.length === 0) {
            throw new Error('Invalid Claude response: no content returned');
        }

        // Claude can return multiple content blocks
        const textBlocks = rawResponse.content
            .filter(block => block.type === 'text')
            .map(block => block.text);

        return textBlocks.join('\n');
    }

    /**
     * Extract usage information
     * @override
     */
    extractUsage(rawResponse) {
        const usage = rawResponse.usage || {};
        
        return {
            promptTokens: usage.input_tokens || 0,
            completionTokens: usage.output_tokens || 0,
            totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
            // Normalized names for compatibility
            input: usage.input_tokens || 0,
            output: usage.output_tokens || 0,
            total: (usage.input_tokens || 0) + (usage.output_tokens || 0)
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
        return rawResponse.stop_reason || 'unknown';
    }

    /**
     * Stream chat (for future implementation)
     * @param {Object} request - Request object
     * @param {Function} onChunk - Callback for each chunk
     */
    async streamChat(request, onChunk) {
        // TODO: Implement streaming support
        throw new Error('Streaming is not yet implemented for Claude adapter');
    }

    /**
     * Get model information
     */
    getAvailableModels() {
        return [
            {
                id: 'claude-3-opus-20240229',
                name: 'Claude 3 Opus',
                description: 'Most powerful model, best for complex tasks',
                maxTokens: 4096
            },
            {
                id: 'claude-3-sonnet-20240229',
                name: 'Claude 3 Sonnet',
                description: 'Balanced performance and speed',
                maxTokens: 4096
            },
            {
                id: 'claude-3-haiku-20240307',
                name: 'Claude 3 Haiku',
                description: 'Fastest model, best for simple tasks',
                maxTokens: 4096
            },
            {
                id: 'claude-2.1',
                name: 'Claude 2.1',
                description: 'Previous generation model',
                maxTokens: 4096
            }
        ];
    }

    /**
     * Count tokens (approximate)
     * Claude's tokenization is similar to GPT but not identical
     * This is a rough estimate
     */
    estimateTokens(text) {
        // Rough estimate: ~4 characters per token for English
        // ~2 characters per token for code
        const avgCharsPerToken = text.match(/[a-zA-Z0-9_]/g) ? 4 : 3;
        return Math.ceil(text.length / avgCharsPerToken);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClaudeAdapter;
}
