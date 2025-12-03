"use client";

import { Button } from "../ui/button";
import { WalletButton } from "../WalletButton";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  const isHome = pathname === "/home";
  const isSwap = pathname.startsWith("/swap");
  const isPerps = pathname.startsWith("/perps");
  const isStock = pathname.startsWith("/stock");
  const isPortfolio = pathname.startsWith("/portfolio");

  return (
    <div className="flex justify-between items-center p-2 border-b">
      <h1 className="text-2xl font-bold">Quant Pilot</h1>
      <ul>
        <li className="flex gap-2">
          <Link href="/home">
            <Button className="cursor-pointer" variant={isHome ? "default" : "outline"}>Home</Button>
          </Link>
          <Link href="/swap">
            <Button className="cursor-pointer" variant={isSwap ? "default" : "outline"}>Swap</Button>
          </Link>
          <Link href="/perps/SOL">
            <Button className="cursor-pointer" variant={isPerps ? "default" : "outline"}>Perps</Button>
          </Link>
          <Link href="/stock/AAPL">
            <Button className="cursor-pointer" variant={isStock ? "default" : "outline"}>Stock</Button>
          </Link>
          <Link href="/portfolio">
            <Button className="cursor-pointer" variant={isPortfolio ? "default" : "outline"}>Portfolio</Button>
          </Link>
        </li>
      </ul>
      <WalletButton />
    </div>
  );
};

export default Navbar;
