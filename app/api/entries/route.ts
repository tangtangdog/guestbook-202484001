import { NextResponse } from "next/server";
import { createEntry, listEntries } from "@/lib/entries";
import { errorResponse, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ entries: await listEntries() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const entry = await createEntry({ name: body.name, message: body.message, password: body.password });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
