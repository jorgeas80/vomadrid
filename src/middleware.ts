import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return new NextResponse("Admin credentials not configured", { status: 500 });
  }

  const authHeader = request.headers.get("Authorization");

  if (authHeader?.startsWith("Basic ")) {
    const base64 = authHeader.slice(6);
    const decoded = atob(base64);
    const colonIndex = decoded.indexOf(":");
    const inputUser = decoded.slice(0, colonIndex);
    const inputPass = decoded.slice(colonIndex + 1);

    if (inputUser === username && inputPass === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="VO Madrid Admin"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
