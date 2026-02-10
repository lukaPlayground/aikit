import express from 'express';
import cors from 'cors';
import AIKit from '@lukaplayground/aikit';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AIKit Proxy Server is running',
    endpoints: {
      chat: 'POST /api/chat',
      health: 'GET /'
    }
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { provider, apiKey, message, options = {} } = req.body;

    // Validation
    if (!provider || !apiKey || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: provider, apiKey, message' 
      });
    }

    // API 키 정리 (공백, 개행 제거)
    const cleanApiKey = apiKey.trim();

    // API 키 형식 검증
    if (cleanApiKey.length < 20) {
      return res.status(400).json({ 
        error: 'Invalid API key format' 
      });
    }

    console.log(`[${new Date().toISOString()}] Chat request - Provider: ${provider}`);

    // Create AIKit instance
    const aikit = new AIKit({
      provider,
      apiKey: cleanApiKey,  // ← trim된 키 사용
      enableCache: options.enableCache !== false,
      enableCostTracking: options.enableCostTracking !== false,
      ...options
    });

    const result = await aikit.chat(message);

    console.log(`[${new Date().toISOString()}] Chat response received`);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);
    
    res.status(500).json({ 
      success: false,
      error: error.message || 'An error occurred'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   AIKit Proxy Server                  ║
║   Running on http://localhost:${PORT}  ║
║                                       ║
║   Endpoints:                          ║
║   • GET  /                            ║
║   • POST /api/chat                    ║
╚═══════════════════════════════════════╝
  `);
});