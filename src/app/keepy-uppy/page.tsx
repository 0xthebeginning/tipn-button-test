import type { Metadata } from 'next';
import { KeepyUppyGame } from '~/features/keepy-uppy';

const KEEPY_UPPY_URL = 'https://superinu-miniapp.vercel.app/keepy-uppy';
const KEEPY_UPPY_OG_IMAGE =
  'https://superinu-miniapp.vercel.app/keepy-uppy/opengraph-image-v2.png';

const keepyUppyMiniAppEmbed = {
  version: 'next',
  imageUrl: KEEPY_UPPY_OG_IMAGE,
  button: {
    title: 'Play Superinu Keepy-Uppy ⚽',
    action: {
      type: 'launch_frame',
      name: 'Superinu Keepy-Uppy',
      url: KEEPY_UPPY_URL,
      splashImageUrl: 'https://superinu-miniapp.vercel.app/splash.png',
      iconUrl: 'https://superinu-miniapp.vercel.app/icon.png',
      splashBackgroundColor: '#52a842',
    },
  },
};

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
    'fc:miniapp': JSON.stringify(keepyUppyMiniAppEmbed),
  },
};

export default function KeepyUppyPage() {
  return <KeepyUppyGame />;
}
