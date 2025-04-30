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

// Rate limiting setup
const CALLS_PER_MINUTE_LIMIT = 55; // Keep a small buffer below the 60 limit
const apiCalls: number[] = [];
const POLLING_INTERVAL = 15000; // 15 seconds

function canMakeApiCall(callsNeeded: number): boolean {
    const now = Date.now();
    // Remove calls older than 1 minute
    const oneMinuteAgo = now - 60000;
    while (apiCalls.length > 0 && apiCalls[0] < oneMinuteAgo) {
        apiCalls.shift();
    }
    return apiCalls.length + callsNeeded <= CALLS_PER_MINUTE_LIMIT;
}

function trackApiCall() {
    apiCalls.push(Date.now());
}

wss.on("connection", (ws) => {
    console.log("Client connected");

    const fetchStockPrice = async (symbol: string) => {
        try {
            // Check if we can make the API call
            if (!canMakeApiCall(1)) {
                console.warn(`Rate limit approaching, skipping fetch for ${symbol}`);
                return null;
            }

            const res = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
            );
            
            // Track the API call
            trackApiCall();

            const data = await res.json();

            // Check for rate limit response
            if (res.status === 429) {
                console.warn('Rate limit exceeded, waiting for reset');
                return null;
            }

            const price = data.c;

            if (!price) {
                console.warn(`No price returned for ${symbol}:`, data);
                return null;
            }

            return {
                symbol,
                price: price,
                time: new Date().toISOString(),
            };
        } catch (error) {
            console.error(`Error fetching ${symbol} data from Finnhub:`, error);
            return null;
        }
    };

    const sendStockPrices = async () => {
        // Check if we can make all needed API calls
        if (!canMakeApiCall(SYMBOLS.length)) {
            console.warn('Approaching rate limit, skipping this update cycle');
            return;
        }

        const stockPromises = SYMBOLS.map(fetchStockPrice);
        const stocks = await Promise.all(stockPromises);

        const validStocks = stocks.filter((stock) => stock !== null);

        if (validStocks.length > 0) {
            ws.send(JSON.stringify(validStocks));
        } else {
            console.warn("No valid stock data retrieved.");
        }
    };

    // Send immediately upon connection, then every POLLING_INTERVAL milliseconds
    sendStockPrices().catch(console.error);
    const interval = setInterval(() => {
        sendStockPrices().catch(console.error);
    }, POLLING_INTERVAL);

    ws.on("close", () => {
        clearInterval(interval);
        console.log("Client disconnected");
    });
});