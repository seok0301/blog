# Blog

Astro 기반 개인 블로그.

## 글 쓰기

`src/content/posts/` 에 `.md` 파일을 하나 만든다. 파일 이름이 주소가 된다.

```markdown
---
title: 글 제목
date: 2026-09-07
category: 메모
---

본문. 강조는 **볼드** 만.
```

- `category` 는 생략 가능
- `draft: true` 를 넣으면 공개되지 않음

다 쓰면 `git push` → Vercel 이 자동으로 배포한다.

## 명령어

```bash
npm run dev      # http://localhost:4321 로컬 확인
npm run build    # dist/ 로 정적 빌드
npm run preview  # 빌드 결과 확인
```
