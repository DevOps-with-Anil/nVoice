"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type { CartItem } from "@/lib/pos-types"

interface CartPanelProps {
  items: CartItem[]
  onUpdateQuantity: (productId: string, delta: number) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
  subtotal: number
  total: number
}

export function CartPanel({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  subtotal,
  total,
}: CartPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <ShoppingCart className="h-4 w-4" />
          Cart ({items.reduce((acc, i) => acc + i.quantity, 0)})
        </h2>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearCart} className="h-7 text-xs text-destructive hover:text-destructive">
            Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <ShoppingCart className="mb-2 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Cart is empty</p>
          <p className="text-xs text-muted-foreground/70">Add products to get started</p>
        </div>
      ) : (
        <>
          <div className="flex max-h-[280px] flex-col gap-2 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 rounded-md border border-border bg-background p-2.5"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-card-foreground">{item.product.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {"₹"}{item.product.price.toFixed(2)} x {item.quantity}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-transparent"
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                  >
                    <Minus className="h-3 w-3" />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <span className="w-7 text-center text-sm font-semibold text-card-foreground">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-transparent"
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                  >
                    <Plus className="h-3 w-3" />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 text-right text-sm font-bold text-card-foreground">
                    {"₹"}{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onRemoveItem(item.product.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{"₹"}{subtotal.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold text-card-foreground">
              <span>Total</span>
              <span>{"₹"}{total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
