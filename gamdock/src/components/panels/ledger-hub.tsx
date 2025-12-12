import type { ITxRecord } from '../../schema-core'

type Props = { txs: ITxRecord[]; txLoading: boolean; onAddTx: () => void }

export default function LedgerHub(props: Props) {
  return (
    <div className="panel" id="ledger">
      <div className="section-title">
        <div>Ledger</div>
        <div className="actions">
          <button className="secondary" onClick={props.onAddTx}>Add Tx</button>
        </div>
      </div>
      <div className="list">
        {props.txs.length === 0 ? (
          <div className="empty">no transactions</div>
        ) : (
          props.txs.map((t: ITxRecord) => (
            <div className="row" key={t.id}>
              <div>{t.asset}</div>
              <div>{t.amount}</div>
              <div><span className={`badge ${t.direction}`}>{t.direction}</span></div>
              <div><span className="tag">{t.onchain ? 'onchain' : 'offchain'}</span></div>
              <div>{new Date(t.createdAt).toLocaleTimeString()}</div>
            </div>
          ))
        )}
        {props.txLoading && <div className="spinner" />}
      </div>
    </div>
  )
}
