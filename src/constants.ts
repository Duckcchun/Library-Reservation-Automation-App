export const FONT = "'Noto Sans KR', 'Inter', system-ui, sans-serif"

export const SUPPORTED_EXTENSIONS = ["xlsx", "xls", "csv"] as const

/** 라벨 길이 (테이프 피드 방향) mm */
export const LABEL_LENGTH_MM = 30
/** 테이프 폭 mm */
export const LABEL_TAPE_WIDTH_MM = 12

export const DEFAULT_FONT_SIZE_PT = 24
export const PRINTER_DPI = 180
export const MM_TO_PT = 72 / 25.4

/** EPD10에서 한 번만 설정하면 됨 */
export const EPD10_SETUP_STEPS = [
  "EPD10 실행 → 새 라벨 → LW-K600 → 테이프 12mm",
  "테이프 길이: 수동(Manual) → 30mm",
  "텍스트 객체 추가 → 가로·세로 가운데 정렬",
  "파일 → 삽입할 데이터 → 불러오기 → 아래 엑셀 선택",
  "인쇄 → 「연속으로 삽입하기」 체크 → 인쇄",
] as const

export const EPD10_PRINT_TIPS = [
  "Windows + LW-K600은 EPD10 연속 인쇄가 공식 방법",
  "EPD10: 테이프 12mm · 길이 수동 30mm · 가운데 정렬",
  "프린터 본체: PC 연결 모드 (PC 버튼)",
  "PDF + 12mm 테이프 드라이버 조합은 정상 출력 불가",
] as const
