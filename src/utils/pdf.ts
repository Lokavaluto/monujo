import jsPDF from "jspdf"

import moment from "moment"

type Pos = { x: number; y: number }
type Box = { w: number; h: number }

function loadImageAsDataURL(
  src: string
): Promise<{ dataURL: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.setAttribute("crossOrigin", "anonymous")
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      ctx.drawImage(img, 0, 0)
      resolve({
        dataURL: canvas.toDataURL("image/png"),
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    img.onerror = function (ev) {
      reject(new Error(`Failed to load image: ${src}`))
    }
    img.src = src
  })
}

function capitalizeFirst(str: string): string {
  if (!str) return str
  return str[0].toUpperCase() + str.slice(1).toLowerCase()
}

function dateFormat(date: any) {
  return moment(date).format("YYYY-MM-DD")
}

let strAmount2intCents = (dataStrAmount: string): bigint => {
  // Check format XX...XX.YY
  if (!/^-?[0-9]+\.[0-9]{2}$/.test(dataStrAmount)) {
    throw Error(`Unexpected amount string: ${JSON.stringify(dataStrAmount)}`)
  }
  return BigInt(dataStrAmount.replace(".", ""))
}

let intCents2strAmount = (dataIntCents: bigint): string => {
  let sign = ""
  if (dataIntCents < 0n) {
    dataIntCents = -dataIntCents
    sign = "-"
  }
  let dataStr = dataIntCents.toString().padStart(3, "0")
  return `${sign}${dataStr.slice(0, -2)}.${dataStr.slice(-2)}`
}

function makeAddressBlock(contact: any): string[] {
  return [
    ...(contact.name ? [contact.name] : []),
    ...(contact.street ? [contact.street] : []),
    ...(contact.street2 ? [contact.street2] : []),
    ...(contact.zip || contact.city
      ? [
          [
            ...(contact.zip ? [contact.zip] : []),
            ...(contact.city ? [contact.city] : []),
          ].join(" "),
        ]
      : []),
  ]
}

async function evalIfFunction(
  fnOrDirect: Function | any,
  aThis: any,
  args: any[]
) {
  if (typeof fnOrDirect === "function") {
    return await fnOrDirect.apply(aThis, args)
  }
  return fnOrDirect
}

class PdfDocument {
  // Configuration

  page = {
    height: 297,
    width: 210,
  }
  margin = {
    top: 12,
    bottom: 15,
    left: 12,
    right: 12,
  }

  footer = 5 // footer is below margin.bottom

  tableCellPadding = {
    horizontal: 1,
    vertical: 0.5,
  }
  columnHeaders = {
    fontSize: 9,
    fontStyle: "bold",
  }

  defaultCell = {
    fontName: "NotoSans",
    fontStyle: "normal",
    fontSize: 8,
  }
  defaultTotalCell = {
    fontSize: 9,
    fontStyle: "bold",
  }
  columns = {
    date: {
      // Column Header Label
      label(this: any) {
        return this.$gettext("Date")
      },
      // Retrieve cell data from transaction (can be used by totals)
      value: (tx: any): any => tx.date,
      // Retrieve cell text content from cell data (before possible wrapping)
      valueStr: (value: any) => moment(value).format("YYYY-MM-DD HH:mm:ss"),
      // Width either numeric or "content" to fit to content
      width: "content",
      // Should wrap content
      wrap: false,
    },
    related: {
      // Column Header Label
      label(this: any) {
        return this.$gettext("From / To")
      },
      // Retrieve cell data from transaction (can be used by totals)
      value(this: any, tx: any): any {
        if (tx.isReconversion) {
          return this.$gettext("Reconversion")
        }
        if (tx.isTopUp) {
          return this.$gettext("Top-up")
        }
        return tx.related
      },
      // cell text style
      style(tx: any) {
        if (tx.isReconversion || tx.isTopUp)
          return {
            fontStyle: "italic",
            color: "#555",
          }
        if (/^0x[0-9a-f]{40,40}$/.test(tx.related))
          return {
            fontName: "courier",
            // Fits the 42 chars of an address on one line within
            // ``maxWidth``. Explicit size is also required for
            // line-splitting to measure with the size used to draw.
            fontSize: 5.5,
          }
        return {}
      },
      // Width either numeric or "content" to fit to content
      width: "content",
      maxWidth: 50,
      // Should limit content to this many lines (default: no trim)
      maxLines: 3,
    },
    description: {
      // Column Header Label
      label(this: any) {
        return this.$gettext("Description")
      },
      // Retrieve cell data from transaction
      value: (tx: any) => {
        if (tx.isReconversion || tx.isTopUp) {
          return ""
        }
        return tx.description
      },
      // Should limit content to this many lines (default: no trim)
      maxLines: 3,
    },
    debit: {
      // Column Header Label
      label(this: any) {
        return this.$gettext("Debit") + ` (${this.account.curr})`
      },
      // Retrieve cell data from transaction (can be used by totals)
      value(this: any, tx: any): bigint {
        return tx.amountUnit < 0n ? 0n - tx.amountUnit : 0n
      },
      // Retrieve cell text content from cell data (before possible wrapping)
      valueStr(this: any, value: bigint) {
        return value === 0n ? "" : this.numericFormat(value)
      },
      // Width either numeric or "content" to fit to content
      width: "content",
      align: "right",
      total(pile: any, value: any, tx: any) {
        if (typeof pile === "undefined") {
          pile = {
            all: { nb: 0, amount: 0n },
            reconversion: { nb: 0, amount: 0n },
            transaction: { nb: 0, amount: 0n },
          }
        }
        if (value == 0n) return pile
        pile.all.amount += value
        pile.all.nb++
        if (tx.isReconversion) {
          pile.reconversion.amount += value
          pile.reconversion.nb++
        } else {
          pile.transaction.amount += value
          pile.transaction.nb++
        }
        return pile
      },
    },
    credit: {
      // Column Header Label
      label(this: any) {
        return this.$gettext("Credit") + ` (${this.account.curr})`
      },
      // Retrieve cell data from transaction (can be used by totals)
      value(this: any, tx: any): bigint {
        return tx.amountUnit >= 0n ? tx.amountUnit : 0n
      },
      // Retrieve cell text content from cell data (before possible wrapping)
      valueStr(this: any, value: bigint) {
        return value === 0n ? "" : this.numericFormat(value)
      },
      // Width either numeric or "content" to fit to content or auto
      width: "content",
      align: "right",
      total(pile: any, value: any, tx: any) {
        if (typeof pile === "undefined") {
          pile = {
            all: { nb: 0, amount: 0n },
            topUp: { nb: 0, amount: 0n },
            transaction: { nb: 0, amount: 0n },
          }
        }
        if (value == 0n) return pile
        pile.all.amount += value
        pile.all.nb++
        if (tx.isTopUp) {
          pile.topUp.amount += value
          pile.topUp.nb++
        } else {
          pile.transaction.amount += value
          pile.transaction.nb++
        }
        return pile
      },
    },
  }
  columnsOrder = ["date", "related", "description", "debit", "credit"]

  /**
   * Internal values
   */

  private marginLeftPos: number
  private marginRightPos: number

  walletAddress: any
  txs: any
  headerData: any
  dateBegin: any
  dateEnd: any
  doc: any
  parentVueComponent: any
  _columnArray: any
  _fonts: any
  _jsPdfPrimiteLedger: any[]
  _isFinalized: boolean
  account: any
  _env: any = {}
  $config: any
  $gettext: any
  $ngettext: any
  info: any

