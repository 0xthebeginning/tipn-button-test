// components/StickerOverlay.tsx
'use client';

import html2canvas from 'html2canvas';
import { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import Moveable from 'react-moveable';

declare global {
  interface Window {
    farcaster?: {
      actions?: {
        composeCast: (args: {
          text: string;
          embeds?: string[];
        }) => Promise<void>;
      };
    };
  }
}

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
    rotation: 0,
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

      const uploadRes = await fetch('/api/farcaster/upload', {
        method: 'POST',
        body: (() => {
          const fd = new FormData();
          fd.append('file', blob, 'superinu-meme.png');
          return fd;
        })(),
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.text();
        console.error('Upload error:', error);
        alert('Upload failed. Try again!');
        return;
      }

      const { url: imageUrl } = await uploadRes.json();
      const castText = `Made this $SuperInu Moment 🐶✨ on @terricola.eth's miniapp! Try it! https://superinu-miniapp.vercel.app`;

      if (window?.farcaster?.actions?.composeCast) {
        try {
          await window.farcaster.actions.composeCast({
            text: castText,
            embeds: [imageUrl],
          });
        } catch (error) {
          console.error("Error composing cast via SDK:", error);
          window.open(
            `https://warpcast.com/~/compose?text=${encodeURIComponent(
              castText
            )}&embeds[]=${encodeURIComponent(imageUrl)}`,
            "_blank"
          );
        }
      } else {
        window.open(
          `https://warpcast.com/~/compose?text=${encodeURIComponent(
            castText
          )}&embeds[]=${encodeURIComponent(imageUrl)}`,
          "_blank"
        );
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
          transform: `rotate(${frame.rotation}deg)`,
        }}
      />

      {!hideControls && (
        <Moveable
          target={stickerRef}
          draggable
          resizable
          rotatable
          throttleDrag={1}
          throttleResize={1}
          throttleRotate={1}
          onDrag={({ left, top }) => {
            setFrame((f) => ({ ...f, left, top }));
          }}
          onResize={({ width, height, drag }) => {
            setFrame((f) => ({
              ...f,
              width,
              height,
              left: drag.left,
              top: drag.top,
            }));
          }}
          onRotate={({ beforeRotate }) => {
            setFrame((f) => ({
              ...f,
              rotation: beforeRotate,
            }));
          }}
        />
      )}
    </div>
  );
});

StickerOverlay.displayName = 'StickerOverlay';
export default StickerOverlay;