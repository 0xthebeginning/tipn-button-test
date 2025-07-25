// src/app/layout.tsx
import type { Metadata } from "next";
import "~/app/globals.css";
import ClientWrapper from "./client-wrapper"; // import client component for UI logic

export const metadata: Metadata = {
  title: "SuperInu",
  description: "Create and share custom SuperInu memes!",
  openGraph: {
    title: "SuperInu",
    description: "Create and share custom SuperInu memes!",
    url: "https://superinu-miniapp.vercel.app",
    images: [
      {
        url: "https://superinu-miniapp.vercel.app/preview.png",
        width: 1200,
        height: 630,
        alt: "SuperInu Meme Preview",
      },
    ],
  },
  other: {
    "fc:frame": "vNext",
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


