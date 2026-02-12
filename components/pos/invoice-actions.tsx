"use client"

import { Button } from "@/components/ui/button"
import { Printer, FileText, RotateCcw, PenLine } from "lucide-react"
import type { InvoiceData } from "@/lib/pos-types"
import { generateReceiptHTML } from "./thermal-receipt"

interface InvoiceActionsProps {
  invoice: InvoiceData | null
  canGenerate: boolean
  onGenerateInvoice: () => void
  onNewTransaction: () => void
  onEditInvoice?: () => void
}

export function InvoiceActions({
  invoice,
  canGenerate,
  onGenerateInvoice,
  onNewTransaction,
  onEditInvoice,
}: InvoiceActionsProps) {
  const handlePrint = async () => {
    if (!invoice) return
    const html = await generateReceiptHTML(invoice)

    // Clean up any previous print frame
    const old = document.getElementById("pos-print-frame")
    if (old) old.remove()

    // Create hidden iframe for thermal printing
    const iframe = document.createElement("iframe")
    iframe.id = "pos-print-frame"
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;visibility:hidden;"
    document.body.appendChild(iframe)

    const win = iframe.contentWindow
    if (!win) return

    const doc = win.document
    doc.open()
    doc.write(html)
    doc.close()

    // Wait for content to render, then print
    // Using setTimeout since document.write content is synchronous
    setTimeout(() => {
      try {
        win.focus()
        win.print()
      } catch {
        // Fallback: open in new window
        const w = window.open("", "_blank")
        if (w) { w.document.write(html); w.document.close(); w.print(); }
      }
      // Clean up after a delay
      setTimeout(() => { try { iframe.remove() } catch {} }, 2000)
    }, 400)
  }

  const handleDownloadHTML = async () => {
    if (!invoice) return
    const html = await generateReceiptHTML(invoice)
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice-${invoice.invoiceNumber}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-2">
      {!invoice ? (
        <Button
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!canGenerate}
          onClick={onGenerateInvoice}
        >
          <FileText className="mr-2 h-4 w-4" />
          Generate Invoice
        </Button>
      ) : (
        <>
          <Button
            size="lg"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          <Button size="lg" variant="outline" className="w-full bg-transparent" onClick={handleDownloadHTML}>
            <FileText className="mr-2 h-4 w-4" />
            Download HTML
          </Button>
          {onEditInvoice && (
            <Button
              size="lg"
              variant="outline"
              className="w-full border-accent/40 bg-transparent text-accent hover:bg-accent/10"
              onClick={onEditInvoice}
            >
              <PenLine className="mr-2 h-4 w-4" />
              Edit Invoice
            </Button>
          )}
          <Button size="lg" variant="secondary" className="w-full" onClick={onNewTransaction}>
            <RotateCcw className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </>
      )}
    </div>
  )
}
