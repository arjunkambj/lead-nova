"use client";

import { HeroUIProvider } from "@heroui/react";
import ConvexClientProvider from "./ConvexClientProvider";
import { Provider as JotaiProvider } from "jotai/react";

interface ProviderProps {
  children: React.ReactNode;
}

export const Provider: React.FC<ProviderProps> = ({ children }) => {
  return (
    <ConvexClientProvider>
      <HeroUIProvider>
        <JotaiProvider>{children}</JotaiProvider>
      </HeroUIProvider>
    </ConvexClientProvider>
  );
};
