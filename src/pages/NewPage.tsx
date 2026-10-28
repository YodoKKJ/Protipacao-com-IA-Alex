import { useNavigate } from 'react-router-dom'
import type { LoanDraft } from '../domain/loan'
import { LoanForm } from '../components/LoanForm'
import { PageTitle } from '../components/PageTitle'

export function NewPage({ onCreate }: { onCreate: (values: LoanDraft) => Promise<string> }) {
  const navigate = useNavigate()
  return (
    <div className="page page-enter">
      <div className="topline">
        <span>Seu espaço de empréstimos</span>
        <span className="topline-date">Novo empréstimo</span>
      </div>
      <PageTitle
        backTo="/"
        description="Um registro rápido para você não precisar confiar na memória."
      >
        Novo empréstimo<span className="heading-period">.</span>
      </PageTitle>
      <LoanForm onSave={async (values) => navigate(`/emprestimo/${await onCreate(values)}`)} />
    </div>
  )
}
