-- 앱이 첫 요청 때 자동으로 생성하지만, Neon SQL Editor에서 직접 실행해도 된다.
CREATE TABLE IF NOT EXISTS guestbook_entries (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(30)  NOT NULL,
  message       VARCHAR(500) NOT NULL,
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS guestbook_entries_created_at_idx
  ON guestbook_entries (created_at DESC);
