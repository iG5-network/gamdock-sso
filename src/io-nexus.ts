export const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4000'

async function request(method: 'GET' | 'POST', path: string, body?: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`request_failed_${res.status}`)
  return res.json()
}

export async function get(path: string) {
  return request('GET', path)
}

export async function post(path: string, body: unknown) {
  return request('POST', path, body)
}
