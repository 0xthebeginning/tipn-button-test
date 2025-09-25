// src/app/layout.tsx
import "~/app/globals.css";
import type { Metadata } from "next";
import { getMiniAppEmbedMetadata } from "~/lib/utils";
import DarkModeWrapper from "./dark-wrapper";
import ClientWrapper from "./client-wrapper";
import '@reown/appkit/react/core/components';

export const metadata: Metadata = {
  title: "SuperInu",
  description: "Create and share custom SuperInu memes!",
  openGraph: {
    title: "SuperInu",
    description: "Create and share custom SuperInu memes!",
    url: "https://superinu-miniapp.vercel.app",
    images: [{ url: "https://superinu-miniapp.vercel.app/splash.png", width: 1200, height: 630, alt: "SuperInu Meme Preview" }],
  },
  other: { "fc:miniapp": JSON.stringify(getMiniAppEmbedMetadata()) },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f1fff0] text-gray-900 dark:bg-gray-900 dark:text-white transition-colors">
        <DarkModeWrapper>
          <ClientWrapper>{children}</ClientWrapper>
        </DarkModeWrapper>
      </body>
    </html>
  );
}