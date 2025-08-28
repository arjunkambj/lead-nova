"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { m, LazyMotion, domAnimation } from "framer-motion";

interface AuthCardProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
}

const AuthCard = React.memo(function AuthCard({
  title,
  showBack = false,
  onBack,
  children,
}: AuthCardProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-[420px] flex-col gap-8">
        <LazyMotion features={domAnimation}>
          <m.div layout className="flex flex-col">
            {showBack && (
              <m.div className="mb-4">
                <Button isIconOnly size="sm" variant="flat" onPress={onBack}>
                  <Icon
                    className="text-default-500"
                    icon="solar:alt-arrow-left-linear"
                    width={16}
                  />
                </Button>
              </m.div>
            )}
            <m.h1
              layout
              className="text-3xl font-semibold tracking-tight"
              transition={{ duration: 0.25 }}
            >
              {title}
            </m.h1>
            <p className="text-default-500 mt-2">
              {showBack ? "Enter the code we sent you" : "Sign in to your account"}
            </p>
          </m.div>
          <div className="mt-6">
            {children}
          </div>
        </LazyMotion>
      </div>
    </div>
  );
});

export default AuthCard;