import { describe, it, expect, beforeEach, vi } from "vitest"
import { readFileSync } from "fs"
import path from "path"
import PdfDocument from "@/utils/pdf"

const ADDRESS = "0x7bf1399836dcdd239a4dede2ba4aac918de29572"

const parent = {
  $gettext: (s: string) => s,
  $ngettext: (s: string) => s,
  $config: {},
  $modal: { args: { value: [{ params: { account: { curr: "RAD" } } }] } },
  numericFormat: (s: string) => s,
}

function tx(related: string) {
  return {
    date: new Date("2026-06-25T13:10:31Z"),
    related,
    description: "Test remboursement par structure",
    amountUnit: -100n,
    isTopUp: false,
    isReconversion: false,
  }
}

async function preparedReport(txs: any[]) {
  const report: any = new PdfDocument({}, txs, parent)
  report._init()
  await report.setFont("NotoSans")
  await report._computeColumnWidths(txs)
  return report
}

function drawnWidth(report: any, text: string, style: any) {
  const doc = report.doc
  const saved = { font: doc.getFont(), size: doc.getFontSize() }
  doc.setFont(style.fontName)
  doc.setFontSize(style.fontSize)
  const w = doc.getTextWidth(text)
  doc.setFont(saved.font.fontName, saved.font.fontStyle)
  doc.setFontSize(saved.size)
  return w
}

describe("PDF account statement: wallet address in « From / To »", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", async (url: string) => {
      const file = path.resolve(__dirname, "../../../public", url.slice(1))
      const buf = readFileSync(file)
      return {
        arrayBuffer: async () =>
          buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      }
    })
  })

  it("draws a raw address on a single line that fits its column", async () => {
    const txs = [tx(ADDRESS)]
    const report = await preparedReport(txs)
    const col = report.columns.related
    const style = col.style(txs[0])

    const lines = await report.getValueStrWrapped(col, txs[0], 0)

    expect(lines).toEqual([ADDRESS])
    expect(drawnWidth(report, ADDRESS, style)).toBeLessThanOrEqual(col._width)
  })

  it("wraps addresses independently of the document's current font size", async () => {
    const txs = [tx(ADDRESS)]
    const report = await preparedReport(txs)
    const col = report.columns.related
    // Simulate leftover state from previously drawn elements.
    report.doc.setFontSize(16)

    const lines = await report.getValueStrWrapped(col, txs[0], 0)

    expect(lines).toEqual([ADDRESS])
  })

  it("keeps every wrapped line of a long name within its column", async () => {
    const name = "Association des producteurs et commerçants du marché"
    const txs = [tx(name)]
    const report = await preparedReport(txs)
    const col = report.columns.related

    const lines = await report.getValueStrWrapped(col, txs[0], 0)

    for (const line of lines) {
      const w = drawnWidth(report, line, { fontName: "NotoSans", fontSize: 8 })
      expect(w).toBeLessThanOrEqual(col._width)
    }
  })
})
