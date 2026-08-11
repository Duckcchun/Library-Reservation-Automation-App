export const FONT = "'Noto Sans KR', 'Inter', system-ui, sans-serif"

export const SUPPORTED_EXTENSIONS = ["xlsx", "xls", "csv"] as const

/** 라벨 길이 (가로) mm */
export const LABEL_LENGTH_MM = 30
/** 테이프 폭 (세로) mm */
export const LABEL_TAPE_WIDTH_MM = 12

export const DEFAULT_FONT_SIZE_PT = 60
export const MIN_FONT_SIZE_PT = 12
export const MAX_FONT_SIZE_PT = 100

export const PRINTER_DPI = 180
export const MM_TO_PT = 72 / 25.4

/** PDF 1장(라벨 1장)에 넣을 이름 수 */
export const NAMES_PER_LABEL = 2

export const PRINT_TIPS = [
  "PDF 저장 후 Adobe Reader에서 인쇄 (Chrome 인쇄 비권장)",
  "배율: 100% (페이지에 맞춤 끄기)",
  "테이프 길이: 자동(Auto)",
  "여백(Margin): 없음",
] as const
