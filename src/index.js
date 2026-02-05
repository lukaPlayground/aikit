// Import all modules
const modules = {
    CacheManager: require('./utils/CacheManager.js'),
    CostTracker: require('./utils/CostTracker.js'),
    ResponseValidator: require('./utils/ResponseValidator.js'),
    BaseAdapter: require('./providers/BaseAdapter.js'),
    OpenAIAdapter: require('./providers/OpenAIAdapter.js'),
    ClaudeAdapter: require('./providers/ClaudeAdapter.js'),
    GeminiAdapter: require('./providers/GeminiAdapter.js'),
    AIKit: require('./core/AIKit.js')
};

// Attach to global for browser usage
if (typeof window !== 'undefined') {
    Object.assign(window, modules);
}

// Export for module systems
module.exports = modules.AIKit;
module.exports.default = modules.AIKit;
Object.assign(module.exports, modules);
