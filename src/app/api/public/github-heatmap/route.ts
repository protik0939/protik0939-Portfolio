import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_USERNAME = "protik0939";
const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";
const FIRST_GITHUB_YEAR = 2008;

type GraphQlError = {
  message: string;
};

type GraphQlResponse<TData> = {
  data?: TData;
  errors?: GraphQlError[];
};

type ContributionDay = {
  date: string;
  contributionCount: number;
  contributionLevel: string;
};

type ContributionWeek = {
  contributionDays: ContributionDay[];
};

type RepoContribution = {
  contributions: {
    totalCount: number;
  };
  repository: {
    nameWithOwner: string;
    stargazerCount: number;
    url: string;
  };
};

type GithubUserData = {
  user: {
    avatarUrl: string;
    createdAt: string;
    followers: {
      totalCount: number;
    };
    following: {
      totalCount: number;
    };
    login: string;
    name: string | null;
    repositories: {
      totalCount: number;
    };
    starredRepositories: {
      totalCount: number;
    };
    url: string;
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: ContributionWeek[];
      };
      totalCommitContributions: number;
      totalIssueContributions: number;
      totalPullRequestContributions: number;
      totalRepositoryContributions: number;
      commitContributionsByRepository: RepoContribution[];
      issueContributionsByRepository: RepoContribution[];
      pullRequestContributionsByRepository: RepoContribution[];
    };
  } | null;
};

type TopRepository = {
  nameWithOwner: string;
  url: string;
  stars: number;
  totalContributions: number;
  commitContributions: number;
  pullRequestContributions: number;
  issueContributions: number;
};

const GITHUB_HEATMAP_QUERY = `
  query GetGithubHeatmap($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      login
      name
      avatarUrl
      createdAt
      url
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) {
        totalCount
      }
      starredRepositories {
        totalCount
      }
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalRepositoryContributions
        commitContributionsByRepository(maxRepositories: 100) {
          contributions {
            totalCount
          }
          repository {
            nameWithOwner
            stargazerCount
            url
          }
        }
        issueContributionsByRepository(maxRepositories: 100) {
          contributions {
            totalCount
          }
          repository {
            nameWithOwner
            stargazerCount
            url
          }
        }
        pullRequestContributionsByRepository(maxRepositories: 100) {
          contributions {
            totalCount
          }
          repository {
            nameWithOwner
            stargazerCount
            url
          }
        }
      }
    }
  }
`;

function appendRepoContributions(
  rows: RepoContribution[],
  target: Map<string, TopRepository>,
  contributionKey: "commitContributions" | "pullRequestContributions" | "issueContributions",
) {
  for (const row of rows) {
    const repoName = row.repository.nameWithOwner;
    const contributionCount = row.contributions.totalCount;

    if (contributionCount <= 0) {
      continue;
    }

    const current = target.get(repoName) ?? {
      nameWithOwner: repoName,
      url: row.repository.url,
      stars: row.repository.stargazerCount,
      totalContributions: 0,
      commitContributions: 0,
      pullRequestContributions: 0,
      issueContributions: 0,
    };

    current.totalContributions += contributionCount;
    current[contributionKey] += contributionCount;
    target.set(repoName, current);
  }
}

function parseSelectedYear(yearParam: string, currentYear: number): number | null | "invalid" {
  if (!yearParam) {
    return null;
  }

  const parsedYear = Number.parseInt(yearParam, 10);
  if (!Number.isFinite(parsedYear) || parsedYear < FIRST_GITHUB_YEAR || parsedYear > currentYear) {
    return "invalid";
  }

  return parsedYear;
}

function getContributionWindow(selectedYear: number | null, now: Date, currentYear: number) {
  const fromDate = selectedYear
    ? new Date(Date.UTC(selectedYear, 0, 1))
    : new Date(Date.UTC(currentYear, now.getUTCMonth(), now.getUTCDate()));

  if (!selectedYear) {
    fromDate.setUTCDate(fromDate.getUTCDate() - 364);
  }

  let toDate = now;
  if (selectedYear && selectedYear !== currentYear) {
    toDate = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));
  }

  return {
    fromIso: fromDate.toISOString(),
    toIso: toDate.toISOString(),
  };
}

