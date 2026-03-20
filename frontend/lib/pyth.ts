export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type PriceTick = {
  price: number;
  publishTime: number;
};

const backendBase =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export function getHistoryUrl(params: {
  symbol: string;
  resolution: string;
  from: number;
  to: number;
}) {
  const url = new URL(`${backendBase}/api/pyth/history`);
  url.searchParams.set("symbol", params.symbol);
  url.searchParams.set("resolution", params.resolution);
  url.searchParams.set("from", String(params.from));
  url.searchParams.set("to", String(params.to));
  return url.toString();
}

export function getStreamUrl(ids: string[]) {
  const url = new URL(`${backendBase}/api/pyth/stream`);
  ids.forEach((id) => url.searchParams.append("ids[]", `0x${id}`));
  return url.toString();
}

export async function fetchHistory(params: {
  symbol: string;
  resolution: string;
  from: number;
  to: number;
}): Promise<Candle[]> {
  const res = await fetch(getHistoryUrl(params));
  if (!res.ok) {
    throw new Error(`History error: ${res.status}`);
  }
  const data = await res.json();
  if (!data || data.s !== "ok") return [];
  return data.t.map((t: number, i: number) => ({
    time: t,
    open: data.o[i],
    high: data.h[i],
    low: data.l[i],
    close: data.c[i],
  }));
}

export function parseHermesTick(json: any): PriceTick | null {
  const parsed = json?.parsed?.[0]?.price;
  if (!parsed) return null;
  const priceRaw = Number(parsed.price);
  const expo = Number(parsed.expo || 0);
  const publishTime = Number(parsed.publish_time || parsed.publishTime || 0);
  if (!Number.isFinite(priceRaw)) return null;
  const price = priceRaw * Math.pow(10, expo);
  return { price, publishTime: publishTime || Math.floor(Date.now() / 1000) };
}

export function mergeTickIntoCandles(
  candles: Candle[],
  tick: PriceTick,
  resolutionSeconds: number
) {
  const next = [...candles];
  const last = next[next.length - 1];
  if (!last) {
    next.push({
      time: Math.floor(tick.publishTime / resolutionSeconds) * resolutionSeconds,
      open: tick.price,
      high: tick.price,
      low: tick.price,
      close: tick.price,
    });
    return next;
  }

  const bucket = Math.floor(tick.publishTime / resolutionSeconds) * resolutionSeconds;
  if (bucket > last.time) {
    next.push({
      time: bucket,
      open: tick.price,
      high: tick.price,
      low: tick.price,
      close: tick.price,
    });
    return next;
  }

  if (bucket === last.time) {
    last.close = tick.price;
    last.high = Math.max(last.high, tick.price);
    last.low = Math.min(last.low, tick.price);
  }

  return next;
}
