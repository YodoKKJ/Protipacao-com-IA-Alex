import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, CheckCircle2, Clock3 } from 'lucide-react'
import { isLoanOverdue } from '../domain/loan'
import type { Loan } from '../domain/loan'
import { formatDate } from '../loanPresentation'
import { ItemVisual } from '../components/ItemVisual'
import { PageTitle } from '../components/PageTitle'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { NotFound } from './NotFound'

export function DetailPage({
  loans,
  onReturn,
}: {
  loans: Loan[]
  onReturn: (id: string) => Promise<void>
}) {
  const { id } = useParams()
  const [confirming, setConfirming] = useState(false)
  const loan = loans.find((item) => item.id === id)
  if (!loan) return <NotFound />
  const isLate = isLoanOverdue(loan)
  return (
    <div className="page page-enter">
      <div className="topline">
        <span>Seu espaço de empréstimos</span>
        <span className="topline-date">Detalhes</span>
      </div>
      <PageTitle
        backTo={loan.returnedAt ? '/historico' : '/'}
        description="Tudo que você precisa lembrar sobre este objeto."
      >
        Detalhes<span className="heading-period">.</span>
      </PageTitle>
      <div className="detail-layout">
        <section className="detail-main">
          <div className="detail-object">
            <ItemVisual item={loan.item} large />
            <div>
              <span
                className={`status-pill ${loan.returnedAt ? 'status-pill--done' : isLate ? 'status-pill--late' : ''}`}
              >
                {loan.returnedAt ? 'Devolvido' : isLate ? 'Prazo passou' : 'Em aberto'}
              </span>
              <h2>{loan.item}</h2>
              <p>{loan.returnedAt ? 'Já está de volta com você.' : `Está com ${loan.person}.`}</p>
            </div>
          </div>
          <div className="detail-facts">
            <div>
              <span>Pessoa</span>
              <strong>{loan.person}</strong>
            </div>
            <div>
              <span>Emprestado em</span>
              <strong>{formatDate(loan.lentAt)}</strong>
            </div>
            <div>
              <span>Devolução prevista</span>
              <strong>{formatDate(loan.dueAt)}</strong>
            </div>
            {loan.returnedAt && (
              <div>
                <span>Devolvido em</span>
                <strong>{formatDate(loan.returnedAt)}</strong>
              </div>
            )}
          </div>
          {loan.note && (
            <div className="detail-note">
              <span>Observação</span>
              <p>{loan.note}</p>
            </div>
          )}
        </section>
        <aside className="detail-aside">
          <div className="aside-icon">
            {loan.returnedAt ? (
              <CheckCircle2 size={24} aria-hidden="true" />
            ) : (
              <Clock3 size={24} aria-hidden="true" />
            )}
          </div>
          <h3>{loan.returnedAt ? 'De volta ao seu lugar.' : 'Acompanhando para você.'}</h3>
          <p>
            {loan.returnedAt
              ? 'Este empréstimo foi concluído e ficará guardado no histórico.'
              : 'Quando o objeto voltar, confirme a devolução para manter tudo atualizado.'}
          </p>
          {!loan.returnedAt && (
            <>
              <button
                className="button button--primary button--full"
                onClick={() => setConfirming(true)}
              >
                <Check size={18} aria-hidden="true" /> Marcar como devolvido
              </button>
              <Link
                className="button button--quiet button--full"
                to={`/emprestimo/${loan.id}/editar`}
              >
                Editar detalhes
              </Link>
            </>
          )}
        </aside>
      </div>
      {confirming && (
        <ConfirmDialog
          item={loan.item}
          onClose={() => setConfirming(false)}
          onConfirm={async () => {
            await onReturn(loan.id)
            setConfirming(false)
          }}
        />
      )}
    </div>
  )
}
