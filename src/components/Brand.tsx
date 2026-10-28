import { Link } from 'react-router-dom'

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="EmprestaAí, ir para início">
      <span className="brand-mark">
        <span />
        <span />
      </span>
      <span>
        Empresta<span className="brand-accent">Aí</span>
      </span>
    </Link>
  )
}
