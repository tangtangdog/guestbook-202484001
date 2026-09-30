import { NextResponse } from "next/server";
import { NotFoundError, ValidationError, WrongPasswordError } from "./entries";

export function errorResponse(err: unknown) {
  if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
  if (err instanceof WrongPasswordError) return NextResponse.json({ error: err.message }, { status: 403 });
  if (err instanceof NotFoundError) return NextResponse.json({ error: err.message }, { status: 404 });
  console.error(err);
  return NextResponse.json({ error: "서버 오류가 발생했습니다. 잠시 후 다시 시도하세요." }, { status: 500 });
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}
