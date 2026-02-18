"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    if (!loginEmail || !loginPassword) {
      setLoginError("Please fill in all fields");
      setLoginLoading(false);
      return;
    }

    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setLoginError(result.error || "Login failed");
    }

    setLoginLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);

    if (!registerEmail || !registerPassword || !registerName) {
      setRegisterError("Please fill in all fields");
      setRegisterLoading(false);
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Passwords do not match");
      setRegisterLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError("Password must be at least 6 characters");
      setRegisterLoading(false);
      return;
    }

    const result = await register(registerEmail, registerPassword, registerName);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setRegisterError(result.error || "Registration failed");
    }

    setRegisterLoading(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col">
      {/* Main container - uses flexbox to prevent scrolling */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md flex flex-col max-h-full">
          {/* Logo and Header */}
          <div className="text-center mb-6 flex-shrink-0">
            <div className="flex justify-center mb-3">
              <Image
                src="/nvoize-logo.png"
                alt="nVoize logo"
                width={150}
                height={150}
                className="h-24 w-auto"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">nVoize</h1>
            <p className="text-muted-foreground text-xs mt-1">POS Billing & Inventory Management</p>
          </div>

          {/* Auth Tabs - scrollable content area */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-5 flex-1 overflow-y-auto">
            <Tabs defaultValue="login" className="w-full h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-4 flex-shrink-0">
                <TabsTrigger value="login" className="text-sm">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-sm">Create Account</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="flex-1 overflow-y-auto">
                <form onSubmit={handleLogin} className="space-y-3">
                  {loginError && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">{loginError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-xs">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={loginLoading}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="login-password" className="text-xs">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={loginLoading}
                      className="h-9 text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-9 text-sm"
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs h-auto py-1"
                      onClick={() => {
                        const event = new CustomEvent("navigateForgot");
                        window.dispatchEvent(event);
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </div>

                  {/* Demo credentials */}
                  <div className="pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold">Demo Credentials:</p>
                    <p>Email: <code className="bg-muted px-1 py-0.5 rounded text-xs">demo@nvoice.com</code></p>
                    <p>Password: <code className="bg-muted px-1 py-0.5 rounded text-xs">demo123</code></p>
                  </div>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="flex-1 overflow-y-auto">
                <form onSubmit={handleRegister} className="space-y-3">
                  {registerError && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">{registerError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="register-name" className="text-xs">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      disabled={registerLoading}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="register-email" className="text-xs">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={registerLoading}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="register-password" className="text-xs">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={registerLoading}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="register-confirm" className="text-xs">Confirm Password</Label>
                    <Input
                      id="register-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      disabled={registerLoading}
                      className="h-9 text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-9 text-sm"
                    disabled={registerLoading}
                  >
                    {registerLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-4 flex-shrink-0">
            nVoize © 2026 - All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
