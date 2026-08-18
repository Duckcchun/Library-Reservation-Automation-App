import { useState, KeyboardEvent } from "react"
import { IC } from "./icons"

type ManualInputProps = {
  onAdd: (names: string[]) => void
}

export function ManualInput({ onAdd }: ManualInputProps) {
  const [input, setInput] = useState("")

  const handleAdd = () => {
    const trimmed = input.trim()
    if (!trimmed) return

    // 쉼표, 줄바꿈, 공백으로 구분된 여러 이름 지원
    const names = trimmed
      .split(/[,\n]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0)

    if (names.length > 0) {
      onAdd(names)
      setInput("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
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
          ✏️ 수기 입력
          <span style={{ color: "#a78bfa", fontWeight: 400 }} className="ml-1.5">
            이름 직접 추가
          </span>
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div
          className="flex flex-col gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={"이름을 입력하세요\n여러 명은 쉼표(,)로 구분\n예: 홍길동, 김철수, 이영희"}
            rows={3}
            className="w-full px-4 py-3 rounded-xl resize-none placeholder:text-violet-300"
            style={{
              fontSize: 14,
              color: "#1e1b4b",
              background: "rgba(124,58,237,0.04)",
              border: "1px solid rgba(139,92,246,0.15)",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.08)"
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(139,92,246,0.15)"
              e.currentTarget.style.boxShadow = "none"
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
            style={{
              background: input.trim()
                ? "linear-gradient(135deg,#7c3aed,#6366f1)"
                : "rgba(139,92,246,0.15)",
              color: input.trim() ? "#fff" : "#a78bfa",
              fontSize: 13,
              boxShadow: input.trim() ? "0 4px 12px rgba(124,58,237,0.25)" : "none",
            }}
          >
            <div className="w-4 h-4">
              <IC.Plus />
            </div>
            이름 추가
          </button>
        </div>
        <p style={{ fontSize: 11, color: "#c4b5fd", lineHeight: 1.5 }}>
          Enter로 추가 · Shift+Enter로 줄바꿈 · 쉼표로 여러 명 동시 입력
        </p>
      </div>
    </div>
  )
}
