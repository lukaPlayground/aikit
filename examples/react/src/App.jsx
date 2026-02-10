import { useState, useEffect } from 'react';
import './App.css';

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

function App() {
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableModels = modelOptions[provider];
  const currentModel = availableModels.find(m => m.id === model);

  // Provider 변경 시 첫 번째 모델로 설정
  useEffect(() => {
    setModel(modelOptions[provider][0].id);
  }, [provider]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey) {
      setError('Please enter an API key');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: provider,
          apiKey: apiKey.trim(),
          message: message,
          options: {
            model: model,
            enableCache: true,
            enableCostTracking: true
          }
        })
      });

      const result = await res.json();
      
      if (result.success) {
        setResponse(result.data.content);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to connect to proxy server. Make sure it is running on http://localhost:3000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>🤖 AIKit React Example</h1>
        <p>Universal AI API Client - React Integration</p>
      </header>

      <main className="container">
        <div className="config-panel">
          <h2>Configuration</h2>
          
          <div className="form-group">
            <label>Provider:</label>
            <select 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="openai">OpenAI</option>
              <option value="claude">Claude (Anthropic)</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          <div className="form-group">
            <label>Model:</label>
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
            >
              {availableModels.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <small className={`hint ${currentModel?.free ? 'free' : 'paid'}`}>
              {currentModel?.free ? '✅ 무료' : '💳 크레딧 필요'}
            </small>
          </div>

          <div className="form-group">
            <label>API Key:</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
          </div>

          <div className="info">
            <h3>ℹ️ Get API Keys</h3>
            <ul>
              <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI</a></li>
              <li><a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">Claude</a></li>
              <li><a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Gemini</a></li>
            </ul>
          </div>
        </div>

        <div className="chat-panel">
          <h2>Chat</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !apiKey || !message}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          {error && (
            <div className="error">
              ❌ {error}
            </div>
          )}

          {response && (
            <div className="response">
              <h3>Response:</h3>
              <div className="response-content">
                {response}
              </div>
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Thinking...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;