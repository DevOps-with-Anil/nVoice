"use client";

import React, { useState, useEffect } from "react";
import { CustomerStorage } from "@/lib/storage";
import { Customer } from "@/lib/pos-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit2, Plus, Search } from "lucide-react";

interface CustomerManagerProps {
  onSelectCustomer?: (customer: Customer) => void;
}

export function CustomerManager({ onSelectCustomer }: CustomerManagerProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const allCustomers = CustomerStorage.getAllCustomers();
    setCustomers(allCustomers);
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery)
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.mobile) {
      setError("Name and mobile are required");
      return;
    }

    try {
      const newCustomer = CustomerStorage.addCustomer({
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email || undefined,
        address: formData.address || undefined,
      });

      setCustomers([...customers, newCustomer]);
      setFormData({ name: "", mobile: "", email: "", address: "" });
      setIsAddingCustomer(false);
    } catch (err) {
      setError("Failed to add customer");
    }
  };

  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!editingCustomer || !formData.name || !formData.mobile) {
      setError("Name and mobile are required");
      return;
    }

    try {
      const updated = CustomerStorage.updateCustomer(editingCustomer.id, {
        ...editingCustomer,
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email || undefined,
        address: formData.address || undefined,
      });

      if (updated) {
        setCustomers(customers.map((c) => (c.id === updated.id ? updated : c)));
        setEditingCustomer(null);
        setFormData({ name: "", mobile: "", email: "", address: "" });
      }
    } catch (err) {
      setError("Failed to update customer");
    }
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      CustomerStorage.deleteCustomer(id);
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email || "",
      address: customer.address || "",
    });
  };

  const openAddDialog = () => {
    setEditingCustomer(null);
    setFormData({ name: "", mobile: "", email: "", address: "" });
    setIsAddingCustomer(true);
  };

  const closeDialog = () => {
    setIsAddingCustomer(false);
    setEditingCustomer(null);
    setFormData({ name: "", mobile: "", email: "", address: "" });
  };

  return (
    <div className="space-y-4">
      {/* Search and Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
        <div className="flex-1">
          <Label htmlFor="search" className="text-sm">
            Search Customers
          </Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Dialog open={isAddingCustomer || !!editingCustomer} onOpenChange={(open) => !open && closeDialog()}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                {editingCustomer ? "Update Customer" : "Add Customer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <p>
            {customers.length === 0
              ? "No customers yet. Add one to get started."
              : "No customers match your search."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground">{customer.name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1 mt-2">
                    <p>Mobile: {customer.mobile}</p>
                    {customer.email && <p>Email: {customer.email}</p>}
                    {customer.address && <p>Address: {customer.address}</p>}
                    <p className="text-xs pt-2">
                      Purchases: {customer.totalPurchases} | Total Spent: ₹{customer.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      handleEditClick(customer);
                      setIsAddingCustomer(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteCustomer(customer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {onSelectCustomer && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onSelectCustomer(customer)}
                    >
                      Select
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
