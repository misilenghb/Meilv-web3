import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSessionServer();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user settings or return defaults
  let settings = db.userSettings.get(session.userId);
  
  if (!settings) {
    // Create default settings
    settings = {
      userId: session.userId,
      notifications: {
        orderUpdates: true,
        messageAlerts: true,
        promotions: false,
        systemAnnouncements: true,
      },
      privacy: {
        showProfile: true,
        showOrderHistory: false,
        allowDirectMessages: true,
      },
      preferences: {
        language: "zh-CN",
        currency: "CNY",
        theme: "light",
      },
    };
    
    db.userSettings.set(session.userId, settings);
  }

  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const session = await getSessionServer();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newSettings = await request.json();
  
  // Validate settings structure
  if (!newSettings.notifications || !newSettings.privacy || !newSettings.preferences) {
    return NextResponse.json({ error: "Invalid settings format" }, { status: 400 });
  }

  // Add userId to settings
  newSettings.userId = session.userId;
  
  // Save settings
  db.userSettings.set(session.userId, newSettings);

  return NextResponse.json(newSettings);
}
