"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { CustomerForm } from "@/components/pos/customer-form";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartPanel } from "@/components/pos/cart-panel";
import { ThermalReceipt } from "@/components/pos/thermal-receipt";
import { InvoiceActions } from "@/components/pos/invoice-actions";
import { OrderHistory } from "@/components/pos/order-history";
import { InvoiceStorage, CustomerStorage, InventoryStorage } from "@/lib/storage";
import Image from "next/image";
import type { CartItem, CustomerInfo, InvoiceData, Product } from "@/lib/pos-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, History } from "lucide-react";

function generateInvoiceNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${datePart}-${randomPart}`;
}

export default function POSDashboard() {
  const [customer, setCustomer] = useState<CustomerInfo>({ name: "", mobile: "" });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [activeTab, setActiveTab] = useState("billing");

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("pos_draft_cart");
    const draftCustomer = localStorage.getItem("pos_draft_customer");
    if (draft && draftCustomer) {
      try {
        setCart(JSON.parse(draft));
        setCustomer(JSON.parse(draftCustomer));
      } catch {
        // Invalid draft, ignore
      }
    }
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const newCart = existing
        ? prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev, { product, quantity: 1 }];

      // Save draft
      localStorage.setItem("pos_draft_cart", JSON.stringify(newCart));
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) => {
      const newCart = prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0);

      localStorage.setItem("pos_draft_cart", JSON.stringify(newCart));
      return newCart;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => {
      const newCart = prev.filter((item) => item.product.id !== productId);
      localStorage.setItem("pos_draft_cart", JSON.stringify(newCart));
      return newCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem("pos_draft_cart");
  }, []);

  const { subtotal, total } = useMemo(() => {
    const sub = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    return { subtotal: sub, total: sub };
  }, [cart]);

  const handleGenerateInvoice = useCallback(() => {
    const invoiceData: InvoiceData = {
      invoiceNumber: generateInvoiceNumber(),
      date: new Date(),
      customer,
      items: [...cart],
      subtotal,
      tax: 0,
      total,
    };

    // Add customer ID if exists
    if (customer.id) {
      invoiceData.customerId = customer.id;
    }

    // Save to storage
    InvoiceStorage.addInvoice(invoiceData);

    // Update customer purchase stats if customer exists
    if (customer.id) {
      const cust = CustomerStorage.getCustomerById(customer.id);
      if (cust) {
        CustomerStorage.updatePurchaseStats(customer.id, total);
      }
    }

    // Adjust inventory
    cart.forEach((item) => {
      InventoryStorage.adjustStock(item.product.id, -item.quantity);
    });

    setInvoice(invoiceData);
    localStorage.removeItem("pos_draft_cart");
    localStorage.removeItem("pos_draft_customer");
  }, [customer, cart, subtotal, total]);

  const handleEditInvoice = useCallback(() => {
    if (!invoice) return;
    // Restore cart and customer from the invoice so the user can edit
    setCustomer(invoice.customer);
    setCart([...invoice.items]);
    setInvoice(null);
  }, [invoice]);

  const handleEditFromHistory = useCallback((originalInvoice: InvoiceData) => {
    // Restore inventory from original invoice
    originalInvoice.items.forEach((item) => {
      InventoryStorage.adjustStock(item.product.id, item.quantity);
    });

    // Set up cart for editing
    setCustomer(originalInvoice.customer);
    setCart([...originalInvoice.items]);
    setActiveTab("billing");
  }, []);

  const handleNewTransaction = useCallback(() => {
    setCustomer({ name: "", mobile: "" });
    setCart([]);
    setInvoice(null);
    localStorage.removeItem("pos_draft_cart");
    localStorage.removeItem("pos_draft_customer");
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-card-foreground">POS Billing System</h1>
        <p className="text-muted-foreground mt-2">Create and manage invoices</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="billing" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Orders
          </TabsTrigger>
        </TabsList>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6">
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
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Invoice Preview
                </h2>
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
                      <span className="font-mono font-medium text-card-foreground">
                        {invoice.invoiceNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="font-medium text-card-foreground">
                        {invoice.customer.name || "Walk-in"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items</span>
                      <span className="font-medium text-card-foreground">
                        {invoice.items.reduce((a, i) => a + i.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-card-foreground">Total</span>
                      <span className="text-primary">₹{invoice.total.toFixed(2)}</span>
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
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <OrderHistory onEditOrder={handleEditFromHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
