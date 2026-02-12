"use client";

import React, { useState, useEffect, useMemo } from "react";
import { InvoiceStorage } from "@/lib/storage";
import { InvoiceData } from "@/lib/pos-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThermalReceipt } from "./thermal-receipt";
import { Search, Eye, Download, Trash2, Edit2, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderHistoryProps {
  onEditOrder?: (invoice: InvoiceData) => void;
}

export function OrderHistory({ onEditOrder }: OrderHistoryProps) {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const allInvoices = InvoiceStorage.getAllInvoices();
    // Sort by date descending
    allInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setInvoices(allInvoices);
  };

  // Filter invoices based on search and filters
  const filteredInvoices = useMemo(() => {
    let results = invoices;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customer.name.toLowerCase().includes(q) ||
          inv.customer.mobile.includes(q)
      );
    }

    // Type filter
    if (filterType === "edited") {
      results = results.filter((inv) => inv.isEdited);
    } else if (filterType === "original") {
      results = results.filter((inv) => !inv.isEdited);
    }

    // Date filter
    if (dateFilter) {
      results = results.filter((inv) => {
        const invDate = new Date(inv.date).toISOString().split("T")[0];
        return invDate === dateFilter;
      });
    }

    // Amount filter
    if (minAmount || maxAmount) {
      results = results.filter((inv) => {
        const amount = inv.total;
        if (minAmount && amount < parseFloat(minAmount)) return false;
        if (maxAmount && amount > parseFloat(maxAmount)) return false;
        return true;
      });
    }

    return results;
  }, [invoices, searchQuery, filterType, dateFilter, minAmount, maxAmount]);

  const handleDeleteInvoice = (invoiceNumber: string) => {
    if (confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      InvoiceStorage.deleteInvoice(invoiceNumber);
      loadInvoices();
    }
  };

  const handleDownloadReceipt = (invoice: InvoiceData) => {
    const element = document.createElement("div");
    element.innerHTML = `<pre>${JSON.stringify(invoice, null, 2)}</pre>`;
    const file = new Blob([JSON.stringify(invoice, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice_${invoice.invoiceNumber}.json`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="flex-1">
          <Label htmlFor="search" className="text-sm">
            Search Orders
          </Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by invoice, customer name, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="date-filter" className="text-sm">
              Date
            </Label>
            <Input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-amount" className="text-sm">
              Min Amount
            </Label>
            <Input
              id="min-amount"
              type="number"
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-amount" className="text-sm">
              Max Amount
            </Label>
            <Input
              id="max-amount"
              type="number"
              placeholder="999999"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type-filter" className="text-sm">
              Type
            </Label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Orders</option>
              <option value="original">Original Only</option>
              <option value="edited">Edited Only</option>
            </select>
          </div>
        </div>

        {/* Reset Filters */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setFilterType("all");
              setDateFilter("");
              setMinAmount("");
              setMaxAmount("");
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
          <span className="text-sm text-muted-foreground ml-auto flex items-center">
            {filteredInvoices.length} {filteredInvoices.length === 1 ? "order" : "orders"} found
          </span>
        </div>
      </div>

      {/* Orders List */}
      {filteredInvoices.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <p>
            {invoices.length === 0
              ? "No invoices yet. Create one to get started."
              : "No invoices match your filters."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.invoiceNumber} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-card-foreground">
                      {invoice.invoiceNumber}
                    </h3>
                    {invoice.isEdited && (
                      <Badge variant="secondary">Edited</Badge>
                    )}
                    {invoice.editedFrom && (
                      <Badge variant="outline">Based on {invoice.editedFrom}</Badge>
                    )}
                  </div>

                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <div>
                      <p>
                        <strong>Customer:</strong> {invoice.customer.name || "Walk-in"}
                      </p>
                      <p>
                        <strong>Mobile:</strong> {invoice.customer.mobile}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(invoice.date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p>
                        <strong>Items:</strong> {invoice.items.reduce((a, i) => a + i.quantity, 0)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-lg font-bold text-primary">
                      ₹{invoice.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-auto">
                  <Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Dialog>

                  {onEditOrder && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditOrder(invoice)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReceipt(invoice)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteInvoice(invoice.invoiceNumber)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Invoice Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice: {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="rounded-lg border border-border bg-card p-4">
              <ThermalReceipt invoice={selectedInvoice} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
