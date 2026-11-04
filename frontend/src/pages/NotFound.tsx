import { useNavigate } from 'react-router-dom'
import { Button } from '../components'
import './NotFound.css'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="not-found">
      <div className="not-found__tile">404</div>
      <h1 className="not-found__title">Page not found</h1>
      <p className="not-found__subtitle">The page you're looking for doesn't exist or was moved.</p>
      <Button variant="filled" onClick={() => navigate('/')}>
        Back to dashboard
      </Button>
    </div>
  )
}
