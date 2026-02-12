"use client";

import React from "react";
import { OrderHistory } from "@/components/pos/order-history";
import { Card } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-card-foreground">Order History</h1>
        <p className="text-muted-foreground mt-2">
          View, manage, and reprint past invoices
        </p>
      </div>

      {/* Content */}
      <Card className="p-6">
        <OrderHistory />
      </Card>
    </div>
  );
}
