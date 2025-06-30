// src/components/SampleDisplay.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { sdk } from "@farcaster/frame-sdk";

export default function SampleDisplay() {
  const { isSDKLoaded, context } = useMiniApp();
  console.log("🧠 Neynar context:", context);
  const user = context?.user;
  const fid = user?.fid;
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
  if (isSDKLoaded) {
    console.log("🧠 Full Neynar context:", JSON.stringify(context, null, 2));
  }
}, [isSDKLoaded, context]);

function logDeep(obj: any, prefix = "") {
  for (const key in obj) {
    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      logDeep(value, path);
    } else {
      console.log(`${path}:`, value);
    }
  }
}

useEffect(() => {
  if (isSDKLoaded && context) {
    console.log("🔎 Exploring context keys:");
    logDeep(context);
  }
}, [isSDKLoaded, context]);

  useEffect(() => {
    if (isSDKLoaded) {
      sdk.actions.ready();
    }
  }, [isSDKLoaded]);

  useEffect(() => {
    if (isSDKLoaded && fid) {
      const displayName = user?.displayName ?? user?.username ?? `FID#${fid}`;
      setMessage(`Hello, ${displayName}! Your Farcaster ID is ${fid}`);
    }
  }, [isSDKLoaded, fid, user]);

  const [tipped, setTipped] = useState(false);

    const handleTip = () => {
    window.parent.postMessage(
        {
        type: "farcaster-frame-action",
        action: "like",
        },
        "*"
    );
    setTipped(true);
    setTimeout(() => setTipped(false), 3000);
    };

  return (
    <div className="m-4 p-4 bg-white border rounded shadow">
      <h2 className="text-black font-semibold mb-2">Neynar Connected:</h2>
      {message ? (
        <p className="text-black">{message}</p>
      ) : (
        <p className="text-black">
          {!isSDKLoaded ? "Initializing session…" : "Loading your ID…"}
        </p>
      )}


      <h3 className="text-black font-semibold mt-4 mb-2">Press button to "Like"(Tip) from user to trigger TIPN sensing webhook(Assuming user is tipping with TIPN)</h3>
        <button
        onClick={handleTip}
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
        {tipped ? "✅ Tipped!" : "Tip this Mini App Dev 💸"}
        </button>
    </div>
  );
}