function toHeatLevel(contributionLevel: string): number {
  if (contributionLevel === "NONE") return 0;
  if (contributionLevel === "FIRST_QUARTILE") return 1;
  if (contributionLevel === "SECOND_QUARTILE") return 2;
  if (contributionLevel === "THIRD_QUARTILE") return 3;
  return 4;
}

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username")?.trim() || DEFAULT_USERNAME;
  const yearParam = request.nextUrl.searchParams.get("year")?.trim() || "";
  const githubToken = process.env.GITHUB_GRAPHQL_TOKEN || process.env.GITHUB_TOKEN;

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const selectedYear = parseSelectedYear(yearParam, currentYear);

  if (selectedYear === "invalid") {
    return NextResponse.json(
      { error: `Invalid year. Use a value between ${FIRST_GITHUB_YEAR} and ${currentYear}.` },
      { status: 400 },
    );
  }

  const { fromIso, toIso } = getContributionWindow(selectedYear, now, currentYear);

  if (!githubToken) {
    return NextResponse.json(
      {
        error: "GitHub token is missing. Set GITHUB_TOKEN or GITHUB_GRAPHQL_TOKEN in your server environment.",
      },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${githubToken}`,
      },
      body: JSON.stringify({
        query: GITHUB_HEATMAP_QUERY,
        variables: {
          login: username,
          from: fromIso,
          to: toIso,
        },
      }),
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch GitHub GraphQL data." }, { status: 502 });
    }

    const payload = (await response.json()) as GraphQlResponse<GithubUserData>;

    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      const firstError = payload.errors[0]?.message || "GitHub GraphQL returned an error.";
      return NextResponse.json({ error: firstError }, { status: 502 });
    }

    const user = payload.data?.user;
    if (!user) {
      return NextResponse.json({ error: "GitHub user not found." }, { status: 404 });
    }

    const contributionDays = user.contributionsCollection.contributionCalendar.weeks
      .flatMap((week) => week.contributionDays)
      .map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: toHeatLevel(day.contributionLevel),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const accountCreationYear = new Date(user.createdAt).getUTCFullYear();
    const years: number[] = [];
    for (let year = currentYear; year >= accountCreationYear; year -= 1) {
      years.push(year);
    }

    const repoStats = new Map<string, TopRepository>();
    appendRepoContributions(
      user.contributionsCollection.commitContributionsByRepository,
      repoStats,
      "commitContributions",
    );
    appendRepoContributions(
      user.contributionsCollection.pullRequestContributionsByRepository,
      repoStats,
      "pullRequestContributions",
    );
    appendRepoContributions(
      user.contributionsCollection.issueContributionsByRepository,
      repoStats,
      "issueContributions",
    );

    const topRepositories = Array.from(repoStats.values())
      .sort((a, b) => {
        if (b.totalContributions !== a.totalContributions) {
          return b.totalContributions - a.totalContributions;
        }

        return b.stars - a.stars;
      })
      .slice(0, 8);

    return NextResponse.json(
      {
        username: user.login,
        profile: {
          name: user.name,
          avatarUrl: user.avatarUrl,
          url: user.url,
        },
        selectedYear,
        years,
        values: contributionDays,
        stats: {
          followers: user.followers.totalCount,
          following: user.following.totalCount,
          publicRepos: user.repositories.totalCount,
          starredRepos: user.starredRepositories.totalCount,
          totalContributions: user.contributionsCollection.contributionCalendar.totalContributions,
          commitContributions: user.contributionsCollection.totalCommitContributions,
          pullRequestContributions: user.contributionsCollection.totalPullRequestContributions,
          issueContributions: user.contributionsCollection.totalIssueContributions,
          repositoryContributions: user.contributionsCollection.totalRepositoryContributions,
        },
        topRepositories,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Unable to load GitHub contribution data right now." }, { status: 500 });
  }
}
