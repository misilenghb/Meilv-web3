import { cookies } from "next/headers";

export type Session = {
  userId: string;
  phone: string;
  role: "user" | "guide" | "admin";
  intendedRole?: "user" | "guide" | "admin";
} | null;

export async function getSessionServer(): Promise<Session> {
  const c = await cookies();
  const raw = c.get("ml_session")?.value;
  if (!raw) return null;
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    const obj = JSON.parse(decoded);
    if (typeof obj?.userId === "string" && typeof obj?.phone === "string" && typeof obj?.role === "string") {
      if (obj.role === "user" || obj.role === "guide" || obj.role === "admin") {
        return {
          userId: obj.userId,
          phone: obj.phone,
          role: obj.role,
          intendedRole: obj.intendedRole || obj.role
        };
      }
    }
  } catch {}
  return null;
}

