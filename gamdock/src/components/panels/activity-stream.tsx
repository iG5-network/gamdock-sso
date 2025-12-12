import type { IActivityRecord } from '../../schema-core'

type Props = {
  activities: IActivityRecord[]
  activityType: string
  setActivityType: (v: string) => void
  onAddActivity: () => void
}

export default function ActivityStream(props: Props) {
  return (
    <div className="panel" id="activity">
      <div className="section-title">
        <div>Activity</div>
        <div className="actions">
          <input placeholder="type" value={props.activityType} onChange={e => props.setActivityType(e.target.value)} />
          <button className="secondary" onClick={props.onAddActivity}>Add Activity</button>
        </div>
      </div>
      <div className="list">
        {props.activities.length === 0 ? (
          <div className="empty">no activity</div>
        ) : (
          props.activities.map(a => (
            <div className="row" key={a.id}>
              <div>{a.type}</div>
              <div>{new Date(a.ts).toLocaleTimeString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
