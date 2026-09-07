import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { redis } from './redis';

const SALT = process.env.SALT || 'blog-static-salt';

/** 방문자 식별용 해시. 원본 IP 는 저장하지 않는다. */
export function visitor(request: Request): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0';
  return createHash('sha256').update(ip + SALT).digest('hex').slice(0, 24);
}

export function hashPassword(pw: string): string {
  const salt = randomBytes(12).toString('hex');
  return `${salt}:${scryptSync(pw, salt, 32).toString('hex')}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, want] = stored.split(':');
  if (!salt || !want) return false;
  const got = scryptSync(pw, salt, 32);
  const exp = Buffer.from(want, 'hex');
  return got.length === exp.length && timingSafeEqual(got, exp);
}

/** 같은 방문자가 window 초 안에 max 번 넘게 쓰면 막는다. */
export async function rateLimit(key: string, max = 5, window = 60) {
  const n = await redis('INCR', key);
  if (n === 1) await redis('EXPIRE', key, window);
  return n <= max;
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

/** 글 주소로 쓸 수 있는 형태만 허용 (경로 탈출 차단) */
export const cleanSlug = (s: unknown) => {
  if (typeof s !== 'string') return null;
  if (!/^[a-zA-Z0-9가-힣._-]+(?:\/[a-zA-Z0-9가-힣._-]+)*$/.test(s)) return null;
  if (s.length > 120 || s.split('/').some((p) => p === '.' || p === '..')) return null;
  return s;
};

export const clamp = (s: unknown, max: number) =>
  typeof s === 'string' ? s.trim().slice(0, max) : '';
