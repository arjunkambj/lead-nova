"use client";

import { HeroUIProvider } from "@heroui/react";

interface ProviderProps {
  children: React.ReactNode;
}

export const Provider: React.FC<ProviderProps> = ({ children }) => {
  return <HeroUIProvider>{children}</HeroUIProvider>;
};
