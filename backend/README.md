# Quant Pilot Backend

Provides API proxies for Pyth and Jupiter plus on-chain trade parsing via Solana RPC.

## Endpoints
- `GET /api/pyth/history` (TradingView history proxy)
- `GET /api/pyth/stream` (Hermes SSE proxy)
- `GET /api/jupiter/quote`
- `POST /api/jupiter/swap`
- `GET /api/trades?wallet=...`

## Setup
1. Copy `.env.example` to `.env` and adjust values.
2. Install dependencies: `npm install`
3. Run: `npm run dev`
