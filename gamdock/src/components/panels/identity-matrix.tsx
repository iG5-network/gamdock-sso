import type { IProfile } from '../../schema-core'

type Props = {
  profile: IProfile | null
  invItem: string
  profileLoading: boolean
  onUpsert: () => void
  onLoad: () => void
  onAddInventory: () => void
  onRemoveInventory: () => void
  setInvItem: (v: string) => void
}

export default function IdentityMatrix(props: Props) {
  return (
    <div className="panel" id="profile">
      <div className="section-title">
        <div>Profile</div>
        <div className="actions">
          <button className="secondary" onClick={props.onUpsert}>Upsert</button>
          <button className="secondary" onClick={props.onLoad}>Load</button>
          <input placeholder="Inventory item" value={props.invItem} onChange={e => props.setInvItem(e.target.value)} />
          <button className="secondary" onClick={props.onAddInventory}>Add</button>
          <button className="secondary" onClick={props.onRemoveInventory}>Remove</button>
        </div>
      </div>
      <div className="list">
        {props.profile ? (
          <div className="kv">
            <div className="label">Player</div>
            <div className="value">{props.profile.playerId}</div>
            <div className="label">Nickname</div>
            <div className="value">{props.profile.nickname || 'N/A'}</div>
            <div className="label">Email</div>
            <div className="value">{props.profile.email || 'N/A'}</div>
            <div className="label">Country</div>
            <div className="value">{props.profile.country || 'N/A'}</div>
            <div className="label">KYC</div>
            <div className="value">{props.profile.kycLevel || '—'}</div>
            <div className="label">Reputation</div>
            <div className="value">{props.profile.reputation ?? 0}</div>
            <div className="label">Wallets</div>
            <div className="value truncate">{(props.profile.wallets || []).join(', ') || '—'}</div>
            <div className="label">Inventory</div>
            <div className="value truncate">{(props.profile.inventory || []).join(', ') || '—'}</div>
            <div className="label">Updated</div>
            <div className="value">{new Date(props.profile.updatedAt).toLocaleString()}</div>
          </div>
        ) : (
          <div className="empty">no profile</div>
        )}
        {props.profileLoading && (
          <div className="row">
            <div className="skeleton" style={{ width: '40%' }} />
            <div className="skeleton" style={{ width: '60%' }} />
          </div>
        )}
      </div>
    </div>
  )
}
