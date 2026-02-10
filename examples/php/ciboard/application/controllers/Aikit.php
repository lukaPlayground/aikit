<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * AIKit Controller for CIBoard
 * 
 * CIBoard(CodeIgniter)에서 AIKit을 사용하는 예제
 * @package AIKit
 */
class Aikit extends CI_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
    }

    /**
     * 채팅 페이지
     */
    public function index()
    {
        $this->load->view('aikit/index');
    }

    /**
     * 채팅 요청 처리
     * POST /aikit/chat
     */
    public function chat()
    {
        // AJAX 요청만 허용
        if ( ! $this->input->is_ajax_request()) {
            show_error('Direct access not allowed', 403);
        }

        // 입력값 가져오기
        $provider = $this->input->post('provider');
        $model    = $this->input->post('model');
        $api_key  = trim($this->input->post('apiKey'));
        $message  = $this->input->post('message');

        // 유효성 검사
        if (empty($provider) || empty($model) || empty($api_key) || empty($message)) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'error'   => 'All fields are required'
                ]));
            return;
        }

        // 허용된 provider 확인
        $allowed_providers = ['openai', 'claude', 'gemini'];
        if ( ! in_array($provider, $allowed_providers)) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'error'   => 'Invalid provider'
                ]));
            return;
        }

        try {
            // AI API 호출
            $result = $this->call_ai_api($provider, $model, $api_key, $message);

            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'data'    => $result
                ]));

        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'error'   => $e->getMessage()
                ]));
        }
    }

    /**
     * AI API 호출 분기
     */
    private function call_ai_api($provider, $model, $api_key, $message)
    {
        switch ($provider) {
            case 'openai':
                return $this->call_openai($model, $api_key, $message);
            case 'claude':
                return $this->call_claude($model, $api_key, $message);
            case 'gemini':
                return $this->call_gemini($model, $api_key, $message);
            default:
                throw new Exception("Unknown provider: {$provider}");
        }
    }

    /**
     * OpenAI API 호출 (cURL)
     */
    private function call_openai($model, $api_key, $message)
    {
        $url  = 'https://api.openai.com/v1/chat/completions';
        $data = [
            'model'    => $model,
            'messages' => [
                ['role' => 'user', 'content' => $message]
            ]
        ];

        $response = $this->curl_post($url, $data, [
            'Authorization: Bearer ' . $api_key,
            'Content-Type: application/json'
        ]);

        return [
            'content' => $response['choices'][0]['message']['content'],
            'model'   => $response['model'],
            'usage'   => $response['usage']
        ];
    }

    /**
     * Claude API 호출 (cURL)
     */
    private function call_claude($model, $api_key, $message)
    {
        $url  = 'https://api.anthropic.com/v1/messages';
        $data = [
            'model'      => $model,
            'max_tokens' => 1024,
            'messages'   => [
                ['role' => 'user', 'content' => $message]
            ]
        ];

        $response = $this->curl_post($url, $data, [
            'x-api-key: ' . $api_key,
            'anthropic-version: 2023-06-01',
            'Content-Type: application/json'
        ]);

        return [
            'content' => $response['content'][0]['text'],
            'model'   => $response['model'],
            'usage'   => $response['usage']
        ];
    }

    /**
     * Gemini API 호출 (cURL)
     */
    private function call_gemini($model, $api_key, $message)
    {
        $url  = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$api_key}";
        $data = [
            'contents' => [
                ['parts' => [['text' => $message]]]
            ]
        ];

        $response = $this->curl_post($url, $data, [
            'Content-Type: application/json'
        ]);

        return [
            'content' => $response['candidates'][0]['content']['parts'][0]['text'],
            'model'   => $model
        ];
    }

    /**
     * cURL POST 공통 함수
     * Laravel의 Guzzle 대신 CIBoard에서는 cURL 직접 사용
     */
    private function curl_post($url, $data, $headers)
    {
        $ch = curl_init($url);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($data),
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => true
        ]);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);

        if ($curl_error) {
            throw new Exception("cURL Error: {$curl_error}");
        }

        $decoded = json_decode($response, true);

        if ($http_code !== 200) {
            $error_msg = $decoded['error']['message'] ?? "HTTP Error: {$http_code}";
            throw new Exception($error_msg);
        }

        return $decoded;
    }
}