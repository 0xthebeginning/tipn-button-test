"use client";
import { useMiniApp } from "@neynar/react";
import { useEffect, useState } from "react";

const DEVELOPER_FID = 1083400;

type Like = { fid: number };

type Cast = {
  hash: string;
  text: string;
};

export default function SampleDisplay() {
  const { context } = useMiniApp();
  const user = context?.user;
  const userFid = user?.fid;
  const displayName = user?.displayName ?? user?.username ?? `Farcaster User`;

  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [devCasts, setDevCasts] = useState<{ text: string }[]>([]);

    useEffect(() => {
    if (!context || !userFid) return;

    async function fetchAndFilterDevCasts() {
      try {
        const res = await fetch(
          `https://api.neynar.com/v2/farcaster/feed/user-casts?fid=${DEVELOPER_FID}&limit=5`,
          {
            headers: {
              accept: "application/json",
              api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY || "",
            },
          }
        );

        const data = await res.json();
        const casts: Cast[] = data?.casts || [];

        const filteredCasts: Cast[] = [];

        for (const cast of casts) {
          const likesRes = await fetch(
            `https://api.neynar.com/v2/farcaster/cast/likes?hash=${cast.hash}`,
            {
              headers: {
                accept: "application/json",
                api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY || "",
              },
            }
          );

          const likesData = await likesRes.json();

          const likes = likesData?.likes ?? [];
          const hasLiked = likes.some((like: Like) => like.fid === userFid);

          setDebugMessages((prev) => [
            `Cast "${cast.text.slice(0, 20)}..." → Likes: ${likes.length}, Liked by user: ${hasLiked}`,
            ...prev,
          ]);

          if (!hasLiked) {
            filteredCasts.push(cast);
          }
        }

        setDevCasts(filteredCasts);
        setDebugMessages((prev) => [
          `Fetched ${casts.length} casts. ${filteredCasts.length} not liked yet.`,
          ...prev,
        ]);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : typeof err === "string"
            ? err
            : JSON.stringify(err);
        setDebugMessages((prev) => [
          `Error filtering dev casts: ${message}`,
          ...prev,
        ]);
      }
    }

    fetchAndFilterDevCasts();
  }, [context, userFid]);

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

      {/* Developer Casts Preview */}
      <div className="mt-6">
        <h3 className="text-md font-semibold text-purple-700 mb-2">Developers Recent Casts:</h3>
        {devCasts.length > 0 ? (
          <ul className="space-y-1 text-sm text-gray-800 list-disc list-inside">
            {devCasts.map((cast: { text: string }, index: number) => (
              <li key={index}>
                {cast.text.length > 80 ? `${cast.text.slice(0, 77)}...` : cast.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No casts available.</p>
        )}
      </div>
    </div>
  );
}