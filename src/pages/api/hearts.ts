import type { APIRoute } from 'astro';
import { configured, pipe, redis } from '../../lib/redis';
import { cleanSlug, json, rateLimit, visitor } from '../../lib/util';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  const slug = cleanSlug(url.searchParams.get('slug'));
  if (!slug) return json({ error: 'bad slug' }, 400);
  if (!configured) return json({ count: 0, mine: false, off: true });

  const me = visitor(request);
  const [count, mine] = await pipe(
    ['GET', `hearts:${slug}`],
    ['SISMEMBER', `hearted:${slug}`, me]
  );
  return json({ count: Number(count) || 0, mine: mine === 1 });
};

export const POST: APIRoute = async ({ request, url }) => {
  const slug = cleanSlug(url.searchParams.get('slug'));
  if (!slug) return json({ error: 'bad slug' }, 400);
  if (!configured) return json({ error: 'storage not configured' }, 503);

  const me = visitor(request);
  if (!(await rateLimit(`rl:h:${me}`, 20, 60)))
    return json({ error: '잠시 후 다시 시도해 주세요.' }, 429);

  const added = await redis('SADD', `hearted:${slug}`, me);
  if (added === 1) {
    const count = await redis('INCR', `hearts:${slug}`);
    return json({ count: Number(count), mine: true });
  }
  await redis('SREM', `hearted:${slug}`, me);
  const count = await redis('DECR', `hearts:${slug}`);
  return json({ count: Math.max(0, Number(count)), mine: false });
};
