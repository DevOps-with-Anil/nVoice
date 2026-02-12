export interface Product {
  id: string
  name: string
  price: number
  category: string
  sku: string
  stock?: number
  reorderLevel?: number
  lastRestockDate?: Date
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface CustomerInfo {
  id?: string
  name: string
  mobile: string
  email?: string
  address?: string
}

export interface Customer extends CustomerInfo {
  id: string
  createdDate: Date
  totalPurchases: number
  totalAmount: number
}

export interface InvoiceData {
  invoiceNumber: string
  date: Date
  customer: CustomerInfo
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  editedFrom?: string
  isEdited?: boolean
  customerId?: string
  paymentMethod?: string
}