  constructor(info: any, txs: any, parentVueComponent: any) {
    this.txs = txs
    this.parentVueComponent = parentVueComponent

    // shortcuts
    this.$gettext = this.parentVueComponent.$gettext
    this.$ngettext = this.parentVueComponent.$ngettext
    this.$config = this.parentVueComponent.$config
    this.account = this.parentVueComponent.$modal.args.value[0].params.account

    this.marginLeftPos = this.margin.left
    this.marginRightPos = this.page.width - this.margin.right

    this.info = info
    this.headerData = {
      date: "Report Date:",
      requestAddress: "Request Address:",
      proper_name: "Placeholder Company Name",
      title: "Transaction Report – from ",
      to: " to ",
      initBal: "Opening Balance on ",
      finalBal: "Closing Balance on ",
      disclaimer: "test test test",
    }

    this._jsPdfPrimiteLedger = []
    this._fonts = {}
    this._isFinalized = false
  }

  private _init() {
    this.doc = new jsPDF()

    this._columnArray = this.columnsOrder.map((label: string) => {
      return (this.columns as any)[label]
    })
    for (const colLabel of this.columnsOrder) {
      const col = (this.columns as any)[colLabel]
      col._values = {}
      col._valueStrings = {}
      col._valueStrWrapped = {}
      col.name = colLabel
    }

    // Init env tracking

    this._env["page"] = 1
    for (const k of JSPDF_ENV_VARS) {
      const m = k[0].toUpperCase() + k.slice(1)
      if (this.doc[`get${m}`]) {
        this._env[k] = this.doc[`get${m}`]()
      }
    }
    const font = this.doc.getFont()
    this._fonts[`${font.fontName}-${font.fontStyle}`] = font
  }

