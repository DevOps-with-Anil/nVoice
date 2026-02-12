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
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-primary text-primary-foreground flex items-center justify-between px-4 border-b border-border">
        <div className="font-bold text-lg">nVoize</div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-primary/80"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 w-64 bg-primary text-primary-foreground transform transition-transform duration-200 md:transform-none md:mt-0 mt-16 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo - Centered and Larger */}
          <div className="mb-8 flex items-center justify-center">
            <Image
              src="/nvoize-logo.png"
              alt="nVoize"
              width={140}
              height={140}
              className="h-32 w-auto"
            />
          </div>

          <div className="h-px bg-primary-foreground/20 mb-6" />

          {/* User Info */}
          <div className="mb-6 p-3 rounded-lg bg-primary-foreground/10">
            <p className="text-xs text-primary-foreground/70">Logged in as</p>
            <p className="font-semibold text-sm text-primary-foreground">{user.name}</p>
            <p className="text-xs text-primary-foreground/70">{user.email}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/15"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="h-px bg-primary-foreground/20 mb-4" />

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            className="w-full justify-start gap-3 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:mt-0 mt-16">
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
