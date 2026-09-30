import bcrypt from "bcryptjs";
import { db } from "./db";

export type Entry = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
  updatedAt: string | null;
};

type Row = {
  id: number;
  name: string;
  message: string;
  created_at: string | Date;
  updated_at: string | Date | null;
};

export const LIMITS = {
  name: 30,
  message: 500,
  passwordMin: 4,
  passwordMax: 64,
};

export class ValidationError extends Error {}
export class NotFoundError extends Error {}
export class WrongPasswordError extends Error {}

const iso = (v: string | Date) => new Date(v).toISOString();

function toEntry(r: Row): Entry {
  return {
    id: r.id,
    name: r.name,
    message: r.message,
    createdAt: iso(r.created_at),
    updatedAt: r.updated_at ? iso(r.updated_at) : null,
  };
}

function str(v: unknown) {
  return typeof v === "string" ? v : "";
}

export function validateName(v: unknown) {
  const s = str(v).trim();
  if (!s) throw new ValidationError("이름을 입력하세요.");
  if (s.length > LIMITS.name) throw new ValidationError(`이름은 ${LIMITS.name}자 이내로 입력하세요.`);
  return s;
}

export function validateMessage(v: unknown) {
  const s = str(v).trim();
  if (!s) throw new ValidationError("메시지를 입력하세요.");
  if (s.length > LIMITS.message) throw new ValidationError(`메시지는 ${LIMITS.message}자 이내로 입력하세요.`);
  return s;
}

export function validateNewPassword(v: unknown) {
  const s = str(v);
  if (s.length < LIMITS.passwordMin) throw new ValidationError(`비밀번호는 ${LIMITS.passwordMin}자 이상 입력하세요.`);
  if (s.length > LIMITS.passwordMax) throw new ValidationError(`비밀번호는 ${LIMITS.passwordMax}자 이내로 입력하세요.`);
  return s;
}

export function requirePassword(v: unknown) {
  const s = str(v);
  if (!s) throw new ValidationError("비밀번호를 입력하세요.");
  return s;
}

export function parseId(v: string) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new NotFoundError("글을 찾을 수 없습니다.");
  return n;
}

export async function listEntries(): Promise<Entry[]> {
  const sql = await db();
  const rows = (await sql`
    SELECT id, name, message, created_at, updated_at
    FROM guestbook_entries
    ORDER BY created_at DESC, id DESC`) as Row[];
  return rows.map(toEntry);
}

export async function createEntry(input: { name: unknown; message: unknown; password: unknown }) {
  const name = validateName(input.name);
  const message = validateMessage(input.message);
  const password = validateNewPassword(input.password);
  const hash = await bcrypt.hash(password, 10);
  const sql = await db();
  const rows = (await sql`
    INSERT INTO guestbook_entries (name, message, password_hash)
    VALUES (${name}, ${message}, ${hash})
    RETURNING id, name, message, created_at, updated_at`) as Row[];
  return toEntry(rows[0]);
}

async function verify(id: number, password: string) {
  const sql = await db();
  const rows = (await sql`
    SELECT password_hash FROM guestbook_entries WHERE id = ${id}`) as { password_hash: string }[];
  if (rows.length === 0) throw new NotFoundError("글을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.");
  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) throw new WrongPasswordError("비밀번호가 일치하지 않습니다.");
  return sql;
}

export async function updateEntry(id: number, input: { message: unknown; password: unknown }) {
  const message = validateMessage(input.message);
  const password = requirePassword(input.password);
  const sql = await verify(id, password);
  const rows = (await sql`
    UPDATE guestbook_entries
    SET message = ${message}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, name, message, created_at, updated_at`) as Row[];
  if (rows.length === 0) throw new NotFoundError("글을 찾을 수 없습니다.");
  return toEntry(rows[0]);
}

export async function deleteEntry(id: number, input: { password: unknown }) {
  const password = requirePassword(input.password);
  const sql = await verify(id, password);
  await sql`DELETE FROM guestbook_entries WHERE id = ${id}`;
}