  public async generate() {
    this._init()

    await this.setFont("NotoSans")

    const verticalCursor = await this._preamble()

    // Exhaut txs and save it
    const allTxs = []
    for await (const tx of this.txs) allTxs.push(tx)
    allTxs.reverse()

    await this.createTable(allTxs, verticalCursor)

    const pageCount = this.doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      this.setPage(i) // 1-based
      await this._pageHeader(i, pageCount)
      await this._pageFooter(i, pageCount)
    }
  }

  private _finalizeDocument() {
    if (this._isFinalized) {
      return
    }

    // Optimize order
    const attributeSets = JSPDF_ENV_VARS.map((k: any) => [k])
    attributeSets.push(["fontName", "fontStyle"])

    // First layer : rect and roundedrect
    this._reorderPrimitiveRec(
      this._jsPdfPrimiteLedger.filter((p: any) =>
        ["rect", "roundedRect"].includes(p.name)
      ),
      attributeSets
    )

    // second layer: everything else

    this._reorderPrimitiveRec(
      this._jsPdfPrimiteLedger.filter(
        (p: any) => !["rect", "roundedRect"].includes(p.name)
      ),
      attributeSets
    )

    this._isFinalized = true
  }

  /**
   * Make header
   */
  async _preamble() {
    // logo

    let { y: verticalPos } = await this.addImage(
      this.$config.logoUrl,
      { x: this.marginLeftPos, y: this.margin.top },
      { w: 50, h: 20 }
    )

    // addresses

    let verticalPosLeft = await this.contactInfoBlock(
      this.info.issuer,
      this.marginLeftPos,
      verticalPos
    )
    let verticalPosRight = await this.contactInfoBlock(
      this.info.user,
      this.marginRightPos - 80,
      this.margin.top + 10
    )

    verticalPos = Math.max(verticalPosLeft, verticalPosRight)

    const titleStyle = {
      fontSize: 11,
    }
    const title = this.$gettext("Account Statements in %{currency}", {
      currency: this.account.curr,
    }).toUpperCase()
    const { w, h } = await this.getTextDimensions(title, titleStyle)

    await this.text(title, this.marginRightPos, this.margin.top, {
      align: "right",
      ...titleStyle,
    })

    // this.setFontSize(12)
    // const today = new Date()

    // await this.text(this.headerData.date, this.marginLeftPos, 40)
    // this.text(
    //   dateFormat(today) + " " + today.toTimeString().slice(0, 8),
    //   60,
    //   40
    // )
    // await this.text(
    //   this.headerData.requestAddress,
    //   this.marginLeftPos,
    //   this.margin.top + 25
    // )
    // this.text(
    //   [this.walletAddress.substring(0, 21), this.walletAddress.substring(21)],
    //   73,
    //   48
    // )
    //this.doc.addImage(imgAddData, 'PNG', 60, 44, 10, 10);
    // let name_lines = this.doc.splitTextToSize(
    //   this.headerData.proper_name,
    //   50,
    //   {}
    // )
    // if (name_lines.length > 2) {
    //   name_lines = name_lines.slice(0, 2)
    //   name_lines[1] = name_lines[1] + "..."
    // }
    // await this.text(name_lines, 140, 48)

    this.setFontSize(16)
    // const title =
    //   this.headerData.title +
    //   dateFormat(this.dateBegin) +
    //   this.headerData.to +
    //   dateFormat(this.dateEnd)
    // await this.text(title, this.marginLeftPos, 65)

    this.setFontSize(8)

    // if (this.txs.length > 0) {
    //   if (this.txs[0].balance != "") {
    //     await this.text(
    //       this.headerData.initBal +
    //         dateFormat(this.dateBegin) +
    //         " " +
    //         this.dateBegin.toTimeString().slice(0, 2) +
    //         ":00 ",
    //       this.marginLeftPos,
    //       73
    //     )
    //     await this.text("EUR", 73, 73)

    //     const txDate = this.txs[0].time
    //     let last_block = 0
    //     let i = 0
    //     while (i < this.txs.length && this.txs[i].time == txDate) {
    //       // YYYvlab: to fix
    //       if (this.txs[i].addr_from == "xxx") {
    //         last_block += (this.txs[i].recieved + this.txs[i].tax) / 100
    //       } else {
    //         last_block -= this.txs[i].recieved / 100
    //       }
    //       i++
    //     }

    //     await this.text(
    //       (parseFloat(this.txs[0].balance) + last_block).toFixed(2),
    //       83,
    //       73
    //     )
    //   }

    //   if (this.txs[this.txs.length - 1].balance != "") {
    //     await this.text(
    //       this.headerData.finalBal +
    //         dateFormat(this.dateEnd) +
    //         " " +
    //         this.dateEnd.toTimeString().slice(0, 2) +
    //         ":59",
    //       this.marginLeftPos,
    //       77
    //     )
    //     await this.text("EUR", 73, 77)
    //     await this.text(
    //       parseFloat(this.txs[this.txs.length - 1].balance).toFixed(2),
    //       83,
    //       77
    //     )
    //   }
    // }
    // YYYvlab: to compute
    return verticalPos
  }

  async contactInfoBlock(info: any, x: number, verticalPos: number) {
    const addressBlockStyle = {
      fontSize: 10,
      fontStyle: "normal",
    }
    const lineHeight = await this.getLineHeight(addressBlockStyle)
    verticalPos += lineHeight + 2
    const addressBlock = makeAddressBlock(info)
    if (addressBlock.length == 0) {
      return verticalPos
    }
    verticalPos = await this.text(
      addressBlock,
      x,
      verticalPos,
      addressBlockStyle
    )
    const contactIconStyle = {
      fontSize: 10,
      fontName: "ContactInfo",
    }
    const contactInfoStyle = {
      fontSize: 8,
      fontName: "courier",
    }
    verticalPos += 2
    const { w } = await this.getTextDimensions("☎", contactIconStyle)
    const offset = -0.5
    if (info.phone) {
      await this.text("☎", x, verticalPos - offset, contactIconStyle)
      verticalPos = await this.text(info.phone, x + w + 1, verticalPos, {
        ...contactInfoStyle,
        fontName: "NotoSans",
      })
    }
    if (info.mobile) {
      await this.text(
        "\u{E001}",
        x - 0.5,
        verticalPos - offset - 0.1,
        contactIconStyle
      )
      verticalPos = await this.text(info.mobile, x + w + 1, verticalPos + 0.4, {
        ...contactInfoStyle,
        fontName: "NotoSans",
      })
    }
    if (info.email) {
      await this.text("✉", x, verticalPos - offset, contactIconStyle)
      verticalPos = await this.text(
        info.email,
        x + w + 1,
        verticalPos,
        contactInfoStyle
      )
    }
    if (info.website) {
      await this.text(
        "\u{E002}",
        x - 0.05,
        verticalPos - offset,
        contactIconStyle
      )
      verticalPos = await this.text(
        info.website,
        x + w + 1,
        verticalPos + 0.2,
        contactInfoStyle
      )
    }
    return verticalPos + 0.2
  }

  async setFont(fontName: string, fontStyle?: string) {
    const { fontName: oldFontName, fontStyle: oldFontStyle } = this.getFont()
    // if (fontName !== oldFontName || fontStyle !== oldFontStyle) {
    //   throw Error("Changing font is not yet supported.")
    // }
    const fonts = this.doc.getFontList()
    if (
      !fonts[fontName] ||
      !fonts[fontName]
        .map((e: any) => e.toLowerCase())
        .includes((fontStyle || "").toLowerCase())
    ) {
      // console.log(`Loading font ${fontName} ${fontStyle}`)
      await this._loadFont(fontName, fontStyle)
    }
    this._env.fontName = fontName
    if (fontStyle) this._env.fontStyle = fontStyle
    this.doc.setFont(fontName, fontStyle)
  }

  getFont() {
    let font = this._fonts[`${this._env.fontName}-${this._env.fontStyle}`]
    if (typeof font === "undefined") {
      font = this.doc.getFont()
      this._fonts[`${font.fontName}-${font.fontStyle}`] = font
    }
    return font
  }

  async _loadFont(name: string, style: string = "normal") {
    let fileStyle = style || "normal"
    if (style == "normal") {
      fileStyle = "regular"
    }
    const fullName = `${name}-${capitalizeFirst(fileStyle)}`
    const fileName = `${fullName}.ttf`
    const res = await fetch(`/font/${fileName}`)
    const contentUintArray = new Uint8Array(await res.arrayBuffer())
    const contentB64 = btoa(
      contentUintArray.reduce(function (p, c) {
        return p + String.fromCharCode(c)
      }, "")
    )
    this.doc.addFileToVFS(fileName, contentB64)
    this.doc.addFont(fileName, name, style, "Identity-H")
  }

  /**
   * Make table (possibly across pages)
   */
  async createTable(txs: any, verticalPos: number) {
    // gives a numeric '_width' attribute to all cols
    await this._computeColumnWidths(txs)
    // YYYvlab: temporarily removed
    // await this._balanceTable(verticalPos, txs)
    verticalPos = await this._createTableTotals(verticalPos, {
      withSubTotals: true,
    })

    let tx_idx = 0
    while (true) {
      ;[tx_idx, verticalPos] = await this._createTableFragment(
        txs,
        tx_idx,
        verticalPos
      )
      if (verticalPos !== -1) break
      verticalPos = this.newPage()
      verticalPos += 15
    }

    this.setDrawColor("#000")
    verticalPos = this.hline(verticalPos, 0.3)

    verticalPos = await this._createTableTotals(verticalPos)

    // if (
    //   this.txs &&
    //   this.txs.length > 0 &&
    //   this.txs[this.txs.length - 1].balance != ""
    // ) {
    //   const date_final = new Date(this.txs[this.txs.length - 1].time * 1000)
    //   await this.text(
    //     this.headerData.finalBal +
    //       dateFormat(date_final) +
    //       " " +
    //       date_final.toTimeString().slice(0, 2) +
    //       ":59",
    //     this.marginLeftPos,
    //     verticalPos
    //   )
    //   await this.text("EUR", 73, verticalPos)
    //   await this.text(
    //     parseFloat(this.txs[this.txs.length - 1].balance).toFixed(2),
    //     83,
    //     verticalPos
    //   )
    // }
  }

  async _balanceTable(verticalPos: number, txs: Record<string, any>[]) {
    const accountMsg =
      this.info.user.name +
      " – " +
      this.$gettext("Account %{ accountName }", {
        accountName: (
          await this.parentVueComponent.$lokapi.getBankAccountName(
            this.account._obj
          )
        )(),
      })
    const { w: accountTextWidth, h: textHeight } = await this.getTextDimensions(
      accountMsg,
      {
        fontSize: this.defaultTotalCell.fontSize,
        fontStyle: this.defaultTotalCell.fontStyle,
      }
    )
    let offset = this.getOffset(this.defaultTotalCell.fontSize)
    verticalPos += textHeight + this.tableCellPadding.vertical / 2

    let col = this._columnArray[0] // we want to be over the first col
    await this.text(accountMsg, col._pos, verticalPos - offset, {
      fontSize: this.defaultTotalCell.fontSize,
      fontStyle: this.defaultTotalCell.fontStyle,
    })

    verticalPos += this.tableCellPadding.vertical / 2

    this.setDrawColor("#000")
    this.setLineWidth(0.3)
    verticalPos += 0.15
    this.line(
      col._pos - this.tableCellPadding.horizontal / 2,
      verticalPos,
      col._pos + accountTextWidth + this.tableCellPadding.horizontal / 2,
      verticalPos
    )
    verticalPos += 0.15

    verticalPos += this.tableCellPadding.vertical / 2

    // Opening Balance

    const openingBalanceMsg = this.$gettext("Opening balance")
    const closingBalanceMsg = this.$gettext("Closing balance")
    let dateBegin = this.info.date.begin || txs[0].date
    let dateEnd = this.info.date.end || txs[txs.length - 1].date
    dateBegin = moment(dateBegin).format("YYYY-MM-DD HH:mm:ss")
    dateEnd = moment(dateEnd).format("YYYY-MM-DD HH:mm:ss")

    const cellStyle = {
      fontSize: this.defaultCell.fontSize,
      fontStyle: this.defaultCell.fontStyle,
    }

    const { w: openingBalanceMsgWidth, h: lineHeight } =
      await this.getTextDimensions(openingBalanceMsg, cellStyle)

    const { w: closingBalanceMsgWidth } = await this.getTextDimensions(
      openingBalanceMsg,
      cellStyle
    )

    const labelColumnWidth = Math.max(
      openingBalanceMsgWidth,
      closingBalanceMsgWidth
    )

    const { w: dateColumnWidth } = await this.getTextDimensions(
      dateBegin,
      cellStyle
    )

    offset = this.getOffset(this.defaultCell.fontSize)

    verticalPos += lineHeight

    await this.text(
      openingBalanceMsg,
      col._pos,
      verticalPos - offset,
      cellStyle
    )

    const dateColumnPos =
      col._pos + labelColumnWidth + this.tableCellPadding.horizontal
    const balanceColumnPos =
      dateColumnPos + dateColumnWidth + this.tableCellPadding.horizontal

    this.cellDivider(
      { x: dateColumnPos, y: verticalPos - lineHeight },
      lineHeight
    )

    await this.text(dateBegin, dateColumnPos, verticalPos - offset, cellStyle)

    this.cellDivider(
      { x: balanceColumnPos, y: verticalPos - lineHeight },
      lineHeight
    )

    await this.text("xxx", balanceColumnPos, verticalPos - offset, cellStyle)

    verticalPos += this.tableCellPadding.vertical / 2

    // Closing Balance

    verticalPos += 0.05
    this.setDrawColor("#ccc")
    this.line(
      col._pos - this.tableCellPadding.horizontal / 2,
      verticalPos,
      this.page.width / 2,
      verticalPos
    )
    verticalPos += 0.05

    verticalPos += this.tableCellPadding.vertical / 2

    verticalPos += lineHeight
    await this.text(
      closingBalanceMsg,
      col._pos,
      verticalPos - offset,
      cellStyle
    )

    this.cellDivider(
      { x: dateColumnPos, y: verticalPos - lineHeight },
      lineHeight
    )

    await this.text(
      moment(dateEnd).format("YYYY-MM-DD HH:mm:ss"),
      dateColumnPos,
      verticalPos - offset,
      cellStyle
    )

    this.cellDivider(
      { x: dateColumnPos, y: verticalPos - lineHeight },
      lineHeight
    )

    this.cellDivider(
      { x: balanceColumnPos, y: verticalPos - lineHeight },
      lineHeight
    )

    await this.text("yyy", balanceColumnPos, verticalPos - offset, cellStyle)

    verticalPos += this.tableCellPadding.vertical / 2
  }

  getOffset(fontSize: number) {
    // lineHeightFactor is how much room there is above letter like "h"
    // but, cursor.x is at the bottomn of this letter "R", not accounting
    // for possible letter going down, like "g". I artificially want to
    // draw the text half of the one produced by lineHeightFactor
    let lineHeightFactor = this.getLineHeightFactor() as any
    return fontSize * (lineHeightFactor - 1) * 0.3
  }

  async _createTableTotals(verticalPos: number, opts?: any) {
    opts = opts || ({} as any)
    const totalsMsg = this.$gettext("Totals")
    const { w: totalsTextWidth, h: textHeight } = await this.getTextDimensions(
      totalsMsg,
      {
        fontSize: this.defaultTotalCell.fontSize,
      }
    )

    let offset = this.getOffset(this.defaultTotalCell.fontSize)

    verticalPos += textHeight + this.tableCellPadding.vertical / 2

    let noTotalColFoundYet = true
    for (const [index, col] of this._columnArray.entries()) {
      if (!col.total) continue
      if (noTotalColFoundYet) {
        await this.text(
          totalsMsg,
          col._pos - this.tableCellPadding.horizontal,
          verticalPos - offset,
          {
            align: "right",
            fontSize: this.defaultTotalCell.fontSize,
            fontStyle: this.defaultTotalCell.fontStyle,
          }
        )
        noTotalColFoundYet = false
      }

      // this.setFillColor("#ffeeee")
      // this.setDrawColor("#aaa")
      // this.setLineWidth(0.05)
      // this.rect(
      //   col._pos,
      //   verticalPos - textHeight,
      //   col._width,
      //   textHeight,
      //   "DF"
      // )

      await this.text(
        this.numericFormat(col._total.all.amount),
        col._pos + col._width,
        verticalPos - offset,
        {
          align: "right",
          fontSize: this.defaultCell.fontSize,
          fontStyle: this.defaultCell.fontStyle,
        }
      )

      this.cellDivider({ x: col._pos, y: verticalPos - textHeight }, textHeight)
    }
    verticalPos += this.tableCellPadding.vertical / 2

    const subTotalStyle = {
      fontSize: 8,
      fontStyle: "normal",
    }

    if (opts.withSubTotals) {
      const nbReconversion = (this.columns.debit as any)._total.reconversion.nb
      const nbTopUp = (this.columns.credit as any)._total.topUp.nb
      const conversionMsg =
        this.$ngettext(
          "%{nbReconversion} reconversion",
          "%{nbReconversion} reconversions",
          nbReconversion,
          {
            nbReconversion,
          }
        ) +
        " / " +
        this.$ngettext("%{nbTopUp} top-up", "%{nbTopUp} top-ups", nbTopUp, {
          nbTopUp,
        })

      const conversionMsgDim = await this.getTextDimensions(conversionMsg, {
        ...subTotalStyle,
        fontStyle: "italic",
        color: "#555",
      })

      offset = this.getOffset(subTotalStyle.fontSize)

      noTotalColFoundYet = true
      for (const [index, col] of this._columnArray.entries()) {
        if (!col.total) continue

        if (noTotalColFoundYet) {
          this.setDrawColor("#000")
          this.setLineWidth(0.3)
          verticalPos += 0.15
          this.line(
            col._pos - totalsTextWidth - this.tableCellPadding.horizontal * 2,
            verticalPos,
            this.marginRightPos,
            verticalPos
          )
          verticalPos += 0.15

          this.setFillColor("#e4e4e4")
          const startOfTextPosX =
            col._pos -
            this.tableCellPadding.horizontal * 1.5 -
            conversionMsgDim.w
          this.roundedRect(
            startOfTextPosX,
            verticalPos + 0.1,
            this.page.width - this.margin.right - startOfTextPosX,
            conversionMsgDim.h + this.tableCellPadding.vertical,
            1,
            1,
            "F"
          )
          verticalPos += conversionMsgDim.h + this.tableCellPadding.vertical / 2

          this.setDrawColor("#ccc")
          this.setLineWidth(0.1)
          this.line(
            startOfTextPosX + 1,
            verticalPos + this.tableCellPadding.vertical / 2 + 0.05,
            this.marginRightPos - 1,
            verticalPos + this.tableCellPadding.vertical / 2 + 0.05
          )

          await this.text(
            conversionMsg,
            col._pos - this.tableCellPadding.horizontal,
            verticalPos - offset,
            {
              ...subTotalStyle,
              align: "right",
              fontStyle: "italic",
              color: "#555",
            }
          )
          noTotalColFoundYet = false
        }
        const colName = col.name === "debit" ? "reconversion" : "topUp"
        await this.text(
          col.valueStr.apply(this, [col._total[colName].amount]),
          col._pos + col._width,
          verticalPos - offset,
          {
            align: "right",
            fontSize: this.defaultCell.fontSize,
            fontStyle: this.defaultCell.fontStyle,
          }
        )
        this.cellDivider(
          { x: col._pos, y: verticalPos - conversionMsgDim.h },
          conversionMsgDim.h
        )
      }

      // Accounting for the horizontal separator line
      verticalPos += 0.1

      verticalPos += this.tableCellPadding.vertical

      verticalPos += conversionMsgDim.h
      noTotalColFoundYet = true
      for (const [index, col] of this._columnArray.entries()) {
        if (!col.total) continue
        if (noTotalColFoundYet) {
          await this.text(
            this.$gettext("%{nbTransactions} transactions", {
              nbTransactions: col._total.transaction.nb,
            }),
            col._pos - this.tableCellPadding.horizontal,
            verticalPos - offset,
            {
              ...subTotalStyle,
              align: "right",
            }
          )
          noTotalColFoundYet = false
        }
        await this.text(
          col.valueStr.apply(this, [col._total.transaction.amount]),
          col._pos + col._width,
          verticalPos - offset,
          {
            align: "right",
            fontSize: this.defaultCell.fontSize,
            fontStyle: this.defaultCell.fontStyle,
          }
        )
        this.cellDivider(
          { x: col._pos, y: verticalPos - conversionMsgDim.h },
          conversionMsgDim.h
        )
      }
      verticalPos += this.tableCellPadding.vertical / 2
    }

    return verticalPos
  }

  async _computeColumnWidths(allTxs: any) {
    // Compute columns with width adjusting to content

    for (const col of this._columnArray) {
      if (typeof col.width === "number") {
        col._width = col.width
        continue
      }
      if (col.width === "content") {
        col._width = 0
        for (const [tx_idx, tx] of allTxs.entries()) {
          const content = await this.getValueStr(col, tx, tx_idx)
          const { w } = await this.getTextDimensions(
            content,
            this.getCellFontSpec(col)
          )
          if (w > col._width) col._width = w
        }

        // total
        if (col.total) {
          const content = await this.getTotalStr(col)
          const { w } = await this.getTextDimensions(
            content,
            this.getCellFontSpec(col)
          )
          if (w > col._width) col._width = w
        }
        // col headers
        let label = await col.label.apply(this, [])
        const { w } = await this.getTextDimensions(label, this.columnHeaders)
        if (w > col._width) col._width = w

        // finish
        if (col.maxWidth && col._width >= col.maxWidth) {
          col._width = col.maxWidth
          continue
        }
      }
    }

    // Compute columns with no width to take all space

    const noWidthColumns = []
    let totalWidthColumns = 0
    for (const col of this._columnArray) {
      if (typeof col.width === "undefined") {
        noWidthColumns.push(col)
        continue
      }
      totalWidthColumns += col._width
    }
    const remainingWidth =
      this.page.width -
      this.margin.left -
      this.margin.right -
      totalWidthColumns -
      this._columnArray.length * this.tableCellPadding.horizontal
    const noWidthCellWidth = remainingWidth / noWidthColumns.length

    for (const col of noWidthColumns) {
      col._width = noWidthCellWidth
    }

    // calculate column position

    let x = this.marginLeftPos + this.tableCellPadding.horizontal / 2

    for (const col of this._columnArray) {
      col._pos = x
      x += col._width + this.tableCellPadding.horizontal
    }
  }
  /**
   * Make table fragment
   */
  async _createTableFragment(txs: any, tx_idx: number, verticalPos: number) {
    verticalPos = await this._createTableColHeaders(verticalPos)
    this.setFontSize(8)
    const singleLineHeight = await this.getLineHeight()
    const totalsTextHeight = await this.getLineHeight({
      fontSize: this.defaultTotalCell.fontSize,
    })

    while (true) {
      if (txs.length == tx_idx) return [tx_idx, verticalPos]
      const tx = txs[tx_idx]

      // compute height of row

      let txRowHeight = 0

      for (const col of this._columnArray) {
        const valueStrWrapped = await this.getValueStrWrapped(col, tx, tx_idx)
        let style = await evalIfFunction(col.style || {}, this, [tx, tx_idx])
        const { h } = await this.getTextDimensions(valueStrWrapped, style)
        if (h > txRowHeight) txRowHeight = h
      }
      // txRowHeight += this.tableCellPadding.vertical
      // YYYvlab: and is there room for totals ?

      if (
        verticalPos +
          txRowHeight +
          this.tableCellPadding.vertical +
          totalsTextHeight +
          0.3 >
        this.page.height - this.margin.bottom
      ) {
        return [tx_idx, -1]
      }

      if (tx.isTopUp || tx.isReconversion) {
        this.setFillColor("#e4e4e4")
        this.roundedRect(
          this.marginLeftPos,
          verticalPos + 0.1,
          this.page.width - this.margin.left - this.margin.right,
          txRowHeight + this.tableCellPadding.vertical,
          1,
          1,
          "F"
        )
      } else {
        if (tx_idx % 2 != 0) {
          this.setFillColor("#f4f4f4")
          this.rect(
            this.marginLeftPos,
            verticalPos,
            this.page.width - this.margin.left - this.margin.right,
            txRowHeight + this.tableCellPadding.vertical,
            "F"
          )
        }
      }
      const lastVerticalPos = verticalPos
      verticalPos = await this._tableLine(tx, tx_idx, verticalPos, txRowHeight)
      this.setDrawColor("#ccc")
      this.setLineWidth(0.1)
      verticalPos += 0.05
      this.line(
        this.marginLeftPos + 1,
        verticalPos,
        this.marginRightPos - 1,
        verticalPos
      )
      verticalPos += 0.05
      tx_idx++
    }
    return [tx_idx, -1]
  }

  async _createTableColHeaders(verticalPos: number) {
    this.setDrawColor("#000")
    verticalPos = this.hline(verticalPos, 0.3)
    const opts = this.columnHeaders
    const tableHeaderHeight = await this.getLineHeight(opts)

    verticalPos += tableHeaderHeight + this.tableCellPadding.vertical / 2

    for (const [idx, colLabel] of this.columnsOrder.entries()) {
      const col = (this.columns as any)[colLabel]
      let align = col.align || "left"
      let label = await col.label.apply(this, [])

      // this.setFillColor("#ffeeee")
      // this.setDrawColor("#aaa")
      // this.setLineWidth(0.05)

      // this.rect(
      //   cursor.x,
      //   cursor.y - tableHeaderHeight,
      //   col._width,
      //   tableHeaderHeight,
      //   "DF"
      // )

      if (align == "right") {
        await this.text(label, col._pos + col._width, verticalPos, {
          align,
          ...opts,
        })
      } else {
        await this.text(label, col._pos, verticalPos, opts)
      }
    }
    verticalPos += this.tableCellPadding.vertical
    verticalPos = this.hline(verticalPos, 0.3, "#000")
    return verticalPos
  }

  hline(verticalPos: number, lineWidth?: number, drawColor?: string) {
    const doc = this.doc
    const oldLineWidth = this.getLineWidth() as number
    const oldDrawColor = this.getDrawColor()

    const changed = { lineWidth: false, drawColor: false }
    if (lineWidth && lineWidth !== oldLineWidth) {
      this.setLineWidth(lineWidth)
      changed.lineWidth = true
      verticalPos += lineWidth / 2
    } else {
      verticalPos += oldLineWidth / 2
    }
    if (drawColor && drawColor !== oldDrawColor) {
      this.setDrawColor(drawColor)
      changed.drawColor = true
    }
    this.line(this.marginLeftPos, verticalPos, this.marginRightPos, verticalPos)
    if (changed.lineWidth) {
      this.setLineWidth(oldLineWidth)
      if (lineWidth)
        // to make typescript happy
        verticalPos += lineWidth / 2
    } else {
      verticalPos += oldLineWidth / 2
    }
    if (changed.drawColor) {
      this.setDrawColor(oldDrawColor)
    }
    return verticalPos
  }
  /**
   * draw a vertical separator to divide cell. The pos is the
   * top left corner of the cell (after adding cell padding).
   * and h is the height of the cell content (without cell padding).
   */
  cellDivider(pos: { x: number; y: number }, h: number) {
    const lineWidth = 0.1

    // Both lines have same width
    this.setLineWidth(lineWidth)

    // Without cellPadding, these are the cell boundaries
    const topRight = {
      x: pos.x - this.tableCellPadding.horizontal / 2,
      y: pos.y - this.tableCellPadding.vertical / 2,
    }
    const bottomRight = {
      x: topRight.x,
      y: topRight.y + h + this.tableCellPadding.vertical,
    }

    // make the extremities shorter
    topRight.y += this.tableCellPadding.vertical * 1.5
    bottomRight.y -= this.tableCellPadding.vertical * 1.5

    // shift so they don't overlap, on the left
    topRight.x -= lineWidth / 2
    bottomRight.x -= lineWidth / 2

    this.setDrawColor("#ccc")
    this.line(topRight.x, topRight.y, bottomRight.x, bottomRight.y)

    // shift so they don't overlap, on the right
    topRight.x += lineWidth
    bottomRight.x += lineWidth

    this.setDrawColor("#fff")
    this.line(topRight.x, topRight.y, bottomRight.x, bottomRight.y)
  }

  /**
   * Make table line
   */
  async _tableLine(
    tx: any,
    tx_idx: number,
    verticalPos: number,
    txRowHeight: number
  ) {
    const date = new Date(tx.time * 1000)
    const singleLineHeight = await this.getLineHeight()
    var offset = this.getOffset(this.getFontSize() as number)
    let cursor = {
      x: this.marginLeftPos + this.tableCellPadding.horizontal / 2,
      y:
        verticalPos +
        singleLineHeight +
        this.tableCellPadding.vertical / 2 -
        offset,
    }
    for (const [index, colLabel] of this.columnsOrder.entries()) {
      const col = (this.columns as any)[colLabel]
      const fmt = col.fmt || this.defaultFmtCell

      // this.setFillColor("#ffeeee")
      // this.setDrawColor("#aaa")
      // this.setLineWidth(0.05)
      // this.rect(
      //   cursor.x,
      //   cursor.y - singleLineHeight + offset,
      //   col._width,
      //   txRowHeight,
      //   "DF"
      // )

      await fmt.apply(this, [tx, tx_idx, col, cursor])

      if (index > 0) {
        this.cellDivider(
          { x: cursor.x, y: verticalPos + this.tableCellPadding.vertical / 2 },
          txRowHeight
        )
      }

      cursor.x += col._width + this.tableCellPadding.horizontal
    }
    return verticalPos + txRowHeight + this.tableCellPadding.vertical
  }

  newPage() {
    this.doc.addPage()
    this._env["page"] += 1
    return this.margin.top
  }

  async _pageFooter(page: number, pageCount: number) {
    this.setFontSize(8)
    const lineHeight = await this.getLineHeight()
    this.setDrawColor("#000000")
    this.hline(this.page.height - this.margin.bottom, 0.3)
    await this.text(
      `Page ${page} / ${pageCount}`,
      this.page.width - this.margin.right,
      this.page.height - this.margin.bottom + lineHeight,
      {
        align: "right",
      }
    )
  }

  async _pageHeader(page: number, pageCount: number) {
    const titleStyle = {
      fontSize: 11,
    }
    let title = this.$gettext("Account Statements in %{currency}", {
      currency: this.account.curr,
    }).toUpperCase()
    if (page > 1) {
      title += " – " + this.$gettext("continued")
    }
    const { w, h } = await this.getTextDimensions(title, titleStyle)

    await this.text(title, this.marginRightPos, this.margin.top, {
      align: "right",
      ...titleStyle,
    })
  }

  /**
   * default Format Cell
   */
  async defaultFmtCell(
    tx: any,
    tx_idx: number,
    col: any,
    cursor: { x: number; y: number }
  ) {
    let style = await evalIfFunction(col.style || {}, this, [tx, tx_idx])
    let text = (await this.getValueStrWrapped(col, tx, tx_idx)) as any
    let align = col.align || "left"
    if (align == "right") {
      await this.text(text, cursor.x + col._width, cursor.y, {
        ...style,
        align,
      })
    } else {
      await this.text(text, cursor.x, cursor.y, style)
    }
  }

  /**
   *
   */
  async text(t: any, x: number, y: number, options?: any, transform?: any) {
    const { fontName: oldFontName, fontStyle: oldFontStyle } = this.getFont()
    const oldTextColor = this.getTextColor()
    const oldSize = this.getFontSize()

    let newOptions: any = {}
    const changed = { font: false, size: false, color: false }
    if (options) {
      newOptions = { ...options }
      if (newOptions.fontStyle || newOptions.fontName) {
        await this.setFont(
          newOptions.fontName || oldFontName,
          newOptions.fontStyle || oldFontStyle
        )
        changed.font = true
        if (newOptions.fontStyle) delete newOptions.fontStyle
        if (newOptions.fontName) delete newOptions.fontName
      }
      if (options.fontSize) {
        this.setFontSize(options.fontSize)
        changed.size = true
        delete newOptions.fontSize
      }
      if (options.color) {
        this.setTextColor(options.color)
        changed.color = true
        delete newOptions.color
      }
    }
    t = this.replaceMissingGlyphs(t)
    const dim = this._getTextDimensions(t, {})
    this._jsPdfText(t, x, y, newOptions, transform)
    if (changed.font) {
      this.setFont(oldFontName, oldFontStyle)
    }

    if (changed.size) this.setFontSize(oldSize)

    if (changed.color) this.setTextColor(oldTextColor)
    return y + dim.h
  }

  rect(...args: any[]) {
    return this._jsPdfRect(...args)
  }

  roundedRect(...args: any[]) {
    return this._jsPdfRoundedRect(...args)
  }

  line(...args: any[]) {
    return this._jsPdfLine(...args)
  }

  async getLineHeight(opt?: any, options?: any) {
    const { h: singleLineHeight } = await this.getTextDimensions("Ag", options)
    return singleLineHeight
  }

  numericFormat(value: bigint) {
    // Note: it is important to force the value to be a string to get
    // arbitrary large number to be correctly formatted.
    const origFormatted = this.parentVueComponent.numericFormat(
      intCents2strAmount(value)
    )
    return origFormatted
  }

  async getValue(col: any, tx: any, idx: number): Promise<any> {
    const cachedValue = col._values[idx]
    if (typeof cachedValue === "undefined") {
      const value = await col.value.apply(this, [tx])
      col._values[idx] = value
      if (col.total) {
        col._total = col.total.apply(this, [col._total, value, tx])
      }
      return value
    }
    // console.log(`cached Value ${col.name}: idx: ${idx}, value: ${cachedValue}`)
    return cachedValue
  }

  async getValueStr(col: any, tx: any, idx: number): Promise<string> {
    const cachedValue = col._valueStrings[idx]
    if (typeof cachedValue === "undefined") {
      const defaultValueStr = (e: string) => e
      const value = await this.getValue(col, tx, idx)
      const text = await evalIfFunction(col.valueStr || defaultValueStr, this, [
        value,
      ])
      col._valueStrings[idx] = text
      return text
    }
    // console.log(
    //   `cached ValueString ${col.name}: idx: ${idx}, value: ${cachedValue}`
    // )
    return cachedValue
  }

  async getValueStrWrapped(col: any, tx: any, tx_idx: number): Promise<string> {
    const cachedValue = col._valueStrWrapped[tx_idx]
    if (typeof cachedValue === "undefined") {
      let style = await evalIfFunction(col.style || {}, this, [tx, tx_idx])
      let text = (await this.getValueStr(col, tx, tx_idx)) as any
      if (col.wrap !== false) {
        let lines = this.doc.splitTextToSize(text, col._width, style)
        text = lines
      } else {
        text = text.split("\n")
      }
      if (col.maxLines && text.length > col.maxLines) {
        text = text.slice(0, col.maxLines)
        text[col.maxLines - 1] += "…"
      }
      col._valueStrWrapped[tx_idx] = text
      return text
    }
    // console.log(
    //   `cached ValueStringWrapped ${col.name}: idx: ${tx_idx}, value: ${cachedValue}`
    // )
    return cachedValue
  }

  async getTotalStr(col: any): Promise<string> {
    const cachedValue = col._totalStr
    if (typeof cachedValue === "undefined") {
      const text = await col.valueStr.apply(this, [col._total])
      col._totalStr = text
      return text
    }
    // console.log(`cached getTotalStr ${col.name}: value: ${cachedValue}`)
    return cachedValue
  }

  getCellFontSpec(col: any) {
    return {
      fontName: col.fontName || this.defaultCell.fontName,
      fontStyle: col.fontStyle || this.defaultCell.fontStyle,
      fontSize: col.fontSize || this.defaultCell.fontSize,
    }
  }

  getCellTotalFontSpec(col: any) {
    const defaultTotalCell = this.defaultTotalCell as any
    return {
      fontName: defaultTotalCell.fontName,
      fontStyle: defaultTotalCell.fontStyle,
      fontSize: defaultTotalCell.fontSize,
    }
  }

  _reorderPrimitiveRec(
    primitives: any[],
    attributeSets: any[],
    currentEnvs?: any
  ) {
    currentEnvs = currentEnvs || { currentPage: 0 }
    // if (attributeSets.length === 0) {
    //   for (const { args, name } of primitives) {
    //     console.log(`${name} ${args}`)
    //     this.doc[name](...args)
    //   }
    //   return { primitives } // leaf
    // }
    let candidate: any
    let newAttributeSets
    while (true) {
      let lowestScore = null
      for (const [idx, attributeSet] of attributeSets.entries()) {
        const partition = {} as any
        for (const p of primitives) {
          const env = Object.fromEntries(
            attributeSet.map((a: any) => [a, p.env[a]])
          )
          const keyStr = attributeSet.map((a: any) => p.env[a]).join("|")
          if (!partition[keyStr]) {
            partition[keyStr] = { env, primitives: [] }
          }
          partition[keyStr].primitives.push(p)
        }
        const score = Object.keys(partition).length
        const current = {
          attributeSet,
          idx,
          partition,
          score,
        }

        if (lowestScore === null || score < lowestScore) {
          candidate = current
          lowestScore = score
          if (lowestScore == 1) break
        }
      }

      newAttributeSets = attributeSets.filter((_, i) => i !== candidate.idx)
      if (candidate.score != 1 || newAttributeSets.length === 0) {
        break
      }
      const candidateEnv = (Object.values(candidate.partition)[0] as any).env
      const everyEnvValueUndef = Object.values(candidateEnv).every(
        (v) => typeof v === "undefined"
      )
      if (!everyEnvValueUndef) {
        break
      }
      attributeSets = newAttributeSets
    }
    const result = {} as any
    for (const [keyStr, { env, primitives: newPrimitives }] of Object.entries(
      candidate.partition
    ) as any) {
      if (newAttributeSets.length === 0) {
        this._applyJsPdfEnv(newPrimitives[0].env, currentEnvs)
        for (const { args, name } of newPrimitives) {
          this.doc[name](...args)
        }
        result[keyStr] = {
          primitives: newPrimitives,
        }
      } else {
        result[keyStr] = {
          env,
          primitives: this._reorderPrimitiveRec(
            newPrimitives,
            newAttributeSets,
            currentEnvs
          ),
        }
      }
    }
    return result
  }

  _applyJsPdfEnv(env: any, currentEnvs: any) {
    if (env.page !== currentEnvs.currentPage) {
      // console.log(`setPage ${env.page}`)
      currentEnvs.currentPage = env.page
      this.doc.setPage(env.page)
    }
    if (!currentEnvs[env.page]) currentEnvs[env.page] = {}
    const currentEnv = currentEnvs[env.page]
    env = { ...env }
    // XXXvlab: bug in fillColor ? Could it reset others ?
    //currentEnv.fillColor = undefined
    if (env.fontName || env.fontStyle) {
      if (
        env.fontName !== currentEnv.fontName ||
        env.fontStyle !== currentEnv.fontStyle
      ) {
        // console.log(`setFont ${env.fontName} ${env.fontStyle}`)
        // content += `doc.setFont("${env.fontName}", ${JSON.stringify(
        //   env.fontStyle,
        //   null,
        //   2
        // )})\n`
        this.doc.setFont(env.fontName, env.fontStyle)
        currentEnv.fontName = env.fontName
        currentEnv.fontStyle = env.fontStyle
      }
      delete env.fontName
      delete env.fontStyle
    }
    for (const [label, value] of Object.entries(env)) {
      if (label == "page") continue // already set
      if (typeof value === "undefined") {
        continue
      }
      const m = label[0].toUpperCase() + label.slice(1)
      if (currentEnv[label] !== value) {
        // console.log(`set${m}(${value})`)
        // content += `doc.set${m}(${JSON.stringify(value, null, 2)})\n`
        this.doc[`set${m}`](value)
        currentEnv[label] = value
      }
    }
  }

  save(filename: string) {
    this._finalizeDocument()
    this.doc.save(filename)
  }

  output(type: string) {
    this._finalizeDocument()
    return this.doc.output(type)
  }

  async getTextDimensions(t: any, options?: any) {
    const { fontName: oldFontName, fontStyle: oldFontStyle } = this.getFont()
    const oldSize = this.getFontSize()

    let newOptions: any = {}
    const changed = { font: false, size: false }
    if (options) {
      newOptions = { ...options }
      if (newOptions.fontStyle || newOptions.fontName) {
        await this.setFont(
          newOptions.fontName || oldFontName,
          newOptions.fontStyle || oldFontStyle
        )
        changed.font = true
        if (newOptions.fontStyle) delete newOptions.fontStyle
        if (newOptions.fontName) delete newOptions.fontName
      }
      if (options.fontSize) {
        this.setFontSize(options.fontSize)
        changed.size = true
        delete newOptions.fontSize
      }
    }
    const result = this._getTextDimensions(t, newOptions)
    if (changed.font) {
      this.setFont(oldFontName, oldFontStyle)
    }

    if (changed.size) this.setFontSize(oldSize)
    return result
  }

  /**
   * replacement of jspdf.getTextDimensions
   *
   * we want to use our virtual env vars and avoid to have to use
   * setFont and write anything on the pdf to get this information
   */
  _getTextDimensions(text: string | string[], options: any) {
    options = options || {}
    text = this.replaceMissingGlyphs(text)
    var fontSize = options.fontSize || this.getFontSize()
    var scaleFactor = options.scaleFactor || this.doc.internal.scaleFactor
    var width = 0
    var amountOfLines = 0
    var height = 0
    var tempWidth = 0

    if (typeof text === "string") {
      width = this.getStringUnitWidth(text) * fontSize
      if (width !== 0) {
        amountOfLines = 1
      }
    } else if (Object.prototype.toString.call(text) === "[object Array]") {
      for (var i = 0; i < text.length; i++) {
        tempWidth = this.getStringUnitWidth(text[i]) * fontSize

        if (width < tempWidth) {
          width = tempWidth
        }
      }

      if (width !== 0) {
        amountOfLines = text.length
      }
    } else {
      throw new Error(
        "getTextDimensions expects text-parameter to be of type String or an Array of Strings."
      )
    }

    width = width / scaleFactor

    const lineHeightFactor = this.getLineHeightFactor() as number
    // height = Math.max(
    //   (amountOfLines * fontSize * lineHeightFactor -
    //     fontSize * (lineHeightFactor - 1)) /
    //     scaleFactor,
    //   0
    // )
    height = Math.max(
      (amountOfLines * fontSize * lineHeightFactor -
        fontSize * (lineHeightFactor - 1)) /
        scaleFactor,
      0
    )

    return { w: width, h: height }
  }

  /**
   * Returns an array of length matching length of the 'word' string, with each
   * cell occupied by the width of the char in that position.
   *
   * @name getCharWidthsArray
   * @function
   * @param {string} text
   * @param {Object} options
   * @returns {Array}
   */
  getCharWidthsArray(text: string, options?: any) {
    options = options || {}

    var activeFont = options.font || this.getFont()
    var fontSize = options.fontSize || this.getFontSize()
    var charSpace = options.charSpace || this.getCharSpace()

    var widths = options.widths
      ? options.widths
      : activeFont.metadata.Unicode.widths
    var widthsFractionOf = widths.fof ? widths.fof : 1
    var kerning = options.kerning
      ? options.kerning
      : activeFont.metadata.Unicode.kerning
    var kerningFractionOf = kerning.fof ? kerning.fof : 1

    var i
    var length = text.length
    var char_code
    var prior_char_code = 0 //for kerning
    var default_char_width = widths[0] || widthsFractionOf
    var output = []

    for (i = 0; i < length; i++) {
      char_code = text.charCodeAt(i)

      if (typeof activeFont.metadata.widthOfString === "function") {
        output.push(
          (activeFont.metadata.widthOfGlyph(
            activeFont.metadata.characterToGlyph(char_code)
          ) +
            charSpace * (1000 / fontSize) || 0) / 1000
        )
      } else {
        output.push(
          (widths[char_code] || default_char_width) / widthsFractionOf +
            ((kerning[char_code] && kerning[char_code][prior_char_code]) || 0) /
              kerningFractionOf
        )
      }

      prior_char_code = char_code
    }

    return output
  }

  /**
   * Returns a widths of string in a given font, if the font size is set as 1 point.
   *
   * In other words, this is "proportional" value. For 1 unit of font size, the length
   * of the string will be that much.
   *
   * Multiply by font size to get actual width in *points*
   * Then divide by 72 to get inches or divide by (72/25.6) to get 'mm' etc.
   *
   * @name getStringUnitWidth
   * @public
   * @function
   * @param {string} text
   * @param {string} options
   * @returns {number} result
   */
  getStringUnitWidth(text: string, options?: any) {
    options = options || {}

    var fontSize = options.fontSize || this.getFontSize()
    var font = options.font || this.getFont()
    var charSpace = options.charSpace || this.getCharSpace()

    var result = 0

    if (typeof font.metadata.widthOfString === "function") {
      result = font.metadata.widthOfString(text, fontSize, charSpace) / fontSize
    } else {
      result = this.getCharWidthsArray
        .apply(this, arguments as any)
        .reduce(function (pv, cv) {
          return pv + cv
        }, 0)
    }
    return result
  }

  /**
   * Replace every character that has *no* glyph in the
   * currently-selected font with `subst` (defaults to U+FFFD REPLACEMENT CHAR).
   */
  replaceMissingGlyphs(t: string | string[], subst = "�"): string | string[] {
    let textArray: string[]
    let converted: boolean = false
    if (typeof t === "string") {
      textArray = [t]
      converted = true
    } else {
      textArray = t
    }
    const font = this.getFont()
    let result
    if (font.encoding === "WinAnsiEncoding") {
      result = textArray.map((text: string) =>
        // built-in WinAnsi fonts → only 0-255 guaranteed
        [...text].map((ch) => (ch.charCodeAt(0) < 256 ? ch : subst)).join("")
      )
    } else {
      // Identity-H subset: consult the Unicode cmap jsPDF built
      const cmap: Record<number, unknown> =
        font.metadata?.cmap?.unicode?.codeMap || {}
      try {
        result = textArray.map((text: string) =>
          [...text]
            .map((ch) => (cmap.hasOwnProperty(ch.codePointAt(0)!) ? ch : subst))
            .join("")
        )
      } catch (e) {
        console.log(`Could not replace missing glyphs in ${textArray}: `, e)
        return []
      }
    }
    if (converted) {
      return result[0]
    }
    return result
  }

  async addImage(url: string, pos: Pos, box: Box) {
    const img = await loadImageAsDataURL(url)

    // boxing of the image
    const imgSize = { h: box.h, w: (box.h * img.width) / img.height }
    if (imgSize.w > box.w) {
      imgSize.w = box.w
      imgSize.h = (box.w * img.height) / img.width
    }
    this.doc.addImage(img.dataURL, "PNG", pos.x, pos.y, imgSize.w, imgSize.h)
    return { x: pos.x + imgSize.w, y: pos.y + imgSize.h }
  }
}

