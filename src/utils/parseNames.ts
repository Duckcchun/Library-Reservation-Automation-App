import * as XLSX from "xlsx"

export type ParseStats = {
  total: number
  valid: number
  filtered: number
}

const KOREAN_NAME_PATTERN = /^[가-힣]{2,4}$/
const ENGLISH_NAME_PATTERN = /^[a-zA-Z\s]{2,30}$/

function isValidName(name: string): boolean {
  return KOREAN_NAME_PATTERN.test(name) || ENGLISH_NAME_PATTERN.test(name)
}

export async function parseNames(
  file: File,
): Promise<{ names: string[]; stats: ParseStats }> {
  const data = await file.arrayBuffer()
  const wb = XLSX.read(new Uint8Array(data), { type: "array" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 }) as string[][]

  if (!raw.length) throw new Error("시트에 데이터가 없습니다.")

  const headerRowIdx = raw.findIndex((row) =>
    row.some((cell) => String(cell ?? "").trim() === "예약자"),
  )
  if (headerRowIdx === -1) {
    throw new Error('"예약자" 열을 찾을 수 없습니다. 파일 형식을 확인해 주세요.')
  }

  const headers = raw[headerRowIdx].map((h) => String(h ?? "").trim())
  const colIdx = headers.indexOf("예약자")

  const processedRows: string[] = []
  const filteredNames: string[] = []

  raw
    .slice(headerRowIdx + 1)
    .map((row) => String(row[colIdx] ?? "").trim())
    .forEach((name) => {
      if (!name) return

      processedRows.push(name)

      if (!isValidName(name)) {
        console.log(`필터링된 이름: "${name}" (이름 패턴 불일치)`)
        return
      }

      filteredNames.push(name)
    })

  const stats: ParseStats = {
    total: processedRows.length,
    valid: filteredNames.length,
    filtered: processedRows.length - filteredNames.length,
  }

  console.log(
    `파싱 통계: 총 ${stats.total}개 행 중 ${stats.valid}개 유효, ${stats.filtered}개 필터링됨`,
  )

  const koreanNames = filteredNames.filter((name) => KOREAN_NAME_PATTERN.test(name))
  const englishNames = filteredNames.filter((name) => ENGLISH_NAME_PATTERN.test(name))

  koreanNames.sort((a, b) => a.localeCompare(b, "ko"))
  englishNames.sort((a, b) => a.localeCompare(b, "en"))

  return {
    names: [...koreanNames, ...englishNames],
    stats,
  }
}
