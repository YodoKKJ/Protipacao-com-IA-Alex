import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, Plus } from 'lucide-react'
import type { Note } from '../domain/note'
import { NoteApi } from '../infrastructure/NoteApi'
import { formatMoney, formatNoteDate, formatNoteNumber } from '../notePresentation'
import { PageTitle } from '../components/PageTitle'

const noteApi = new NoteApi()

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    noteApi
      .list()
      .then((items) => {
        if (active) setNotes(items)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="page page-enter">
      <div className="topline">
        <span>Seu espaço de empréstimos</span>
        <span className="topline-date">Notas simuladas</span>
      </div>
      <PageTitle description="Crie documentos demonstrativos para experimentar o fluxo de emissão.">
        Notas<span className="heading-period">.</span>
      </PageTitle>
      <div className="note-disclaimer" role="note">
        <FileText size={19} aria-hidden="true" />
        <span>
          Este módulo é apenas uma simulação. As notas não têm validade fiscal e não são enviadas à
          SEFAZ.
        </span>
      </div>
      <div className="notes-actions">
        <h2>
          Notas emitidas <span className="title-count">{notes.length}</span>
        </h2>
        <Link className="button button--primary" to="/notas/nova">
          <Plus size={18} /> Emitir nota simulada
        </Link>
      </div>
      {loading ? (
        <p className="note-feedback" role="status">
          Carregando notas...
        </p>
      ) : error ? (
        <p className="note-feedback" role="alert">
          Não foi possível carregar as notas. Atualize a página para tentar novamente.
        </p>
      ) : notes.length ? (
        <div className="note-list">
          {notes.map((note) => (
            <Link className="note-list-item" to={`/notas/${note.id}`} key={note.id}>
              <div className="note-list-icon">
                <FileText size={23} aria-hidden="true" />
              </div>
              <div className="note-list-copy">
                <strong>Nota {formatNoteNumber(note.number)}</strong>
                <span>
                  {note.recipient} · {formatNoteDate(note.issuedAt)}
                </span>
              </div>
              <b>{formatMoney(note.amountCents)}</b>
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={30} aria-hidden="true" />
          </div>
          <h3>Nenhuma nota por enquanto</h3>
          <p>Emita a primeira nota demonstrativa para testar o módulo.</p>
        </div>
      )}
    </div>
  )
}
