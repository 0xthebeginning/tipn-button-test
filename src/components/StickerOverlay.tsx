// components/StickerOverlay.tsx
'use client';

import html2canvas from 'html2canvas';
import { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import Moveable from 'react-moveable';

export interface StickerOverlayHandle {
  shareImage: () => void;
}

const StickerOverlay = forwardRef<StickerOverlayHandle, {
  photoUrl: string;
  stickerUrl: string;
}>(({ photoUrl, stickerUrl }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickerRef = useRef<HTMLDivElement>(null);
  const [hideControls, setHideControls] = useState(false);
  const [frame, setFrame] = useState({
    left: 50,
    top: 50,
    width: 100,
    height: 100,
  });

  useImperativeHandle(ref, () => ({
    shareImage: async () => {
      if (!containerRef.current) return;

      setHideControls(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(containerRef.current);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve)
      );

      if (!blob) {
        console.error('Failed to generate image blob');
        setHideControls(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', blob, 'superinu-meme.png');

      try {
        const uploadRes = await fetch('https://api.neynar.com/v2/farcaster/upload/image', {
          method: 'POST',
          headers: {
            'api_key': process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '', // Set in .env
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.text();
          throw new Error(`Upload failed: ${err}`);
        }

        const { url: imageUrl } = await uploadRes.json();

        const castUrl = new URL('https://warpcast.com/~/compose');
        castUrl.searchParams.set('text', 'Made a SuperInu meme! 🐶✨\n\nTry it here: https://superinu-miniapp.vercel.app');
        castUrl.searchParams.append('embeds[]', imageUrl);

        window.open(castUrl.toString(), '_blank');

      } catch (err) {
        console.error('Sharing failed:', err);
        alert('Failed to share. Try again!');
      } finally {
        setHideControls(false);
      }
    },
  }));

  return (
    <div ref={containerRef} className="relative inline-block">
      <img src={photoUrl} alt="Uploaded" className="max-w-full rounded-xl" />

      <div
        ref={stickerRef}
        style={{
          position: 'absolute',
          left: frame.left,
          top: frame.top,
          width: frame.width,
          height: frame.height,
          backgroundImage: `url(${stickerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {!hideControls && (
        <Moveable
          target={stickerRef}
          draggable
          resizable
          throttleDrag={1}
          throttleResize={1}
          onDrag={({ left, top }) => {
            setFrame((f) => ({ ...f, left, top }));
          }}
          onResize={({ width, height, drag }) => {
            setFrame({
              width,
              height,
              left: drag.left,
              top: drag.top,
            });
          }}
        />
      )}
    </div>
  );
});

StickerOverlay.displayName = 'StickerOverlay';
export default StickerOverlay;