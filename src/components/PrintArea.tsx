import {
  LABEL_WIDTH_MM,
  LABEL_HEIGHT_MM,
  DEFAULT_FONT_SIZE_PT,
} from "@/constants"

type PrintAreaProps = {
  names: string[]
  /** 브라우저 직접 인쇄(보조)용 — PDF 인쇄와 별개 */
  fontSize?: number
}

export function PrintArea({ names, fontSize = DEFAULT_FONT_SIZE_PT }: PrintAreaProps) {
  return (
    <>
      <style>{`
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: ${LABEL_WIDTH_MM}mm !important;
            height: ${LABEL_HEIGHT_MM}mm !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }

          @page {
            margin: 0 !important;
            size: ${LABEL_WIDTH_MM}mm ${LABEL_HEIGHT_MM}mm;
          }

          #print-area {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: ${LABEL_WIDTH_MM}mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .label-item {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: ${LABEL_WIDTH_MM}mm !important;
            height: ${LABEL_HEIGHT_MM}mm !important;
            background: white !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            position: relative !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }

          .label-item:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }

          .label-name {
            font-weight: 700 !important;
            font-size: ${DEFAULT_FONT_SIZE_PT}pt !important;
            color: black !important;
            letter-spacing: -0.02em !important;
            text-align: center !important;
            word-break: keep-all !important;
            font-family: 'Noto Sans KR', sans-serif !important;
            width: ${LABEL_WIDTH_MM}mm !important;
            height: ${LABEL_HEIGHT_MM}mm !important;
            overflow: hidden !important;
            white-space: nowrap !important;
            line-height: ${LABEL_HEIGHT_MM}mm !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            box-sizing: border-box !important;
            transform: none !important;
            zoom: 1 !important;
          }
        }
      `}</style>

      <div
        id="print-area"
        className="print:block hidden"
        style={{ ["--label-font-size" as string]: `${fontSize}pt` }}
      >
        {names.map((name, i) => (
          <div key={i} className="label-item">
            <span className="label-name">{name}</span>
          </div>
        ))}
      </div>
    </>
  )
}
