import * as XLSX from "xlsx"

/** EPD10 연속 인쇄용 엑셀 (예약자 열) */
export function downloadEpd10Excel(names: string[]): void {
  const rows: string[][] = [["예약자"], ...names.map((name) => [name])]
  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "라벨")

  XLSX.writeFile(workbook, `EPD10_라벨명단_${names.length}명.xlsx`)
}
