"use client";

import { useState } from "react";
import type { Entry } from "@/lib/entries";

const timeFmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "요청을 처리하지 못했습니다.");
  return data as T;
}

export default function Guestbook({
  initialEntries,
  initialError,
}: {
  initialEntries: Entry[];
  initialError: string | null;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [listError, setListError] = useState(initialError);
  const [notice, setNotice] = useState<string | null>(null);

  async function reload() {
    try {
      const { entries } = await call<{ entries: Entry[] }>("/api/entries");
      setEntries(entries);
      setListError(null);
    } catch (e) {
      setListError((e as Error).message);
    }
  }

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice((n) => (n === msg ? null : n)), 2500);
  }

  return (
    <>
      <WriteForm
        onCreated={async () => {
          await reload();
          flash("글을 남겼습니다.");
        }}
      />

      <p className="notice" role="status" aria-live="polite">
        {notice}
      </p>

      <section aria-label="방명록 목록">
        {listError && (
          <p className="error" role="alert">
            {listError}
          </p>
        )}
        {!listError && entries.length === 0 && (
          <p className="empty">아직 남겨진 글이 없습니다. 첫 번째 글을 남겨 보세요.</p>
        )}
        <ol className="entries">
          {entries.map((entry) => (
            <EntryItem
              key={entry.id}
              entry={entry}
              onUpdated={(updated) => {
                setEntries((list) => list.map((e) => (e.id === updated.id ? updated : e)));
                flash("글을 수정했습니다.");
              }}
              onDeleted={(id) => {
                setEntries((list) => list.filter((e) => e.id !== id));
                flash("글을 삭제했습니다.");
              }}
            />
          ))}
        </ol>
      </section>
    </>
  );
}

function WriteForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await call("/api/entries", {
        method: "POST",
        body: JSON.stringify({ name, password, message }),
      });
      setMessage("");
      setPassword("");
      await onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="write" onSubmit={submit}>
      <div className="row">
        <label>
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} required />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={4}
            maxLength={64}
            placeholder="수정·삭제할 때 필요해요"
            required
          />
        </label>
      </div>
      <label>
        메시지
        <textarea
          className="ruled"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={3}
          required
        />
      </label>
      <div className="actions">
        <span className="count">{message.length}/500</span>
        <button type="submit" className="primary" disabled={busy}>
          {busy ? "남기는 중…" : "남기기"}
        </button>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

type Mode = "view" | "edit" | "delete";

function EntryItem({
  entry,
  onUpdated,
  onDeleted,
}: {
  entry: Entry;
  onUpdated: (e: Entry) => void;
  onDeleted: (id: number) => void;
}) {
  const [mode, setMode] = useState<Mode>("view");
  const [draft, setDraft] = useState(entry.message);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open(next: Mode) {
    setMode(next);
    setDraft(entry.message);
    setPassword("");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "edit") {
        const { entry: updated } = await call<{ entry: Entry }>(`/api/entries/${entry.id}`, {
          method: "PATCH",
          body: JSON.stringify({ message: draft, password }),
        });
        setMode("view");
        onUpdated(updated);
      } else {
        await call(`/api/entries/${entry.id}`, {
          method: "DELETE",
          body: JSON.stringify({ password }),
        });
        onDeleted(entry.id);
      }
    } catch (err) {
      setError((err as Error).message);
      setPassword("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="entry">
      <div className="meta">
        <span className="name">{entry.name}</span>
        <time dateTime={entry.createdAt}>
          {timeFmt.format(new Date(entry.createdAt))}
          {entry.updatedAt && " (수정됨)"}
        </time>
      </div>

      {mode === "edit" ? null : <p className="message">{entry.message}</p>}

      {mode === "view" && (
        <div className="tools">
          <button type="button" onClick={() => open("edit")}>
            수정
          </button>
          <button type="button" onClick={() => open("delete")}>
            삭제
          </button>
        </div>
      )}

      {mode !== "view" && (
        <form className={`panel ${mode}`} onSubmit={submit}>
          {mode === "edit" && (
            <label>
              메시지 수정
              <textarea
                className="ruled"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={500}
                rows={3}
                required
                autoFocus
              />
            </label>
          )}
          {mode === "delete" && <p className="confirm">이 글을 삭제할까요? 되돌릴 수 없습니다.</p>}
          <div className="row tight">
            <label>
              비밀번호
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="글 쓸 때 입력한 비밀번호"
                required
                autoFocus={mode === "delete"}
              />
            </label>
            <div className="panel-actions">
              <button type="button" onClick={() => open("view")} disabled={busy}>
                취소
              </button>
              <button type="submit" className={mode === "delete" ? "danger" : "primary"} disabled={busy}>
                {busy ? "확인 중…" : mode === "edit" ? "수정 저장" : "삭제"}
              </button>
            </div>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </li>
  );
}
