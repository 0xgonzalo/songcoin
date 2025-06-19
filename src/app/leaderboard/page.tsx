// import { NeynarProfileCard } from "@/components/Neynar";
import Image from "next/image";
import Link from "next/link";

interface LeaderboardEntry {
  fid: number;
  displayName: string;
  username: string;
  pfpUrl: string;
  points: number;
}

// Mock leaderboard data
const leaderboard: LeaderboardEntry[] = [
  {
    fid: 1,
    displayName: "Alice",
    username: "alice",
    pfpUrl: "/icon.png",
    points: 1200,
  },
  {
    fid: 2,
    displayName: "Bob",
    username: "bob",
    pfpUrl: "/icon.png",
    points: 950,
  },
  {
    fid: 3,
    displayName: "Charlie",
    username: "charlie",
    pfpUrl: "/icon.png",
    points: 800,
  },
];

export default function LeaderboardPage() {
  return (
    <main className="max-w-md mx-auto w-full px-2 py-6">
      <div className="flex items-center mb-4">
        <Link href="/" aria-label="Back to home" className="mr-2 p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-purple-700 dark:text-purple-300">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-center flex-1">Leaderboard</h1>
      </div>
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
              <th className="py-2 px-3 text-left font-semibold">Rank</th>
              <th className="py-2 px-3 text-left font-semibold">Name</th>
              <th className="py-2 px-3 text-right font-semibold">Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, idx) => (
              <tr key={entry.fid} className="border-t border-gray-100 dark:border-gray-800 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors">
                <td className="py-2 px-3 font-mono">{idx + 1}</td>
                <td className="py-2 px-3 flex items-center gap-2">
                  <Image
                    src={entry.pfpUrl}
                    alt={entry.displayName}
                    width={32}
                    height={32}
                    className="rounded-full border border-gray-200 dark:border-gray-700"
                  />
                  <span className="font-medium">{entry.displayName}</span>
                  <span className="text-xs text-gray-500">@{entry.username}</span>
                </td>
                <td className="py-2 px-3 text-right font-bold">{entry.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
} 