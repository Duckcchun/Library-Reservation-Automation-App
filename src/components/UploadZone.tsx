import { ChangeEvent, DragEvent, RefObject } from "react"
import { IC } from "./icons"
import type { ParseStats } from "@/utils/parseNames"

type UploadZoneProps = {
  dragging: boolean
  loading: boolean
  fileName: string | null
  namesCount: number
  parseStats: ParseStats | null
  duplicateCount: number
  fileRef: RefObject<HTMLInputElement | null>
  onDragOver: (e: DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (e: DragEvent<HTMLDivElement>) => void
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export function UploadZone({
  dragging,
  loading,
  fileName,
  namesCount,
  parseStats,
  duplicateCount,
  fileRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onInputChange,
}: UploadZoneProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => fileRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="rounded-2xl cursor-pointer select-none flex flex-col items-center justify-center gap-4 py-12 px-8 text-center transition-all duration-300"
      style={{
        background: dragging ? "linear-gradient(135deg,#ede9fe,#e0e7ff)" : "rgba(255,255,255,0.82)",
        border: `2px dashed ${dragging ? "#7c3aed" : fileName ? "rgba(124,58,237,0.35)" : "rgba(139,92,246,0.2)"}`,
        backdropFilter: "blur(8px)",
        boxShadow: dragging
          ? "0 0 0 4px rgba(124,58,237,0.1),0 8px 32px rgba(124,58,237,0.08)"
          : "0 2px 16px rgba(0,0,0,0.04)",
        transform: dragging ? "scale(1.02)" : "scale(1)",
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={onInputChange}
      />

      {loading ? (
        <>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#ede9fe,#e0e7ff)" }}
          >
            <div style={{ color: "#7c3aed" }} className="w-6 h-6">
              <IC.Spinner />
            </div>
          </div>
          <p style={{ fontSize: 14, color: "#7c3aed" }} className="font-semibold">
            파일 파싱 중...
          </p>
        </>
      ) : fileName && namesCount > 0 ? (
        <>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center animate-bounce"
            style={{ background: "linear-gradient(135deg,#ede9fe,#e0e7ff)" }}
          >
            <div style={{ color: "#7c3aed" }} className="w-7 h-7">
              <IC.File />
            </div>
          </div>
          <div className="animate-fade-in">
            <p className="font-semibold" style={{ fontSize: 14, color: "#1e1b4b" }}>
              {fileName}
            </p>
            <p style={{ fontSize: 12, color: "#a78bfa" }} className="mt-0.5">
              파일을 바꾸려면 클릭하거나 새 파일을 드래그하세요
            </p>
          </div>
          <div className="flex items-center gap-2 animate-fade-in">
            <span
              className="text-white font-semibold px-4 py-1.5 rounded-full"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", fontSize: 12 }}
            >
              {namesCount}명 추출 완료
            </span>
            {parseStats && parseStats.filtered > 0 && (
              <span
                className="flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold"
                style={{ background: "rgba(245,158,11,0.12)", color: "#d97706", fontSize: 12 }}
              >
                <div className="w-3.5 h-3.5">
                  <IC.Warning />
                </div>
                {parseStats.filtered}개 필터링됨
              </span>
            )}
            {duplicateCount > 0 && (
              <span
                className="flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold"
                style={{ background: "rgba(245,158,11,0.12)", color: "#d97706", fontSize: 12 }}
              >
                <div className="w-3.5 h-3.5">
                  <IC.Warning />
                </div>
                동명이인 {duplicateCount}명
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200"
            style={{
              background: dragging
                ? "linear-gradient(135deg,#7c3aed,#6366f1)"
                : "linear-gradient(135deg,#ede9fe,#e0e7ff)",
              boxShadow: dragging ? "0 8px 20px rgba(124,58,237,0.3)" : "none",
            }}
          >
            <div className="w-7 h-7" style={{ color: dragging ? "#fff" : "#7c3aed" }}>
              <IC.Upload />
            </div>
          </div>
          <div>
            <p className="font-semibold" style={{ fontSize: 14, color: "#1e1b4b" }}>
              {dragging ? "여기에 놓으세요!" : "엑셀 파일을 드래그하거나 클릭하여 업로드"}
            </p>
            <p style={{ fontSize: 12, color: "#a78bfa" }} className="mt-1.5">
              .xlsx · .xls · .csv 지원 &nbsp;·&nbsp;{" "}
              <strong style={{ color: "#7c3aed" }}>예약자</strong> 열 자동 감지
            </p>
          </div>
        </>
      )}
    </div>
  )
}
