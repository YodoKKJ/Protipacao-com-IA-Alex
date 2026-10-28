import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { isLoanOverdue } from '../domain/loan'
import type { Loan } from '../domain/loan'
import { shortDate } from '../loanPresentation'
import { ItemVisual } from './ItemVisual'

export function LoanCard({ loan, index }: { loan: Loan; index: number }) {
  const isLate = isLoanOverdue(loan)
  return (
    <Link
      to={`/emprestimo/${loan.id}`}
      className="loan-card"
      style={{ animationDelay: `${Math.min(index, 5) * 55}ms` }}
    >
      <ItemVisual item={loan.item} />
      <span className="loan-card-main">
        <strong>{loan.item}</strong>
        <span>Com {loan.person}</span>
      </span>
      <span className="loan-card-side">
        <span
          className={`status-pill ${loan.returnedAt ? 'status-pill--done' : isLate ? 'status-pill--late' : ''}`}
        >
          {loan.returnedAt ? 'Devolvido' : isLate ? 'Prazo passou' : 'Em aberto'}
        </span>
        <small>{loan.returnedAt ? shortDate(loan.returnedAt) : shortDate(loan.lentAt)}</small>
      </span>
      <ChevronRight size={20} className="loan-chevron" aria-hidden="true" />
    </Link>
  )
}
