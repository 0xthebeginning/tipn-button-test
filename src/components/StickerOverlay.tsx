// components/StickerOverlay.tsx
'use client';

import html2canvas from 'html2canvas';
import { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import Moveable from 'react-moveable';

export interface StickerOverlayHandle {
  downloadImage: () => void;
  shareImage: () => void;
}

const StickerOverlay = forwardRef<StickerOverlayHandle, {
  photoUrl: string;
  stickerUrl: string;
}>(({ photoUrl, stickerUrl }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickerRef = useRef<HTMLDivElement>(null);

  const [frame, setFrame] = useState({
    left: 50,
    top: 50,
    width: 100,
    height: 100,
  });

  useImperativeHandle(ref, () => ({
    downloadImage: () => {
      if (!containerRef.current) return;
      html2canvas(containerRef.current).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'meme.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    },
    shareImage: async () => {
      if (!containerRef.current) return;
      const canvas = await html2canvas(containerRef.current);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'meme.png', { type: 'image/png' });

        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'My Meme',
              text: 'Check this out!',
            });
          } catch (err) {
            console.error('Error sharing image:', err);
          }
        } else {
          alert('Sharing is not supported on this device.');
        }
      });
    }
  }));

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Base photo */}
      <img src={photoUrl} alt="Uploaded" className="max-w-full rounded-xl" />

      {/* Sticker overlay */}
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

      {/* Moveable handler */}
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
    </div>
  );
});

StickerOverlay.displayName = 'StickerOverlay';
export default StickerOverlay;