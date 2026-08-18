import { useState, useCallback, useRef, useMemo, DragEvent, ChangeEvent } from "react"
import { parseNames, type ParseStats } from "@/utils/parseNames"
import { FONT, SUPPORTED_EXTENSIONS, DEFAULT_FONT_SIZE_PT } from "@/constants"
import { IC } from "@/components/icons"
import { UploadZone } from "@/components/UploadZone"
import { ManualInput } from "@/components/ManualInput"
import { NameList } from "@/components/NameList"
import { PrintPanel } from "@/components/PrintPanel"
import { printLabels, countLabelPages } from "@/utils/printLabels"

type AppMode = "home" | "upload" | "manual"

export default function App() {
  const [mode, setMode] = useState<AppMode>("home")
  const [names, setNames] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE_PT)
  const [parseStats, setParseStats] = useState<ParseStats | null>(null)
  const [printing, setPrinting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const trimmedQuery = query.trim()
    return names
      .map((name, index) => ({ name, index }))
      .filter(({ name }) => !trimmedQuery || name.includes(trimmedQuery))
  }, [names, query])

  const duplicates = useMemo(() => {
    const count: Record<string, number> = {}
    for (const n of names) count[n] = (count[n] ?? 0) + 1
    return new Set(Object.keys(count).filter((n) => count[n] > 1))
  }, [names])

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setNames([])
    setQuery("")

    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!SUPPORTED_EXTENSIONS.includes(ext as (typeof SUPPORTED_EXTENSIONS)[number])) {
      setError("xlsx, xls, csv 파일만 지원합니다.")
      return
    }

    setLoading(true)
    setFileName(file.name)

    try {
      const result = await parseNames(file)
      setNames(result.names)
      setParseStats(result.stats)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "파일 처리 중 오류가 발생했습니다."
      setError(errorMessage)
      setFileName(null)
      setParseStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  const addManualNames = useCallback((newNames: string[]) => {
    setNames((prev) => [...prev, ...newNames])
    setError(null)
  }, [])

  const removeName = (index: number) =>
    setNames((prev) => prev.filter((_, idx) => idx !== index))

  const reset = () => {
    setNames([])
    setFileName(null)
    setError(null)
    setQuery("")
    setParseStats(null)
    setMode("home")
  }

  const handlePrint = useCallback(async () => {
    if (!names.length || printing) return

    setPrinting(true)
    setError(null)

    try {
      await printLabels(names, fontSize)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "인쇄 준비 중 오류가 발생했습니다."
      setError(message)
    } finally {
      setPrinting(false)
    }
  }, [names, fontSize, printing])

  return (
    <div
      className="min-h-screen print:hidden flex flex-col"
      style={{
        fontFamily: FONT,
        background: "linear-gradient(135deg, #f5f3ff 0%, #faf5ff 45%, #eff6ff 100%)",
      }}
    >
      <header
        className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(139,92,246,0.1)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#6366f1)",
              boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
            }}
          >
            <div className="w-4 h-4">
              <IC.File />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 10, color: "#a78bfa", letterSpacing: "0.06em" }} className="font-semibold uppercase">
              자양한강도서관
            </p>
            <p style={{ fontSize: 14, color: "#1e1b4b" }} className="font-semibold leading-tight">
              예약 도서 라벨 인쇄 시스템
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mode !== "home" && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 hover:bg-red-50 hover:scale-105"
              style={{ color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <div className="w-3.5 h-3.5">
                <IC.Trash />
              </div>
              초기화
            </button>
          )}
          {names.length > 0 && (
            <button
              onClick={handlePrint}
              disabled={printing}
              className="flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:opacity-90 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:scale-100"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
              }}
            >
              <div className="w-4 h-4">
                {printing ? <IC.Spinner /> : <IC.Print />}
              </div>
              {printing ? "인쇄 준비 중..." : `인쇄 (${countLabelPages(names.length)}장)`}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
        {/* 홈 화면: 모드 선택 */}
        {mode === "home" && (
          <div className="flex flex-col items-center gap-8 py-12">
            <div className="text-center">
              <p style={{ fontSize: 18, color: "#1e1b4b" }} className="font-bold">
                이름을 어떻게 입력하시겠습니까?
              </p>
              <p style={{ fontSize: 13, color: "#a78bfa" }} className="mt-2">
                원하는 방법을 선택하세요
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
              {/* 엑셀 업로드 버튼 */}
              <button
                onClick={() => setMode("upload")}
                className="group flex flex-col items-center gap-4 p-8 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "2px solid rgba(139,92,246,0.15)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: "linear-gradient(135deg,#ede9fe,#e0e7ff)",
                  }}
                >
                  <div className="w-8 h-8" style={{ color: "#7c3aed" }}>
                    <IC.Upload />
                  </div>
                </div>
                <div className="text-center">
                  <p style={{ fontSize: 15, color: "#1e1b4b" }} className="font-bold">
                    엑셀 업로드
                  </p>
                  <p style={{ fontSize: 12, color: "#a78bfa" }} className="mt-1">
                    xlsx · xls · csv 파일
                  </p>
                </div>
              </button>

              {/* 수기 입력 버튼 */}
              <button
                onClick={() => setMode("manual")}
                className="group flex flex-col items-center gap-4 p-8 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "2px solid rgba(139,92,246,0.15)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: "linear-gradient(135deg,#ede9fe,#e0e7ff)",
                  }}
                >
                  <div className="w-8 h-8" style={{ color: "#7c3aed" }}>
                    <IC.Plus />
                  </div>
                </div>
                <div className="text-center">
                  <p style={{ fontSize: 15, color: "#1e1b4b" }} className="font-bold">
                    수기 입력
                  </p>
                  <p style={{ fontSize: 12, color: "#a78bfa" }} className="mt-1">
                    이름 직접 타이핑
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 엑셀 업로드 모드 */}
        {mode === "upload" && (
          <UploadZone
            dragging={dragging}
            loading={loading}
            fileName={fileName}
            namesCount={names.length}
            parseStats={parseStats}
            duplicateCount={duplicates.size}
            fileRef={fileRef}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onInputChange={onInputChange}
          />
        )}

        {/* 수기 입력 모드 */}
        {mode === "manual" && (
          <ManualInput onAdd={addManualNames} />
        )}

        {error && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(254,242,242,0.92)",
              border: "1px solid rgba(252,165,165,0.5)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="w-4 h-4 shrink-0 text-red-500">
              <IC.Warning />
            </div>
            <span style={{ fontSize: 13 }} className="flex-1 text-red-600">
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="w-4 h-4 text-red-400 hover:text-red-600 transition-colors"
            >
              <IC.X />
            </button>
          </div>
        )}

        {names.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_264px] gap-5 items-start">
            <NameList
              filtered={filtered}
              totalCount={names.length}
              query={query}
              duplicates={duplicates}
              onQueryChange={setQuery}
              onRemove={removeName}
            />
            <PrintPanel
              namesCount={names.length}
              fontSize={fontSize}
              previewNames={
                names.length >= 2
                  ? [names[0], names[1]]
                  : [names[0] ?? "홍길동"]
              }
              printing={printing}
              onFontSizeChange={setFontSize}
              onPrint={handlePrint}
            />
          </div>
        )}
      </main>

      <footer className="text-center pb-8 pt-2" style={{ fontSize: 11, color: "#c4b5fd" }}>
        자양한강도서관 · 예약 도서 라벨 인쇄 시스템
      </footer>
    </div>
  )
}
