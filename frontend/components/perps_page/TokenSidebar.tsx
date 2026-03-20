const TokenSidebar = () => {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
      <div className="rounded-lg border border-border/60 p-4">
        <p className="text-xs text-muted-foreground">Leverage</p>
        <p className="text-lg font-semibold">Up to 5x</p>
      </div>
      <div className="rounded-lg border border-border/60 p-4">
        <p className="text-xs text-muted-foreground">Funding</p>
        <p className="text-lg font-semibold">Devnet</p>
      </div>
    </div>
  );
};

export default TokenSidebar;
