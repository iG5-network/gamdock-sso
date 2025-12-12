export type TxDirection = 'debit' | 'credit'

export type ITxRecord = {
  id: string
  playerId: string
  amount: number
  asset: string
  direction: TxDirection
  onchain: boolean
  createdAt: number
  sessionId?: string
}

export type IActivityRecord = {
  id: string
  playerId: string
  type: string
  payload?: unknown
  ts: number
}
