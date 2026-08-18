"use client";

export default function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="neu-pressed flex items-center gap-2.5 rounded-[14px] px-[15px] py-[11px]">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A907C" strokeWidth={2.2} strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M16.5 16.5L21 21" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-[190px] border-none bg-transparent text-[13px] font-semibold text-[#3A342B] outline-none placeholder:text-[#9A907C]"
      />
    </div>
  );
}
