# Blog

Astro 기반 개인 블로그. 마크다운 파일을 올리면 글이 된다.

## 글 쓰기

`src/content/posts/` 에 `.md` 파일을 하나 만든다. 파일 이름이 그대로 주소가 된다.

```markdown
---
title: 글 제목
date: 2026-09-07
---

본문. 강조는 **볼드** 만.
```

유튜브는 아래처럼 넣으면 본문 안에서 바로 재생된다. `VIDEO_ID`는 링크의 `v=` 뒤 또는 `youtu.be/` 뒤에 있는 값이다.

```html
<figure class="embed">
  <div class="embed-frame">
    <iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID" title="영상 설명" loading="lazy" allowfullscreen></iframe>
  </div>
  <figcaption>영상 설명</figcaption>
</figure>
```

외부 글은 제목을 넣은 링크 카드로 남긴다.

```html
<p class="resource-link"><a href="https://example.com">읽을거리 제목 <span aria-hidden="true">↗</span></a></p>
```

- `draft: true` 를 넣으면 공개되지 않음
- 최신 글이 좌측 목록 맨 위에 오고, 홈(`/`)에 열리면 그 글이 바로 보인다

다 쓰면 `git push` → Vercel 이 자동 배포한다.

## 명령어

```bash
npm run dev      # http://localhost:4321
npm run build    # dist/ 로 정적 빌드
npm run preview  # 빌드 결과 확인
```

## 하트 + 댓글

직접 만든 것이다. 외부 서비스 로그인 없이 **이름 + 비밀번호**로 댓글을 달고,
그 비밀번호로 본인 댓글을 지운다. 하트는 한 번 더 누르면 취소된다.

- `src/pages/api/hearts.ts` — 하트 조회 / 토글
- `src/pages/api/comments.ts` — 댓글 목록 / 등록 / 삭제
- `src/components/Reactions.astro` — 화면 + 클라이언트 스크립트
- `src/lib/` — Redis REST 래퍼, 비밀번호 해시, 레이트리밋

저장소는 **Upstash Redis** 다. Vercel 프로젝트에서 한 번만 붙이면 된다:

**Vercel 프로젝트 → Storage → Create Database → Upstash Redis → Connect**

붙이면 `KV_REST_API_URL` / `KV_REST_API_TOKEN` 환경변수가 자동으로 주입된다.
없으면 하트는 0으로, 댓글은 빈 목록으로 조용히 넘어간다(사이트는 정상 동작).

선택 환경변수 (Vercel → Settings → Environment Variables):

| 이름 | 용도 |
|---|---|
| `ADMIN_PASSWORD` | 이 값을 넣으면 아무 댓글이나 삭제 가능 |
| `SALT` | 방문자 해시용 소금. 안 넣으면 기본값 사용 |

### 스팸 대책

- 같은 방문자 기준 댓글 분당 5회, 하트 분당 20회 (Redis 카운터)
- 봇 잡는 빈 칸(honeypot) 한 개
- 이름 24자 / 댓글 2000자 제한, 글 하나당 최근 300개만 보관
- 비밀번호는 scrypt 해시로만 저장. 평문·IP·이메일은 저장하지 않음 (IP 는 해시만)

## 배포

```bash
gh repo create blog --public --source=. --push
```

[vercel.com/new](https://vercel.com/new) 에서 repo import → Deploy. Astro 는 자동 감지된다.
배포 후 `src/config.ts` 의 `SITE.url` 과 `astro.config.mjs` 의 `site` 를 실제 주소로 바꾼다.
