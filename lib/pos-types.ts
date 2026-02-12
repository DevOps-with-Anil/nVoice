export interface Product {
  id: string
  name: string
  price: number
  category: string
  sku: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface CustomerInfo {
  name: string
  mobile: string
}

export interface InvoiceData {
  invoiceNumber: string
  date: Date
  customer: CustomerInfo
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
}
