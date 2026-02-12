"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = [
    { icon: ShoppingCart, label: "POS Billing", href: "/dashboard" },
    { icon: Package, label: "Inventory", href: "/dashboard/inventory" },
    { icon: BarChart3, label: "Orders", href: "/dashboard/orders" },
    { icon: Users, label: "Customers", href: "/dashboard/customers" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-card border border-border hover:bg-accent"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 md:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Logo */}
          <div className="mb-6 flex items-center gap-3">
            <Image
              src="/shrimlogo.png"
              alt="Shrim Creation"
              width={100}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          <Separator className="mb-4" />

          {/* User Info */}
          <div className="mb-6 p-3 rounded-lg bg-accent/50">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="font-semibold text-sm text-card-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-accent"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <Separator className="mb-4" />

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full justify-start gap-3"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          {/* Close sidebar on mobile when navigating */}
          <div onClick={() => setSidebarOpen(false)}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
