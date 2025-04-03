const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
    res.send('Backend is live 🚀');
});

wss.on('connection', (ws) => {
    console.log('🟢 WebSocket client connected');
    const interval = setInterval(() => {
        const mockData = {
            symbol: 'FAKE',
            price: (Math.random() * 1000).toFixed(2),
            time: new Date().toISOString()
        };
        ws.send(JSON.stringify(mockData));
    }, 2000);

    ws.on('close', () => {
        console.log('🔴 WebSocket client disconnected');
        clearInterval(interval);
    });
});

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});