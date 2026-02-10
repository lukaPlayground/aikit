<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIKit CIBoard Example</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
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
            border-color: #11998e;
        }

        .hint { display: block; margin-top: 0.3rem; font-size: 0.85rem; }
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
        .info a { color: #11998e; text-decoration: none; font-size: 0.9rem; }
        .info a:hover { text-decoration: underline; }

        button {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
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
            box-shadow: 0 5px 20px rgba(17, 153, 142, 0.4);
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
            border-top: 4px solid #11998e;
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
        <h1>🤖 AIKit CIBoard Example</h1>
        <p>Universal AI API Client - CIBoard(CodeIgniter) Integration</p>
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

            <button id="submit-btn">Send Message</button>

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

    <!-- AIKit Chat JS -->
    <?php echo base_url('assets/js/aikit-chat.js'); ?>
    <script src="<?php echo base_url('assets/js/aikit-chat.js'); ?>"></script>
</body>
</html>