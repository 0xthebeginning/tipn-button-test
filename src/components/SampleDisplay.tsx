"use client";
import { useMiniApp } from "@neynar/react";
import { useState } from "react";

const DEVELOPER_FID = 1102924;// Testing with @junyboy // 21024; // Replace with your actual FID

export default function SampleDisplay() {
  const { context } = useMiniApp();
  const user = context?.user;
  const userFid = user?.fid;
  const displayName = user?.displayName ?? user?.username ?? `Farcaster User`;

  const [debugMessage, setDebugMessage] = useState<string | null>(null);

  if (!context) {
    return <p className="text-gray-500">Loading...</p>;
  }

  const isDeveloper = userFid === DEVELOPER_FID;

  function handleTipClick() {
    setDebugMessage(`Tip button clicked by user FID: ${userFid}`);
    // Tip logic will go here
  }

  return (
    <div className="m-4 p-6 bg-white border rounded-2xl shadow space-y-4">
      <h2 className="text-xl font-bold text-purple-700">Welcome, {displayName}!</h2>

      <p className="text-gray-700">
        Love this Mini App? Send a tip to support the developer 🎉
      </p>

      {isDeveloper ? (
        <p className="text-sm text-red-500">
          You are the developer — tipping yourself is not allowed.
        </p>
      ) : (
        <button
          onClick={handleTipClick}
          className="w-full py-3 bg-purple-600 text-white text-lg rounded-xl hover:bg-purple-700 transition"
        >
          Tip the Developer 💸
        </button>
      )}

      {debugMessage && (
        <p className="mt-4 text-sm text-gray-500 border-t pt-4">{debugMessage}</p>
      )}
    </div>
  );
}