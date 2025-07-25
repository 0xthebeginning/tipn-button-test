// app/head.tsx
import { APP_OG_IMAGE_URL } from "~/lib/constants";
import { getMiniAppEmbedMetadata } from "~/lib/utils";

export default function Head() {
  const embed = getMiniAppEmbedMetadata();

  return (
    <>
      <title>SuperInu</title>
      <meta property="og:title" content="SuperInu" />
      <meta property="og:description" content="Create and share custom SuperInu memes!" />
      <meta property="og:image" content={APP_OG_IMAGE_URL} />
      
      {/* Required for Farcaster Embed */}
      <meta property="fc:frame" content="vNext" />
    </>
  );
}