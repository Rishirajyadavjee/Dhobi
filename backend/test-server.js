import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Test endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is working! ✅',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Dhobi Service API v1.0',
    endpoints: {
      health: 'GET /api/health',
      auth: 'POST /api/auth/login',
      register: 'POST /api/auth/register'
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n✅ TEST SERVER RUNNING!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🧪 Test endpoints:`);
  console.log(`   - http://localhost:${PORT}/`);
  console.log(`   - http://localhost:${PORT}/api/health\n`);
});
