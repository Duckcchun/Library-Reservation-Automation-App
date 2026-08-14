import { useState, useCallback, useRef, useMemo, DragEvent, ChangeEvent } from "react"
import * as XLSX from "xlsx"

// ── 파싱 ─────────────────────────────────────────────────────────────────────

async function parseNames(file: File): Promise<{ names: string[]; stats: { total: number; valid: number; filtered: number } }> {
  const data = await file.arrayBuffer()
  const wb = XLSX.read(new Uint8Array(data), { type: "array" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 }) as string[][]
  if (!raw.length) throw new Error("시트에 데이터가 없습니다.")

  // "예약자" 헤더가 있는 행을 찾음
  const headerRowIdx = raw.findIndex((row) =>
    row.some((cell) => String(cell ?? "").trim() === "예약자")
  )
  if (headerRowIdx === -1) throw new Error('"예약자" 열을 찾을 수 없습니다. 파일 형식을 확인해 주세요.')

  const headers = raw[headerRowIdx].map((h) => String(h ?? "").trim())
  const colIdx = headers.indexOf("예약자")

  // 한글 이름 패턴 (2-4자 한글)
  const koreanNamePattern = /^[가-힣]{2,4}$/
  // 영어 이름 패턴 (영문자와 공백만 허용)
  const englishNamePattern = /^[a-zA-Z\s]{2,30}$/

  const totalRows = raw.length - headerRowIdx - 1
  const processedRows: string[] = []
  const filteredNames: string[] = []
  
  raw
    .slice(headerRowIdx + 1)
    .map((row) => String(row[colIdx] ?? "").trim())
    .forEach((name) => {
      // 빈 값 필터링
      if (!name) return
      
      processedRows.push(name)
      
      // 한글 또는 영어 이름 패턴 검증
      if (!koreanNamePattern.test(name) && !englishNamePattern.test(name)) {
        console.log(`필터링된 이름: "${name}" (이름 패턴 불일치)`)
        return
      }
      
      filteredNames.push(name)
    })

  const stats = {
    total: processedRows.length,
    valid: filteredNames.length,
    filtered: processedRows.length - filteredNames.length
  }

  console.log(`파싱 통계: 총 ${stats.total}개 행 중 ${stats.valid}개 유효, ${stats.filtered}개 필터링됨`)
  
  // 한글 이름과 영어 이름 분리
  const koreanNames = filteredNames.filter(name => koreanNamePattern.test(name))
  const englishNames = filteredNames.filter(name => englishNamePattern.test(name))
  
  // 각각 정렬
  koreanNames.sort((a, b) => a.localeCompare(b, "ko"))
  englishNames.sort((a, b) => a.localeCompare(b, "en"))
  
  // 한글 이름 먼저, 영어 이름 나중에 합치기
  const sortedNames = [...koreanNames, ...englishNames]
  
  return {
    names: sortedNames,
    stats
  }
}

// ── 아이콘 ────────────────────────────────────────────────────────────────────

const IC = {
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  File: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Print: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-full h-full">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  Spinner: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
    </svg>
  ),
  Warning: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
}

// ── App ───────────────────────────────────────────────────────────────────────

const FONT = "'Gothic A1', 'D2Coding', system-ui, sans-serif"

