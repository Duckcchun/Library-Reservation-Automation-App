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

async function ensureFontLoaded(fontSizePx: number): Promise<void> {
  await document.fonts.load(`700 ${fontSizePx}px "Noto Sans KR"`)
  await document.fonts.ready
}

/** 30×12mm 라벨 PNG — 최대 2명, 좌우 반칸씩 왼쪽 정렬 */
async function renderLabelDataUrl(namesOnLabel: string[], fontSizePt: number): Promise<string> {
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
