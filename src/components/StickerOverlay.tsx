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

      const file = new File([blob], 'superinu-meme.png', { type: 'image/png' });
      const imageUrl = URL.createObjectURL(file); // temporary preview URL

      const castText = `Made a SuperInu meme! 🐶✨\n\nTry it: https://superinu-miniapp.vercel.app`;
      const intentUrl = `https://client.neynar.com/intent/cast?text=${encodeURIComponent(castText)}`;

      window.open(intentUrl, '_blank');
      setHideControls(false);
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