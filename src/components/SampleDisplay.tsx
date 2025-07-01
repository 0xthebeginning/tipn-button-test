"use client";
import { useState } from "react";
import { useMiniApp } from "@neynar/react";

const DEVELOPER_FID = 1102924;

export default function SampleDisplay() {
  const { context } = useMiniApp();
  const user = context?.user;
  const userFid = user?.fid;
  const displayName = user?.displayName ?? user?.username ?? `Farcaster User`;

  const [debugMessage, setDebugMessage] = useState("");

  if (!context) {
    return <p className="text-gray-500">Loading...</p>;
  }

  const isDev = userFid === DEVELOPER_FID;

  function handleTipClick() {
    const message = `User ${userFid} clicked to tip dev ${DEVELOPER_FID}`;
    setDebugMessage(message);
    console.log(message);
    // Later: trigger deep link or API call here
  }

  return (
    <div className="m-4 p-6 bg-white border rounded-2xl shadow space-y-4">
      <h2 className="text-xl font-bold text-purple-700">
        Welcome, {displayName}!
      </h2>

      <p className="text-gray-700">
        Your Farcaster ID: <strong>{userFid}</strong>
      </p>

      <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
        <p className="text-sm text-purple-800">
          <strong>Dev FID:</strong> {DEVELOPER_FID}
        </p>
        <p className="text-sm text-purple-800">
          {isDev
            ? "You're the developer — no tip button for you 😉"
            : "This Mini App was made by the developer above."}
        </p>
      </div>

      {!isDev && (
        <button
          onClick={handleTipClick}
          className="w-full py-3 bg-purple-600 text-white text-lg rounded-xl hover:bg-purple-700 transition"
        >
          Tip the Developer 💸
        </button>
      )}

      {debugMessage && (
        <div className="mt-4 p-3 bg-gray-100 border rounded text-sm text-gray-700">
          <strong>Debug:</strong> {debugMessage}
        </div>
      )}
    </div>
  );
}