import { NextResponse } from "next/server";
import { getActiveWorkSession, stopWorkSession } from "@/lib/garden";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectIdParam = searchParams.get("projectId");
    const projectId = projectIdParam ? Number(projectIdParam) : undefined;

    const activeSession = getActiveWorkSession(projectId);
    return NextResponse.json({ activeSession });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch work session" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "stop";

    if (action === "stop") {
      const stopped = stopWorkSession(body.sessionId, body.notes);
      return NextResponse.json({ session: stopped });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process work session" }, { status: 500 });
  }
}
