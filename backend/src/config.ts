import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  solanaRpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
  pythHermesHttp: process.env.PYTH_HERMES_HTTP || "https://hermes.pyth.network",
  pythBenchmarksHttp:
    process.env.PYTH_BENCHMARKS_HTTP || "https://benchmarks.pyth.network",
  jupiterApiBase: process.env.JUPITER_API_BASE || "https://quote-api.jup.ag/v6",
};
