import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

function getClient() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL 환경 변수가 설정되지 않았습니다.");
    client = neon(url);
  }
  return client;
}

/** 테이블이 없으면 만든다. 인스턴스당 한 번만 실행된다. */
async function ensureSchema() {
  if (!schemaReady) {
    const sql = getClient();
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS guestbook_entries (
          id            SERIAL PRIMARY KEY,
          name          VARCHAR(30)  NOT NULL,
          message       VARCHAR(500) NOT NULL,
          password_hash TEXT         NOT NULL,
          created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          updated_at    TIMESTAMPTZ
        )`;
      await sql`
        CREATE INDEX IF NOT EXISTS guestbook_entries_created_at_idx
          ON guestbook_entries (created_at DESC)`;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

export async function db() {
  await ensureSchema();
  return getClient();
}
