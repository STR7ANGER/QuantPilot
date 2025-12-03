import TokenChart from "@/components/perps_page/TokenChart"
import TokenMenu from "@/components/perps_page/TokenMenu"
import TokenSidebar from "@/components/perps_page/TokenSidebar"
import TokenHeader from "@/components/perps_page/TokenHeader"


const page = () => {
  return (
    <div>
        <TokenHeader />
        <TokenMenu />
        <TokenSidebar />
        <TokenChart />
    </div>
  )
}

export default page
