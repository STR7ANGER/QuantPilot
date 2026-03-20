import PriceChart from "@/components/charts/PriceChart";

type TokenChartProps = {
  title: string;
  symbol: string;
  feedId: string;
};

const TokenChart = ({ title, symbol, feedId }: TokenChartProps) => {
  return (
    <div className="mt-6">
      <PriceChart title={title} symbol={symbol} feedId={feedId} />
    </div>
  );
};

export default TokenChart;
