import express, { Request, Response } from 'express';
import http from 'http';
import { Server as WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.get('/', (_req: Request, res: Response) => {
    res.send('Backend is live 🚀');
});

wss.on('connection', (ws: WebSocket) => {
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
