import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminSessionCookieOptions,
  revokeAdminSessionByToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const currentToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (currentToken) {
    await revokeAdminSessionByToken(currentToken);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    ...getAdminSessionCookieOptions(new Date(0)),
    maxAge: 0,
  });

  return response;
}
