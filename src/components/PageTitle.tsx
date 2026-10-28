import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function PageTitle({
  backTo,
  children,
  description,
}: {
  backTo?: string
  children: ReactNode
  description?: string
}) {
  return (
    <div className="page-heading">
      {backTo && (
        <Link to={backTo} className="back-link">
          <ArrowLeft size={18} aria-hidden="true" /> Voltar
        </Link>
      )}
      <h1>{children}</h1>
      {description && <p>{description}</p>}
    </div>
  )
}
