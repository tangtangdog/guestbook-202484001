import Guestbook from "@/components/Guestbook";
import { DEVELOPER } from "@/lib/developer";
import { listEntries, type Entry } from "@/lib/entries";

export const dynamic = "force-dynamic";

export default async function Page() {
  let entries: Entry[] = [];
  let loadError: string | null = null;
  try {
    entries = await listEntries();
  } catch (err) {
    console.error(err);
    loadError = "방명록을 불러오지 못했습니다. 새로고침해 보세요.";
  }

  return (
    <main className="desk">
      <article className="page">
        <header className="masthead">
          <h1>방명록</h1>
          <p className="lede">다녀간 흔적을 한 줄 남겨 주세요.</p>
          <p className="author">
            만든 사람 <strong>{DEVELOPER.name}</strong> <span>({DEVELOPER.studentId})</span>
          </p>
        </header>
        <Guestbook initialEntries={entries} initialError={loadError} />
      </article>
    </main>
  );
}
