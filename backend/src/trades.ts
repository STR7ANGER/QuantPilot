import { PublicKey } from "@solana/web3.js";
import { getConnection } from "./solana.js";

const DEFAULT_JUPITER_PROGRAMS = [
  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
  "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB",
];

function getJupiterProgramIds() {
  const raw = process.env.JUPITER_PROGRAM_IDS;
  if (!raw) return DEFAULT_JUPITER_PROGRAMS;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export type ParsedTrade = {
  signature: string;
  blockTime: number | null;
  status: "success" | "failed";
  feeSol: number;
  input: { mint: string; amount: number } | null;
  output: { mint: string; amount: number } | null;
};

export async function getTradesForWallet(wallet: string, limit = 20) {
  const connection = getConnection();
  const walletKey = new PublicKey(wallet);
  const signatures = await connection.getSignaturesForAddress(walletKey, {
    limit,
  });

  const jupiterPrograms = new Set(getJupiterProgramIds());
  const trades: ParsedTrade[] = [];

  for (const sig of signatures) {
    const tx = await connection.getTransaction(sig.signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    if (!tx) continue;
    if (!tx.transaction) continue;

    const message = tx.transaction.message;
    const accountKeys = message.getAccountKeys({
      accountKeysFromLookups: tx.meta?.loadedAddresses,
    });
    const hasJupiter = message.compiledInstructions.some((ix) => {
      const programId = accountKeys.get(ix.programIdIndex)?.toBase58();
      return programId ? jupiterPrograms.has(programId) : false;
    });

    if (!hasJupiter) continue;

    const meta = tx.meta;
    const feeSol = meta?.fee ? meta.fee / 1e9 : 0;
    const status = meta?.err ? "failed" : "success";

    const tokenDeltas = new Map<string, number>();
    const pre = meta?.preTokenBalances || [];
    const post = meta?.postTokenBalances || [];

    for (const postBal of post) {
      if (postBal.owner !== wallet) continue;
      const preBal = pre.find(
        (p) => p.owner === wallet && p.mint === postBal.mint
      );
      const preAmount = preBal?.uiTokenAmount.uiAmount || 0;
      const postAmount = postBal.uiTokenAmount.uiAmount || 0;
      const delta = postAmount - preAmount;
      tokenDeltas.set(postBal.mint, (tokenDeltas.get(postBal.mint) || 0) + delta);
    }

    const walletIndex = accountKeys
      .staticAccountKeys.concat(accountKeys.accountKeysFromLookups || [])
      .findIndex((k) => k.equals(walletKey));
    if (walletIndex >= 0 && meta?.preBalances && meta?.postBalances) {
      const preLamports = meta.preBalances[walletIndex] || 0;
      const postLamports = meta.postBalances[walletIndex] || 0;
      const deltaSol = (postLamports - preLamports) / 1e9;
      if (deltaSol !== 0) {
        tokenDeltas.set("SOL", (tokenDeltas.get("SOL") || 0) + deltaSol);
      }
    }

    const deltas = Array.from(tokenDeltas.entries());
    const negatives = deltas.filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1]);
    const positives = deltas.filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);

    trades.push({
      signature: sig.signature,
      blockTime: tx.blockTime ?? null,
      status,
      feeSol,
      input: negatives.length ? { mint: negatives[0][0], amount: Math.abs(negatives[0][1]) } : null,
      output: positives.length ? { mint: positives[0][0], amount: positives[0][1] } : null,
    });
  }

  return trades;
}
