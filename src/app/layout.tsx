import "~/app/globals.css";
import type { Metadata } from "next";
import ClientWrapper from "./client-wrapper";

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
  twitter: {
    card: "summary_large_image",
    title: "SuperInu",
    description: "Create and share custom SuperInu memes!",
    images: ["https://superinu-miniapp.vercel.app/preview.png"],
  },

  other: {
    "fc:frame": "vNext",
    "fc:frame:button:1": "SuperInu",
    "fc:frame:post_url": "https://superinu-miniapp.vercel.app/api/frame",
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