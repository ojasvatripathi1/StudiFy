import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const docRef = doc(db, "settings", "platform");
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return NextResponse.json({ maintenanceMode: false });
    }

    return NextResponse.json(snap.data());
  } catch (error) {
    console.error("Error fetching platform settings:", error);
    // On error (like missing permissions), default to false so we don't break the app
    return NextResponse.json({ maintenanceMode: false }, { status: 500 });
  }
}
