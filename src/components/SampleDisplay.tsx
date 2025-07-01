import { useMiniApp } from "@neynar/react";

export default function SampleDisplay() {
  const { context } = useMiniApp();
  const user = context?.user;
  const displayName = user?.displayName ?? user?.username ?? `Farcaster User`;

  if (!context) {
    return <p className="text-gray-500">Loading...</p>;
  }

  function handleTipClick() {
    // your logic here, like triggering a deep link or calling an API
    console.log("Tip button clicked!");
  }

  return (
    <div className="m-4 p-6 bg-white border rounded-2xl shadow space-y-4">
      <h2 className="text-xl font-bold text-purple-700">Welcome, {displayName}!</h2>

      <p className="text-gray-700">
        Love this Mini App? Send a tip to support the developer 🎉
      </p>

      <button
        onClick={handleTipClick}
        className="w-full py-3 bg-purple-600 text-white text-lg rounded-xl hover:bg-purple-700 transition"
      >
        Tip the Developer 💸
      </button>
    </div>
  );
}
