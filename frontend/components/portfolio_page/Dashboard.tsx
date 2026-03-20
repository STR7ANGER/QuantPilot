"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

type TokenBalance = {
  mint: string;
  amount: number;
};

const Dashboard = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [airdropStatus, setAirdropStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;

    const loadBalances = async () => {
      const lamports = await connection.getBalance(publicKey);
      setSolBalance(lamports / LAMPORTS_PER_SOL);

      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
        }
      );
      const parsed = tokenAccounts.value.map((acc) => {
        const info: any = acc.account.data.parsed.info;
        return {
          mint: info.mint,
          amount: Number(info.tokenAmount.uiAmount || 0),
        };
      });
      setTokens(parsed.filter((t) => t.amount > 0));
    };

    loadBalances();
  }, [publicKey, connection]);

  const handleAirdrop = async () => {
    if (!publicKey) return;
    try {
      setAirdropStatus("Requesting airdrop...");
      const sig = await connection.requestAirdrop(
        publicKey,
        1 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(sig, "confirmed");
      setAirdropStatus("Airdrop confirmed.");
      const lamports = await connection.getBalance(publicKey);
      setSolBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err: any) {
      setAirdropStatus(err?.message || "Airdrop failed.");
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-background/80 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Portfolio</h2>
          <p className="text-xs text-muted-foreground">
            {publicKey ? publicKey.toBase58() : "Connect wallet to view balances"}
          </p>
        </div>
        <button
          onClick={handleAirdrop}
          disabled={!publicKey}
          className="px-4 py-2 rounded-md text-sm border border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
        >
          Airdrop 1 SOL
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg border border-border/60 p-4">
          <p className="text-xs text-muted-foreground">SOL Balance</p>
          <p className="text-lg font-semibold">
            {solBalance !== null ? solBalance.toFixed(4) : "--"}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 p-4">
          <p className="text-xs text-muted-foreground">Token Accounts</p>
          <p className="text-lg font-semibold">{tokens.length}</p>
        </div>
      </div>

      {airdropStatus && (
        <p className="mt-3 text-xs text-muted-foreground">{airdropStatus}</p>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-foreground mb-2">Tokens</h3>
        {tokens.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tokens yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-xs">
            {tokens.map((t) => (
              <div key={t.mint} className="rounded-md border border-border/60 p-3">
                <p className="text-muted-foreground">{t.mint}</p>
                <p className="text-foreground font-semibold">{t.amount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
