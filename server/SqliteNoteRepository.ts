import type { Note, NoteRepository } from '../src/domain/note'
import type { AppDatabase } from './database'

type NoteRow = {
  id: string
  number: number
  issuer_name: string
  recipient: string
  description: string
  amount_cents: number
  issued_at: string
}

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    number: row.number,
    issuerName: row.issuer_name,
    recipient: row.recipient,
    description: row.description,
    amountCents: row.amount_cents,
    issuedAt: row.issued_at,
  }
}

/** A consulta e a numeração pertencem exclusivamente ao usuário autenticado. */
export class SqliteNoteRepository implements NoteRepository {
  constructor(
    private readonly database: AppDatabase,
    private readonly userId: string,
  ) {}

  async list(): Promise<Note[]> {
    return (
      this.database
        .prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY number DESC')
        .all(this.userId) as NoteRow[]
    ).map(toNote)
  }

  async findById(id: string): Promise<Note | null> {
    const row = this.database
      .prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
      .get(id, this.userId) as NoteRow | undefined
    return row ? toNote(row) : null
  }

  async create(note: Omit<Note, 'number'>): Promise<Note> {
    this.database.exec('BEGIN IMMEDIATE')
    try {
      const next = this.database
        .prepare('SELECT COALESCE(MAX(number), 0) + 1 AS number FROM notes WHERE user_id = ?')
        .get(this.userId) as { number: number }
      this.database
        .prepare(
          `INSERT INTO notes
          (id, user_id, number, issuer_name, recipient, description, amount_cents, issued_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          note.id,
          this.userId,
          next.number,
          note.issuerName,
          note.recipient,
          note.description,
          note.amountCents,
          note.issuedAt,
        )
      this.database.exec('COMMIT')
      return { ...note, number: next.number }
    } catch (error) {
      this.database.exec('ROLLBACK')
      throw error
    }
  }
}
