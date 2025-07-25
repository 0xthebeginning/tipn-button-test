export const APP_URL = process.env.NEXT_PUBLIC_URL!;
export const APP_NAME = "SuperInu";
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_MINI_APP_DESCRIPTION;
export const APP_PRIMARY_CATEGORY = process.env.NEXT_PUBLIC_MINI_APP_PRIMARY_CATEGORY;
export const APP_TAGS = process.env.NEXT_PUBLIC_MINI_APP_TAGS?.split(',');
export const APP_ICON_URL = `${APP_URL}/icon.png`;
export const APP_OG_IMAGE_URL = `https://superinu-miniapp.vercel.app/splash.png`;
export const APP_SPLASH_URL = `https://superinu-miniapp.vercel.app/splash.png`;
export const APP_SPLASH_BACKGROUND_COLOR = "#52a842";
export const APP_BUTTON_TEXT = "Make a SuperInu Moment 🐶✨";
export const APP_WEBHOOK_URL = process.env.NEYNAR_API_KEY && process.env.NEYNAR_CLIENT_ID 
    ? `https://api.neynar.com/f/app/${process.env.NEYNAR_CLIENT_ID}/event`
    : `${APP_URL}/api/webhook`;
export const USE_WALLET = process.env.NEXT_PUBLIC_USE_WALLET === 'true';
