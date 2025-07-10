import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory store for processed data (in production, use a proper database)
let processedData = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Webhook server is running' });
});

// Webhook endpoint for Clay to send processed data
app.post('/api/webhooks/clay-data', async (req, res) => {
  try {
    console.log('📨 Received webhook from Clay:', JSON.stringify(req.body, null, 2));
    
    const { 
      attendees, 
      eventUrl, 
      profileIntent,
      sessionId,
      ...otherData 
    } = req.body;

    // Validate required fields
    if (!attendees || !Array.isArray(attendees)) {
      return res.status(400).json({ 
        error: 'Missing or invalid attendees data',
        received: Object.keys(req.body)
      });
    }

    // Store the processed data with a key (using eventUrl or sessionId)
    const dataKey = sessionId || eventUrl || Date.now().toString();
    
    const processedPayload = {
      attendees,
      eventUrl,
      profileIntent,
      sessionId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      ...otherData
    };

    processedData.set(dataKey, processedPayload);
    
    // Optional: Save to file for persistence
    try {
      const dataDir = join(__dirname, '..', 'data');
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(
        join(dataDir, `processed-data-${dataKey}.json`),
        JSON.stringify(processedPayload, null, 2)
      );
    } catch (fileError) {
      console.warn('⚠️  Could not save to file:', fileError.message);
    }

    console.log(`✅ Stored processed data for key: ${dataKey}`);
    console.log(`📊 Found ${attendees.length} attendees`);

    res.json({ 
      success: true, 
      message: 'Data received and stored successfully',
      dataKey,
      attendeeCount: attendees.length
    });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Endpoint to get latest processed data (must come before :key route)
app.get('/api/data/latest', (req, res) => {
  if (processedData.size === 0) {
    return res.status(404).json({ error: 'No data available' });
  }

  // Get the most recent entry
  const entries = Array.from(processedData.entries());
  const latestEntry = entries[entries.length - 1];
  const [key, data] = latestEntry;

  console.log(`📤 Frontend requested latest data: ${key}`);
  res.json(data);
});

// Endpoint for frontend to poll for processed data
app.get('/api/data/:key', (req, res) => {
  const { key } = req.params;
  
  if (processedData.has(key)) {
    const data = processedData.get(key);
    console.log(`📤 Frontend requested data for key: ${key}`);
    res.json(data);
  } else {
    res.status(404).json({ 
      error: 'Data not found',
      key,
      available: Array.from(processedData.keys())
    });
  }
});

// Endpoint to list all available data keys
app.get('/api/data', (req, res) => {
  const keys = Array.from(processedData.keys());
  res.json({ 
    keys,
    count: keys.length,
    latest: keys[keys.length - 1] || null
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on http://localhost:${PORT}`);
  console.log(`📡 Clay webhook endpoint: http://localhost:${PORT}/api/webhooks/clay-data`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down webhook server...');
  process.exit(0);
}); 