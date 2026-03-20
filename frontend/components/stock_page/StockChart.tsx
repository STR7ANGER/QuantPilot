import PriceChart from "@/components/charts/PriceChart";

type StockChartProps = {
  title: string;
  symbol: string;
  feedId: string;
};

const StockChart = ({ title, symbol, feedId }: StockChartProps) => {
  return (
    <div className="mt-6">
      <PriceChart title={title} symbol={symbol} feedId={feedId} />
    </div>
  );
};

export default StockChart;
