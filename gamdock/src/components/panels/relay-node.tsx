import type { IRelayResult } from '../../schema-core'

type Props = { relayResult: IRelayResult | null; onRelay: () => void }

export default function RelayNode(props: Props) {
  return (
    <div className="panel" id="relay">
      <div className="section-title">
        <div>Relay</div>
        <div className="actions">
          <button className="secondary" onClick={props.onRelay}>Relay Data</button>
        </div>
      </div>
      <div className="list">
        {props.relayResult ? (
          <div className="kv">
            <div className="label">Status</div>
            <div className="value">{props.relayResult.status}</div>
            <div className="label">Player</div>
            <div className="value">{props.relayResult.playerId}</div>
          </div>
        ) : (
          <div className="empty">no data</div>
        )}
      </div>
    </div>
  )
}
