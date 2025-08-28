"use client";

import React, { useCallback, useMemo } from "react";
import { Button, Divider, Input, addToast } from "@heroui/react";
import { AnimatePresence, m } from "framer-motion";
import { Icon } from "@iconify/react";
import { useOTPFlow } from "@/hooks/useAuth";
import AuthCard from "./components/AuthCard";
import OAuthButtons from "./components/OAuthButtons";
import EmailInput from "./components/EmailInput";
import OtpInput from "./components/OtpInput";
import AuthLinks from "./components/AuthLinks";

export default function SignupCard() {
  const { handleSignupOTP, handleVerifyOTP } = useOTPFlow();
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [[page, direction], setPage] = React.useState([0, 0]);
  const [isEmailValid, setIsEmailValid] = React.useState(true);
  const [isNameValid, setIsNameValid] = React.useState(true);
  const [isOtpValid, setIsOtpValid] = React.useState(true);

  const variants = useMemo(() => ({
    enter: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 20 : -20, opacity: 0 }),
  }), []);

  const getPageTitle = useMemo(() => {
    if (page === 0) return "Get started for free";
    if (page === 1) return "Complete your profile";
    return "Verify your email";
  }, [page]);

  const handleEmailSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.length) {
      setIsEmailValid(false);
      return;
    }
    setIsEmailValid(true);
    setPage([1, 1]);
  }, [email]);

  const handleDetailsSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.length) {
      setIsNameValid(false);
      return;
    }
    setIsNameValid(true);

    try {
      await handleSignupOTP(email, name);
      setPage([2, 1]);
    } catch {
      // Error is handled in the hook
    }
  }, [name, email, handleSignupOTP]);

  const handleOtpSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setIsOtpValid(false);
      return;
    }
    setIsOtpValid(true);

    try {
      await handleVerifyOTP(otp);
      addToast({
        title: "Account Created!",
        description: "Your account has been successfully created.",
        color: "success",
        timeout: 3000,
      });
    } catch {
      setIsOtpValid(false);
    }
  }, [otp, handleVerifyOTP]);

  const handleSubmit = useMemo(() => 
    page === 0 ? handleEmailSubmit : page === 1 ? handleDetailsSubmit : handleOtpSubmit,
    [page, handleEmailSubmit, handleDetailsSubmit, handleOtpSubmit]
  );

  const handleBack = useCallback(() => setPage([Math.max(0, page - 1), -1]), [page]);
  const handleEmailChange = useCallback((value: string) => {
    setIsEmailValid(true);
    setEmail(value);
  }, []);
  const handleNameChange = useCallback((value: string) => {
    setIsNameValid(true);
    setName(value);
  }, []);
  const handleOtpChange = useCallback((value: string) => setOtp(value), []);

  return (
    <AuthCard title={getPageTitle} showBack={page > 0} onBack={handleBack}>
      {page === 0 && (
        <>
          <OAuthButtons mode="signup" />
          <div className="flex items-center gap-4 py-3">
            <Divider className="flex-1" />
            <p className="text-tiny text-default-500 shrink-0">OR</p>
            <Divider className="flex-1" />
          </div>
        </>
      )}
      <AnimatePresence custom={direction} initial={false} mode="wait">
        <m.form
          key={page}
          animate="center"
          className="flex flex-col gap-4"
          custom={direction}
          exit="exit"
          initial="enter"
          transition={{ duration: 0.25 }}
          variants={variants}
          onSubmit={handleSubmit}
        >
          {page === 0 ? (
            <>
              <EmailInput
                value={email}
                onChange={handleEmailChange}
                isInvalid={!isEmailValid}
              />
              <Button
                fullWidth
                type="submit"
                color="primary"
                size="lg"
                startContent={<Icon className="pointer-events-none text-xl" icon="solar:letter-bold" />}
              >
                Continue with Email
              </Button>
            </>
          ) : page === 1 ? (
            <>
              <Input
                errorMessage={!isNameValid ? "Enter your name" : undefined}
                isInvalid={!isNameValid}
                name="name"
                placeholder="John Doe"
                type="text"
                value={name}
                variant="bordered"
                label="Full Name"
                startContent={<Icon className="text-default-400" icon="solar:user-linear" width={18} />}
                onValueChange={handleNameChange}
              />
              <Button fullWidth color="primary" size="lg" type="submit">
                Continue
              </Button>
            </>
          ) : (
            <>
              <OtpInput value={otp} onChange={handleOtpChange} isInvalid={!isOtpValid} email={email} />
              <Button
                fullWidth
                color="primary"
                size="lg"
                type="submit"
              >
                Verify & Create Account
              </Button>
            </>
          )}
        </m.form>
      </AnimatePresence>
      {page === 0 && (
        <div className="mt-6">
          <AuthLinks mode="signup" />
        </div>
      )}
    </AuthCard>
  );
}