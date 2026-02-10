<template>
  <div class="app">
    <header>
      <h1>🤖 AIKit Vue Example</h1>
      <p>Universal AI API Client - Vue Integration</p>
    </header>

    <main class="container">
      <!-- Configuration Panel -->
      <div class="config-panel">
        <h2>Configuration</h2>
        
        <div class="form-group">
          <label>Provider:</label>
          <select v-model="provider">
            <option value="openai">OpenAI</option>
            <option value="claude">Claude (Anthropic)</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </div>

        <!-- 모델 선택 (추가) -->
        <div class="form-group">
          <label>Model:</label>
          <select v-model="model">
            <option v-for="m in availableModels" :key="m.id" :value="m.id">
              {{ m.name }}
            </option>
          </select>
          <small class="hint">{{ modelHint }}</small>
        </div>

        <div class="form-group">
          <label>API Key:</label>
          <input
            v-model="apiKey"
            type="password"
            placeholder="Enter your API key"
          />
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
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <textarea
              v-model="message"
              placeholder="Type your message here..."
              rows="4"
            />
          </div>

          <button 
            type="submit" 
            :disabled="loading || !apiKey || !message"
          >
            {{ loading ? 'Sending...' : 'Send Message' }}
          </button>
        </form>

        <!-- Error Display -->
        <div v-if="error" class="error">
          ❌ {{ error }}
        </div>

        <!-- Response Display -->
        <div v-if="response" class="response">
          <h3>Response:</h3>
          <div class="response-content">
            {{ response }}
          </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Thinking...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const provider = ref('openai');
const model = ref('gpt-4o-mini');
const apiKey = ref('');
const message = ref('');
const response = ref('');
const loading = ref(false);
const error = ref('');

// 모델 목록
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

const availableModels = computed(() => modelOptions[provider.value]);

const modelHint = computed(() => {
  const currentModel = availableModels.value.find(m => m.id === model.value);
  return currentModel?.free ? '✅ 무료' : '💳 크레딧 필요';
});

const updateModels = () => {
  model.value = availableModels.value[0].id;
};

const handleSubmit = async () => {
  if (!apiKey.value) {
    error.value = 'Please enter an API key';
    return;
  }

  loading.value = true;
  error.value = '';
  response.value = '';

  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: provider.value,
        apiKey: apiKey.value.trim(),
        message: message.value,
        options: {
          model: model.value,  // ← 모델 전달
          enableCache: true,
          enableCostTracking: true
        }
      })
    });

    const result = await res.json();
    
    if (result.success) {
      response.value = result.data.content;
    } else {
      error.value = result.error || 'An error occurred';
    }
  } catch (err) {
    error.value = 'Failed to connect to proxy server. Make sure it is running on http://localhost:3000';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
}

header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.config-panel,
.chat-panel {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.config-panel h2,
.chat-panel h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

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
  border-color: #42b883;
}

.info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.info h3 {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #666;
}

.info ul {
  list-style: none;
  padding: 0;
}

.info li {
  margin-bottom: 0.3rem;
}

.info a {
  color: #42b883;
  text-decoration: none;
  font-size: 0.9rem;
}

.info a:hover {
  text-decoration: underline;
}

button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
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
  box-shadow: 0 5px 20px rgba(66, 184, 131, 0.4);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee;
  border-left: 4px solid #f44;
  border-radius: 4px;
  color: #c33;
}

.response {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.response h3 {
  margin-bottom: 1rem;
  color: #333;
}

.response-content {
  line-height: 1.6;
  color: #555;
  white-space: pre-wrap;
}

.loading {
  margin-top: 2rem;
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 1rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }
}

.hint {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: #666;
}
</style>