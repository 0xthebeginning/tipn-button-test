// src/app/layout.tsx
import "~/app/globals.css";
import type { Metadata } from "next";
import ClientWrapper from "./client-wrapper";
import { getMiniAppEmbedMetadata } from "~/lib/utils"; // adjust path as needed

export const metadata: Metadata = {
  title: "SuperInu",
  description: "Create and share custom SuperInu memes!",
  openGraph: {
    title: "SuperInu",
    description: "Create and share custom SuperInu memes!",
    url: "https://superinu-miniapp.vercel.app",
    images: [
      {
        url: "https://superinu-miniapp.vercel.app/splash.png",
        width: 1200,
        height: 630,
        alt: "SuperInu Meme Preview",
      },
    ],
  },
  other: {
    "fc:miniapp": JSON.stringify(getMiniAppEmbedMetadata()),
  },
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