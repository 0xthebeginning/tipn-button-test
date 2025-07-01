"use client";
import { useMiniApp } from "@neynar/react";
import { useState } from "react";

const DEVELOPER_FID = 1102924;

export default function SampleDisplay() {
  const { context } = useMiniApp();
  const user = context?.user;
  const userFid = user?.fid;
  const displayName = user?.displayName ?? user?.username ?? `Farcaster User`;

  const [debugMessages, setDebugMessages] = useState<string[]>([]);

  if (!context) {
    return <p className="text-gray-500">Loading...</p>;
  }

  function handleTipClick() {
    const newMessage = `Tip button clicked by FID ${userFid} at ${new Date().toLocaleTimeString()}`;
    setDebugMessages((prev) => [newMessage, ...prev]); // Add new messages to the top
  }

  const isDeveloper = userFid === DEVELOPER_FID;

  return (
    <div className="m-4 p-6 bg-white border rounded-2xl shadow space-y-4">
      <h2 className="text-xl font-bold text-purple-700">Welcome, {displayName}!</h2>

      <div className="text-sm text-gray-600">
        <p><strong>Your FID:</strong> {userFid}</p>
        <p><strong>Developer FID:</strong> {DEVELOPER_FID}</p>
      </div>

      {isDeveloper ? (
        <p className="text-red-600">You are the developer! Tipping yourself is disabled.</p>
      ) : (
        <>
          <p className="text-gray-700">
            Love this Mini App? Send a tip to support the developer 🎉
          </p>
          <button
            onClick={handleTipClick}
            className="w-full py-3 bg-purple-600 text-white text-lg rounded-xl hover:bg-purple-700 transition"
          >
            Tip the Developer 💸
          </button>
        </>
      )}

      {/* Debug Output */}
      <div className="mt-6 p-3 bg-gray-100 rounded-md h-40 overflow-y-auto text-sm text-gray-800">
        {debugMessages.length > 0 ? (
          debugMessages.map((msg, index) => (
            <div key={index} className="mb-1">• {msg}</div>
          ))
        ) : (
          <p>No debug messages yet.</p>
        )}
      </div>
    </div>
  );
}