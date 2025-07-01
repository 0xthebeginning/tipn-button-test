export async function GET() {
  const base = "https://tipn-button-test.vercel.app";

  return Response.json({
    name: "Tip Button Mini App",
    description: "Prototype tipping mini app for developers",
    icon: `${base}/favicon.ico`,
    url: base,
    button: {
      title: "Tip Dev",
    },
    action: {
      type: "launch_frame",
      name: "Tip Button",
      url: base,
      splashImageUrl: `${base}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  });
}