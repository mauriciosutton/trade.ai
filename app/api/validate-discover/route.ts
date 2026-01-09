import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    const validPassword = process.env.FIND_POSTS;
    
    if (!validPassword) {
      return NextResponse.json(
        { error: "Feature not configured" },
        { status: 500 }
      );
    }
    
    if (password === validPassword) {
      return NextResponse.json({ valid: true });
    }
    
    return NextResponse.json({ valid: false }, { status: 401 });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    );
  }
}
