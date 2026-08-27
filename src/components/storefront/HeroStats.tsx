export function HeroStats({
  stats,
  surface,
  line,
  ink,
  soft,
}: {
  stats: { label: string; value: string }[];
  surface: string;
  line: string;
  ink: string;
  soft: string;
}) {
  return (
    <dl className="grid grid-cols-3 gap-px" style={{ background: line }}>
      {stats.map((s) => (
        <div key={s.label} className="p-4" style={{ background: surface }}>
          <dd className="font-tabular text-xl leading-none" style={{ color: ink }}>
            {s.value}
          </dd>
          <dt className="text-[10px] tracking-widest uppercase mt-1.5" style={{ color: soft }}>
            {s.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
