"use client";

import React from "react";
import { InventoryPanel } from "@/components/pos/inventory-panel";
import { Card } from "@/components/ui/card";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-card-foreground">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage product stock levels
        </p>
      </div>

      {/* Content */}
      <Card className="p-6">
        <InventoryPanel />
      </Card>
    </div>
  );
}
