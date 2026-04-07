import { NextRequest, NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE_NAME = "admin_session";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/admin/content")) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value?.trim();
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/content/:path*"],
};
