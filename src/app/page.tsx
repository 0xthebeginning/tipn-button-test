'use client';

import { Metadata } from "next";
import { APP_NAME, APP_DESCRIPTION, APP_OG_IMAGE_URL } from "~/lib/constants";
import { getMiniAppEmbedMetadata } from "~/lib/utils";
import { useState } from "react";
import SampleDisplay from "../components/SampleDisplay";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: APP_NAME,
    openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [APP_OG_IMAGE_URL],
    },
    other: {
      "fc:frame": JSON.stringify(getMiniAppEmbedMetadata()),
    },
  };
}

export default function Page() {
  const [showTipping, setShowTipping] = useState(false);

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      {showTipping ? (
        <SampleDisplay />
      ) : (
        <div className="m-4 p-6 bg-white border rounded-2xl shadow space-y-6 text-center">
          <h1 className="text-2xl font-bold text-purple-800">🎉 Welcome to My Mini App</h1>
          <p className="text-gray-600">
            This is your landing page. Click below to support the developer!
          </p>
          <button
            onClick={() => setShowTipping(true)}
            className="mt-10 w-full py-3 bg-purple-600 text-white text-lg rounded-xl hover:bg-purple-700 transition"
          >
            Support the Developer 💸
          </button>
        </div>
      )}
    </main>
  );
}