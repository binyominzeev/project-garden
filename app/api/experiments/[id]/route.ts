import { NextResponse } from "next/server";
import { deleteExperiment, getExperiment, updateExperiment } from "@/lib/garden";

export function GET(_: Request, { params }: { params: { id: string } }) {
  const experiment = getExperiment(Number(params.id));
  return experiment
    ? NextResponse.json(experiment)
    : NextResponse.json({ error: "Experiment not found" }, { status: 404 });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const experiment = updateExperiment(Number(params.id), await request.json());
  return experiment
    ? NextResponse.json(experiment)
    : NextResponse.json({ error: "Experiment not found" }, { status: 404 });
}

export function DELETE(_: Request, { params }: { params: { id: string } }) {
  const deleted = deleteExperiment(Number(params.id));
  return deleted
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: "Experiment not found" }, { status: 404 });
}
