
"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { backendBase } from "@/lib/backend";

type Trade = {
  signature: string;
  blockTime: number | null;
  status: "success" | "failed";
  feeSol: number;
  input: { mint: string; amount: number } | null;
  output: { mint: string; amount: number } | null;
};

const StockDashboard = () => {
  const { publicKey } = useWallet();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    const load = async () => {
      setLoading(true);
      const res = await fetch(
        `${backendBase}/api/trades?wallet=${publicKey.toBase58()}&limit=20`
      );
      const data = await res.json();
      setTrades(data.trades || []);
      setLoading(false);
    };
    load();
  }, [publicKey]);

  return (
    <div className="mt-6 rounded-xl border border-border/60 bg-background/80 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Recent Trades</h3>
        {loading && <span className="text-xs text-muted-foreground">Loading...</span>}
      </div>
      {!publicKey && (
        <p className="mt-3 text-xs text-muted-foreground">Connect wallet to view trades.</p>
      )}
      {publicKey && trades.length === 0 && !loading && (
        <p className="mt-3 text-xs text-muted-foreground">No swaps found yet.</p>
      )}
      <div className="mt-4 space-y-3 text-xs">
        {trades.map((t) => (
          <div key={t.signature} className="rounded-md border border-border/60 p-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t.blockTime
                  ? new Date(t.blockTime * 1000).toLocaleString()
                  : "Pending"}
              </span>
              <span className={t.status === "success" ? "text-emerald-400" : "text-red-400"}>
                {t.status}
              </span>
            </div>
            <div className="mt-2 text-foreground">
              {t.input && t.output ? (
                <>
                  Swapped {t.input.amount} {t.input.mint} → {t.output.amount} {t.output.mint}
                </>
              ) : (
                <>Swap parsed (details unavailable)</>
              )}
            </div>
            <div className="mt-1 text-muted-foreground">Fee: {t.feeSol} SOL</div>
            <div className="mt-1 text-muted-foreground break-all">{t.signature}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockDashboard;
