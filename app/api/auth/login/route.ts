import { NextResponse } from "next/server";

const AUTH_COOKIE = "birthday-memory-auth";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
  const expectedPassword = process.env.NEXT_PUBLIC_APP_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      { success: false, message: "Missing NEXT_PUBLIC_APP_PASSWORD in the environment." },
      { status: 500 },
    );
  }

  if (!password || password !== expectedPassword) {
    return NextResponse.json(
      { success: false, message: "That password doesn’t match." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE, "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
