export const FONT = "'Noto Sans KR', 'Inter', system-ui, sans-serif"

export const SUPPORTED_EXTENSIONS = ["xlsx", "xls", "csv"] as const

/** 라벨 길이 (테이프 피드 방향) */
export const LABEL_LENGTH_MM = 30
/** 라벨 테이프 폭 */
export const LABEL_TAPE_WIDTH_MM = 12

/**
 * Epson 12mm 테이프 드라이버가 강제하는 용지 크기에 맞춘 PDF 페이지 (세로)
 * - 페이지 너비 12mm = 테이프 폭
 * - 페이지 높이 30mm = 라벨 길이(피드·컷)
 */
export const PDF_PAGE_WIDTH_MM = LABEL_TAPE_WIDTH_MM
export const PDF_PAGE_HEIGHT_MM = LABEL_LENGTH_MM

export const DEFAULT_FONT_SIZE_PT = 24
export const MIN_FONT_SIZE_PT = 12
export const MAX_FONT_SIZE_PT = 36

export const MM_TO_PT = 72 / 25.4
export const PRINTER_DPI = 180

export const PRINT_TIPS = [
  "프린터: Epson LW-K600 + 12mm 테이프 장착",
  "용지: 12mm 테이프 (드라이버 자동 선택 OK)",
  "테이프 길이: 자동(Auto)",
  "배율: 100% (페이지에 맞춤 / Fit to page 끄기)",
  "여백(Margin): 없음",
  "PDF 페이지: 12×30mm — 드라이버 용지 크기와 일치",
] as const
