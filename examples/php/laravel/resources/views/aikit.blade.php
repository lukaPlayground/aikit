<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>AIKit Laravel Example</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #f05340 0%, #e91e63 100%);
            min-height: 100vh;
            padding: 2rem;
        }

        header {
            text-align: center;
            color: white;
            margin-bottom: 2rem;
        }

        header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        header p { font-size: 1.1rem; opacity: 0.9; }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 2rem;
        }

        .config-panel, .chat-panel {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        h2 { margin-bottom: 1.5rem; color: #333; }

        .form-group { margin-bottom: 1.5rem; }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #555;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1rem;
            font-family: inherit;
            transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #f05340;
        }

        .hint {
            display: block;
            margin-top: 0.3rem;
            font-size: 0.85rem;
        }

        .hint.free { color: #4caf50; font-weight: 600; }
        .hint.paid { color: #ff9800; font-weight: 600; }

        .info {
            margin-top: 2rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .info h3 { font-size: 0.9rem; margin-bottom: 0.5rem; color: #666; }
        .info ul { list-style: none; padding: 0; }
        .info li { margin-bottom: 0.3rem; }
        .info a { color: #f05340; text-decoration: none; font-size: 0.9rem; }
        .info a:hover { text-decoration: underline; }

        button {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #f05340 0%, #e91e63 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(240, 83, 64, 0.4);
        }

        button:disabled { opacity: 0.6; cursor: not-allowed; }

        .error {
            margin-top: 1rem;
            padding: 1rem;
            background: #fee;
            border-left: 4px solid #f44;
            border-radius: 4px;
            color: #c33;
            display: none;
        }

        .response {
            margin-top: 2rem;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 8px;
            display: none;
        }

        .response h3 { margin-bottom: 1rem; color: #333; }

        .response-content {
            line-height: 1.6;
            color: #555;
            white-space: pre-wrap;
        }

        .loading {
            margin-top: 2rem;
            text-align: center;
            padding: 2rem;
            display: none;
        }

        .spinner {
            width: 50px;
            height: 50px;
            margin: 0 auto 1rem;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #f05340;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
            .container { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <header>
        <h1>🤖 AIKit Laravel Example</h1>
        <p>Universal AI API Client - Laravel Integration</p>
    </header>

    <main class="container">
        <!-- Configuration Panel -->
        <div class="config-panel">
            <h2>Configuration</h2>

            <div class="form-group">
                <label for="provider">Provider:</label>
                <select id="provider">
                    <option value="openai">OpenAI</option>
                    <option value="claude">Claude (Anthropic)</option>
                    <option value="gemini">Google Gemini</option>
                </select>
            </div>

            <div class="form-group">
                <label for="model">Model:</label>
                <select id="model"></select>
                <small id="model-hint" class="hint"></small>
            </div>

            <div class="form-group">
                <label for="apiKey">API Key:</label>
                <input type="password" id="apiKey" placeholder="Enter your API key">
            </div>

            <div class="info">
                <h3>ℹ️ Get API Keys</h3>
                <ul>
                    <li><a href="https://platform.openai.com/api-keys" target="_blank">OpenAI</a></li>
                    <li><a href="https://console.anthropic.com/" target="_blank">Claude</a></li>
                    <li><a href="https://makersuite.google.com/app/apikey" target="_blank">Gemini</a></li>
                </ul>
            </div>
        </div>

        <!-- Chat Panel -->
        <div class="chat-panel">
            <h2>Chat</h2>

            <div class="form-group">
                <textarea id="message" rows="4" placeholder="Type your message here..."></textarea>
            </div>

            <button id="submit-btn" onclick="sendMessage()">Send Message</button>

            <div id="error" class="error"></div>

            <div id="response" class="response">
                <h3>Response:</h3>
                <div id="response-content" class="response-content"></div>
            </div>

            <div id="loading" class="loading">
                <div class="spinner"></div>
                <p>Thinking...</p>
            </div>
        </div>
    </main>

    <script>
        // 모델 옵션
        const modelOptions = {
            openai: [
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini (빠름, 저렴)', free: true },
                { id: 'gpt-4o', name: 'GPT-4o (최신, 강력)', free: true },
                { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', free: true },
                { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (레거시)', free: true }
            ],
            claude: [
                { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (최신)', free: false },
                { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (빠름)', free: false },
                { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (강력)', free: false }
            ],
            gemini: [
                { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (추천)', free: true },
                { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B (경량)', free: true },
                { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (강력)', free: true },
                { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (실험)', free: true }
            ]
        };

        // 모델 목록 업데이트
        function updateModels() {
            const provider = document.getElementById('provider').value;
            const modelSelect = document.getElementById('model');
            const models = modelOptions[provider];

            modelSelect.innerHTML = '';
            models.forEach(m => {
                const option = document.createElement('option');
                option.value = m.id;
                option.textContent = m.name;
                modelSelect.appendChild(option);
            });

            updateModelHint();
        }

        // 모델 힌트 업데이트
        function updateModelHint() {
            const provider = document.getElementById('provider').value;
            const modelId = document.getElementById('model').value;
            const hint = document.getElementById('model-hint');
            const model = modelOptions[provider].find(m => m.id === modelId);

            if (model) {
                hint.textContent = model.free ? '✅ 무료' : '💳 크레딧 필요';
                hint.className = model.free ? 'hint free' : 'hint paid';
            }
        }

        // 이벤트 리스너
        document.getElementById('provider').addEventListener('change', updateModels);
        document.getElementById('model').addEventListener('change', updateModelHint);

        // 초기 설정
        updateModels();

        // 메시지 전송
        async function sendMessage() {
            const provider = document.getElementById('provider').value;
            const model = document.getElementById('model').value;
            const apiKey = document.getElementById('apiKey').value.trim();
            const message = document.getElementById('message').value;

            if (!apiKey) {
                showError('Please enter an API key');
                return;
            }

            if (!message) {
                showError('Please enter a message');
                return;
            }

            // UI 업데이트
            hideError();
            hideResponse();
            showLoading();
            document.getElementById('submit-btn').disabled = true;

            try {
                const res = await fetch('/aikit/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ provider, model, apiKey, message })
                });

                const result = await res.json();

                if (result.success) {
                    showResponse(result.data.content);
                } else {
                    showError(result.error || 'An error occurred');
                }
            } catch (err) {
                showError('Failed to send request: ' + err.message);
            } finally {
                hideLoading();
                document.getElementById('submit-btn').disabled = false;
            }
        }

        function showError(msg) {
            const el = document.getElementById('error');
            el.textContent = '❌ ' + msg;
            el.style.display = 'block';
        }

        function hideError() {
            document.getElementById('error').style.display = 'none';
        }

        function showResponse(content) {
            document.getElementById('response-content').textContent = content;
            document.getElementById('response').style.display = 'block';
        }

        function hideResponse() {
            document.getElementById('response').style.display = 'none';
        }

        function showLoading() {
            document.getElementById('loading').style.display = 'block';
        }

        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
        }

        // Enter로 전송
        document.getElementById('message').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.ctrlKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    </script>
</body>
</html>