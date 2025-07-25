// src/app/layout.tsx
import "~/app/globals.css";
import ClientWrapper from "./client-wrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>SuperInu</title>
        <meta property="og:title" content="SuperInu" />
        <meta property="og:description" content="Create and share custom SuperInu memes!" />
        <meta property="og:url" content="https://superinu-miniapp.vercel.app" />
        <meta property="og:image" content="https://superinu-miniapp.vercel.app/preview.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="SuperInu Meme Preview" />

        {/* Farcaster Frame Metadata */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:post_url" content="https://superinu-miniapp.vercel.app/api/frame" />
        <meta property="fc:frame:button:1" content="Start" />

        <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="1024x1024" />
      </head>
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}