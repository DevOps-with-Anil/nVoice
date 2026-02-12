"use client";

import React, { useState } from "react";
import { useAuth } from "./auth-context";
import { AuthService } from "@/lib/auth-service";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2 } from "lucide-react";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const { resetPassword } = useAuth();
  const [step, setStep] = useState<"email" | "verify" | "reset">("email");
  const [email, setEmail] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email");
      setLoading(false);
      return;
    }

    if (!AuthService.emailExists(email)) {
      setError("Email not found in our system");
      setLoading(false);
      return;
    }

    setStep("verify");
    setLoading(false);
  };

  const handleSecurityVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!securityAnswer) {
      setError("Please answer the security question");
      setLoading(false);
      return;
    }

    // Simplified security verification
    if (!AuthService.verifySecurity(email, "What company do you work for?", securityAnswer)) {
      setError("Security answer incorrect. Please try again.");
      setLoading(false);
      return;
    }

    setStep("reset");
    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const result = resetPassword(email, newPassword);
    if (result.success) {
      setSuccess("Password reset successfully! You can now login with your new password.");
      setTimeout(() => {
        onBack();
      }, 2000);
    } else {
      setError(result.error || "Failed to reset password");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/nvoize-logo.png"
              alt="nVoize logo"
              width={150}
              height={150}
              className="h-32 w-auto"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-card-foreground">Reset Password</h1>
          <p className="text-muted-foreground text-sm mt-1">Recover your account access</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-6">
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Enter your email address and we'll help you reset your password.
              </p>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleSecurityVerify} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Answer the security question to verify your identity.
              </p>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label className="font-semibold">What company do you work for?</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  (Hint: It's nVoize)
                </p>
                <Input
                  type="text"
                  placeholder="Type your answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Create a new password for your account.
              </p>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200 text-green-900">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading || !!success}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || !!success}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !!success}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}

          {/* Back Button */}
          <Button
            type="button"
            variant="ghost"
            className="w-full mt-4 text-muted-foreground hover:text-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          nVoize © 2024 - All Rights Reserved
        </p>
      </div>
    </div>
  );
}
