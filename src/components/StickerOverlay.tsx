'use client';
import { useRef, useState } from 'react';
import Moveable from 'react-moveable';
import html2canvas from 'html2canvas';

export default function StickerOverlay({
  photoUrl,
  stickerUrl,
}: {
  photoUrl: string;
  stickerUrl: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickerRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ left: 50, top: 50, width: 100, height: 100 });

  const downloadImage = async () => {
    if (!containerRef.current) return;
    const canvas = await html2canvas(containerRef.current);
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'my-meme.png';
    a.click();
  };

  const shareImage = async () => {
    if (!containerRef.current) return;
    const canvas = await html2canvas(containerRef.current);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    );
    if (!blob) return;

    const file = new File([blob], 'cast-image.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'My Meme Cast',
        text: 'Check out what I made!',
      });
    } else {
      alert("Sharing not supported. You can download it instead.");
    }
  };

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative inline-block">
        {/* Base photo */}
        <img src={photoUrl} alt="Uploaded" className="max-w-full rounded-xl" />

        {/* Draggable sticker */}
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

      {/* Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={downloadImage}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
        >
          Download 📥
        </button>
        <button
          onClick={shareImage}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Share 🟣
        </button>
      </div>
    </div>
  );
}