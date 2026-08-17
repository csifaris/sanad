import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, parseCookie } from "@/lib/auth-cookie";

export async function POST(request: NextRequest) {
  try {
    // Get session from cookies
    const raw = request.cookies.get(COOKIE_NAME)?.value;
    
    // Validate that an active session exists
    if (!raw) {
      return NextResponse.json(
        { error: "No active session" },
        { status: 401 }
      );
    }

    // Parse the cookie to ensure it's valid
    const session = parseCookie(raw);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    // Create response
    const response = NextResponse.json({ ok: true });
    
    // Securely delete the authentication cookie with the same settings as creation
    response.cookies.delete(COOKIE_NAME);
    
    return response;
  } catch (error) {
    console.error("Logout endpoint error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
