export function ShopPlaque({
  shopNumber,
  floor,
  className = "",
}: {
  shopNumber: string;
  floor?: string | null;
  className?: string;
}) {
  return (
    <span className={`shop-plaque ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-signal-500 shrink-0" />
      {shopNumber}
      {floor ? <span className="text-ink-soft">· {floor}</span> : null}
    </span>
  );
}
