import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getDb } from "@/lib/db";
import { COOKIE_NAME, buildCookieValue, ROLE_HOME, Role } from "@/lib/auth-cookie";

type DBUser = { id: number; name: string; role: Role; password: string };

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    let email: unknown;
    let password: unknown;
    
    try {
      const body = await request.json();
      email = body?.email;
      password = body?.password;
    } catch (parseError) {
      console.error("Request parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Validate input types and presence
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور مطلوبة" },
        { status: 400 }
      );
    }

    // Get database connection with error handling
    let user: DBUser | undefined;
    try {
      let db: any;
      try {
        db = getDb();
        if (!db) {
          throw new Error("Failed to get database connection");
        }
      } catch (dbOpenError) {
        console.error("Database connection error:", dbOpenError);
        return NextResponse.json(
          { error: "خطأ في الخادم" },
          { status: 500 }
        );
      }

      try {
        // Ensure database is still valid
        db.prepare("SELECT 1").get();
      } catch (dbHealthError) {
        console.error("Database health check failed:", dbHealthError);
        return NextResponse.json(
          { error: "خطأ في الخادم" },
          { status: 500 }
        );
      }

      try {
        user = db
          .prepare("SELECT id, name, role, password FROM users WHERE email = ?")
          .get(email) as DBUser | undefined;
      } catch (queryError) {
        console.error("Database query execution error:", queryError);
        return NextResponse.json(
          { error: "خطأ في الخادم" },
          { status: 500 }
        );
      }
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return NextResponse.json(
        { error: "خطأ في الخادم" },
        { status: 500 }
      );
    }

    // Verify user exists and password is correct
    if (!user || !(await bcrypt.compare(password as string, user.password))) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ redirect: ROLE_HOME[user.role] });

    response.cookies.set(COOKIE_NAME, buildCookieValue(user.id, user.role), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login endpoint error:", error);
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
