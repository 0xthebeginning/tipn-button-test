import { APP_OG_IMAGE_URL } from "~/lib/constants";

export default function Head() {
  return (
    <>
      <title>SuperInu</title>
      <meta property="og:title" content="SuperInu" />
      <meta property="og:description" content="Create and share custom SuperInu memes!" />
      <meta property="og:image" content={APP_OG_IMAGE_URL} />
      <meta property="og:url" content="https://superinu-miniapp.vercel.app/" />
      
      {/* Required for Farcaster Embed */}
      <meta property="fc:frame" content="vNext" />
    </>
  );
}