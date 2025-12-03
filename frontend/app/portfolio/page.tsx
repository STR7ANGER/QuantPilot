import Dashboard from "@/components/portfolio_page/Dashboard"
import TokenDashboard from "@/components/portfolio_page/TokenDashboard"
import StockDashboard from "@/components/portfolio_page/StockDashboard"


const page = () => {
  return (
    <div>
        <Dashboard />
        <StockDashboard />
        <TokenDashboard />
    </div>
  )
}

export default page
