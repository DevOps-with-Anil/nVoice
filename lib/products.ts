import type { Product } from "./pos-types"

export const products: Product[] = [
  { id: "1", name: "Rice (1kg)", price: 55.00, category: "Grocery", sku: "GR001", stock: 150, reorderLevel: 20 },
  { id: "2", name: "Wheat Flour (1kg)", price: 42.00, category: "Grocery", sku: "GR002", stock: 120, reorderLevel: 15 },
  { id: "3", name: "Sugar (1kg)", price: 45.00, category: "Grocery", sku: "GR003", stock: 100, reorderLevel: 15 },
  { id: "4", name: "Salt (1kg)", price: 20.00, category: "Grocery", sku: "GR004", stock: 200, reorderLevel: 25 },
  { id: "5", name: "Cooking Oil (1L)", price: 135.00, category: "Grocery", sku: "GR005", stock: 80, reorderLevel: 10 },
  { id: "6", name: "Tea (250g)", price: 95.00, category: "Beverages", sku: "BV001", stock: 60, reorderLevel: 8 },
  { id: "7", name: "Coffee (200g)", price: 180.00, category: "Beverages", sku: "BV002", stock: 45, reorderLevel: 6 },
  { id: "8", name: "Milk (1L)", price: 60.00, category: "Dairy", sku: "DA001", stock: 110, reorderLevel: 15 },
  { id: "9", name: "Butter (500g)", price: 270.00, category: "Dairy", sku: "DA002", stock: 35, reorderLevel: 5 },
  { id: "10", name: "Cheese (200g)", price: 120.00, category: "Dairy", sku: "DA003", stock: 28, reorderLevel: 5 },
  { id: "11", name: "Bread (Loaf)", price: 40.00, category: "Bakery", sku: "BK001", stock: 90, reorderLevel: 20 },
  { id: "12", name: "Biscuits (Pack)", price: 30.00, category: "Snacks", sku: "SN001", stock: 160, reorderLevel: 25 },
  { id: "13", name: "Chips (Pack)", price: 20.00, category: "Snacks", sku: "SN002", stock: 140, reorderLevel: 20 },
  { id: "14", name: "Soap (Bar)", price: 35.00, category: "Personal Care", sku: "PC001", stock: 180, reorderLevel: 25 },
  { id: "15", name: "Shampoo (200ml)", price: 110.00, category: "Personal Care", sku: "PC002", stock: 65, reorderLevel: 10 },
  { id: "16", name: "Toothpaste", price: 65.00, category: "Personal Care", sku: "PC003", stock: 95, reorderLevel: 15 },
  { id: "17", name: "Detergent (1kg)", price: 85.00, category: "Household", sku: "HH001", stock: 75, reorderLevel: 10 },
  { id: "18", name: "Floor Cleaner (1L)", price: 95.00, category: "Household", sku: "HH002", stock: 5, reorderLevel: 8 },
  { id: "19", name: "Eggs (12 pcs)", price: 72.00, category: "Dairy", sku: "DA004", stock: 85, reorderLevel: 12 },
  { id: "20", name: "Noodles (Pack)", price: 14.00, category: "Snacks", sku: "SN003", stock: 220, reorderLevel: 30 },
]

export const categories = [...new Set(products.map(p => p.category))]

// Initialize inventory on first load
export function initializeInventory() {
  if (typeof window !== "undefined") {
    const { InventoryStorage } = require("./storage")
    InventoryStorage.initializeStock(products)
  }
}
