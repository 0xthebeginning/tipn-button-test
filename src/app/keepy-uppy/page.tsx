import type { Metadata } from 'next';
import { KeepyUppyGame } from '~/features/keepy-uppy';
import { getMiniAppEmbedMetadata } from '~/lib/utils';

const KEEPY_UPPY_URL = 'https://superinu-miniapp.vercel.app/keepy-uppy';
const KEEPY_UPPY_OG_IMAGE =
  'https://superinu-miniapp.vercel.app/keepy-uppy/opengraph-image';

export const metadata: Metadata = {
  title: 'Superinu Keepy-Uppy',
  description: 'Keep the ball up with Superinu! A cozy one-tap arcade game.',
  openGraph: {
    title: 'Superinu Keepy-Uppy',
    description: 'Keep the ball up with Superinu! A cozy one-tap arcade game.',
    url: KEEPY_UPPY_URL,
    images: [
      {
        url: KEEPY_UPPY_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Superinu Keepy-Uppy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Superinu Keepy-Uppy',
    description: 'Keep the ball up with Superinu! A cozy one-tap arcade game.',
    images: [KEEPY_UPPY_OG_IMAGE],
  },
  other: {
    'fc:miniapp': JSON.stringify(getMiniAppEmbedMetadata(KEEPY_UPPY_OG_IMAGE)),
  },
};

/**
 * /keepy-uppy — standalone game screen.
 * Server component on purpose (metadata lives here); everything
 * interactive is inside the 'use client' feature module.
 */
export default function KeepyUppyPage() {
  return <KeepyUppyGame />;
}
