import TokenChart from "@/components/perps_page/TokenChart";
import TokenMenu from "@/components/perps_page/TokenMenu";
import TokenSidebar from "@/components/perps_page/TokenSidebar";
import TokenHeader from "@/components/perps_page/TokenHeader";
import TOKEN_DATA from "@/constant/token";

type PageProps = {
  params: { token: string };
};

const page = ({ params }: PageProps) => {
  const key = params.token?.toUpperCase();
  const token = TOKEN_DATA[key as keyof typeof TOKEN_DATA] || TOKEN_DATA.SOL;

  return (
    <div className="px-8 py-6">
      <TokenHeader name={token.name} symbol={token.symbol} base={token.base} />
      <TokenMenu />
      <TokenSidebar />
      <TokenChart title={`${token.base} Perps`} symbol={token.symbol} feedId={token.id} />
    </div>
  );
};

export default page;
