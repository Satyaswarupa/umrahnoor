export default function PageHeader({
  crumb,
  title,
  subtitle,
  children,
}: {
  crumb: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 px-1 pt-1">
      <div>
        <div className="text-[11px] font-extrabold tracking-[0.14em] text-[#9A907C]">{crumb}</div>
        <h1 className="mt-[7px] text-[27px] font-extrabold tracking-tight text-[#24201A]">{title}</h1>
        <p className="mt-[7px] text-[13.5px] text-[#7A705E]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
