'use client';

import html2canvas from 'html2canvas';
import { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import Moveable from 'react-moveable';
import sdk from '@farcaster/miniapp-sdk';

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
  const [showMoveable, setShowMoveable] = useState(true);
  const [isMirrored, setIsMirrored] = useState(false);

  const [frame, setFrame] = useState({
    left: 50,
    top: 50,
    width: 100,
    height: 100,
    rotation: 0,
  });

  // Listen for clicks outside the sticker to hide controls
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        stickerRef.current &&
        !stickerRef.current.contains(e.target as Node)
      ) {
        setShowMoveable(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useImperativeHandle(ref, () => ({
    shareImage: async () => {
      if (!containerRef.current) return;

      setHideControls(true);
      await new Promise((r) => setTimeout(r, 100));

      const pixelRatio = window.devicePixelRatio || 2;
      const canvas = await html2canvas(containerRef.current, {
        scale: pixelRatio,
      });

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

      const castText = `Made this $SuperInu Moment 🐶✨ on @terricola.eth's miniapp! Try it!`;
      const miniappUrl = 'https://farcaster.xyz/miniapps/8CEpD-h8a_uW/superinu';
      const finalCast = `${castText}\n\n${miniappUrl}\n#SuperInu`.trim();

      try {
        if (sdk?.actions?.composeCast) {
          await sdk.actions.composeCast({
            text: finalCast,
            embeds: [imageUrl],
          });
        } else {
          const castUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(finalCast)}&embeds[]=${encodeURIComponent(imageUrl)}`;
          window.open(castUrl, '_blank');
        }
      } catch (err) {
        console.error('Cast share failed:', err);
        const fallbackUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(finalCast)}&embeds[]=${encodeURIComponent(imageUrl)}`;
        window.open(fallbackUrl, '_blank');
      }
    },
  }));

  return (
    <div ref={containerRef} className="relative inline-block rounded-xl overflow-hidden">
      <img
        src={photoUrl}
        alt="Uploaded"
        className="max-w-full rounded-xl dark:border dark:border-gray-700"
      />

      <div
        ref={stickerRef}
        onMouseDown={() => setShowMoveable(true)}
        style={{
          position: 'absolute',
          left: frame.left,
          top: frame.top,
          width: frame.width,
          height: frame.height,
          transform: `
            rotate(${frame.rotation}deg)
            ${isMirrored ? 'scaleX(-1)' : ''}
          `,
          transformOrigin: 'center',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        <img
          src={stickerUrl}
          alt="Sticker"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'crisp-edges',
          }}
        />
      </div>

      {!hideControls && showMoveable && (
        <>
          <Moveable
            target={stickerRef}
            draggable
            resizable
            rotatable
            keepRatio={true}
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
          <button
            onClick={() => setIsMirrored((prev) => !prev)}
            className="absolute bottom-2 right-2 px-3 py-1 bg-white dark:bg-gray-800 text-xs text-gray-800 dark:text-white border rounded shadow"
          >
            {isMirrored ? 'Unmirror Sticker' : 'Mirror Sticker'}
          </button>
        </>
      )}
    </div>
  );
});

StickerOverlay.displayName = 'StickerOverlay';
export default StickerOverlay;