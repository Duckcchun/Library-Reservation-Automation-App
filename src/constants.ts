export const FONT = "'Noto Sans KR', 'Inter', system-ui, sans-serif"

export const SUPPORTED_EXTENSIONS = ["xlsx", "xls", "csv"] as const

/** 라벨 테이프 길이 (가로) */
export const LABEL_WIDTH_MM = 30
/** 라벨 테이프 폭 (세로) */
export const LABEL_HEIGHT_MM = 12

export const DEFAULT_FONT_SIZE_PT = 24
export const MIN_FONT_SIZE_PT = 12
export const MAX_FONT_SIZE_PT = 36

export const MM_TO_PT = 72 / 25.4

export const NOTO_SANS_KR_BOLD_URL =
  "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/KR/NotoSansKR-Bold.otf"

/** PDF 텍스트 세로 위치 보정 (baseline을 위로 올림) */
export const LABEL_TEXT_Y_OFFSET_PT = 3.5

export const PRINT_TIPS = [
  "① PDF 저장 → Adobe Reader / 미리보기에서 인쇄 (권장)",
  "용지 크기: PDF 자동(30×12mm) — '12mm 테이프' 프리셋 선택 금지",
  "프린터: Epson LW-K600 (물리 테이프 12mm 장착)",
  "테이프 길이: 자동(Auto)",
  "배율: 100% (페이지에 맞춤 / Fit to page 끄기)",
  "여백(Margin): 없음",
] as const
