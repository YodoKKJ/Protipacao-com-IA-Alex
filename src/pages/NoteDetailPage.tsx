import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import type { Note } from '../domain/note'
import { NoteApi } from '../infrastructure/NoteApi'
import { formatMoney, formatNoteDate, formatNoteNumber } from '../notePresentation'
import { FiscalDanfe } from '../components/FiscalDanfe'

const noteApi = new NoteApi()

export function NoteDetailPage() {
  const { id } = useParams()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!id) return
    noteApi
      .findById(id)
      .then((item) => {
        if (active) setNote(item)
      })
      .catch((cause) => {
        if (active)
          setError(cause instanceof Error ? cause.message : 'Não foi possível abrir a nota.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  if (loading)
    return (
      <div className="page note-feedback" role="status">
        Carregando nota...
      </div>
    )
  if (error || !note)
    return (
      <div className="page note-feedback" role="alert">
        <p>{error || 'Nota não encontrada.'}</p>
        <Link to="/notas">Voltar às notas</Link>
      </div>
    )

  return (
    <div className="page page-enter note-detail-page">
      <div className="note-detail-actions">
        <Link className="back-link" to="/notas">
          <ArrowLeft size={18} /> Voltar às notas
        </Link>
        <button className="button button--primary" onClick={() => window.print()}>
          <Printer size={18} /> Imprimir ou salvar em PDF
        </button>
      </div>
      {note.fiscal ? (
        <FiscalDanfe note={note} />
      ) : (
        <article className="note-document" aria-labelledby="note-document-title">
          <div className="note-document-top">
            <span className="note-document-brand">
              Empresta<span>Aí</span>
            </span>
            <span className="note-document-status">SIMULAÇÃO</span>
          </div>
          <div className="note-document-heading">
            <div>
              <p className="note-document-overline">DOCUMENTO DE DEMONSTRAÇÃO</p>
              <h1 id="note-document-title">Nota {formatNoteNumber(note.number)}</h1>
              <p>Emitida em {formatNoteDate(note.issuedAt)}</p>
            </div>
            <div className="note-document-number">#{formatNoteNumber(note.number)}</div>
          </div>
          <div className="note-document-parties">
            <div>
              <span>EMITENTE</span>
              <strong>{note.issuerName}</strong>
            </div>
            <div>
              <span>DESTINATÁRIO</span>
              <strong>{note.recipient}</strong>
            </div>
          </div>
          <div className="note-document-line">
            <div>
              <span>DESCRIÇÃO</span>
              <p>{note.description}</p>
            </div>
            <strong>{formatMoney(note.amountCents)}</strong>
          </div>
          <div className="note-document-total">
            <span>Valor demonstrativo</span>
            <strong>{formatMoney(note.amountCents)}</strong>
          </div>
          <div className="note-document-warning">
            Esta nota é fictícia, não tem validade fiscal e não foi transmitida à SEFAZ.
          </div>
        </article>
      )}
    </div>
  )
}
