"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { backendBase } from "@/lib/backend";

const DEFAULT_INPUT = {
  symbol: "SOL",
  mint: "So11111111111111111111111111111111111111112",
};

const DEFAULT_OUTPUT = {
  symbol: "USDC",
  mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
};

const SwapDialog = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [inputMint, setInputMint] = useState(DEFAULT_INPUT.mint);
  const [outputMint, setOutputMint] = useState(DEFAULT_OUTPUT.mint);
  const [amount, setAmount] = useState("0.1");
  const [slippageBps, setSlippageBps] = useState("50");
  const [quote, setQuote] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);

  const fetchQuote = async () => {
    setStatus("Fetching quote...");
    const amountLamports = Math.floor(Number(amount) * 1e9);
    const res = await fetch(
      `${backendBase}/api/jupiter/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=${slippageBps}`
    );
    const data = await res.json();
    setQuote(data);
    setStatus(res.ok ? "Quote loaded." : data.error || "Quote error.");
  };

  const executeSwap = async () => {
    if (!publicKey || !quote) return;
    try {
      setStatus("Building swap transaction...");
      const res = await fetch(`${backendBase}/api/jupiter/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey.toBase58(),
          wrapAndUnwrapSol: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Swap build failed.");
        return;
      }
      const swapTx = VersionedTransaction.deserialize(
        Buffer.from(data.swapTransaction, "base64")
      );
      setStatus("Signing...");
      const sig = await sendTransaction(swapTx, connection);
      setStatus(`Submitted: ${sig}`);
    } catch (err: any) {
      setStatus(err?.message || "Swap failed.");
    }
  };

  return (
    <div className="px-8 py-6">
      <div className="max-w-xl rounded-xl border border-border/60 bg-background/80 p-6">
        <h2 className="text-lg font-semibold text-foreground">Swap (Devnet)</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Uses Jupiter routes on Devnet. Update mint addresses if needed.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Input Mint</label>
            <input
              value={inputMint}
              onChange={(e) => setInputMint(e.target.value)}
              className="mt-1 w-full rounded-md border border-border/60 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Output Mint</label>
            <input
              value={outputMint}
              onChange={(e) => setOutputMint(e.target.value)}
              className="mt-1 w-full rounded-md border border-border/60 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Amount</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-md border border-border/60 bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Slippage (bps)</label>
              <input
                value={slippageBps}
                onChange={(e) => setSlippageBps(e.target.value)}
                className="mt-1 w-full rounded-md border border-border/60 bg-transparent px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchQuote}
              className="px-4 py-2 rounded-md text-sm border border-border/60 hover:text-foreground"
            >
              Get Quote
            </button>
            <button
              onClick={executeSwap}
              disabled={!publicKey || !quote}
              className="px-4 py-2 rounded-md text-sm border border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
            >
              Swap
            </button>
          </div>
        </div>

        {quote?.outAmount && (
          <p className="mt-4 text-xs text-muted-foreground">
            Quote out amount: {quote.outAmount}
          </p>
        )}
        {status && <p className="mt-2 text-xs text-muted-foreground">{status}</p>}
      </div>
    </div>
  );
};

export default SwapDialog;
