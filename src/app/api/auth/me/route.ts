import { NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";

export async function GET() {
  const s = await getSessionServer();
  return NextResponse.json(s ?? { anonymous: true });
}