/**
 * jsPDF internal environment duplication
 */

const JSPDF_ENV_VARS = [
  "fontSize",
  "drawColor",
  "fillColor",
  "lineWidth",
  "textColor",
  "charSpace",
  "lineHeightFactor",
  "page",
] as const

type JsPdfEnvVar = typeof JSPDF_ENV_VARS[number]

for (const k of JSPDF_ENV_VARS) {
  const m = k[0].toUpperCase() + k.slice(1)

  Object.defineProperty(PdfDocument.prototype, `set${m}`, {
    value(this: PdfDocument, v: unknown) {
      this._env[k] = v
      this.doc[`set${m}`](v)
      return this
    },
    writable: false,
  })

  Object.defineProperty(PdfDocument.prototype, `get${m}`, {
    value(this: PdfDocument) {
      let value = this._env[k]
      if (typeof value === "undefined") {
        value = this.doc[`get${m}`]()
        this._env[k] = value
      }
      return value
    },
    writable: false,
  })
}

type SetterMethods = {
  [K in JsPdfEnvVar as `set${Capitalize<K>}`]: (
    this: PdfDocument,
    ...args: any
  ) => PdfDocument
}
interface PdfDocument extends SetterMethods {}

type GetterMethods = {
  [K in JsPdfEnvVar as `get${Capitalize<K>}`]: (this: PdfDocument) => unknown
}
interface PdfDocument extends GetterMethods {}

