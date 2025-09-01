import { NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSessionServer();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is a guide
  if (session.role !== "guide") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Find guide profile
  const guide = Array.from(db.guides.values()).find(g => g.userId === session.userId);
  if (!guide) {
    return NextResponse.json({ error: "Guide profile not found" }, { status: 404 });
  }

  // Get guide's orders
  const guideOrders = Array.from(db.orders.values()).filter(
    order => order.guideId === guide.id
  );

  // Calculate statistics
  const totalOrders = guideOrders.length;
  const pendingOrders = guideOrders.filter(order => 
    order.status === "PAID" || order.status === "IN_PROGRESS"
  ).length;
  const completedOrders = guideOrders.filter(order => 
    order.status === "COMPLETED"
  ).length;
  
  const totalEarnings = guideOrders
    .filter(order => order.status === "COMPLETED")
    .reduce((sum, order) => sum + order.amount, 0);

  // Calculate monthly earnings (current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyEarnings = guideOrders
    .filter(order => {
      const orderDate = new Date(order.createdAt);
      return order.status === "COMPLETED" && 
             orderDate.getMonth() === currentMonth && 
             orderDate.getFullYear() === currentYear;
    })
    .reduce((sum, order) => sum + order.amount, 0);

  // Get reviews for this guide
  const guideReviews = Array.from(db.reviews.values()).filter(
    review => review.guideId === guide.id
  );

  const averageRating = guideReviews.length > 0 
    ? Math.round((guideReviews.reduce((sum, review) => sum + review.rating, 0) / guideReviews.length) * 10) / 10
    : 0;

  const totalReviews = guideReviews.length;

  return NextResponse.json({
    totalOrders,
    pendingOrders,
    completedOrders,
    totalEarnings,
    monthlyEarnings,
    averageRating,
    totalReviews,
  });
}
