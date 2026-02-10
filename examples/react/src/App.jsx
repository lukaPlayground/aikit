import { useState } from 'react';
import AIKit from '@lukaplayground/aikit';
import './App.css';

function App() {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const aikit = new AIKit({
        provider: provider,
        apiKey: apiKey,
        enableCache: true,
        enableCostTracking: true
      });

      const result = await aikit.chat(message);
      setResponse(result.content);
    } catch (err) {
      setError(err.message || 'An error occurred');
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
            <label>API Key:</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
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
        </div>
      </main>
    </div>
  );
}

export default App;