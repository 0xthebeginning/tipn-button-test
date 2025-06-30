// src/app/layout.tsx
import type { Metadata } from "next";
import "~/app/globals.css";
import ClientWrapper from "./client-wrapper"; // import client component for UI logic

export const metadata: Metadata = {
  title: "Prototyping",
  description: "My Farcaster Mini App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}


