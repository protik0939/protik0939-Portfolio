import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_HANDLE = "protik0939";
const MAX_SUBMISSIONS = 10000;

type CodeforcesSubmission = {
  creationTimeSeconds: number;
  verdict?: string;
  problem?: {
    contestId?: number;
    index?: string;
  };
};

type CodeforcesApiResponse = {
  status: "OK" | "FAILED";
  comment?: string;
  result?: CodeforcesSubmission[];
};

type CodeforcesUserInfo = {
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
};

type CodeforcesUserInfoResponse = {
  status: "OK" | "FAILED";
  comment?: string;
  result?: CodeforcesUserInfo[];
};

function toIsoDate(timestampSeconds: number) {
  return new Date(timestampSeconds * 1000).toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle")?.trim() || DEFAULT_HANDLE;

  try {
    const [statusResponse, userInfoResponse] = await Promise.all([
      fetch(
        `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=${MAX_SUBMISSIONS}`,
        {
          next: { revalidate: 1800 },
        },
      ),
      fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`, {
        next: { revalidate: 1800 },
      }),
    ]);

    if (!statusResponse.ok || !userInfoResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Codeforces submissions." },
        { status: 502 },
      );
    }

    const payload = (await statusResponse.json()) as CodeforcesApiResponse;
    const userPayload = (await userInfoResponse.json()) as CodeforcesUserInfoResponse;

    if (payload.status !== "OK" || !Array.isArray(payload.result)) {
      return NextResponse.json(
        { error: payload.comment || "Codeforces API returned an invalid response." },
        { status: 502 },
      );
    }

    if (userPayload.status !== "OK" || !Array.isArray(userPayload.result) || userPayload.result.length === 0) {
      return NextResponse.json(
        { error: userPayload.comment || "Codeforces profile data is unavailable." },
        { status: 502 },
      );
    }

    const counts = new Map<string, number>();
    const solvedSet = new Set<string>();
    let accepted = 0;

    for (const submission of payload.result) {
      const date = toIsoDate(submission.creationTimeSeconds);
      counts.set(date, (counts.get(date) ?? 0) + 1);

      if (submission.verdict === "OK") {
        accepted += 1;
        const contestId = submission.problem?.contestId ?? 0;
        const index = submission.problem?.index ?? "";
        solvedSet.add(`${contestId}-${index}`);
      }
    }

    const values = Array.from(counts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const profile = userPayload.result[0];

    return NextResponse.json(
      {
        handle,
        values,
        stats: {
          rating: profile.rating ?? 0,
          maxRating: profile.maxRating ?? 0,
          rank: profile.rank ?? "unrated",
          maxRank: profile.maxRank ?? "unrated",
          totalSubmissions: payload.result.length,
          accepted,
          uniqueSolved: solvedSet.size,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to load Codeforces heatmap data right now." },
      { status: 500 },
    );
  }
}
