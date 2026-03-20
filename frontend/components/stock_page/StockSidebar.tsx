
const StockSidebar = () => {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
      <div className="rounded-lg border border-border/60 p-4">
        <p className="text-xs text-muted-foreground">Market</p>
        <p className="text-lg font-semibold">US Equities</p>
      </div>
      <div className="rounded-lg border border-border/60 p-4">
        <p className="text-xs text-muted-foreground">Data</p>
        <p className="text-lg font-semibold">Pyth</p>
      </div>
    </div>
  );
};

export default StockSidebar;
