# guestbook-<학번>

Next.js(App Router) + TypeScript + Neon Postgres + Vercel로 만든 미니 방명록.
스펙은 [docs/SPEC.md](docs/SPEC.md) 참고.

## 로컬 실행
```bash
cp .env.example .env.local   # DATABASE_URL 입력
npm install
npm run dev
```
테이블은 첫 요청 때 자동으로 생성된다 (`schema.sql`로 직접 만들어도 됨).

## 배포
1. `lib/developer.ts`의 이름·학번 수정
2. GitHub에 public 저장소 `guestbook-<학번>`으로 push
3. Neon에서 프로젝트 `guestbook-<학번>` 생성 → 연결 문자열 복사
4. Vercel에서 저장소 import (프로젝트명 `guestbook-<학번>`) → 환경 변수 `DATABASE_URL` 추가 → Deploy
