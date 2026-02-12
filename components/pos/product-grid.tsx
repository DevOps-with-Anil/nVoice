"use client"

import { useRef, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Package } from "lucide-react"
import type { Product } from "@/lib/pos-types"

interface ProductGridProps {
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [manualName, setManualName] = useState("")
  const [manualPrice, setManualPrice] = useState("")
  const [manualQty, setManualQty] = useState("1")
  const nameInputRef = useRef<HTMLInputElement>(null)

  function handleManualAdd(e: FormEvent) {
    e.preventDefault()
    const price = Number.parseFloat(manualPrice)
    const qty = Number.parseInt(manualQty, 10)
    if (!manualName.trim() || Number.isNaN(price) || price <= 0) return

    const customProduct: Product = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: manualName.trim(),
      price,
      category: "Custom",
      sku: "CUSTOM",
    }

    const validQty = Number.isNaN(qty) || qty < 1 ? 1 : qty
    for (let i = 0; i < validQty; i++) {
      onAddToCart(customProduct)
    }

    setManualName("")
    setManualPrice("")
    setManualQty("1")
    nameInputRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Package className="h-4 w-4" />
        Add Product
      </h2>

      <form onSubmit={handleManualAdd} className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="manual-name" className="text-xs font-medium text-card-foreground">
            Product Name <span className="text-destructive">*</span>
          </label>
          <Input
            ref={nameInputRef}
            id="manual-name"
            placeholder="e.g. Saree, Blouse Piece, Dupatta..."
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="manual-price" className="text-xs font-medium text-card-foreground">
              Price ({"₹"}) <span className="text-destructive">*</span>
            </label>
            <Input
              id="manual-price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="manual-qty" className="text-xs font-medium text-card-foreground">
              Quantity
            </label>
            <Input
              id="manual-qty"
              type="number"
              min="1"
              step="1"
              placeholder="1"
              value={manualQty}
              onChange={(e) => setManualQty(e.target.value)}
            />
          </div>
        </div>
        {manualName.trim() && manualPrice && Number(manualPrice) > 0 && (
          <div className="flex items-center justify-between rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-sm">
            <span className="font-medium text-card-foreground">{manualName.trim()}</span>
            <span className="font-bold text-primary">
              {"₹"}{(Number(manualPrice) * (Number(manualQty) || 1)).toFixed(2)}
            </span>
          </div>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={!manualName.trim() || !manualPrice || Number(manualPrice) <= 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </form>
    </div>
  )
}
