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
        this.defaultModel = 'gemini-1.5-flash';  // ← 변경
        
        // 사용 가능한 모델 목록
        this.availableModels = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-8b',
            'gemini-1.5-pro',
            'gemini-2.0-flash-exp'
        ];
    }

    /**
     * Send chat request to Gemini
     * @override
     */
    async chat(message, options = {}) {
        const model = options.model || this.defaultModel;
        const apiKey = options.apiKey || this.apiKey;

        if (!apiKey) {
            throw new Error('Gemini API key is required');
        }

        const url = `${this.baseURL}/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }

        const data = await response.json();
        
        return {
            content: data.candidates[0].content.parts[0].text,
            model: model
        };
    }
}

export default GeminiAdapter;