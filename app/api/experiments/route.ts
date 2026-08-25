import { NextResponse } from "next/server";
import { createExperiment, listExperiments } from "@/lib/garden";

export function GET() {
  return NextResponse.json(listExperiments());
}

export async function POST(request: Request) {
  try {
    const experiment = createExperiment(await request.json());
    return NextResponse.json(experiment, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
