"use client";

import { useCallback, useMemo } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";

export function useAuth() {
  const { signIn, signOut } = useAuthActions();
  const router = useRouter();

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await signIn("google", { redirectTo: "/overview" });
    } catch (error) {
      console.error("Google sign-in error:", error);
      addToast({
        title: "Sign In Failed",
        description: "Unable to sign in with Google. Please try again.",
        color: "danger",
        timeout: 3000,
      });
    }
  }, [signIn]);

  const sendOTP = useCallback(
    async (email: string, name?: string) => {
      try {
        const formData = new FormData();
        formData.set("email", email);
        if (name) {
          formData.set("name", name);
        }
        await signIn("resend-otp", formData);
        addToast({
          title: "Code Sent",
          description: "Check your email for the verification code",
          color: "success",
          timeout: 3000,
        });
      } catch (error) {
        console.error("OTP send error:", error);
        addToast({
          title: "Error",
          description: "Failed to send verification code",
          color: "danger",
          timeout: 3000,
        });
        throw error;
      }
    },
    [signIn]
  );

  const verifyOTP = useCallback(
    async (code: string) => {
      try {
        const formData = new FormData();
        formData.set("code", code);
        await signIn("resend-otp", formData);
        return true;
      } catch (error) {
        console.error("OTP verification error:", error);
        addToast({
          title: "Verification Failed",
          description: "Invalid or expired code. Please try again.",
          color: "danger",
          timeout: 4000,
        });
        throw error;
      }
    },
    [signIn]
  );

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.replace("/signin");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [signOut, router]);

  return useMemo(
    () => ({
      signIn,
      signOut: handleSignOut,
      handleGoogleSignIn,
      sendOTP,
      verifyOTP,
      isLoading: false,
    }),
    [signIn, handleSignOut, handleGoogleSignIn, sendOTP, verifyOTP]
  );
}

export function useOTPFlow() {
  const { sendOTP, verifyOTP } = useAuth();
  const router = useRouter();

  const handleLoginOTP = useCallback(
    async (email: string) => {
      await sendOTP(email);
    },
    [sendOTP]
  );

  const handleSignupOTP = useCallback(
    async (email: string, name: string) => {
      await sendOTP(email, name);
    },
    [sendOTP]
  );

  const handleVerifyOTP = useCallback(
    async (code: string, redirectTo: string = "/overview") => {
      try {
        await verifyOTP(code);
        addToast({
          title: "Welcome!",
          description: "Successfully verified.",
          color: "success",
          timeout: 2000,
        });
        setTimeout(() => {
          router.push(redirectTo);
        }, 500);
      } catch (error) {
        throw error;
      }
    },
    [verifyOTP, router]
  );

  return useMemo(
    () => ({
      handleLoginOTP,
      handleSignupOTP,
      handleVerifyOTP,
    }),
    [handleLoginOTP, handleSignupOTP, handleVerifyOTP]
  );
}