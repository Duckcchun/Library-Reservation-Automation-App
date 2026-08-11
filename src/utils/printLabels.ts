import {
  LABEL_LENGTH_MM,
  LABEL_TAPE_WIDTH_MM,
  NAMES_PER_LABEL,
} from "@/constants"

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function buildLabelPage(namesOnLabel: string[]): string {
  if (namesOnLabel.length === 1) {
    return `<div class="page">
      <div class="label label-single">
        <span class="name">${escapeHtml(namesOnLabel[0])}</span>
      </div>
    </div>`
  }

  return `<div class="page">
    <div class="label label-pair">
      <span class="name">${escapeHtml(namesOnLabel[0])}</span>
      <span class="name">${escapeHtml(namesOnLabel[1])}</span>
    </div>
  </div>`
}

function buildPrintHtml(pages: string[][], fontSizePt: number): string {
  const body = pages.map((pair) => buildLabelPage(pair)).join("")

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>라벨 인쇄</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap" />
  <style>
    @page {
      size: ${LABEL_LENGTH_MM}mm ${LABEL_TAPE_WIDTH_MM}mm;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
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
      overflow: visible;
      page-break-after: always;
      break-after: page;
    }

    .page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .label {
      width: ${LABEL_LENGTH_MM}mm;
      height: ${LABEL_TAPE_WIDTH_MM}mm;
      overflow: visible;
    }

    .name {
      font-family: "Noto Sans KR", sans-serif;
      font-weight: 700;
      font-size: ${fontSizePt}pt;
      line-height: 1;
      color: #000;
      white-space: nowrap;
      letter-spacing: -0.02em;
    }

    .label-single {
      display: flex;
      align-items: center;
      padding-left: 1mm;
    }

    .label-pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
    }

    .label-pair .name {
      padding-left: 1mm;
    }
  </style>
</head>
<body>${body}</body>
</html>`
}

async function waitForIframeFonts(doc: Document, fontSizePt: number): Promise<void> {
  const fonts = doc.fonts
  if (!fonts) return

  await fonts.load(`700 12pt "Noto Sans KR"`)
  await fonts.load(`700 ${fontSizePt}pt "Noto Sans KR"`)
  await fonts.ready
}

export async function printLabels(names: string[], fontSizePt: number): Promise<void> {
  const pages = chunkNames(names)
  const html = buildPrintHtml(pages, fontSizePt)

  const iframe = document.createElement("iframe")
  iframe.setAttribute("aria-hidden", "true")
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none"
  document.body.appendChild(iframe)

  const win = iframe.contentWindow
  const doc = iframe.contentDocument ?? win?.document
  if (!win || !doc) {
    iframe.remove()
    throw new Error("인쇄 창을 열 수 없습니다.")
  }

  doc.open()
  doc.write(html)
  doc.close()

  await new Promise<void>((resolve) => {
    const done = () => resolve()
    if (doc.readyState === "complete") {
      resolve()
      return
    }
    iframe.addEventListener("load", done, { once: true })
    setTimeout(done, 800)
  })

  await waitForIframeFonts(doc, fontSizePt)

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
