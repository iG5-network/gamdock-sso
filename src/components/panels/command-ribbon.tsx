type Props = {
  nickname: string
  email: string
  country: string
  asset: string
  amount: string
  direction: 'debit' | 'credit'
  onchain: boolean
  playerId: string
  setNickname: (v: string) => void
  setEmail: (v: string) => void
  setCountry: (v: string) => void
  setAsset: (v: string) => void
  setAmount: (v: string) => void
  setDirection: (v: 'debit' | 'credit') => void
  setOnchain: (v: boolean) => void
  setPlayerId: (v: string) => void
}

export default function CommandRibbon(props: Props) {
  return (
    <div className="header sticky">
      <div className="brand">
        <div className="title">iG5 SSO</div>
        <div className="subtitle">Web3 Ephemeral Wallet & Player Stack</div>
        <div className="form-row">
          <input placeholder="Nickname" value={props.nickname} onChange={e => props.setNickname(e.target.value)} />
          <input placeholder="Email" value={props.email} onChange={e => props.setEmail(e.target.value)} />
          <input placeholder="Country" value={props.country} onChange={e => props.setCountry(e.target.value)} />
        </div>
        <div className="form-row">
          <input placeholder="Asset" value={props.asset} onChange={e => props.setAsset(e.target.value)} />
          <input placeholder="Amount" value={props.amount} onChange={e => props.setAmount(e.target.value)} />
          <select value={props.direction} onChange={e => props.setDirection(e.target.value as 'debit' | 'credit')}>
            <option value="credit">credit</option>
            <option value="debit">debit</option>
          </select>
          <button className="secondary" onClick={() => props.setOnchain(!props.onchain)}>
            {props.onchain ? 'Onchain' : 'Offchain'}
          </button>
        </div>
      </div>
      <div className="actions">
        <input value={props.playerId} onChange={e => props.setPlayerId(e.target.value)} placeholder="player id" />
        <a href="#payments" className="secondary">Go to Payments</a>
      </div>
    </div>
  )
}
