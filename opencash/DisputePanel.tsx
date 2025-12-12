import { useEffect, useState } from 'react'
import { get, post } from './io-nexus'

type Dispute = {
  id: string
  escrowId: string
  playerId: string
  reason: string
  status: 'open' | 'in_review' | 'arbitration' | 'resolved' | 'rejected'
  createdAt: number
  updates: { at: number; actor: 'player' | 'psp' | 'system' | 'arbiter'; message: string }[]
}

export default function DisputePanel({ playerId, escrowId }: { playerId: string; escrowId: string | null }) {
  const [list, setList] = useState<Dispute[]>([])
  const [message, setMessage] = useState('')
  const [reason, setReason] = useState('Payment issue')
  const [selected, setSelected] = useState<string | null>(null)

  async function load() {
    const d = await get(`/opencash/disputes/${playerId}`)
    setList(d as Dispute[])
  }

  useEffect(() => {
    load().catch(() => {})
  }, [playerId])

  async function openDispute() {
    if (!escrowId) return
    await post('/opencash/disputes/open', { escrowId, playerId, reason })
    setReason('')
    await load()
  }

  async function addComment() {
    if (!selected || !message) return
    await post('/opencash/disputes/comment', { disputeId: selected, actor: 'player', message })
    setMessage('')
    await load()
  }

  async function escalate() {
    if (!selected) return
    await post('/opencash/disputes/status', { disputeId: selected, status: 'arbitration' })
    await load()
  }

  async function resolve() {
    if (!selected) return
    await post('/opencash/disputes/status', { disputeId: selected, status: 'resolved' })
    await load()
  }

  return (
    <div style={{ border: '1px solid #1f2937', borderRadius: 10, padding: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Disputes</div>
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Reason" value={reason} onChange={e => setReason(e.target.value)} />
          <button onClick={openDispute} disabled={!escrowId}>Open</button>
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          {list.length === 0 ? (
            <div style={{ color: '#9aa5b1' }}>no disputes</div>
          ) : (
            list.map(d => (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 8 }}>
                <div>{new Date(d.createdAt).toLocaleTimeString()}</div>
                <div>{d.status} • {d.reason}</div>
                <div>
                  <button onClick={() => setSelected(d.id)}>Select</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
          <button onClick={addComment} disabled={!selected}>Comment</button>
          <button onClick={escalate} disabled={!selected}>Escalate</button>
          <button onClick={resolve} disabled={!selected}>Resolve</button>
        </div>
      </div>
    </div>
  )
}
