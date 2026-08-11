import {
  PDF_PAGE_WIDTH_MM,
  PDF_PAGE_HEIGHT_MM,
  LABEL_LENGTH_MM,
  LABEL_TAPE_WIDTH_MM,
  MM_TO_PT,
  PRINTER_DPI,
} from "@/constants"

function mmToPx(mm: number): number {
  return Math.round((mm / 25.4) * PRINTER_DPI)
}

function ptToPx(pt: number): number {
  return (pt / 72) * PRINTER_DPI
}

async function ensureFontLoaded(fontSizePx: number): Promise<void> {
  await document.fonts.load(`700 ${fontSizePx}px "Noto Sans KR"`)
  await document.fonts.ready
}

/**
 * Epson 12mm 드라이버용 라벨 PNG 생성
 * - 캔버스 12×30mm (세로) = 드라이버 용지와 동일
 * - 텍스트 90° 회전 → 30mm 길이 방향으로 이름 표시
 * - 가운데 정렬, 여백 없이 전체 채움
 */
async function renderLabelPng(name: string, fontSizePt: number): Promise<Uint8Array> {
  const pxW = mmToPx(LABEL_TAPE_WIDTH_MM)
  const pxH = mmToPx(LABEL_LENGTH_MM)

  const canvas = document.createElement("canvas")
  canvas.width = pxW
  canvas.height = pxH
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas를 초기화할 수 없습니다.")

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, pxW, pxH)

  let fontSizePx = ptToPx(fontSizePt)
  const minFontSizePx = ptToPx(8)

  await ensureFontLoaded(fontSizePx)

  // 회전 후 텍스트 길이 = 30mm 방향, 글자 높이 = 12mm 방향
  while (fontSizePx > minFontSizePx) {
    ctx.font = `700 ${fontSizePx}px "Noto Sans KR", sans-serif`
    const metrics = ctx.measureText(name)
    const textW = metrics.width
    const textH = fontSizePx * 1.05

    if (textW <= pxH * 0.92 && textH <= pxW * 0.88) break
    fontSizePx -= 0.5
    await ensureFontLoaded(fontSizePx)
  }

  ctx.fillStyle = "#000000"
  ctx.font = `700 ${fontSizePx}px "Noto Sans KR", sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  // 90° 회전 → 이름이 30mm(세로) 방향으로 흐름
  ctx.save()
  ctx.translate(pxW / 2, pxH / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText(name, 0, 0)
  ctx.restore()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG 변환 실패"))), "image/png")
  })

  return new Uint8Array(await blob.arrayBuffer())
}

export async function generateLabelPdf(
  names: string[],
  fontSizePt: number,
): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib")

  const pdfDoc = await PDFDocument.create()
  const pageWidth = PDF_PAGE_WIDTH_MM * MM_TO_PT
  const pageHeight = PDF_PAGE_HEIGHT_MM * MM_TO_PT

  for (const name of names) {
    const pngBytes = await renderLabelPng(name, fontSizePt)
    const pngImage = await pdfDoc.embedPng(pngBytes)

    const page = pdfDoc.addPage([pageWidth, pageHeight])
    page.setMediaBox(0, 0, pageWidth, pageHeight)
    page.setCropBox(0, 0, pageWidth, pageHeight)

    // 비트맵으로 페이지 전체를 채움 → 드라이버가 텍스트만 따로 밀어낼 수 없음
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    })
  }

  return pdfDoc.save()
}

export async function downloadLabelPdf(names: string[], fontSizePt: number): Promise<void> {
  const pdfBytes = await generateLabelPdf(names, fontSizePt)
  const blob = new Blob([pdfBytes], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `라벨_${names.length}장.pdf`
  anchor.click()

  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export async function openLabelPdf(names: string[], fontSizePt: number): Promise<void> {
  const pdfBytes = await generateLabelPdf(names, fontSizePt)
  const blob = new Blob([pdfBytes], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)

  const win = window.open(url, "_blank")
  if (!win) {
    URL.revokeObjectURL(url)
    throw new Error("팝업이 차단되었습니다. 'PDF 저장' 버튼을 사용해 주세요.")
  }

  setTimeout(() => URL.revokeObjectURL(url), 300_000)
}
