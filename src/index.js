// Import all modules
import CacheManager from './utils/CacheManager.js';
import CostTracker from './utils/CostTracker.js';
import ResponseValidator from './utils/ResponseValidator.js';
import BaseAdapter from './providers/BaseAdapter.js';
import OpenAIAdapter from './providers/OpenAIAdapter.js';
import ClaudeAdapter from './providers/ClaudeAdapter.js';
import GeminiAdapter from './providers/GeminiAdapter.js';
import AIKit from './core/AIKit.js';

// Attach utilities to AIKit for easy access
AIKit.CacheManager = CacheManager;
AIKit.CostTracker = CostTracker;
AIKit.ResponseValidator = ResponseValidator;
AIKit.BaseAdapter = BaseAdapter;
AIKit.OpenAIAdapter = OpenAIAdapter;
AIKit.ClaudeAdapter = ClaudeAdapter;
AIKit.GeminiAdapter = GeminiAdapter;

// Attach to global for browser usage
if (typeof window !== 'undefined') {
    window.AIKit = AIKit;
}

// Default export only
export default AIKit;
