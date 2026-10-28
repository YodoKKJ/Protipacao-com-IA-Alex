import { Link } from 'react-router-dom'
import { History } from 'lucide-react'
import type { Loan } from '../domain/loan'
import { LoanCard } from '../components/LoanCard'
import { PageTitle } from '../components/PageTitle'

export function HistoryPage({ loans }: { loans: Loan[] }) {
  const returned = loans
    .filter((loan) => loan.returnedAt)
    .sort((a, b) => (b.returnedAt || '').localeCompare(a.returnedAt || ''))
  return (
    <div className="page page-enter">
      <div className="topline">
        <span>Seu espaço de empréstimos</span>
        <span className="topline-date">Histórico</span>
      </div>
      <PageTitle description="Objetos que já encontraram o caminho de volta.">Histórico</PageTitle>
      {returned.length ? (
        <div className="loan-list">
          {returned.map((loan, index) => (
            <LoanCard key={loan.id} loan={loan} index={index} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <History size={30} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h3>O histórico começa aqui</h3>
          <p>Quando um objeto for devolvido, ele aparecerá nesta página.</p>
          <Link to="/" className="button button--primary">
            Ver empréstimos
          </Link>
        </div>
      )}
    </div>
  )
}
