import React from "react";
import { ChevronDown, Search } from "lucide-react";

export function SearchBar({ value, setValue, category, setCategory, onSubmit, options }) {
  return (
    <div
      className="flex w-full max-w-3xl items-center overflow-hidden rounded-[var(--radius-card)] p-2 shadow-[var(--shadow-floating)]"
      style={{ backgroundColor: "var(--color-surface-primary)" }}
    >
      <div className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-text-primary)] md:min-w-[190px]">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full border-none bg-transparent text-sm text-[var(--color-text-primary)] outline-none"
          aria-label="选择搜索分类"
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
              className="bg-[var(--color-surface-primary)] text-[var(--color-text-primary)]"
            >
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="h-4 w-4 text-[var(--color-text-secondary)]" />
      </div>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSubmit();
          }
        }}
        placeholder="搜索产品名称、系列或功能标签"
        className="min-w-0 flex-1 border-none bg-transparent px-4 py-3 text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
        aria-label="输入搜索关键词"
      />
      <button
        type="button"
        onClick={onSubmit}
        className="rounded-[var(--radius-control)] p-3 text-[#1C1B19] transition active:scale-95"
        style={{ background: "var(--gradient-accent)" }}
        aria-label="提交搜索"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}
