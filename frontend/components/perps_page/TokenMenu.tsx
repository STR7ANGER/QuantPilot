const TokenMenu = () => {
  return (
    <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="rounded-full border border-border/60 px-3 py-1">Isolated</span>
      <span className="rounded-full border border-border/60 px-3 py-1">Cross</span>
      <span className="rounded-full border border-border/60 px-3 py-1">Devnet</span>
    </div>
  );
};

export default TokenMenu;
