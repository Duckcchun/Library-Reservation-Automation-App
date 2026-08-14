import { IC } from "./icons"
import type { LibraryInfo } from "@/utils/parseNames"
import { getLibraryColor, normalizeLibraryName } from "@/constants/library"

type LibraryEntry = {
  lib: LibraryInfo
  index: number
}

type NameListProps = {
  filtered: LibraryEntry[]
  totalCount: number
  query: string
  duplicates: Set<string>
  onQueryChange: (query: string) => void
  onRemove: (index: number) => void
}

export function NameList({
  filtered,
  totalCount,
  query,
  duplicates,
  onQueryChange,
  onRemove,
}: NameListProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(139,92,246,0.1)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{
          background: "linear-gradient(135deg,rgba(124,58,237,0.04),rgba(99,102,241,0.04))",
          borderBottom: "1px solid rgba(139,92,246,0.08)",
        }}
      >
        <span style={{ fontSize: 13, color: "#4c1d95" }} className="font-semibold">
          회원 명단
          <span style={{ color: "#a78bfa", fontWeight: 400 }} className="ml-1.5">
            도서관순
          </span>
        </span>
        <div className="flex items-center gap-2">
          {query && (
            <span style={{ fontSize: 11, color: "#7c3aed" }} className="font-medium">
              {filtered.length}/{totalCount}
            </span>
          )}
          <span
            className="text-white font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", fontSize: 11 }}
          >
            {totalCount}
          </span>
        </div>
      </div>

      <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(139,92,246,0.07)" }}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(139,92,246,0.12)" }}
        >
          <div className="w-3.5 h-3.5 shrink-0" style={{ color: "#a78bfa" }}>
            <IC.Search />
          </div>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="이름 또는 도서관 검색..."
            style={{
              fontSize: 13,
              color: "#1e1b4b",
              background: "transparent",
              outline: "none",
              width: "100%",
            }}
            className="placeholder:text-violet-300"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: "#c4b5fd" }}
            >
              <IC.X />
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1">
        <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
          {filtered.length === 0 ? (
            <p className="text-center py-8" style={{ fontSize: 13, color: "#c4b5fd" }}>
              &quot;{query}&quot;에 해당하는 항목이 없습니다
            </p>
          ) : (
            filtered.map(({ lib, index }, i) => {
              const isDup = duplicates.has(lib.user)
              const normalizedLibrary = normalizeLibraryName(lib.name)
              const libraryColor = getLibraryColor(normalizedLibrary)
              
              return (
                <div
                  key={`${index}-${lib.user}`}
                  className="group flex items-center gap-3 px-5 py-3 transition-all duration-300 hover:bg-purple-50/50 hover:translate-x-1"
                  style={{ borderBottom: "1px solid rgba(139,92,246,0.06)" }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "#c4b5fd",
                      width: 22,
                      textAlign: "right",
                      flexShrink: 0,
                      fontFamily: "'Inter',monospace",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 flex flex-col">
                    <span style={{ fontSize: 14, color: "#1e1b4b", fontWeight: 500 }}>
                      {lib.user}
                    </span>
                    <span 
                      style={{ 
                        fontSize: 11, 
                        color: libraryColor, 
                        fontWeight: 600,
                        marginTop: 2
                      }}
                    >
                      {normalizedLibrary}
                    </span>
                  </div>
                  {isDup && (
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{
                        fontSize: 10,
                        background: "rgba(245,158,11,0.1)",
                        color: "#d97706",
                        fontWeight: 600,
                      }}
                    >
                      <div className="w-3 h-3">
                        <IC.Warning />
                      </div>
                      중복
                    </span>
                  )}
                  <button
                    onClick={() => onRemove(index)}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-50/20 hover:text-red-500 hover:scale-110"
                    style={{ color: "#c4b5fd" }}
                    title="삭제"
                  >
                    <div className="w-3 h-3">
                      <IC.X />
                    </div>
                  </button>
                </div>
              )
            })
          )}
        </div>
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 rounded-b-2xl"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))" }}
        />
      </div>
    </div>
  )
}
