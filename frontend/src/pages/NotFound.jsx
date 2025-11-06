import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h2>Page not found</h2>
      <p className="note">The page you are looking for doesn’t exist.</p>
      <Link to="/programs" className="btn">Back to Programs</Link>
    </div>
  )
}


