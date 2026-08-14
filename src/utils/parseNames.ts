import * as XLSX from "xlsx"

export type ParseStats = {
  total: number
  valid: number
  filtered: number
}

export type LibraryInfo = {
  name: string
  user: string
}

const KOREAN_NAME_PATTERN = /^[가-힣]{2,4}$/
const ENGLISH_NAME_PATTERN = /^[a-zA-Z\s]{2,30}$/

function isValidName(name: string): boolean {
  return KOREAN_NAME_PATTERN.test(name) || ENGLISH_NAME_PATTERN.test(name)
}

export async function parseNames(
  file: File,
): Promise<{ libraries: LibraryInfo[]; stats: ParseStats }> {
  const data = await file.arrayBuffer()
  const wb = XLSX.read(new Uint8Array(data), { type: "array" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 }) as string[][]

  if (!raw.length) throw new Error("시트에 데이터가 없습니다.")

  // '이용자명' 또는 '예약자' 헤더가 있는 행을 찾음
  const NAME_HEADERS = ["이용자명", "예약자"]
  let headerRowIdx = -1
  let nameHeaderFound = ""

  for (const header of NAME_HEADERS) {
    headerRowIdx = raw.findIndex((row) =>
      row.some((cell) => String(cell ?? "").trim() === header),
    )
    if (headerRowIdx !== -1) {
      nameHeaderFound = header
      break
    }
  }

  if (headerRowIdx === -1) {
    throw new Error('"이용자명" 또는 "예약자" 열을 찾을 수 없습니다. 파일 형식을 확인해 주세요.')
  }

  const headers = raw[headerRowIdx].map((h) => String(h ?? "").trim())
  const userColIdx = headers.indexOf(nameHeaderFound)
  const libraryColIdx = headers.indexOf("요청도서관")

  // 요청도서관 열이 없으면 기본값 사용
  const DEFAULT_LIBRARY = "자양한강도서관"

  const processedRows: LibraryInfo[] = []
  const filteredLibraries: LibraryInfo[] = []

  raw
    .slice(headerRowIdx + 1)
    .forEach((row) => {
      const userName = String(row[userColIdx] ?? "").trim()
      const libraryName = libraryColIdx !== -1
        ? String(row[libraryColIdx] ?? "").trim()
        : DEFAULT_LIBRARY

      if (!userName) return
      // 요청도서관 열이 있을 때만 도서관 빈 값 체크
      if (libraryColIdx !== -1 && !libraryName) return

      processedRows.push({ name: libraryName, user: userName })

      if (!isValidName(userName)) {
        console.log(`필터링된 이름: "${userName}" (이름 패턴 불일치)`)
        return
      }

      filteredLibraries.push({ name: libraryName, user: userName })
    })

  const stats: ParseStats = {
    total: processedRows.length,
    valid: filteredLibraries.length,
    filtered: processedRows.length - filteredLibraries.length,
  }

  console.log(
    `파싱 통계: 총 ${stats.total}개 행 중 ${stats.valid}개 유효, ${stats.filtered}개 필터링됨`,
  )

  // 도서관별로 정렬
  filteredLibraries.sort((a, b) => {
    // 먼저 도서관 이름으로 정렬
    const libraryCompare = a.name.localeCompare(b.name, "ko")
    if (libraryCompare !== 0) return libraryCompare
    // 같은 도서관이면 이용자 이름으로 정렬
    return a.user.localeCompare(b.user, "ko")
  })

  return {
    libraries: filteredLibraries,
    stats,
  }
}
