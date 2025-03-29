import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    // Get the token from cookies
    const token = cookies().get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Return the token
    return NextResponse.json({ token });
}
