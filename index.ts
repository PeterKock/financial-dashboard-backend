import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const server = app.listen(4000, () => {
    console.log("Backend listening on http://localhost:4000");
});

const wss = new WebSocketServer({ server });

const API_KEY = process.env.FINNHUB_API_KEY!;
const SYMBOL = "AAPL";

wss.on("connection", (ws) => {
    console.log("Client connected");

    const sendStockPrice = async () => {
        try {
            const res = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${SYMBOL}&token=${API_KEY}`
            );
            const data = await res.json();

            const price = data.c; // current price from Finnhub

            if (!price) {
                console.warn("No price returned from Finnhub:", data);
                return;
            }

            ws.send(
                JSON.stringify({
                    symbol: SYMBOL,
                    price: price.toString(),
                    time: new Date().toISOString(),
                })
            );
        } catch (error) {
            console.error("Error fetching stock data from Finnhub:", error);
        }
    };

    sendStockPrice().catch(console.error);
    const interval = setInterval(() => {
        sendStockPrice().catch(console.error);
    }, 15000);

    ws.on("close", () => {
        clearInterval(interval);
        console.log("Client disconnected");
    });
});