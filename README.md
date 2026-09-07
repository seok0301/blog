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

`src/config.ts` 의 `GISCUS` 가 비어 있으면 렌더되지 않는다. 켜는 순서:

1. GitHub repo → **Settings → General → Features → Discussions** 체크
2. repo 의 **Discussions → New category** 로 `Comments` 카테고리 생성 (Discussion format 권장)
3. [github.com/apps/giscus](https://github.com/apps/giscus) 설치 (해당 repo 에만 허용해도 됨)
4. [giscus.app](https://giscus.app) 에서 repo 와 카테고리를 고르면 `repo-id` / `category-id` 가 나온다
5. 그 값을 `src/config.ts` 에 채운다

```ts
export const GISCUS = {
  repo: 'seok/blog',
  repoId: 'R_kgDO...',
  category: 'Comments',
  categoryId: 'DIC_kwDO...',
};
```

댓글과 ❤️ 반응이 함께 켜진다. 저장소는 GitHub Discussions 라서 DB·서버·요금이 없다.
댓글 작성에는 방문자의 GitHub 로그인이 필요하고, 읽기는 누구나 된다.

## 배포

```bash
gh repo create blog --public --source=. --push
```

[vercel.com/new](https://vercel.com/new) 에서 repo import → Deploy. Astro 는 자동 감지된다.
배포 후 `src/config.ts` 의 `SITE.url` 과 `astro.config.mjs` 의 `site` 를 실제 주소로 바꾼다.
