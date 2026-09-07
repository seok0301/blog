import type { APIRoute } from 'astro';
import { configured, redis } from '../../lib/redis';
import {
  clamp,
  cleanSlug,
  hashPassword,
  json,
  rateLimit,
  verifyPassword,
  visitor,
} from '../../lib/util';

export const prerender = false;

const MAX = 300; // 한 글에 보관할 댓글 수

type Stored = {
  id: string;
  name: string;
  body: string;
  at: number;
  pw: string;
};

const publicView = ({ id, name, body, at }: Stored) => ({ id, name, body, at });

async function all(slug: string): Promise<Stored[]> {
  const raw: string[] = (await redis('LRANGE', `comments:${slug}`, 0, -1)) || [];
  return raw.flatMap((s) => {
    try {
      return [JSON.parse(s) as Stored];
    } catch {
      return [];
    }
  });
}

export const GET: APIRoute = async ({ url }) => {
  const slug = cleanSlug(url.searchParams.get('slug'));
  if (!slug) return json({ error: 'bad slug' }, 400);
  if (!configured) return json({ comments: [], off: true });
  return json({ comments: (await all(slug)).map(publicView) });
};

export const POST: APIRoute = async ({ request, url }) => {
  const slug = cleanSlug(url.searchParams.get('slug'));
  if (!slug) return json({ error: 'bad slug' }, 400);
  if (!configured) return json({ error: '댓글 저장소가 설정되지 않았습니다.' }, 503);

  let data: any;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }

  // 봇 잡는 빈 칸
  if (clamp(data.url, 10)) return json({ ok: true });

  const name = clamp(data.name, 24);
  const body = clamp(data.body, 2000);
  const pw = typeof data.password === 'string' ? data.password : '';

  if (!name) return json({ error: '이름을 입력해 주세요.' }, 400);
  if (!body) return json({ error: '내용을 입력해 주세요.' }, 400);
  if (pw.length < 4)
    return json({ error: '비밀번호는 4자 이상이어야 합니다.' }, 400);

  const me = visitor(request);
  if (!(await rateLimit(`rl:c:${me}`, 5, 60)))
    return json({ error: '너무 빠릅니다. 잠시 후 다시 시도해 주세요.' }, 429);

  const item: Stored = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    body,
    at: Date.now(),
    pw: hashPassword(pw),
  };

  await redis('RPUSH', `comments:${slug}`, JSON.stringify(item));
  await redis('LTRIM', `comments:${slug}`, -MAX, -1);
  return json({ comment: publicView(item) }, 201);
};

export const DELETE: APIRoute = async ({ request, url }) => {
  const slug = cleanSlug(url.searchParams.get('slug'));
  const id = clamp(url.searchParams.get('id'), 40);
  if (!slug || !id) return json({ error: 'bad request' }, 400);
  if (!configured) return json({ error: 'storage not configured' }, 503);

  let data: any = {};
  try {
    data = await request.json();
  } catch {}
  const pw = typeof data.password === 'string' ? data.password : '';

  const raw: string[] = (await redis('LRANGE', `comments:${slug}`, 0, -1)) || [];
  const hit = raw.find((s) => {
    try {
      return (JSON.parse(s) as Stored).id === id;
    } catch {
      return false;
    }
  });
  if (!hit) return json({ error: '이미 삭제된 댓글입니다.' }, 404);

  const item = JSON.parse(hit) as Stored;
  const admin = process.env.ADMIN_PASSWORD;
  const ok = (admin && pw === admin) || verifyPassword(pw, item.pw);
  if (!ok) return json({ error: '비밀번호가 다릅니다.' }, 403);

  await redis('LREM', `comments:${slug}`, 1, hit);
  return json({ ok: true });
};
