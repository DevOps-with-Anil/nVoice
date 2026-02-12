"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { LoginPage } from "@/components/auth/login-page"
import { ForgotPasswordPage } from "@/components/auth/forgot-password-page"
// Shrim Creation POS - Main Page
import { CustomerForm } from "@/components/pos/customer-form"
import { ProductGrid } from "@/components/pos/product-grid"
import { CartPanel } from "@/components/pos/cart-panel"
import { ThermalReceipt } from "@/components/pos/thermal-receipt"
import { InvoiceActions } from "@/components/pos/invoice-actions"
import Image from "next/image"
import type { CartItem, CustomerInfo, InvoiceData, Product } from "@/lib/pos-types"

function generateInvoiceNumber() {
  const now = new Date()
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "")
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `INV-${datePart}-${randomPart}`
}

function POSContent() {
  const [customer, setCustomer] = useState<CustomerInfo>({ name: "", mobile: "" })
  const [cart, setCart] = useState<CartItem[]>([])
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }, [])

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const { subtotal, total } = useMemo(() => {
    const sub = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
    return { subtotal: sub, total: sub }
  }, [cart])

  const handleGenerateInvoice = useCallback(() => {
    const invoiceData: InvoiceData = {
      invoiceNumber: generateInvoiceNumber(),
      date: new Date(),
      customer,
      items: [...cart],
      subtotal,
      tax: 0,
      total,
    }
    setInvoice(invoiceData)
  }, [customer, cart, subtotal, total])

  const handleEditInvoice = useCallback(() => {
    if (!invoice) return
    // Restore cart and customer from the invoice so the user can edit
    setCustomer(invoice.customer)
    setCart([...invoice.items])
    setInvoice(null)
  }, [invoice])

  const handleNewTransaction = useCallback(() => {
    setCustomer({ name: "", mobile: "" })
    setCart([])
    setInvoice(null)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-primary">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <Image
              src="/shrimlogo.png"
              alt="Shrim Creation logo"
              width={120}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </div>
          <div className="text-right text-xs text-primary-foreground/70">
            <div>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            <div className="font-medium text-primary-foreground">POS Billing</div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-4">
        {!invoice ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Left: Products */}
            <div className="flex flex-col gap-4 lg:col-span-7">
              <CustomerForm customer={customer} onChange={setCustomer} />
              <ProductGrid onAddToCart={addToCart} />
            </div>

            {/* Right: Cart & Actions */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              <CartPanel
                items={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onClearCart={clearCart}
                subtotal={subtotal}
                total={total}
              />
              <InvoiceActions
                invoice={null}
                canGenerate={cart.length > 0}
                onGenerateInvoice={handleGenerateInvoice}
                onNewTransaction={handleNewTransaction}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Invoice Preview */}
            <div className="flex flex-col items-center gap-4 lg:col-span-7">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Invoice Preview</h2>
              <div className="w-full rounded-lg border border-border bg-card shadow-sm">
                <ThermalReceipt invoice={invoice} />
              </div>
            </div>

            {/* Actions */}
            <div className="lg:col-span-5">
              <div className="sticky top-20 flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Invoice Generated
                </h2>
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice No.</span>
                    <span className="font-mono font-medium text-card-foreground">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium text-card-foreground">{invoice.customer.name || "Walk-in"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-medium text-card-foreground">{invoice.items.reduce((a, i) => a + i.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-card-foreground">Total</span>
                    <span className="text-primary">{"₹"}{invoice.total.toFixed(2)}</span>
                  </div>
                </div>
                <InvoiceActions
                  invoice={invoice}
                  canGenerate={false}
                  onGenerateInvoice={handleGenerateInvoice}
                  onNewTransaction={handleNewTransaction}
                  onEditInvoice={handleEditInvoice}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function POSPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Listen for forgot password navigation event
    const handleForgotPassword = () => {
      setShowForgotPassword(true)
    }
    window.addEventListener("navigateForgot", handleForgotPassword)
    return () => window.removeEventListener("navigateForgot", handleForgotPassword)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (showForgotPassword) {
      return <ForgotPasswordPage onBack={() => setShowForgotPassword(false)} />
    }
    return <LoginPage />
  }

  return <POSContent />
}
