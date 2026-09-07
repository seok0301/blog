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

- `draft: true` 를 넣으면 공개되지 않음
- 최신 글이 좌측 목록 맨 위에 오고, 홈(`/`)에 열리면 그 글이 바로 보인다

다 쓰면 `git push` → Vercel 이 자동 배포한다.

## 명령어

```bash
npm run dev      # http://localhost:4321
npm run build    # dist/ 로 정적 빌드
npm run preview  # 빌드 결과 확인
```

## 댓글 + 하트 (Giscus)

`src/config.ts` 에 이 repo(`seok0301/blog`) 의 값이 이미 채워져 있고, Discussions 도 켜져 있다.
남은 단계는 **giscus 앱 설치** 하나다 (브라우저에서만 가능):

[github.com/apps/giscus](https://github.com/apps/giscus) → Install → `seok0301/blog` 만 선택

설치하면 댓글과 ❤️ 반응이 바로 동작한다. 저장소는 GitHub Discussions 의 `Announcements`
카테고리라서 DB·서버·요금이 없다. 댓글 작성에는 방문자의 GitHub 로그인이 필요하고, 읽기는 누구나 된다.

## 배포

```bash
gh repo create blog --public --source=. --push
```

[vercel.com/new](https://vercel.com/new) 에서 repo import → Deploy. Astro 는 자동 감지된다.
배포 후 `src/config.ts` 의 `SITE.url` 과 `astro.config.mjs` 의 `site` 를 실제 주소로 바꾼다.
