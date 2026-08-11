export const FONT = "'Noto Sans KR', 'Inter', system-ui, sans-serif"

export const SUPPORTED_EXTENSIONS = ["xlsx", "xls", "csv"] as const

/** 라벨 길이 (가로) mm */
export const LABEL_LENGTH_MM = 30
/** 테이프 폭 (세로) mm */
export const LABEL_TAPE_WIDTH_MM = 12

export const DEFAULT_FONT_SIZE_PT = 28
export const MIN_FONT_SIZE_PT = 12
export const MAX_FONT_SIZE_PT = 44

/** 2명/장일 때 이름 오른쪽 여백 mm */
export const NAME_RIGHT_PADDING_MM = 1.5

export const PRINTER_DPI = 180
export const MM_TO_PT = 72 / 25.4

/** PDF 1장(라벨 1장)에 넣을 이름 수 */
export const NAMES_PER_LABEL = 2

export const PRINT_TIPS = [
  "인쇄 대화상자에서 Epson LW-K600 선택",
  "배율: 100% (페이지에 맞춤 반드시 끄기)",
  "글자 크기는 슬라이더 pt 그대로 인쇄됩니다",
  "테이프 길이: 자동(Auto)",
  "여백(Margin): 없음",
  "라벨 사이 빈 간격은 프린터 컷/피드 여백일 수 있음",
] as const
