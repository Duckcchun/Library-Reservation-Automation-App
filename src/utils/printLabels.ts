import {
  LABEL_LENGTH_MM,
  LABEL_TAPE_WIDTH_MM,
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

const FONT_FAMILY = '"Noto Sans KR", sans-serif'
const FONT_WEIGHT = 700

async function ensureFontReady(fontSizePx: number): Promise<void> {
  await document.fonts.load(`${FONT_WEIGHT} ${fontSizePx}px ${FONT_FAMILY}`)
  await document.fonts.ready
}

function setCanvasFont(ctx: CanvasRenderingContext2D, fontSizePx: number): void {
  ctx.font = `${FONT_WEIGHT} ${fontSizePx}px ${FONT_FAMILY}`
}

type LabelLayout = {
  fontSizePx: number
  slots: Array<{ name: string; x: number; width: number }>
}

function buildLabelLayout(namesOnLabel: string[], pxW: number, fontSizePt: number): LabelLayout {
  const padding = Math.round(pxW * 0.04)
  const fontSizePx = ptToPx(fontSizePt)

  if (namesOnLabel.length === 1) {
    return {
      fontSizePx,
      slots: [{ name: namesOnLabel[0], x: padding, width: pxW - padding * 2 }],
    }
  }

  const halfW = pxW / 2
  const slotWidthPx = halfW - padding * 2

  return {
    fontSizePx,
    slots: namesOnLabel.map((name, index) => ({
      name,
      x: index === 0 ? padding : halfW + padding,
      width: slotWidthPx,
    })),
  }
}

/** 30×12mm 라벨 PNG — 최대 2명, 슬라이더 pt 그대로 사용 */
async function renderLabelDataUrl(namesOnLabel: string[], fontSizePt: number): Promise<string> {
  const pxW = mmToPx(LABEL_LENGTH_MM)
  const pxH = mmToPx(LABEL_TAPE_WIDTH_MM)

  const canvas = document.createElement("canvas")
  canvas.width = pxW
  canvas.height = pxH
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas를 초기화할 수 없습니다.")

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, pxW, pxH)

  const layout = buildLabelLayout(namesOnLabel, pxW, fontSizePt)
  await ensureFontReady(layout.fontSizePx)

  ctx.fillStyle = "#000000"
  setCanvasFont(ctx, layout.fontSizePx)
  ctx.textAlign = "left"
  ctx.textBaseline = "middle"

  for (const slot of layout.slots) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(slot.x, 0, slot.width, pxH)
    ctx.clip()
    ctx.fillText(slot.name, slot.x, pxH / 2)
    ctx.restore()
  }

  return canvas.toDataURL("image/png")
}

function buildPrintHtml(pages: string[]): string {
  const pageHtml = pages
    .map(
      (src) =>
        `<div class="page"><img src="${src}" alt="" width="${LABEL_LENGTH_MM}mm" height="${LABEL_TAPE_WIDTH_MM}mm" /></div>`,
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>라벨 인쇄</title>
  <style>
    @page {
      size: ${LABEL_LENGTH_MM}mm ${LABEL_TAPE_WIDTH_MM}mm;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: ${LABEL_LENGTH_MM}mm;
      height: ${LABEL_TAPE_WIDTH_MM}mm;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }
    .page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    img {
      display: block;
      width: ${LABEL_LENGTH_MM}mm;
      height: ${LABEL_TAPE_WIDTH_MM}mm;
      object-fit: fill;
    }
  </style>
</head>
<body>${pageHtml}</body>
</html>`
}

export async function printLabels(names: string[], fontSizePt: number): Promise<void> {
  const pairs = chunkNames(names)
  const pages = await Promise.all(pairs.map((pair) => renderLabelDataUrl(pair, fontSizePt)))

  const iframe = document.createElement("iframe")
  iframe.setAttribute("aria-hidden", "true")
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none"
  document.body.appendChild(iframe)

  const win = iframe.contentWindow
  const doc = iframe.contentDocument ?? win?.document
  if (!win || !doc) {
    iframe.remove()
    throw new Error("인쇄 창을 열 수 없습니다.")
  }

  doc.open()
  doc.write(buildPrintHtml(pages))
  doc.close()

  await new Promise<void>((resolve) => {
    const done = () => resolve()
    if (doc.readyState === "complete") {
      resolve()
      return
    }
    iframe.addEventListener("load", done, { once: true })
    setTimeout(done, 500)
  })

  await new Promise<void>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      iframe.remove()
      resolve()
    }

    win.addEventListener("afterprint", finish, { once: true })
    win.focus()
    win.print()
    setTimeout(finish, 60_000)
  })
}
