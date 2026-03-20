import StockHeader from "@/components/stock_page/StockHeader";
import StockMenu from "@/components/stock_page/StockMenu";
import StockSidebar from "@/components/stock_page/StockSidebar";
import StockChart from "@/components/stock_page/StockChart";
import SYMBOL_DATA from "@/constant/symbol";

type PageProps = {
  params: { symbol: string };
};

const page = ({ params }: PageProps) => {
  const key = params.symbol?.toUpperCase();
  const stock = SYMBOL_DATA[key as keyof typeof SYMBOL_DATA] || SYMBOL_DATA.AAPL;

  return (
    <div className="px-8 py-6">
      <StockHeader name={stock.name} symbol={stock.symbol} base={stock.base} />
      <StockMenu />
      <StockSidebar />
      <StockChart title={`${stock.base} Stock`} symbol={stock.symbol} feedId={stock.id} />
    </div>
  );
};

export default page;
