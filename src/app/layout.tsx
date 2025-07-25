// src/app/layout.tsx
import "~/app/globals.css";
import ClientWrapper from "./client-wrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>SuperInu</title>
        <meta name="description" content="Create and share custom SuperInu memes!" />

        {/* OG preview */}
        <meta property="og:title" content="SuperInu" />
        <meta property="og:description" content="Create and share custom SuperInu memes!" />
        <meta property="og:url" content="https://superinu-miniapp.vercel.app" />
        <meta property="og:image" content="https://superinu-miniapp.vercel.app/splash.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="SuperInu Meme Preview" />

        {/* Twitter (optional) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SuperInu" />
        <meta name="twitter:description" content="Create and share custom SuperInu memes!" />
        <meta name="twitter:image" content="https://superinu-miniapp.vercel.app/splash.png" />
        <meta name="twitter:image:alt" content="SuperInu Meme Preview" />

        {/* CRITICAL: Farcaster Mini App Embed */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:post_url" content="https://superinu-miniapp.vercel.app/api/frame" />
        <meta property="fc:frame:button:1" content="Start" />

        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}