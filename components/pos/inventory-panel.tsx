"use client";

import React, { useState, useEffect } from "react";
import { products } from "@/lib/products";
import { InventoryStorage } from "@/lib/storage";
import { Product } from "@/lib/pos-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Edit2, Plus, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InventoryPanel() {
  const [inventory, setInventory] = useState<Map<string, number>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadInventory();
    // Initialize stock on first load
    InventoryStorage.initializeStock(products);
  }, []);

  const loadInventory = () => {
    const inv = InventoryStorage.getProductInventory();
    setInventory(inv);
  };

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!editingProduct) return;

    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) {
      setError("Please enter a valid stock quantity");
      return;
    }

    InventoryStorage.setProductStock(editingProduct.id, stock);
    loadInventory();
    setEditingProduct(null);
    setNewStock("");
  };

  const handleAdjustStock = (productId: string, delta: number) => {
    InventoryStorage.adjustStock(productId, delta);
    loadInventory();
  };

  const getStockStatus = (product: Product) => {
    const stock = inventory.get(product.id) || 0;
    const threshold = product.reorderLevel || 10;

    if (stock === 0) return { label: "Out of Stock", color: "destructive" };
    if (stock < threshold) return { label: "Low Stock", color: "warning" };
    return { label: "In Stock", color: "success" };
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.includes(searchQuery)
  );

  const lowStockProducts = InventoryStorage.getLowStockProducts(filteredProducts);
  const outOfStockProducts = filteredProducts.filter(
    (p) => (inventory.get(p.id) || 0) === 0
  );

  const displayProducts =
    activeTab === "low" ? lowStockProducts : activeTab === "out" ? outOfStockProducts : filteredProducts;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
        <div className="flex-1">
          <Label htmlFor="search" className="text-sm">
            Search Products
          </Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Products ({filteredProducts.length})</TabsTrigger>
          <TabsTrigger value="low" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Low Stock ({lowStockProducts.length})
          </TabsTrigger>
          <TabsTrigger value="out" className="flex items-center gap-2">
            Out of Stock ({outOfStockProducts.length})
          </TabsTrigger>
        </TabsList>

        {/* Products Grid */}
        <TabsContent value={activeTab} className="mt-4">
          {displayProducts.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              <p>No products found</p>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {displayProducts.map((product) => {
                const stock = inventory.get(product.id) || 0;
                const status = getStockStatus(product);

                return (
                  <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-card-foreground text-sm">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </div>
                      <Badge
                        variant={
                          status.color === "destructive"
                            ? "destructive"
                            : status.color === "warning"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {status.label}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {/* Stock Display */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Stock:</span>
                        <span className="font-bold text-lg text-card-foreground">{stock}</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Price:</span>
                        <span className="font-semibold text-card-foreground">
                          ₹{product.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Reorder Level */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Reorder Level:</span>
                        <span className="text-card-foreground">
                          {product.reorderLevel || 10}
                        </span>
                      </div>

                      {/* Quick Adjust Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdjustStock(product.id, -1)}
                          disabled={stock === 0}
                        >
                          -1
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdjustStock(product.id, 1)}
                        >
                          +1
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setEditingProduct(product);
                                setNewStock(stock.toString());
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Stock - {product.name}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpdateStock} className="space-y-4">
                              {error && (
                                <Alert variant="destructive">
                                  <AlertDescription>{error}</AlertDescription>
                                </Alert>
                              )}

                              <div className="space-y-2">
                                <Label htmlFor="stock">
                                  Current Stock: <span className="font-bold">{stock}</span>
                                </Label>
                                <Input
                                  id="stock"
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={newStock}
                                  onChange={(e) => setNewStock(e.target.value)}
                                  autoFocus
                                />
                              </div>

                              <Button type="submit" className="w-full">
                                Update Stock
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
