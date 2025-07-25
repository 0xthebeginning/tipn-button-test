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
      await new Promise((r) => setTimeout(r, 100));

      const canvas = await html2canvas(containerRef.current);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));

      setHideControls(false);
      if (!blob) {
        alert('Failed to generate image');
        return;
      }

      const formData = new FormData();
      formData.append('file', blob, 'superinu-meme.png');

      try {
        const uploadRes = await fetch('/api/farcaster/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.text();
          throw new Error(err);
        }

        const { url } = await uploadRes.json();
        const castText = 'Made this SuperInu meme 🐶✨';
        const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
          `${castText}\n\nTry it here: https://superinu-miniapp.vercel.app`
        )}&embeds[]=${encodeURIComponent(url)}`;

        window.open(composeUrl, '_blank');
      } catch (err) {
        console.error('Failed to upload or share:', err);
        alert('Error uploading meme. Please try again!');
      }
    },
  }));

  return (
    <div ref={containerRef} className="relative inline-block rounded-xl overflow-hidden">
      <img src={photoUrl} alt="Uploaded" className="max-w-full rounded-xl dark:border dark:border-gray-700" />

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