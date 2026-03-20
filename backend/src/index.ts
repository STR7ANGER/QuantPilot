import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { getTradesForWallet } from "./trades.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.get("/api/pyth/history", async (req, res) => {
  try {
    const url = new URL(
      `${config.pythBenchmarksHttp}/v1/shims/tradingview/history`
    );

    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, v));
      } else if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const upstream = await fetch(url.toString());
    const data = await upstream.text();
    res.status(upstream.status).type(upstream.headers.get("content-type") || "application/json").send(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "History proxy error" });
  }
});

app.get("/api/pyth/stream", async (req, res) => {
  try {
    const url = new URL(`${config.pythHermesHttp}/v2/updates/price/stream`);
    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, v));
      } else if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const upstream = await fetch(url.toString(), {
      headers: { Accept: "text/event-stream" },
    });

    if (!upstream.ok || !upstream.body) {
      res.status(502).json({ error: "Upstream stream error" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    upstream.body.pipeTo(
      new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
        abort() {
          res.end();
        },
      }) as any
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Stream proxy error" });
  }
});

app.get("/api/jupiter/quote", async (req, res) => {
  try {
    const url = new URL(`${config.jupiterApiBase}/quote`);
    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, v));
      } else if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const upstream = await fetch(url.toString());
    const data = await upstream.text();
    res.status(upstream.status).type(upstream.headers.get("content-type") || "application/json").send(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Jupiter quote error" });
  }
});

app.post("/api/jupiter/swap", async (req, res) => {
  try {
    const url = new URL(`${config.jupiterApiBase}/swap`);
    const upstream = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.text();
    res.status(upstream.status).type(upstream.headers.get("content-type") || "application/json").send(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Jupiter swap error" });
  }
});

app.get("/api/trades", async (req, res) => {
  try {
    const wallet = String(req.query.wallet || "");
    const limit = Number(req.query.limit || 20);
    if (!wallet) {
      res.status(400).json({ error: "wallet is required" });
      return;
    }
    const trades = await getTradesForWallet(wallet, Math.min(limit, 50));
    res.json({ wallet, trades });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Trade parsing error" });
  }
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${config.port}`);
});
