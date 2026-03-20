type StockHeaderProps = {
  name: string;
  symbol: string;
  base: string;
};

const StockHeader = ({ name, symbol, base }: StockHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{name}</h1>
        <p className="text-sm text-muted-foreground">{symbol}</p>
      </div>
      <div className="rounded-lg border border-border/60 px-3 py-1 text-xs text-muted-foreground">
        Stock • {base}
      </div>
    </div>
  );
};

export default StockHeader;
