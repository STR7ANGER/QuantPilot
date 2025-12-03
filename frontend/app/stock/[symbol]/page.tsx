import StockHeader from "@/components/stock_page/StockHeader"
import StockMenu from "@/components/stock_page/StockMenu"
import StockSidebar from "@/components/stock_page/StockSidebar"
import StockChart from "@/components/stock_page/StockChart"


const page = () => {
  return (
    <div>
      <StockHeader />
      <StockMenu />
      <StockSidebar />
      <StockChart />
    </div>
  )
}

export default page
