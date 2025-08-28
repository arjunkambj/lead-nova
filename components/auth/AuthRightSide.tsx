"use client";
import React from "react";

const AuthRightSide = React.memo(function AuthRightSide({ className }: { className?: string }) {
  return (
    <div
      className={`relative h-screen bg-gradient-to-br from-primary-50 via-primary-100/30 to-background dark:from-primary-900/20 dark:via-primary-900/10 dark:to-background ${className}`}
    />
  );
});

export default AuthRightSide;