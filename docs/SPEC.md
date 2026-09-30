# 미니 방명록 스펙

## 목표
회원가입 없이 이름·메시지·비밀번호로 글을 남기고, 비밀번호로 본인 글만 수정·삭제한다.

## 데이터 모델 `guestbook_entries`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR(30) | 필수, 1–30자 |
| message | VARCHAR(500) | 필수, 1–500자 |
| password_hash | TEXT | bcrypt 해시 (평문 저장 금지, 응답에 노출 금지) |
| created_at | TIMESTAMPTZ | 기본값 NOW() |
| updated_at | TIMESTAMPTZ | 수정 시 갱신, 없으면 NULL |

## API
| 메서드 | 경로 | 본문 | 성공 | 실패 |
|---|---|---|---|---|
| GET | /api/entries | – | 200 `{entries}` 최신순 | 500 |
| POST | /api/entries | `{name, message, password}` | 201 `{entry}` | 400 검증 오류 |
| PATCH | /api/entries/:id | `{message, password}` | 200 `{entry}` | 400 / 403 비밀번호 불일치 / 404 |
| DELETE | /api/entries/:id | `{password}` | 200 `{ok:true}` | 400 / 403 비밀번호 불일치 / 404 |

비밀번호: 작성 시 4–64자. 불일치 시 403과 "비밀번호가 일치하지 않습니다." 메시지를 반환하고 UI에 그대로 표시한다.

## UI
- 상단: 제목, 개발자 이름·학번
- 작성 폼: 이름, 비밀번호, 메시지(500자 카운터), 남기기
- 목록: 최신순, 이름·작성 시각(KST)·수정됨 표시·메시지
- 각 글: 수정(메시지+비밀번호 입력) / 삭제(확인 문구+비밀번호 입력), 실패 사유를 해당 글 아래에 표시

## 티켓
1. Neon 연결 + 테이블 자동 생성 (`lib/db.ts`)
2. 도메인 로직: 검증, bcrypt 해시/비교, CRUD (`lib/entries.ts`)
3. Route Handlers (`app/api/entries/**`)
4. 목록 서버 렌더링 + 작성 폼
5. 수정/삭제 패널 + 비밀번호 오류 안내
6. 개발자 정보 표시, 반응형, Vercel 배포
