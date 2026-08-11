import {
  LABEL_WIDTH_MM,
  LABEL_HEIGHT_MM,
  MM_TO_PT,
  NOTO_SANS_KR_BOLD_URL,
  LABEL_TEXT_Y_OFFSET_PT,
} from "@/constants"

type PdfFont = {
  widthOfTextAtSize: (text: string, size: number) => number
  heightAtSize: (size: number, options?: { descender?: boolean }) => number
}

let cachedFontBytes: ArrayBuffer | null = null

async function loadPdfLib() {
  const [{ PDFDocument, rgb }, { default: fontkit }] = await Promise.all([
    import("pdf-lib"),
    import("@pdf-lib/fontkit"),
  ])
  return { PDFDocument, rgb, fontkit }
}

async function loadFontBytes(): Promise<ArrayBuffer> {
  if (cachedFontBytes) return cachedFontBytes

  const response = await fetch(NOTO_SANS_KR_BOLD_URL)
  if (!response.ok) {
    throw new Error("한글 폰트를 불러오지 못했습니다. 네트워크 연결을 확인해 주세요.")
  }

  cachedFontBytes = await response.arrayBuffer()
  return cachedFontBytes
}

/** WOFF 등에서 CJK 폭이 비정상일 때 대비 */
function measureTextWidth(font: PdfFont, text: string, size: number, pageWidth: number): number {
  const measured = font.widthOfTextAtSize(text, size)
  const approx = size * [...text].length * 0.92

  if (measured <= 0 || measured > pageWidth * 1.05) {
    return Math.min(approx, pageWidth * 0.95)
  }

  return measured
}

function fitFontSize(
  name: string,
  font: PdfFont,
  requestedPt: number,
  maxWidthPt: number,
  pageWidth: number,
): number {
  let size = requestedPt
  const minSize = 8

  while (size > minSize && measureTextWidth(font, name, size, pageWidth) > maxWidthPt) {
    size -= 0.5
  }

  return size
}

function computeTextPosition(
  font: PdfFont,
  name: string,
  size: number,
  pageWidth: number,
  pageHeight: number,
) {
  const textWidth = measureTextWidth(font, name, size, pageWidth)
  const x = Math.max(0, (pageWidth - textWidth) / 2)

  // baseline — descender 제외 높이 기준 + 위쪽 보정
  const capHeight = font.heightAtSize(size, { descender: false })
  const y = (pageHeight - capHeight) / 2 + LABEL_TEXT_Y_OFFSET_PT

  return { x, y }
}

export async function generateLabelPdf(
  names: string[],
  fontSizePt: number,
): Promise<Uint8Array> {
  const { PDFDocument, rgb, fontkit } = await loadPdfLib()

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  const fontBytes = await loadFontBytes()
  const font = await pdfDoc.embedFont(fontBytes)

  const pageWidth = LABEL_WIDTH_MM * MM_TO_PT
  const pageHeight = LABEL_HEIGHT_MM * MM_TO_PT
  const maxTextWidth = pageWidth * 0.92

  for (const name of names) {
    const page = pdfDoc.addPage([pageWidth, pageHeight])
    page.setMediaBox(0, 0, pageWidth, pageHeight)
    page.setCropBox(0, 0, pageWidth, pageHeight)

    const size = fitFontSize(name, font, fontSizePt, maxTextWidth, pageWidth)
    const { x, y } = computeTextPosition(font, name, size, pageWidth, pageHeight)

    page.drawText(name, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
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

export async function printLabelPdf(names: string[], fontSizePt: number): Promise<void> {
  const pdfBytes = await generateLabelPdf(names, fontSizePt)
  const blob = new Blob([pdfBytes], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "none"
    iframe.src = url

    const cleanup = () => {
      iframe.remove()
      URL.revokeObjectURL(url)
    }

    iframe.onload = () => {
      try {
        const win = iframe.contentWindow
        if (!win) throw new Error("PDF 인쇄 창을 열 수 없습니다.")

        win.focus()
        win.print()

        win.addEventListener("afterprint", () => {
          cleanup()
          resolve()
        })

        setTimeout(() => {
          cleanup()
          resolve()
        }, 60_000)
      } catch (err) {
        cleanup()
        reject(err instanceof Error ? err : new Error("PDF 인쇄에 실패했습니다."))
      }
    }

    iframe.onerror = () => {
      cleanup()
      reject(new Error("PDF를 불러오지 못했습니다."))
    }

    document.body.appendChild(iframe)
  })
}

export function printLabelsDirect(): void {
  window.print()
}
