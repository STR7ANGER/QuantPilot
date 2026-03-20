const StockMenu = () => {
  return (
    <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="rounded-full border border-border/60 px-3 py-1">Market</span>
      <span className="rounded-full border border-border/60 px-3 py-1">Limit</span>
      <span className="rounded-full border border-border/60 px-3 py-1">Devnet</span>
    </div>
  );
};

export default StockMenu;
