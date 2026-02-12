"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Phone } from "lucide-react"
import type { CustomerInfo } from "@/lib/pos-types"

interface CustomerFormProps {
  customer: CustomerInfo
  onChange: (customer: CustomerInfo) => void
}

export function CustomerForm({ customer, onChange }: CustomerFormProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <User className="h-4 w-4" />
        Customer Details
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="customer-name" className="text-xs font-medium text-muted-foreground">
            Customer Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="customer-name"
              placeholder="Enter customer name"
              value={customer.name}
              onChange={(e) => onChange({ ...customer, name: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="customer-mobile" className="text-xs font-medium text-muted-foreground">
            Mobile Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="customer-mobile"
              placeholder="Enter mobile number"
              value={customer.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "")
                if (value.length <= 10) {
                  onChange({ ...customer, mobile: value })
                }
              }}
              className="pl-9"
              inputMode="numeric"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
