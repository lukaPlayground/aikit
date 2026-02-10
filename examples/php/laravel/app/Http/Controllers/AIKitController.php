<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class AIKitController extends Controller
{
    private $client;

    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 30,
        ]);
    }

    /**
     * AIKit 채팅 페이지
     */
    public function index()
    {
        return view('aikit');
    }

    /**
     * AIKit 채팅 요청 처리
     */
    public function chat(Request $request)
    {
        // 입력값 검증
        $validated = $request->validate([
            'provider' => 'required|string|in:openai,claude,gemini',
            'model'    => 'required|string',
            'apiKey'   => 'required|string',
            'message'  => 'required|string|max:5000',
        ]);

        try {
            // AI API 직접 호출
            $response = $this->callAIAPI(
                $validated['provider'],
                $validated['model'],
                $validated['apiKey'],
                $validated['message']
            );

            return response()->json([
                'success' => true,
                'data'    => $response
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * AI API 호출
     */
    private function callAIAPI($provider, $model, $apiKey, $message)
    {
        switch ($provider) {
            case 'openai':
                return $this->callOpenAI($model, $apiKey, $message);
            case 'claude':
                return $this->callClaude($model, $apiKey, $message);
            case 'gemini':
                return $this->callGemini($model, $apiKey, $message);
            default:
                throw new \Exception("Unknown provider: {$provider}");
        }
    }

    /**
     * OpenAI API 호출
     */
    private function callOpenAI($model, $apiKey, $message)
    {
        $response = $this->client->post('https://api.openai.com/v1/chat/completions', [
            'headers' => [
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type'  => 'application/json',
            ],
            'json' => [
                'model'    => $model,
                'messages' => [
                    ['role' => 'user', 'content' => $message]
                ],
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        return [
            'content' => $data['choices'][0]['message']['content'],
            'model'   => $data['model'],
            'usage'   => $data['usage'],
        ];
    }

    /**
     * Claude API 호출
     */
    private function callClaude($model, $apiKey, $message)
    {
        $response = $this->client->post('https://api.anthropic.com/v1/messages', [
            'headers' => [
                'x-api-key'         => $apiKey,
                'anthropic-version' => '2023-06-01',
                'Content-Type'      => 'application/json',
            ],
            'json' => [
                'model'      => $model,
                'max_tokens' => 1024,
                'messages'   => [
                    ['role' => 'user', 'content' => $message]
                ],
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        return [
            'content' => $data['content'][0]['text'],
            'model'   => $data['model'],
            'usage'   => $data['usage'],
        ];
    }

    /**
     * Gemini API 호출
     */
    private function callGemini($model, $apiKey, $message)
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $response = $this->client->post($url, [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'contents' => [
                    ['parts' => [['text' => $message]]]
                ],
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        return [
            'content' => $data['candidates'][0]['content']['parts'][0]['text'],
            'model'   => $model,
        ];
    }
}