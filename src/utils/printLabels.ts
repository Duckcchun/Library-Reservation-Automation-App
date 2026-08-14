import {
  LABEL_LENGTH_MM,
  LABEL_TAPE_WIDTH_MM,
  NAMES_PER_LABEL,
  NAME_LEFT_PADDING_MM,
  NAME_RIGHT_PADDING_MM,
  NAME_COLUMN_GAP_MM,
  NAME_OFFSET_Y_MM,
} from "@/constants"
import { getLibraryColor, normalizeLibraryName } from "@/constants/library"
import type { LibraryInfo } from "@/utils/parseNames"

function chunkLibraries(libraries: LibraryInfo[]): LibraryInfo[][] {
  const chunks: LibraryInfo[][] = []
  for (let i = 0; i < libraries.length; i += NAMES_PER_LABEL) {
    chunks.push(libraries.slice(i, i + NAMES_PER_LABEL))
  }
  return chunks
}

export function countLabelPages(librariesCount: number): number {
  return Math.ceil(librariesCount / NAMES_PER_LABEL)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function buildLabelPage(librariesOnLabel: LibraryInfo[]): string {
  if (librariesOnLabel.length === 1) {
    const lib = librariesOnLabel[0]
    const normalizedLibrary = normalizeLibraryName(lib.name)
    const libraryColor = getLibraryColor(normalizedLibrary)
    
    return `<div class="page">
      <div class="label label-single">
        <div class="user-name">${escapeHtml(lib.user)}</div>
        <div class="library-name" style="color: ${libraryColor}">${escapeHtml(normalizedLibrary)}</div>
      </div>
    </div>`
  }

  const lib1 = librariesOnLabel[0]
  const lib2 = librariesOnLabel[1]
  const normalizedLibrary1 = normalizeLibraryName(lib1.name)
  const normalizedLibrary2 = normalizeLibraryName(lib2.name)
  const libraryColor1 = getLibraryColor(normalizedLibrary1)
  const libraryColor2 = getLibraryColor(normalizedLibrary2)

  return `<div class="page">
    <div class="label label-pair">
      <div class="user-column">
        <div class="user-name">${escapeHtml(lib1.user)}</div>
        <div class="library-name" style="color: ${libraryColor1}">${escapeHtml(normalizedLibrary1)}</div>
      </div>
      <div class="user-column">
        <div class="user-name">${escapeHtml(lib2.user)}</div>
        <div class="library-name" style="color: ${libraryColor2}">${escapeHtml(normalizedLibrary2)}</div>
      </div>
    </div>
  </div>`
}

function buildPrintHtml(pages: LibraryInfo[][], fontSizePt: number): string {
  const body = pages.map((pair) => buildLabelPage(pair)).join("")

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>라벨 인쇄</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gothic+A1:wght@700&display=swap" />
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
      padding-top: ${NAME_OFFSET_Y_MM}mm;
    }

    .user-name {
      font-family: "Gothic A1", "D2Coding", sans-serif;
      font-weight: 700;
      font-size: ${fontSizePt}pt;
      line-height: 1;
      color: #000;
      white-space: nowrap;
      letter-spacing: 0.2em;
      font-variant-numeric: tabular-nums;
    }

    .library-name {
      font-family: "Gothic A1", "D2Coding", sans-serif;
      font-weight: 700;
      font-size: ${Math.round(fontSizePt * 0.7)}pt;
      line-height: 1;
      white-space: nowrap;
      letter-spacing: 0.15em;
      margin-top: 0.5mm;
      font-variant-numeric: tabular-nums;
    }

    .label-single {
      display: flex;
      flex-direction: column;
      padding-left: ${NAME_LEFT_PADDING_MM}mm;
    }

    .label-single .user-name {
      padding-right: ${NAME_RIGHT_PADDING_MM}mm;
    }

    .label-pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: start;
      column-gap: ${NAME_COLUMN_GAP_MM}mm;
    }

    .user-column {
      display: flex;
      flex-direction: column;
      padding-left: ${NAME_LEFT_PADDING_MM}mm;
      padding-right: ${NAME_RIGHT_PADDING_MM}mm;
    }
  </style>
</head>
<body>${body}</body>
</html>`
}

async function waitForIframeFonts(doc: Document, fontSizePt: number): Promise<void> {
  const fonts = doc.fonts
  if (!fonts) return

  await fonts.load(`700 12pt "Gothic A1"`)
  await fonts.load(`700 ${fontSizePt}pt "Gothic A1"`)
  await fonts.load(`700 ${Math.round(fontSizePt * 0.7)}pt "Gothic A1"`)
  await fonts.ready
}

export async function printLabels(libraries: LibraryInfo[], fontSizePt: number): Promise<void> {
  const pages = chunkLibraries(libraries)
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
