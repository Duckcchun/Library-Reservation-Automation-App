import {
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

/** 30×12mm 가로 라벨 PNG (180dpi, 가운데 정렬) */
async function renderLabelPng(name: string, fontSizePt: number): Promise<Uint8Array> {
  const pxW = mmToPx(LABEL_LENGTH_MM)
  const pxH = mmToPx(LABEL_TAPE_WIDTH_MM)

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

  while (fontSizePx > minFontSizePx) {
    ctx.font = `700 ${fontSizePx}px "Noto Sans KR", sans-serif`
    const textW = ctx.measureText(name).width
    const textH = fontSizePx * 1.05

    if (textW <= pxW * 0.94 && textH <= pxH * 0.9) break
    fontSizePx -= 0.5
    await ensureFontLoaded(fontSizePx)
  }

  ctx.fillStyle = "#000000"
  ctx.font = `700 ${fontSizePx}px "Noto Sans KR", sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(name, pxW / 2, pxH / 2)

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

  const pageWidth = LABEL_LENGTH_MM * MM_TO_PT
  const pageHeight = LABEL_TAPE_WIDTH_MM * MM_TO_PT
  const pdfDoc = await PDFDocument.create()

  for (const name of names) {
    const pngBytes = await renderLabelPng(name, fontSizePt)
    const pngImage = await pdfDoc.embedPng(pngBytes)
    const page = pdfDoc.addPage([pageWidth, pageHeight])

    page.setMediaBox(0, 0, pageWidth, pageHeight)
    page.setCropBox(0, 0, pageWidth, pageHeight)

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
