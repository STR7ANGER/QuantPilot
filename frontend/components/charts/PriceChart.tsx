"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import { Candle, fetchHistory, getStreamUrl, mergeTickIntoCandles, parseHermesTick } from "@/lib/pyth";

const RESOLUTIONS = [
  { label: "1m", value: "1", seconds: 60 },
  { label: "5m", value: "5", seconds: 300 },
  { label: "1h", value: "60", seconds: 3600 },
  { label: "1d", value: "1D", seconds: 86400 },
];

type PriceChartProps = {
  title: string;
  symbol: string;
  feedId: string;
};

export default function PriceChart({ title, symbol, feedId }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const lookbackSeconds = useMemo(() => resolution.seconds * 500, [resolution]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: "#0b0f14" },
        textColor: "#cbd5e1",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      rightPriceScale: { borderColor: "#1f2937" },
      timeScale: { borderColor: "#1f2937" },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData(candles);
  }, [candles]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setStatus("loading");
        setError(null);
        const now = Math.floor(Date.now() / 1000);
        const from = now - lookbackSeconds;
        const data = await fetchHistory({
          symbol,
          resolution: resolution.value,
          from,
          to: now,
        });
        if (!cancelled) {
          setCandles(data);
          setStatus("idle");
        }
      } catch (err: any) {
        if (!cancelled) {
          setStatus("error");
          setError(err?.message || "Failed to load history");
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [symbol, resolution, lookbackSeconds]);

  useEffect(() => {
    if (!feedId) return;
    const url = getStreamUrl([feedId]);
    const source = new EventSource(url);

    source.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data);
        const tick = parseHermesTick(json);
        if (!tick) return;
        setCandles((prev) =>
          mergeTickIntoCandles(prev, tick, resolution.seconds)
        );
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      source.close();
    };
  }, [feedId, resolution.seconds]);

  return (
    <div className="w-full rounded-xl border border-border/50 bg-background/80 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{symbol}</p>
        </div>
        <div className="flex items-center gap-2">
          {RESOLUTIONS.map((r) => (
            <button
              key={r.label}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                r.label === resolution.label
                  ? "border-emerald-500 text-emerald-400"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setResolution(r)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {status === "error" && (
        <div className="text-sm text-red-400 mb-3">{error}</div>
      )}
      {status === "loading" && (
        <div className="text-sm text-muted-foreground mb-3">Loading history...</div>
      )}

      <div ref={containerRef} className="w-full" />
    </div>
  );
}
