import type { Customer, InvoiceData, Product } from "./pos-types";

// Customer Storage
export const CustomerStorage = {
  getAllCustomers(): Customer[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem("pos_customers");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addCustomer(customer: Omit<Customer, "id" | "createdDate" | "totalPurchases" | "totalAmount">): Customer {
    const customers = this.getAllCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: `cust_${Date.now()}`,
      createdDate: new Date(),
      totalPurchases: 0,
      totalAmount: 0,
    };
    customers.push(newCustomer);
    localStorage.setItem("pos_customers", JSON.stringify(customers));
    return newCustomer;
  },

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const customers = this.getAllCustomers();
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updated = { ...customers[index], ...updates };
    customers[index] = updated;
    localStorage.setItem("pos_customers", JSON.stringify(customers));
    return updated;
  },

  deleteCustomer(id: string): boolean {
    const customers = this.getAllCustomers();
    const filtered = customers.filter((c) => c.id !== id);
    if (filtered.length === customers.length) return false;

    localStorage.setItem("pos_customers", JSON.stringify(filtered));
    return true;
  },

  getCustomerById(id: string): Customer | null {
    return this.getAllCustomers().find((c) => c.id === id) || null;
  },

  searchCustomers(query: string): Customer[] {
    const customers = this.getAllCustomers();
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  },

  updatePurchaseStats(customerId: string, amount: number): void {
    const customer = this.getCustomerById(customerId);
    if (customer) {
      this.updateCustomer(customerId, {
        totalPurchases: customer.totalPurchases + 1,
        totalAmount: customer.totalAmount + amount,
      });
    }
  },
};

// Invoice Storage
export const InvoiceStorage = {
  getAllInvoices(): InvoiceData[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem("pos_invoices");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addInvoice(invoice: InvoiceData): void {
    const invoices = this.getAllInvoices();
    invoices.push(invoice);
    localStorage.setItem("pos_invoices", JSON.stringify(invoices));

    // Update customer purchase stats if customer ID exists
    if (invoice.customerId) {
      CustomerStorage.updatePurchaseStats(invoice.customerId, invoice.total);
    }
  },

  getInvoiceByNumber(invoiceNumber: string): InvoiceData | null {
    return this.getAllInvoices().find((inv) => inv.invoiceNumber === invoiceNumber) || null;
  },

  updateInvoice(invoiceNumber: string, updates: Partial<InvoiceData>): InvoiceData | null {
    const invoices = this.getAllInvoices();
    const index = invoices.findIndex((inv) => inv.invoiceNumber === invoiceNumber);
    if (index === -1) return null;

    const updated = { ...invoices[index], ...updates };
    invoices[index] = updated;
    localStorage.setItem("pos_invoices", JSON.stringify(invoices));
    return updated;
  },

  deleteInvoice(invoiceNumber: string): boolean {
    const invoices = this.getAllInvoices();
    const filtered = invoices.filter((inv) => inv.invoiceNumber !== invoiceNumber);
    if (filtered.length === invoices.length) return false;

    localStorage.setItem("pos_invoices", JSON.stringify(filtered));
    return true;
  },

  getCustomerInvoices(customerId: string): InvoiceData[] {
    return this.getAllInvoices().filter((inv) => inv.customerId === customerId);
  },

  getInvoicesByDateRange(startDate: Date, endDate: Date): InvoiceData[] {
    return this.getAllInvoices().filter((inv) => {
      const invDate = new Date(inv.date);
      return invDate >= startDate && invDate <= endDate;
    });
  },

  searchInvoices(query: string): InvoiceData[] {
    const q = query.toLowerCase();
    return this.getAllInvoices().filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customer.name.toLowerCase().includes(q) ||
        inv.customer.mobile.includes(q)
    );
  },

  getInvoicesByCustomerName(name: string): InvoiceData[] {
    const q = name.toLowerCase();
    return this.getAllInvoices().filter((inv) =>
      inv.customer.name.toLowerCase().includes(q)
    );
  },
};

// Product Inventory Storage
export const InventoryStorage = {
  getProductInventory(): Map<string, number> {
    if (typeof window === "undefined") return new Map();
    try {
      const data = localStorage.getItem("pos_inventory");
      return data ? new Map(JSON.parse(data)) : new Map();
    } catch {
      return new Map();
    }
  },

  setProductStock(productId: string, stock: number): void {
    const inventory = this.getProductInventory();
    inventory.set(productId, Math.max(0, stock));
    localStorage.setItem("pos_inventory", JSON.stringify(Array.from(inventory.entries())));
  },

  adjustStock(productId: string, delta: number): number {
    const inventory = this.getProductInventory();
    const currentStock = inventory.get(productId) || 0;
    const newStock = Math.max(0, currentStock + delta);
    this.setProductStock(productId, newStock);
    return newStock;
  },

  getStock(productId: string): number {
    const inventory = this.getProductInventory();
    return inventory.get(productId) || 0;
  },

  getLowStockProducts(products: Product[], lowThreshold: number = 10): Product[] {
    return products.filter((p) => {
      const stock = this.getStock(p.id);
      return stock < (p.reorderLevel || lowThreshold);
    });
  },

  initializeStock(products: Product[]): void {
    const inventory = this.getProductInventory();
    products.forEach((p) => {
      if (!inventory.has(p.id)) {
        inventory.set(p.id, p.stock || 50); // Default stock
      }
    });
    localStorage.setItem("pos_inventory", JSON.stringify(Array.from(inventory.entries())));
  },
};

// Session/Cache Storage
export const SessionStorage = {
  setDraft(cart: any, customer: any): void {
    localStorage.setItem("pos_draft_cart", JSON.stringify(cart));
    localStorage.setItem("pos_draft_customer", JSON.stringify(customer));
  },

  getDraft(): { cart: any; customer: any } | null {
    const cart = localStorage.getItem("pos_draft_cart");
    const customer = localStorage.getItem("pos_draft_customer");
    return cart && customer ? { cart: JSON.parse(cart), customer: JSON.parse(customer) } : null;
  },

  clearDraft(): void {
    localStorage.removeItem("pos_draft_cart");
    localStorage.removeItem("pos_draft_customer");
  },

  setUserPreference(key: string, value: any): void {
    const prefs = JSON.parse(localStorage.getItem("pos_prefs") || "{}");
    prefs[key] = value;
    localStorage.setItem("pos_prefs", JSON.stringify(prefs));
  },

  getUserPreference(key: string): any {
    const prefs = JSON.parse(localStorage.getItem("pos_prefs") || "{}");
    return prefs[key];
  },
};

// Data Export/Import
export const DataStorage = {
  exportAllData() {
    return {
      customers: CustomerStorage.getAllCustomers(),
      invoices: InvoiceStorage.getAllInvoices(),
      inventory: Array.from(InventoryStorage.getProductInventory().entries()),
      exportDate: new Date().toISOString(),
    };
  },

  importData(data: any): boolean {
    try {
      if (data.customers) {
        localStorage.setItem("pos_customers", JSON.stringify(data.customers));
      }
      if (data.invoices) {
        localStorage.setItem("pos_invoices", JSON.stringify(data.invoices));
      }
      if (data.inventory) {
        localStorage.setItem("pos_inventory", JSON.stringify(data.inventory));
      }
      return true;
    } catch {
      return false;
    }
  },

  clearAllData(): void {
    localStorage.removeItem("pos_customers");
    localStorage.removeItem("pos_invoices");
    localStorage.removeItem("pos_inventory");
    localStorage.removeItem("pos_draft_cart");
    localStorage.removeItem("pos_draft_customer");
    localStorage.removeItem("pos_prefs");
  },
};