/**
 * jsPDF internal primitive call ledger
 */

const JSPDF_PRIMITVES = {
  // all primitive need to remember the page also (it's implied)
  text: [
    "fontSize",
    "fontName",
    "textColor",
    "fontStyle",
    "lineHeightFactor",
    "charSpace",
  ],
  rect: ["fillColor", "lineWidth", "drawColor"],
  roundedRect: ["fillColor", "lineWidth", "drawColor"],
  line: ["lineWidth", "drawColor"],
} as const

type JsPdfPrimitive = keyof typeof JSPDF_PRIMITVES

for (const [name, env_deps] of Object.entries(JSPDF_PRIMITVES)) {
  const m = name[0].toUpperCase() + name.slice(1)
  Object.defineProperty(PdfDocument.prototype, `_jsPdf${m}`, {
    value(this: PdfDocument, ...args: any[]) {
      const env = Object.fromEntries(env_deps.map((k) => [k, this._env[k]]))
      env.page = this._env.page
      this._jsPdfPrimiteLedger.push({
        env,
        name,
        args,
      })
      //this.doc[name](...args)
      return this
    },
    writable: false,
  })
}

type PrimitiveLedgerMethods = {
  [K in JsPdfPrimitive as `_jsPdf${Capitalize<K>}`]: (
    this: PdfDocument,
    ...args: any
  ) => PdfDocument
}
interface PdfDocument extends PrimitiveLedgerMethods {}

export default PdfDocument
