// src/app/client-wrapper.tsx
"use client";

import { MiniAppProvider } from "@neynar/react";
import "@neynar/react/dist/style.css";
import DarkModeToggle from "~/components/ui/DarkModeToggle"; // adjust path if needed

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MiniAppProvider analyticsEnabled={false}>
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      {children}
    </MiniAppProvider>
  );
}