export type IProfile = {
  playerId: string
  nickname?: string
  email?: string
  country?: string
  kycLevel?: string
  wallets?: string[]
  reputation?: number
  entitlements?: Record<string, string[]>
  inventory?: string[]
  updatedAt: number
}

export type ITxRecord = {
  id: string
  playerId: string
  amount: number
  asset: string
  direction: 'debit' | 'credit'
  onchain: boolean
  createdAt: number
  sessionId?: string
}

export type IRelayResult = {
  status: string
  playerId: string
  data?: { event?: string; ts?: number }
}

export type IActivityRecord = {
  id: string
  playerId: string
  type: string
  payload?: unknown
  ts: number
}
