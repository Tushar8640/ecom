import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-do-not-use-in-production";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function getSession(
  req?: Request
): Promise<{ userId: string; role: string } | null> {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get("token")?.value;
  }

  if (!token) return null;

  return verifyToken(token);
}

export async function requireAuth(
  req?: Request
): Promise<{ userId: string; role: string }> {
  const session = await getSession(req);
  if (!session) {
    throw new Error("Authentication required");
  }
  return session;
}

export async function requireAdmin(
  req?: Request
): Promise<{ userId: string; role: string }> {
  const session = await requireAuth(req);
  if (session.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return session;
}
