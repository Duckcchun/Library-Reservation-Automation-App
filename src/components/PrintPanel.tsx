import { IC } from "./icons"
import { PRINT_TIPS } from "@/constants"

type PrintPanelProps = {
  namesCount: number
  fontSize: number
  previewName: string
  printing: boolean
  onFontSizeChange: (size: number) => void
  onDownloadPdf: () => void
  onOpenPdf: () => void
}

export function PrintPanel({
  namesCount,
  fontSize,
  previewName,
  printing,
  onFontSizeChange,
  onDownloadPdf,
  onOpenPdf,
}: PrintPanelProps) {
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
            Epson LW-K600 · 12×30mm (12mm 테이프 맞춤)
          </p>
        </div>

        <div
          className="rounded-xl px-4 py-3"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <p style={{ fontSize: 11, color: "#ddd6fe", lineHeight: 1.6 }}>
            PDF 페이지를 드라이버 <strong style={{ color: "#fff" }}>12mm 테이프</strong> 용지 크기(12×30mm)와
            동일하게 맞춥니다. 이름은 이미지로 가운데 박혀 있어 왼쪽 정렬·여백 문제를 줄입니다.
          </p>
        </div>

        <div
          className="grid grid-cols-2 divide-x divide-white/10 rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="px-4 py-3 text-center">
            <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>{namesCount}</p>
            <p style={{ fontSize: 11, color: "#c4b5fd" }}>총 라벨</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>12mm</p>
            <p style={{ fontSize: 11, color: "#c4b5fd" }}>테이프 맞춤</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, color: "#c4b5fd" }}>라벨 글자 크기</span>
            <span
              style={{ fontSize: 12, color: "#fff", fontWeight: 600, fontFamily: "'Inter',monospace" }}
            >
              {fontSize}pt
            </span>
          </div>
          <input
            type="range"
            min={12}
            max={36}
            step={1}
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: "#a78bfa" }}
            disabled={printing}
          />
          <div className="flex justify-between mt-1" style={{ fontSize: 10, color: "rgba(196,181,253,0.5)" }}>
            <span>작게</span>
            <span>크게</span>
          </div>
          <div
            className="mt-3 rounded-xl flex items-center justify-center py-3"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              minHeight: 56,
            }}
          >
            <span
              style={{
                fontSize: Math.round(fontSize * 0.84),
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              {previewName}
            </span>
          </div>
        </div>

        <button
          onClick={onDownloadPdf}
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
            {printing ? <IC.Spinner /> : <IC.File />}
          </div>
          {printing ? "PDF 생성 중..." : "PDF 저장 (권장)"}
        </button>

        <button
          onClick={onOpenPdf}
          disabled={printing}
          className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white/10 disabled:opacity-50"
          style={{ border: "1px solid rgba(255,255,255,0.25)", color: "#ede9fe" }}
        >
          <div className="w-3.5 h-3.5">
            <IC.Print />
          </div>
          PDF 새 탭에서 열기
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
        <p style={{ fontSize: 12, color: "#4c1d95", fontWeight: 600 }}>인쇄 전 체크리스트</p>
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
