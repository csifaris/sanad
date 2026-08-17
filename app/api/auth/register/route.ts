import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getDb } from "@/lib/db";
import { COOKIE_NAME, buildCookieValue, ROLE_HOME } from "@/lib/auth-cookie";

type DBUser = { id: number; name: string; role: string };

// Simple email validation regex
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    let fullName: unknown;
    let email: unknown;
    let password: unknown;
    let confirmPassword: unknown;

    try {
      const body = await request.json();
      fullName = body?.fullName;
      email = body?.email;
      password = body?.password;
      confirmPassword = body?.confirmPassword;
    } catch (parseError) {
      console.error("Request parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Validate input types and presence
    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    // Trim whitespace
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Validate full name is not empty
    if (trimmedFullName.length === 0) {
      return NextResponse.json(
        { error: "الاسم الكامل مطلوب" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: "البريد الإلكتروني غير صحيح" },
        { status: 400 }
      );
    }

    // Validate password length
    if (trimmedPassword.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون على الأقل 6 أحرف" },
        { status: 400 }
      );
    }

    // Validate passwords match
    if (trimmedPassword !== trimmedConfirmPassword) {
      return NextResponse.json(
        { error: "كلمات المرور غير متطابقة" },
        { status: 400 }
      );
    }

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

    // Check if email already exists
    let existingUser: any;
    try {
      existingUser = db
        .prepare("SELECT id FROM users WHERE email = ?")
        .get(trimmedEmail);
    } catch (queryError) {
      console.error("Database query execution error:", queryError);
      return NextResponse.json(
        { error: "خطأ في الخادم" },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل بالفعل" },
        { status: 409 }
      );
    }

    // Hash password
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    } catch (hashError) {
      console.error("Password hashing error:", hashError);
      return NextResponse.json(
        { error: "خطأ في الخادم" },
        { status: 500 }
      );
    }

    // Insert new user with role = "beneficiary"
    let newUser: DBUser | undefined;
    try {
      const result = db
        .prepare("INSERT INTO users (name, email, password, role, category) VALUES (?, ?, ?, ?, ?)")
        .run(trimmedFullName, trimmedEmail, hashedPassword, "beneficiary", null);

      newUser = {
        id: Number(result.lastInsertRowid),
        name: trimmedFullName,
        role: "beneficiary",
      };
    } catch (insertError: any) {
      console.error("Database insert error:", insertError);
      
      // Check if this is a unique constraint violation
      if (insertError.message && insertError.message.includes("UNIQUE")) {
        return NextResponse.json(
          { error: "هذا البريد الإلكتروني مسجل بالفعل" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "خطأ في الخادم" },
        { status: 500 }
      );
    }

    if (!newUser) {
      return NextResponse.json(
        { error: "فشل إنشاء الحساب" },
        { status: 500 }
      );
    }

    // Create response and set cookie
    const response = NextResponse.json({
      redirect: ROLE_HOME[newUser.role as "beneficiary" | "specialist" | "supervisor"],
    });

    response.cookies.set(COOKIE_NAME, buildCookieValue(newUser.id, newUser.role as "beneficiary"), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration endpoint error:", error);
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
