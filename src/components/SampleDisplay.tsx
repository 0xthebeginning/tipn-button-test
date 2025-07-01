"use client";
import { useMiniApp } from "@neynar/react";
import { useEffect, useState } from "react";

const DEVELOPER_FID = 21024;

export default function SampleDisplay() {
  const { context } = useMiniApp();
  const user = context?.user;
  const userFid = user?.fid;
  const displayName = user?.displayName ?? user?.username ?? `Farcaster User`;

  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [devCasts, setDevCasts] = useState<{ text: string }[]>([]);

  useEffect(() => {
    if (!context) return;

    async function fetchDevCasts() {
      try {
        const res = await fetch(`https://api.neynar.com/v2/farcaster/user/${DEVELOPER_FID}/casts?limit=5&with_recasts=false&viewer_fid=${userFid}`, {
          headers: {
            accept: 'application/json',
            'api_key': process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '',
          },
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        setDevCasts(data.result.casts);
        setDebugMessages(prev => [
          `Fetched ${data.result.casts.length} dev casts.`,
          ...prev,
        ]);
      } catch (err: unknown) {
        let message = "Unknown error";
        if (err instanceof Error) {
          message = err.message;
        } else if (typeof err === "string") {
          message = err;
        } else {
          message = JSON.stringify(err);
        }

        setDebugMessages(prev => [
          `Error fetching dev casts: ${message}`,
          ...prev,
        ]);
      }
    }

    fetchDevCasts();
  }, [context]);

  // No context yet, then we are loading still
  if (!context) {
    return <p className="text-gray-500">Loading...</p>;
  }

  <div className="text-sm text-gray-500">
  <p className="font-semibold mt-4">Developers Latest Casts:</p>
  <ul className="list-disc pl-5">
    {devCasts.map((cast, index) => (
      <li key={index}>{cast.text || "(no text)"}</li>
    ))}
  </ul>
  </div>

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
      <div className="mt-6 p-3 bg-gray-100 rounded-md h-80 overflow-y-auto text-sm text-gray-800">
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