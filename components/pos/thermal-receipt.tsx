"use client"

import Image from "next/image"
import type { InvoiceData } from "@/lib/pos-types"

const INVOICE_LOGO = "/shrim-invoice-logo.jpeg"

interface ThermalReceiptProps {
  invoice: InvoiceData
}

export function ThermalReceipt({ invoice }: ThermalReceiptProps) {
  const totalQty = invoice.items.reduce((acc, i) => acc + i.quantity, 0)

  return (
    <div
      id="thermal-receipt"
      className="mx-auto w-full max-w-[210mm] bg-[#fff] p-8 font-sans text-sm text-[#000]"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-[#6b2c3e] pb-4">
        <div className="flex items-center gap-4">
          <Image
            src={INVOICE_LOGO}
            alt="Shrim Creation"
            width={140}
            height={100}
            className="h-auto w-[140px] object-contain"
          />
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[#6b2c3e]">INVOICE</div>
          <div className="mt-1 text-xs text-[#666]">
            <div>No: <span className="font-mono font-semibold text-[#000]">{invoice.invoiceNumber}</span></div>
            <div>Date: {invoice.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
            <div>Time: {invoice.date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
          <p className="mt-1 text-xs text-[#666]">Phone: +91 78911 11041</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mt-4 rounded border border-[#e0d0d4] bg-[#faf6f7] px-4 py-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">Bill To</div>
        <div className="mt-1 font-semibold text-[#000]">{invoice.customer.name || "Walk-in Customer"}</div>
        {invoice.customer.mobile && (
          <div className="text-xs text-[#666]">Mobile: {invoice.customer.mobile}</div>
        )}
      </div>

      {/* Items Table */}
      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-[#6b2c3e] text-left text-[11px] font-bold uppercase tracking-wider text-[#6b2c3e]">
            <th className="py-2 pr-2">#</th>
            <th className="py-2 pr-2">Item</th>
            <th className="py-2 pr-2 text-center">Qty</th>
            <th className="py-2 pr-2 text-right">Rate</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={item.product.id} className="border-b border-[#eee]">
              <td className="py-2 pr-2 text-xs text-[#999]">{idx + 1}</td>
              <td className="py-2 pr-2 font-medium">{item.product.name}</td>
              <td className="py-2 pr-2 text-center">{item.quantity}</td>
              <td className="py-2 pr-2 text-right">{item.product.price.toFixed(2)}</td>
              <td className="py-2 text-right font-semibold">{(item.product.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-64">
          <div className="flex justify-between border-b border-[#eee] py-1.5 text-sm text-[#666]">
            <span>Subtotal</span>
            <span className="text-[#000]">{invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b border-[#eee] py-1.5 text-xs text-[#999]">
            <span>Items</span>
            <span>{totalQty}</span>
          </div>
          <div className="flex justify-between py-2 text-lg font-bold text-[#6b2c3e]">
            <span>Total</span>
            <span>Rs. {invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-[#eee] pt-4 text-center text-[11px] text-[#999]">
        <div className="font-semibold text-[#000]">Thank you for shopping with Shrim Creation!</div>
        <div className="mt-1">No Exchange / No Refund</div>
      </div>
    </div>
  )
}

export async function generateReceiptHTML(invoice: InvoiceData): Promise<string> {
  const totalQty = invoice.items.reduce((acc, i) => acc + i.quantity, 0)

  // Convert logo to base64 so it embeds in standalone HTML/print
  let logoSrc = ""
  try {
    const fullUrl = typeof window !== "undefined"
      ? `${window.location.origin}${INVOICE_LOGO}`
      : INVOICE_LOGO
    const res = await fetch(fullUrl)
    if (res.ok) {
      const blob = await res.blob()
      logoSrc = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    }
  } catch (e) {
    console.log("[v0] Logo fetch failed:", e)
    logoSrc = ""
  }
  console.log("[v0] Logo loaded:", logoSrc ? `base64 (${logoSrc.length} chars)` : "FAILED - using text fallback")

  const itemsHTML = invoice.items
    .map(
      (item, idx) => `
      <tr>
        <td class="idx">${idx + 1}</td>
        <td class="name">${item.product.name}</td>
        <td class="qty">${item.quantity}</td>
        <td class="rate">${item.product.price.toFixed(2)}</td>
        <td class="amt">${(item.product.price * item.quantity).toFixed(2)}</td>
      </tr>`,
    )
    .join("")

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber} - Shrim Creation</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      color: #222;
      background: #fff;
      padding: 0;
    }

    .invoice {
      width: 100%;
      max-width: 180mm;
      margin: 0 auto;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #6b2c3e;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .logo img { height: 80px; width: auto; object-fit: contain; }
    .shop-phone { font-size: 11px; color: #888; margin-top: 4px; }
    .inv-label { font-size: 18px; font-weight: 700; color: #6b2c3e; text-align: right; }
    .inv-meta { font-size: 11px; color: #666; text-align: right; margin-top: 4px; }
    .inv-meta span { font-weight: 600; color: #000; font-family: monospace; }

    /* Customer */
    .customer-box {
      background: #faf6f7;
      border: 1px solid #e0d0d4;
      border-radius: 4px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }
    .customer-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #999; }
    .customer-name { font-size: 14px; font-weight: 600; color: #000; margin-top: 2px; }
    .customer-mobile { font-size: 12px; color: #666; }

    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    thead tr { border-bottom: 2px solid #6b2c3e; }
    th {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6b2c3e;
      padding: 8px 6px;
      text-align: left;
    }
    td { padding: 7px 6px; border-bottom: 1px solid #eee; }
    .idx { width: 30px; color: #999; font-size: 11px; }
    .name { font-weight: 500; }
    .qty { text-align: center; width: 50px; }
    th:nth-child(3) { text-align: center; }
    .rate { text-align: right; width: 80px; }
    th:nth-child(4) { text-align: right; }
    .amt { text-align: right; width: 90px; font-weight: 600; }
    th:nth-child(5) { text-align: right; }

    /* Totals */
    .totals { display: flex; justify-content: flex-end; margin-bottom: 20px; }
    .totals-box { width: 220px; }
    .totals-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; font-size: 12px; color: #666; }
    .totals-row span:last-child { color: #000; }
    .totals-row.grand {
      border-bottom: none;
      border-top: 2px solid #6b2c3e;
      padding: 8px 0 0 0;
      font-size: 18px;
      font-weight: 800;
      color: #6b2c3e;
    }
    .totals-row.grand span:last-child { color: #6b2c3e; }

    /* Footer */
    .footer {
      border-top: 1px solid #eee;
      padding-top: 12px;
      text-align: center;
      font-size: 11px;
      color: #999;
    }
    .footer strong { color: #222; }

    @media print {
      body { padding: 0; }
      .invoice { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">
        ${logoSrc ? `<img src="${logoSrc}" alt="Shrim Creation" />` : `<div style="font-size:24px;font-weight:900;color:#6b2c3e;letter-spacing:2px;">SHRIM CREATION</div>`}
      </div>
      <div>
        <div class="inv-label">INVOICE</div>
        <div class="inv-meta">
          No: <span>${invoice.invoiceNumber}</span><br>
          Date: ${invoice.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}<br>
          Time: ${invoice.date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div class="shop-phone">Phone: +91 78911 11041</div>
      </div>
    </div>

    <div class="customer-box">
      <div class="customer-label">Bill To</div>
      <div class="customer-name">${invoice.customer.name || "Walk-in Customer"}</div>
      ${invoice.customer.mobile ? `<div class="customer-mobile">Mobile: ${invoice.customer.mobile}</div>` : ""}
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="totals-row"><span>Subtotal</span><span>${invoice.subtotal.toFixed(2)}</span></div>
        <div class="totals-row"><span>Total Items</span><span>${totalQty}</span></div>
        <div class="totals-row grand"><span>Total</span><span>Rs. ${invoice.total.toFixed(2)}</span></div>
      </div>
    </div>

    <div class="footer">
      <strong>Thank you for shopping with Shrim Creation!</strong><br>
      No Exchange / No Refund
    </div>
  </div>
</body>
</html>`
}