export default function App() {
  const [names, setNames] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [fontSize, setFontSize] = useState(20) // pt
  const [parseStats, setParseStats] = useState<{ total: number; valid: number; filtered: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── 검색 필터 ──────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () => {
      const trimmedQuery = query.trim()
      if (!trimmedQuery) return names
      return names.filter((n) => n.includes(trimmedQuery))
    },
    [names, query]
  )

  // ── 중복 이름 감지 ────────────────────────────────────────────────────────
  const duplicates = useMemo(() => {
    const count: Record<string, number> = {}
    for (const n of names) count[n] = (count[n] ?? 0) + 1
    return new Set(Object.keys(count).filter((n) => count[n] > 1))
  }, [names])

  // ── 파일 처리 ──────────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setNames([])           // ① 재업로드 시 이전 명단 즉시 초기화
    setQuery("")
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
      setError("xlsx, xls, csv 파일만 지원합니다.")
      return
    }
    setLoading(true)
    setFileName(file.name)
    try {
      const result = await parseNames(file)
      setNames(result.names)
      setParseStats(result.stats)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "파일 처리 중 오류가 발생했습니다."
      setError(errorMessage)
      setFileName(null)
      setParseStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  const removeName = (i: number) =>
    setNames((prev) => prev.filter((_, idx) => idx !== i))

  const reset = () => {
    setNames([]); setFileName(null); setError(null); setQuery(""); setParseStats(null)
  }

  const handlePrint = () => window.print()

  return (
    <>
      {/* ── 인쇄 전용 스타일 ────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          @page { margin: 0; size: 12mm auto; }
          #print-area { position: absolute; top: 0; left: 0; width: 100%; }
          .label-item {
            width: 12mm !important;
            height: auto !important;
            background: white !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            position: relative !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .label-item:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .label-name {
            font-weight: 700 !important;
            font-size: 24pt !important;
            color: black !important;
            letter-spacing: 0.15em !important;
            text-align: center !important;
            word-break: keep-all !important;
            font-family: 'Gothic A1', 'D2Coding', sans-serif !important;
            width: 12mm !important;
            height: auto !important;
            overflow: hidden !important;
            white-space: nowrap !important;
            line-height: 1.2 !important;
            margin: 0 !important;
            padding: 0 !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
          }
        }
      `}</style>

      {/* ── 인쇄 전용 DOM ─────────────────────────────────────────────────────── */}
      <div id="print-area" className="print:block hidden">
        {names.map((name, i) => (
          <div key={i} className="label-item">
            <span className="label-name" style={{ fontSize: `${fontSize}pt` }}>{name}</span>
          </div>
        ))}
      </div>

      {/* ── 화면 UI ───────────────────────────────────────────────────────────── */}
      <div
        className="min-h-screen print:hidden flex flex-col"
        style={{ fontFamily: FONT, background: "linear-gradient(135deg, #f5f3ff 0%, #faf5ff 45%, #eff6ff 100%)" }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(139,92,246,0.1)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>
              <div className="w-4 h-4"><IC.File /></div>
            </div>
            <div>
              <p style={{ fontSize: 10, color: "#a78bfa", letterSpacing: "0.06em" }} className="font-semibold uppercase">자양한강도서관</p>
              <p style={{ fontSize: 14, color: "#1e1b4b" }} className="font-semibold leading-tight">예약 도서 라벨 인쇄 시스템</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {names.length > 0 && (
              <>
                <button onClick={reset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 hover:bg-red-50 hover:scale-105"
                  style={{ color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <div className="w-3.5 h-3.5"><IC.Trash /></div>
                  초기화
                </button>
                <button onClick={handlePrint}
                  className="flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:opacity-90 hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}>
                  <div className="w-4 h-4"><IC.Print /></div>
                  {names.length}장 인쇄
                </button>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

          {/* Upload Zone */}
          <div
            role="button" tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className="rounded-2xl cursor-pointer select-none flex flex-col items-center justify-center gap-4 py-12 px-8 text-center transition-all duration-300"
            style={{
              background: dragging ? "linear-gradient(135deg,#ede9fe,#e0e7ff)" : "rgba(255,255,255,0.82)",
              border: `2px dashed ${dragging ? "#7c3aed" : fileName ? "rgba(124,58,237,0.35)" : "rgba(139,92,246,0.2)"}`,
              backdropFilter: "blur(8px)",
              boxShadow: dragging ? "0 0 0 4px rgba(124,58,237,0.1),0 8px 32px rgba(124,58,237,0.08)" : "0 2px 16px rgba(0,0,0,0.04)",
              transform: dragging ? "scale(1.02)" : "scale(1)",
            }}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onInputChange} />

            {loading ? (
              <>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#ede9fe,#e0e7ff)" }}>
                  <div style={{ color: "#7c3aed" }} className="w-6 h-6"><IC.Spinner /></div>
                </div>
                <p style={{ fontSize: 14, color: "#7c3aed" }} className="font-semibold">파일 파싱 중...</p>
              </>
            ) : fileName && names.length > 0 ? (
              <>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-bounce"
                  style={{ background: "linear-gradient(135deg,#ede9fe,#e0e7ff)" }}>
                  <div style={{ color: "#7c3aed" }} className="w-7 h-7"><IC.File /></div>
                </div>
                <div className="animate-fade-in">
                  <p className="font-semibold" style={{ fontSize: 14, color: "#1e1b4b" }}>{fileName}</p>
                  <p style={{ fontSize: 12, color: "#a78bfa" }} className="mt-0.5">파일을 바꾸려면 클릭하거나 새 파일을 드래그하세요</p>
                </div>
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-white font-semibold px-4 py-1.5 rounded-full"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", fontSize: 12 }}>
                    {names.length}명 추출 완료
                  </span>
                  {parseStats && parseStats.filtered > 0 && (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold"
                      style={{ background: "rgba(245,158,11,0.12)", color: "#d97706", fontSize: 12 }}>
                      <div className="w-3.5 h-3.5"><IC.Warning /></div>
                      {parseStats.filtered}개 필터링됨
                    </span>
                  )}
                  {duplicates.size > 0 && (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold"
                      style={{ background: "rgba(245,158,11,0.12)", color: "#d97706", fontSize: 12 }}>
                      <div className="w-3.5 h-3.5"><IC.Warning /></div>
                      동명이인 {duplicates.size}명
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: dragging ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "linear-gradient(135deg,#ede9fe,#e0e7ff)",
                    boxShadow: dragging ? "0 8px 20px rgba(124,58,237,0.3)" : "none",
                  }}>
                  <div className="w-7 h-7" style={{ color: dragging ? "#fff" : "#7c3aed" }}><IC.Upload /></div>
                </div>
                <div>
                  <p className="font-semibold" style={{ fontSize: 14, color: "#1e1b4b" }}>
                    {dragging ? "여기에 놓으세요!" : "엑셀 파일을 드래그하거나 클릭하여 업로드"}
                  </p>
                  <p style={{ fontSize: 12, color: "#a78bfa" }} className="mt-1.5">
                    .xlsx · .xls · .csv 지원 &nbsp;·&nbsp; <strong style={{ color: "#7c3aed" }}>예약자</strong> 열 자동 감지
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(254,242,242,0.92)", border: "1px solid rgba(252,165,165,0.5)", backdropFilter: "blur(8px)" }}>
              <div className="w-4 h-4 shrink-0 text-red-500"><IC.Warning /></div>
              <span style={{ fontSize: 13 }} className="flex-1 text-red-600">{error}</span>
              <button onClick={() => setError(null)} className="w-4 h-4 text-red-400 hover:text-red-600 transition-colors">
                <IC.X />
              </button>
            </div>
          )}

          {/* Main content */}
          {names.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_264px] gap-5 items-start">

              {/* Name List */}
              <div className="rounded-2xl overflow-hidden flex flex-col"
                style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)", border: "1px solid rgba(139,92,246,0.1)", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>

                {/* List header */}
                <div className="flex items-center justify-between px-5 py-3.5"
                  style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.04),rgba(99,102,241,0.04))", borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
                  <span style={{ fontSize: 13, color: "#4c1d95" }} className="font-semibold">
                    회원 명단
                    <span style={{ color: "#a78bfa", fontWeight: 400 }} className="ml-1.5">가나다순</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {query && (
                      <span style={{ fontSize: 11, color: "#7c3aed" }} className="font-medium">
                        {filtered.length}/{names.length}
                      </span>
                    )}
                    <span className="text-white font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", fontSize: 11 }}>
                      {names.length}
                    </span>
                  </div>
                </div>

                {/* Search bar */}
                <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(139,92,246,0.07)" }}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(139,92,246,0.12)" }}>
                    <div className="w-3.5 h-3.5 shrink-0" style={{ color: "#a78bfa" }}><IC.Search /></div>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="이름 검색..."
                      style={{ fontSize: 13, color: "#1e1b4b", background: "transparent", outline: "none", width: "100%" }}
                      className="placeholder:text-violet-300"
                    />
                    {query && (
                      <button onClick={() => setQuery("")} className="w-3.5 h-3.5 shrink-0" style={{ color: "#c4b5fd" }}>
                        <IC.X />
                      </button>
                    )}
                  </div>
                </div>

                {/* List body with scroll fade */}
                <div className="relative flex-1">
                  <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
                    {filtered.length === 0 ? (
                      <p className="text-center py-8" style={{ fontSize: 13, color: "#c4b5fd" }}>
                        "{query}"에 해당하는 이름이 없습니다
                      </p>
                    ) : (
                      filtered.map((name, i) => {
                        const isDup = duplicates.has(name)
                        return (
                          <div key={`${name}-${i}`}
                            className="group flex items-center gap-3 px-5 py-3 transition-all duration-300 hover:bg-purple-50/50 hover:translate-x-1"
                            style={{ borderBottom: "1px solid rgba(139,92,246,0.06)" }}
                          >
                            <span style={{ fontSize: 10, color: "#c4b5fd", width: 22, textAlign: "right", flexShrink: 0, fontFamily: "'Inter',monospace", fontVariantNumeric: "tabular-nums" }}>
                              {i + 1}
                            </span>
                            <span style={{ fontSize: 14, color: "#1e1b4b", fontWeight: 500 }} className="flex-1">{name}</span>
                            {isDup && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                                style={{ fontSize: 10, background: "rgba(245,158,11,0.1)", color: "#d97706", fontWeight: 600 }}>
                                <div className="w-3 h-3"><IC.Warning /></div>
                                중복
                              </span>
                            )}
                            <button onClick={() => removeName(i)}
                              className="opacity-0 group-hover:opacity-100 transition-all duration-300 w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-50/20 hover:text-red-500 hover:scale-110"
                              style={{ color: "#c4b5fd" }}
                              title="삭제">
                              <div className="w-3 h-3"><IC.X /></div>
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                  {/* 스크롤 끝 페이드 */}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 rounded-b-2xl"
                    style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))" }} />
                </div>
              </div>

              {/* Right Panel */}
              <div className="flex flex-col gap-4">

                {/* Print card */}
                <div className="rounded-2xl p-5 text-white flex flex-col gap-5"
                  style={{ background: "linear-gradient(160deg,#4c1d95 0%,#3730a3 100%)", boxShadow: "0 8px 32px rgba(76,29,149,0.3),0 2px 8px rgba(0,0,0,0.1)" }}>
                  <div>
                    <p className="font-bold" style={{ fontSize: 16 }}>라벨 인쇄</p>
                    <p style={{ fontSize: 12, color: "rgba(196,181,253,0.8)" }} className="mt-0.5">Epson LW-K600</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 divide-x divide-white/10 rounded-xl overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="px-4 py-3 text-center">
                      <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>{names.length}</p>
                      <p style={{ fontSize: 11, color: "#c4b5fd" }}>총 라벨</p>
                    </div>
                    <div className="px-4 py-3 text-center">
                      <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>1:1</p>
                      <p style={{ fontSize: 11, color: "#c4b5fd" }}>페이지/라벨</p>
                    </div>
                  </div>

                  {/* Font size slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: 12, color: "#c4b5fd" }}>라벨 글자 크기</span>
                      <span style={{ fontSize: 12, color: "#fff", fontWeight: 600, fontFamily: "'Inter',monospace" }}>{fontSize}pt</span>
                    </div>
                    <input
                      type="range" min={12} max={36} step={1} value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: "#a78bfa" }}
                    />
                    <div className="flex justify-between mt-1" style={{ fontSize: 10, color: "rgba(196,181,253,0.5)" }}>
                      <span>작게</span><span>크게</span>
                    </div>
                    {/* 미리보기 */}
                    <div className="mt-3 rounded-xl flex items-center justify-center py-3"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", minHeight: 56 }}>
                      <span style={{ fontSize: Math.round(fontSize * 0.84), fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                        {names[0] ?? "홍길동"}
                      </span>
                    </div>
                  </div>

                  <button onClick={handlePrint}
                    className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300"
                    style={{ background: "#fff", color: "#4c1d95", fontSize: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                    <div className="w-4 h-4"><IC.Print /></div>
                    전체 라벨 일괄 인쇄
                  </button>
                </div>

                {/* Tips card */}
                <div className="rounded-2xl p-4 flex flex-col gap-3"
                  style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)", border: "1px solid rgba(139,92,246,0.1)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontSize: 12, color: "#4c1d95", fontWeight: 600 }}>인쇄 전 체크리스트</p>
                  <div className="flex flex-col gap-2">
                    {[
                      "프린터: Epson LW-K600 선택",
                      "용지 방향: 가로 모드 (Landscape)",
                      "여백(Margin): 없음",
                      "배경 그래픽 인쇄: 해제",
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                          style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>
                          <div className="w-2.5 h-2.5"><IC.Check /></div>
                        </div>
                        <span style={{ fontSize: 12, color: "#6b21a8", lineHeight: 1.5 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
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
    </>
  )
}
