import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env.local if it exists, otherwise from .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
}));

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend listening on http://0.0.0.0:${PORT}`);
});

const wss = new WebSocketServer({ 
    server,
    path: "/ws",
    clientTracking: true
});

const API_KEY = process.env.FINNHUB_API_KEY!;
const SYMBOLS = ["AAPL", "GOOG", "TSLA"]; // Multiple symbols supported

wss.on("connection", (ws) => {
    console.log("Client connected");

    const fetchStockPrice = async (symbol: string) => {
        try {
            const res = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
            );
            const data = await res.json();

            const price = data.c;

            if (!price) {
                console.warn(`No price returned for ${symbol}:`, data);
                return null; // Gracefully skip symbol if no price
            }

            return {
                symbol,
                price: price,
                time: new Date().toISOString(),
            };
        } catch (error) {
            console.error(`Error fetching ${symbol} data from Finnhub:`, error);
            return null; // Ensure robustness even on errors
        }
    };

    const sendStockPrices = async () => {
        const stockPromises = SYMBOLS.map(fetchStockPrice);
        const stocks = await Promise.all(stockPromises);

        const validStocks = stocks.filter((stock) => stock !== null);

        if (validStocks.length > 0) {
            ws.send(JSON.stringify(validStocks));
        } else {
            console.warn("No valid stock data retrieved.");
        }
    };

    // Send immediately upon connection, then every 15 seconds
    sendStockPrices().catch(console.error);
    const interval = setInterval(() => {
        sendStockPrices().catch(console.error);
    }, 15000);

    ws.on("close", () => {
        clearInterval(interval);
        console.log("Client disconnected");
    });
});