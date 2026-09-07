// Upstash Redis REST API. SDK 없이 fetch 로만 쓴다.
const base =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  '';
const token =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  '';

export const configured = Boolean(base && token);

type Arg = string | number;

async function call(body: unknown) {
  const res = await fetch(base, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`redis ${res.status} ${await res.text()}`);
  return res.json();
}

/** 단일 명령: redis('GET', 'key') */
export async function redis(...cmd: Arg[]): Promise<any> {
  const out = await call(cmd.map(String));
  return out.result;
}

/** 여러 명령을 한 번에: pipe(['GET','a'], ['GET','b']) */
export async function pipe(...cmds: Arg[][]): Promise<any[]> {
  const res = await fetch(`${base}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmds.map((c) => c.map(String))),
  });
  if (!res.ok) throw new Error(`redis ${res.status} ${await res.text()}`);
  const out = await res.json();
  return out.map((o: any) => o.result);
}
