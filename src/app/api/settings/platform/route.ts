import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("settings").doc("platform").get();

    if (!snap.exists) {
      return NextResponse.json({ maintenanceMode: false });
    }

    return NextResponse.json(snap.data());
  } catch (error) {
    console.error("Error fetching platform settings:", error);
    // On error, default to false so we don't break the app
    return NextResponse.json({ maintenanceMode: false }, { status: 500 });
  }
}
