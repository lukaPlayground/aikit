/**
 * ClaudeAdapter - Adapter for Anthropic Claude API
 * @class
 * @extends BaseAdapter
 */
import BaseAdapter from './BaseAdapter.js';

class ClaudeAdapter extends BaseAdapter {
    constructor() {
        super();
        this.baseURL = 'https://api.anthropic.com/v1';
        this.defaultModel = 'claude-3-5-sonnet-20241022';  // ← 변경
        this.apiVersion = '2023-06-01';
        
        // 사용 가능한 모델 목록
        this.availableModels = [
            'claude-3-5-sonnet-20241022',
            'claude-3-5-haiku-20241022',
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307'
        ];
    }

    /**
     * Send chat request to Claude
     * @override
     */
    async chat(message, options = {}) {
        const model = options.model || this.defaultModel;
        const apiKey = options.apiKey || this.apiKey;
        const maxTokens = options.maxTokens || 1024;

        if (!apiKey) {
            throw new Error('Claude API key is required');
        }

        const response = await fetch(`${this.baseURL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': this.apiVersion
            },
            body: JSON.stringify({
                model: model,
                max_tokens: maxTokens,
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }

        const data = await response.json();

        return {
            content: data.content[0].text,
            model: data.model,
            usage: {
                input_tokens: data.usage.input_tokens,
                output_tokens: data.usage.output_tokens
            }
        };
    }

    /**
     * Estimate token count (Claude uses characters)
     * @private
     */
    estimateTokens(text) {
        // Claude roughly: 1 token ≈ 4 characters for English
        const avgCharsPerToken = text.match(/[a-zA-Z0-9_]/g) ? 4 : 3;
        return Math.ceil(text.length / avgCharsPerToken);
    }
}

export default ClaudeAdapter;