"use client";

import { HeroUIProvider } from "@heroui/react";
import ConvexClientProvider from "./ConvexClientProvider";

interface ProviderProps {
  children: React.ReactNode;
}

export const Provider: React.FC<ProviderProps> = ({ children }) => {
  return (
    <ConvexClientProvider>
      <HeroUIProvider>{children}</HeroUIProvider>
    </ConvexClientProvider>
  );
};
