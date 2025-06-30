// src/app/client-wrapper.tsx
"use client";

import { MiniAppProvider } from "@neynar/react";
import "@neynar/react/dist/style.css";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MiniAppProvider analyticsEnabled={false}>
      {children}
    </MiniAppProvider>
  );
}
