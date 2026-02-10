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
        this.defaultModel = 'gpt-4o-mini';  // ← 변경: gpt-3.5-turbo에서
        
        // 사용 가능한 모델 목록
        this.availableModels = [
            'gpt-4o',
            'gpt-4o-mini',
            'gpt-4-turbo',
            'gpt-3.5-turbo'
        ];
    }

    /**
     * Send chat request to OpenAI
     * @override
     */
    async chat(message, options = {}) {
        const model = options.model || this.defaultModel;
        const apiKey = options.apiKey || this.apiKey;

        if (!apiKey) {
            throw new Error('OpenAI API key is required');
        }

        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ],
                ...options
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }

        const data = await response.json();

        return {
            content: data.choices[0].message.content,
            model: data.model,
            usage: data.usage
        };
    }
}

export default OpenAIAdapter;