import React from "react";
import { ChevronDown, Search } from "lucide-react";

export function SearchBar({
  value,
  setValue,
  category,
  setCategory,
  onSubmit,
  options,
  variant = "light",
  placeholder = "搜索产品名称、系列或功能标签",
}) {
  const isDark = variant === "dark";
  const shellStyle = isDark
    ? { backgroundColor: "rgba(12, 16, 24, 0.92)", boxShadow: "0 28px 72px rgba(0, 0, 0, 0.34)" }
    : { background: "var(--gradient-card)" };
  const categoryStyle = isDark
    ? { backgroundColor: "rgba(255, 255, 255, 0.04)", borderColor: "rgba(255, 255, 255, 0.08)" }
    : { backgroundColor: "var(--color-surface-secondary)", borderColor: "rgba(27, 28, 28, 0.08)" };
  const buttonStyle = isDark ? { backgroundColor: "#4453a7" } : { background: "var(--gradient-accent)" };
  const textClassName = isDark ? "text-white" : "text-[var(--color-text-primary)]";
  const mutedClassName = isDark ? "text-white/58" : "text-[var(--color-text-secondary)]";
  const dividerClassName = isDark ? "bg-white/8" : "bg-[rgba(27,28,28,0.08)]";
  const inputClassName = isDark
    ? "min-w-0 flex-1 border-none bg-transparent px-1 py-3 text-base text-white outline-none placeholder:text-white/45"
    : "min-w-0 flex-1 border-none bg-transparent px-1 py-3 text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]";

  return (
    <div
      className="flex w-full max-w-4xl items-center gap-3 overflow-hidden rounded-[30px] border p-3"
      style={{
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "transparent",
        ...shellStyle,
      }}
    >
      <div
        data-testid="search-bar-category-shell"
        className={`ml-1 flex min-w-[220px] flex-col rounded-[22px] border px-4 py-3 text-sm md:min-w-[240px] ${textClassName}`}
        style={categoryStyle}
      >
        <span className={`text-[10px] tracking-[0.24em] ${mutedClassName}`}>搜索范围</span>
        <div className="relative mt-1 w-full">
          <select
            data-testid="search-bar-category-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={`w-full appearance-none border-none bg-transparent pr-8 text-left text-[1.05rem] font-semibold outline-none ${textClassName}`}
            aria-label="选择搜索分类"
          >
            {options.map((option) => (
              <option
                key={option}
                value={option}
                className={isDark ? "bg-[#121722] text-white" : "bg-[var(--color-surface-primary)] text-[var(--color-text-primary)]"}
              >
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className={`pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedClassName}`} />
        </div>
      </div>

      <div className={`hidden h-12 w-px shrink-0 md:block ${dividerClassName}`} />

      <div className="flex min-w-0 flex-1 items-center">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit();
            }
          }}
          placeholder={placeholder}
          className={inputClassName}
          aria-label="输入搜索关键词"
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="mr-1 rounded-[22px] px-5 py-5 text-white transition active:scale-95"
        style={buttonStyle}
        aria-label="提交搜索"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}

export default SearchBar;
