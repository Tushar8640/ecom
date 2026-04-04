import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });

    return Response.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
