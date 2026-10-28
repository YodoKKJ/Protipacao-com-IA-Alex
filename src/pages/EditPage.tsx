import { useNavigate, useParams } from 'react-router-dom'
import type { Loan, LoanDraft } from '../domain/loan'
import { LoanForm } from '../components/LoanForm'
import { PageTitle } from '../components/PageTitle'
import { NotFound } from './NotFound'

export function EditPage({
  loans,
  onUpdate,
}: {
  loans: Loan[]
  onUpdate: (id: string, values: LoanDraft) => Promise<void>
}) {
  const { id } = useParams()
  const navigate = useNavigate()
  const loan = loans.find((item) => item.id === id)
  if (!loan) return <NotFound />
  return (
    <div className="page page-enter">
      <div className="topline">
        <span>Seu espaço de empréstimos</span>
        <span className="topline-date">Editar</span>
      </div>
      <PageTitle backTo={`/emprestimo/${loan.id}`} description="Atualize os detalhes que mudaram.">
        Editar empréstimo<span className="heading-period">.</span>
      </PageTitle>
      <LoanForm
        initial={loan}
        onSave={async (values) => {
          await onUpdate(loan.id, values)
          navigate(`/emprestimo/${loan.id}`)
        }}
      />
    </div>
  )
}
