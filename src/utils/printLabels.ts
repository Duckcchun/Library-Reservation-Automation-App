import {
  LABEL_LENGTH_MM,
  LABEL_TAPE_WIDTH_MM,
  MM_TO_PT,
  PRINTER_DPI,
  NAMES_PER_LABEL,
} from "@/constants"

function mmToPx(mm: number): number {
  return Math.round((mm / 25.4) * PRINTER_DPI)
}

function ptToPx(pt: number): number {
  return (pt / 72) * PRINTER_DPI
}

function chunkNames(names: string[]): string[][] {
  const chunks: string[][] = []
  for (let i = 0; i < names.length; i += NAMES_PER_LABEL) {
    chunks.push(names.slice(i, i + NAMES_PER_LABEL))
  }
  return chunks
}

export function countLabelPages(namesCount: number): number {
  return Math.ceil(namesCount / NAMES_PER_LABEL)
}

async function ensureFontLoaded(fontSizePx: number): Promise<void> {
  await document.fonts.load(`700 ${fontSizePx}px "Noto Sans KR"`)
  await document.fonts.ready
}

/** 30×12mm 라벨 PNG — 최대 2명, 좌우 반칸씩 왼쪽 정렬 */
async function renderLabelPng(namesOnLabel: string[], fontSizePt: number): Promise<Uint8Array> {
  const pxW = mmToPx(LABEL_LENGTH_MM)
  const pxH = mmToPx(LABEL_TAPE_WIDTH_MM)
  const halfW = pxW / 2
  const padding = Math.round(pxW * 0.04)

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

  const maxWidthForName = (index: number) => {
    if (namesOnLabel.length === 1) return pxW * 0.94
    return halfW * 0.92 - padding
  }

  while (fontSizePx > minFontSizePx) {
    ctx.font = `700 ${fontSizePx}px "Noto Sans KR", sans-serif`
    const fitsAll = namesOnLabel.every((name, i) => {
      const textW = ctx.measureText(name).width
      const textH = fontSizePx * 1.05
      return textW <= maxWidthForName(i) && textH <= pxH * 0.9
    })
    if (fitsAll) break
    fontSizePx -= 0.5
    await ensureFontLoaded(fontSizePx)
  }

  ctx.fillStyle = "#000000"
  ctx.font = `700 ${fontSizePx}px "Noto Sans KR", sans-serif`
  ctx.textAlign = "left"
  ctx.textBaseline = "middle"

  if (namesOnLabel.length === 1) {
    ctx.fillText(namesOnLabel[0], padding, pxH / 2)
  } else {
    ctx.fillText(namesOnLabel[0], padding, pxH / 2)
    ctx.fillText(namesOnLabel[1], halfW + padding, pxH / 2)
  }

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

  for (const pair of chunkNames(names)) {
    const pngBytes = await renderLabelPng(pair, fontSizePt)
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

  const pageCount = countLabelPages(names.length)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `라벨_${names.length}명_${pageCount}장.pdf`
  anchor.click()

  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
