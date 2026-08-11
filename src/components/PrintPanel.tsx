import { useEffect, useState } from "react"
import { IC } from "./icons"
import { PRINT_TIPS, MAX_FONT_SIZE_PT, MIN_FONT_SIZE_PT, NAMES_PER_LABEL } from "@/constants"
import { countLabelPages, getPreviewFontSizePt } from "@/utils/printLabels"

type PrintPanelProps = {
  namesCount: number
  fontSize: number
  previewNames: string[]
  printing: boolean
  onFontSizeChange: (size: number) => void
  onPrint: () => void
}

export function PrintPanel({
  namesCount,
  fontSize,
  previewNames,
  printing,
  onFontSizeChange,
  onPrint,
}: PrintPanelProps) {
  const pageCount = countLabelPages(namesCount)
  const [fittedPt, setFittedPt] = useState(fontSize)

  useEffect(() => {
    let cancelled = false

    void getPreviewFontSizePt(previewNames, fontSize).then((pt) => {
      if (!cancelled) setFittedPt(pt)
    })

    return () => {
      cancelled = true
    }
  }, [previewNames, fontSize])

  const isTwoUp = previewNames.length >= 2

  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-2xl p-5 text-white flex flex-col gap-5"
        style={{
          background: "linear-gradient(160deg,#4c1d95 0%,#3730a3 100%)",
          boxShadow: "0 8px 32px rgba(76,29,149,0.3),0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <p className="font-bold" style={{ fontSize: 16 }}>
            라벨 인쇄
          </p>
          <p style={{ fontSize: 12, color: "rgba(196,181,253,0.8)" }} className="mt-0.5">
            30×12mm · {NAMES_PER_LABEL}명/장 · {pageCount}장
          </p>
        </div>

        <div
          className="grid grid-cols-2 divide-x divide-white/10 rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="px-4 py-3 text-center">
            <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>{pageCount}</p>
            <p style={{ fontSize: 11, color: "#c4b5fd" }}>인쇄 장수</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>{namesCount}</p>
            <p style={{ fontSize: 11, color: "#c4b5fd" }}>총 인원</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, color: "#c4b5fd" }}>글자 크기</span>
            <span
              style={{ fontSize: 12, color: "#fff", fontWeight: 600, fontFamily: "'Inter',monospace" }}
            >
              {fontSize}pt
              {fittedPt < fontSize && (
                <span style={{ color: "#c4b5fd", fontWeight: 500 }}> → {fittedPt}pt</span>
              )}
            </span>
          </div>
          <input
            type="range"
            min={MIN_FONT_SIZE_PT}
            max={MAX_FONT_SIZE_PT}
            step={1}
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: "#a78bfa" }}
            disabled={printing}
          />
          <div className="flex justify-between mt-1" style={{ fontSize: 10, color: "rgba(196,181,253,0.5)" }}>
            <span>{MIN_FONT_SIZE_PT}pt</span>
            <span>{MAX_FONT_SIZE_PT}pt</span>
          </div>
          <div
            className="mt-3 rounded-xl flex items-center py-3"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              minHeight: 56,
            }}
          >
            {isTwoUp ? (
              previewNames.map((name, index) => (
                <div
                  key={`${name}-${index}`}
                  className="flex-1 min-w-0 px-2 text-left overflow-hidden"
                  style={{
                    borderLeft: index > 0 ? "1px solid rgba(255,255,255,0.12)" : undefined,
                  }}
                >
                  <span
                    style={{
                      fontSize: Math.round(fittedPt * 0.84),
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: "-0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {name}
                  </span>
                </div>
              ))
            ) : (
              <span
                className="px-2"
                style={{
                  fontSize: Math.round(fittedPt * 0.84),
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                }}
              >
                {previewNames[0]}
              </span>
            )}
          </div>
          {isTwoUp && fittedPt < fontSize && (
            <p style={{ fontSize: 10, color: "rgba(196,181,253,0.65)", marginTop: 6 }}>
              2명/장은 반칸(15mm) 기준으로 글자가 자동 축소됩니다
            </p>
          )}
        </div>

        <button
          onClick={onPrint}
          disabled={printing}
          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:scale-100 disabled:cursor-wait"
          style={{
            background: "#fff",
            color: "#4c1d95",
            fontSize: 14,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div className="w-4 h-4">
            {printing ? <IC.Spinner /> : <IC.Print />}
          </div>
          {printing ? "인쇄 준비 중..." : `바로 인쇄 (${pageCount}장 · ${namesCount}명)`}
        </button>
      </div>

      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(139,92,246,0.1)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <p style={{ fontSize: 12, color: "#4c1d95", fontWeight: 600 }}>인쇄 팁</p>
        <div className="flex flex-col gap-2">
          {PRINT_TIPS.map((tip) => (
            <div key={tip} className="flex items-start gap-2.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}
              >
                <div className="w-2.5 h-2.5">
                  <IC.Check />
                </div>
              </div>
              <span style={{ fontSize: 12, color: "#6b21a8", lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
