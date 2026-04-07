import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, getAdminSessionByToken } from "@/lib/admin-auth";

type GuardResult =
  | { ok: true; admin: NonNullable<Awaited<ReturnType<typeof getAdminSessionByToken>>> }
  | { ok: false; response: NextResponse };

export async function requireAdminAccess(request: NextRequest): Promise<GuardResult> {
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  const admin = await getAdminSessionByToken(sessionToken);
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Session expired. Please login again." }, { status: 401 }),
    };
  }

  return {
    ok: true,
    admin,
  };
}
