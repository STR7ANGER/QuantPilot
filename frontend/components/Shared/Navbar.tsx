"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  RefreshCw,
  LineChart,
  CandlestickChart,
  Wallet,
} from "lucide-react";
import { WalletButton } from "../WalletButton";

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/home", label: "Home", icon: Home, active: pathname === "/home" },
    { href: "/swap", label: "Swap", icon: RefreshCw, active: pathname.startsWith("/swap") },
    { href: "/perps/SOL", label: "Perps", icon: LineChart, active: pathname.startsWith("/perps") },
    { href: "/stock/AAPL", label: "Stock", icon: CandlestickChart, active: pathname.startsWith("/stock") },
    { href: "/portfolio", label: "Portfolio", icon: Wallet, active: pathname.startsWith("/portfolio") },
  ];

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <Link href="/home" className="text-xl font-semibold tracking-tight hover:text-emerald-400 transition-colors">
        Quant Pilot
      </Link>

      <nav className="flex-1 flex justify-center">
        <ul className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    item.active
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <WalletButton />
    </div>
  );
};

export default Navbar;
