import type { Metadata } from 'next';
import { KeepyUppyGame } from '~/features/keepy-uppy';

export const metadata: Metadata = {
  title: 'Super Inu Keepy-Uppy',
  description: 'Keep the ball up with Super Inu! A cozy one-tap arcade game.',
};

/**
 * /keepy-uppy — standalone game screen.
 * Server component on purpose (metadata lives here); everything
 * interactive is inside the 'use client' feature module.
 */
export default function KeepyUppyPage() {
  return <KeepyUppyGame />;
}
