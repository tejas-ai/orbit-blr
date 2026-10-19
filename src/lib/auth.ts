import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export const COOKIE_NAME = "orbit_admin_session";

function getAdminPassword(): string | undefined {
  return process.env.ORBIT_ADMIN_PASSWORD?.trim();
}

function getApiSecret(): string | undefined {
  return process.env.ORBIT_API_SECRET?.trim();
}

// Server-side verification for API routes
export async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  const adminPassword = getAdminPassword();
  const apiSecret = getApiSecret();

  // If credentials are not configured, reject access defensively
  if (!adminPassword && !apiSecret) {
    return false;
  }

  // 1. Check Bearer token in Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token && ((apiSecret && token === apiSecret) || (adminPassword && token === adminPassword))) {
      return true;
    }
  }

  // 2. Check X-Admin-Token header
  const customHeader = request.headers.get("x-admin-token")?.trim();
  if (customHeader && ((apiSecret && customHeader === apiSecret) || (adminPassword && customHeader === adminPassword))) {
    return true;
  }

  // 3. Check Cookie session
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (sessionCookie && adminPassword && sessionCookie.value === adminPassword) {
    return true;
  }

  return false;
}

export function isValidAdminPassword(pwd: string): boolean {
  const adminPassword = getAdminPassword();
  if (!adminPassword || !pwd) {
    return false;
  }
  return pwd === adminPassword;
}
