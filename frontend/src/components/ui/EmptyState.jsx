export default function EmptyState({ title = 'Nothing here yet', description, action }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3>{title}</h3>
      {description && <p className="note">{description}</p>}
      {action}
    </div>
  )
}


