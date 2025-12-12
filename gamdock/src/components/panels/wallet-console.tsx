type Props = {
  status: string
  address: string | null
  sessionHandle: string | null
  network: 'evm' | 'solana' | null
  token: string | null
  showToken: boolean
  onConnect: (provider: 'evm' | 'phantom') => void
  onLogin: () => void
  onLinkWallet: () => void
  onIncReputation: () => void
  onToggleToken: () => void
  short: (v?: string | null) => string
}

export default function WalletConsole(props: Props) {
  return (
    <div className="panel" id="wallet">
      <div className="section-title">
        <div>Wallet Connect</div>
        <div className="actions">
          <button className="secondary" onClick={() => props.onConnect('evm')}>MetaMask</button>
          <button className="secondary" onClick={() => props.onConnect('phantom')}>Phantom</button>
          <button className="primary" disabled={!props.sessionHandle} onClick={props.onLogin}>Login</button>
        </div>
      </div>
      <div className="status">
        <div className="item">status: {props.status}</div>
        <div className="item">address: {props.short(props.address)}</div>
        <div className="item">session: {props.sessionHandle ? props.short(props.sessionHandle) : ''}</div>
        <div className="item">token: {props.token ? `${props.token.slice(0, 24)}…` : ''}</div>
      </div>
      <div className="progress">
        <div className="bar" style={{ width: props.status === 'connected' ? '100%' : props.status === 'connecting' ? '50%' : '10%' }} />
      </div>
      <div className="actions">
        <button className="secondary" disabled={!props.address} onClick={props.onLinkWallet}>Link Wallet</button>
        <button className="secondary" onClick={props.onIncReputation}>Reputation +1</button>
      </div>
      {props.token && (
        <div className="actions">
          <button className="secondary" onClick={props.onToggleToken}>{props.showToken ? 'Hide JWT' : 'Show JWT'}</button>
        </div>
      )}
      {props.token && props.showToken && <div className="token">{props.token}</div>}
    </div>
  )
}
