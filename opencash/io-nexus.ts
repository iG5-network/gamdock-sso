const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4001'

export async function get(path: string) {
	const r = await fetch(API_BASE + path)
	if (!r.ok) throw new Error(`http_${r.status}`)
	return r.json()
}

export async function post(path: string, body: any) {
	const r = await fetch(API_BASE + path, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	})
	if (!r.ok) throw new Error(`http_${r.status}`)
	return r.json()
}
