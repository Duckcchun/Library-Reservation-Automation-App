import { useState, useCallback, useRef, useMemo, DragEvent, ChangeEvent } from "react"
import { parseNames, type ParseStats } from "@/utils/parseNames"
import { FONT, SUPPORTED_EXTENSIONS, DEFAULT_FONT_SIZE_PT } from "@/constants"
import { IC } from "@/components/icons"
import { UploadZone } from "@/components/UploadZone"
import { NameList } from "@/components/NameList"
import { PrintPanel } from "@/components/PrintPanel"
import { printLabels, countLabelPages } from "@/utils/printLabels"

export default function App() {
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

  const removeName = (index: number) =>
    setNames((prev) => prev.filter((_, idx) => idx !== index))

  const reset = () => {
    setNames([])
    setFileName(null)
    setError(null)
    setQuery("")
    setParseStats(null)
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
            {names.length > 0 && (
              <>
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
              </>
            )}
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
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

          {!names.length && !error && !loading && (
            <div className="text-center py-4" style={{ color: "#c4b5fd", fontSize: 13 }}>
              파일을 업로드하면 회원 명단이 여기에 표시됩니다
            </div>
          )}
        </main>

        <footer className="text-center pb-8 pt-2" style={{ fontSize: 11, color: "#c4b5fd" }}>
          자양한강도서관 · 예약 도서 라벨 인쇄 시스템
        </footer>
      </div>
  )
}
