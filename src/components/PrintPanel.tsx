import { IC } from "./icons"
import { EPD10_SETUP_STEPS, EPD10_PRINT_TIPS } from "@/constants"

type PrintPanelProps = {
  namesCount: number
  fontSize: number
  previewName: string
  exporting: boolean
  onFontSizeChange: (size: number) => void
  onExportEpd10: () => void
}

export function PrintPanel({
  namesCount,
  fontSize,
  previewName,
  exporting,
  onFontSizeChange,
  onExportEpd10,
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
            Epson LW-K600 · Windows · EPD10
          </p>
        </div>

        <div
          className="rounded-xl px-4 py-3"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <p style={{ fontSize: 11, color: "#ddd6fe", lineHeight: 1.65 }}>
            Windows에서 PDF를 12mm 테이프로 인쇄하면 드라이버가 페이지 크기를 덮어써{" "}
            <strong style={{ color: "#fff" }}>왼쪽 정렬·여백</strong>이 생깁니다.
            <br />
            Epson 공식 프로그램 <strong style={{ color: "#fff" }}>EPD10</strong>으로 인쇄하세요.
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
            <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>30mm</p>
            <p style={{ fontSize: 11, color: "#c4b5fd" }}>라벨 길이</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, color: "#c4b5fd" }}>EPD10 글자 크기 참고</span>
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
          />
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
          <p style={{ fontSize: 10, color: "rgba(196,181,253,0.55)", marginTop: 6 }}>
            글자 크기는 EPD10 템플릿에서 설정합니다
          </p>
        </div>

        <button
          onClick={onExportEpd10}
          disabled={exporting}
          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:scale-100"
          style={{
            background: "#fff",
            color: "#4c1d95",
            fontSize: 14,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div className="w-4 h-4">
            <IC.File />
          </div>
          EPD10용 엑셀 저장 ({namesCount}명)
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
        <p style={{ fontSize: 12, color: "#4c1d95", fontWeight: 600 }}>EPD10 인쇄 순서 (최초 1회 설정)</p>
        <div className="flex flex-col gap-2">
          {EPD10_SETUP_STEPS.map((step, i) => (
            <div key={step} className="flex items-start gap-2.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(124,58,237,0.12)", color: "#7c3aed", fontSize: 10, fontWeight: 700 }}
              >
                {i + 1}
              </div>
              <span style={{ fontSize: 12, color: "#6b21a8", lineHeight: 1.5 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{
          background: "rgba(254,242,242,0.7)",
          border: "1px solid rgba(252,165,165,0.35)",
        }}
      >
        <p style={{ fontSize: 12, color: "#991b1b", fontWeight: 600 }}>알아두세요</p>
        <div className="flex flex-col gap-2">
          {EPD10_PRINT_TIPS.map((tip) => (
            <div key={tip} className="flex items-start gap-2.5">
              <div className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#dc2626" }}>
                <IC.Warning />
              </div>
              <span style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
