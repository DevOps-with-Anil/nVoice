"use client";

import React from "react";
import { CustomerManager } from "@/components/pos/customer-manager";
import { Card } from "@/components/ui/card";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-card-foreground">Customer Management</h1>
        <p className="text-muted-foreground mt-2">Create, manage, and track your customers</p>
      </div>

      {/* Content */}
      <Card className="p-6">
        <CustomerManager />
      </Card>
    </div>
  );
}
