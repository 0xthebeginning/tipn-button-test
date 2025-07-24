'use client';
import { useRef, useState } from 'react';
import Moveable from 'react-moveable';

export default function StickerOverlay({
  photoUrl,
  stickerUrl,
}: {
  photoUrl: string;
  stickerUrl: string;
}) {
  const stickerRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ left: 50, top: 50, width: 100, height: 100 });

  return (
    <div className="relative inline-block">
      {/* Uploaded photo */}
      <img src={photoUrl} alt="Uploaded" className="max-w-full rounded-xl" />

      {/* Sticker */}
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
}