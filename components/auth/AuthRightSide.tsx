"use client";
import React from "react";

const AuthRightSide = React.memo(function AuthRightSide({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative h-screen bg-gradient-to-br from-primary-50/30 via-primary-100/20 to-background dark:from-primary-950/20 dark:via-default-900 dark:to-background ${className}`}
    />
  );
});

export default AuthRightSide;
