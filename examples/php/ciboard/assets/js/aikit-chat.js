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

// 메시지 전송
async function sendMessage() {
    const provider = document.getElementById('provider').value;
    const model    = document.getElementById('model').value;
    const apiKey   = document.getElementById('apiKey').value.trim();
    const message  = document.getElementById('message').value;

    if (!apiKey) { showError('Please enter an API key'); return; }
    if (!message) { showError('Please enter a message'); return; }

    hideError();
    hideResponse();
    showLoading();
    document.getElementById('submit-btn').disabled = true;

    try {
        // CIBoard는 FormData 방식으로 전송
        const formData = new FormData();
        formData.append('provider', provider);
        formData.append('model', model);
        formData.append('apiKey', apiKey);
        formData.append('message', message);

        const res = await fetch('/aikit/chat', {
            method: 'POST',
            body: formData
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

// UI 헬퍼 함수
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

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('provider').addEventListener('change', updateModels);
    document.getElementById('model').addEventListener('change', updateModelHint);
    document.getElementById('submit-btn').addEventListener('click', sendMessage);
    document.getElementById('message').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.ctrlKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 초기 모델 목록 설정
    updateModels();
});