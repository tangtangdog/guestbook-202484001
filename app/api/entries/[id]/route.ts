import { NextResponse } from "next/server";
import { deleteEntry, parseId, updateEntry } from "@/lib/entries";
import { errorResponse, readJson } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const id = parseId((await params).id);
    const body = await readJson(req);
    const entry = await updateEntry(id, { message: body.message, password: body.password });
    return NextResponse.json({ entry });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const id = parseId((await params).id);
    const body = await readJson(req);
    await deleteEntry(id, { password: body.password });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
