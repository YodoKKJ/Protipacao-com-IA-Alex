import type { LoanRepository } from '../src/domain/LoanRepository'
import type { Loan } from '../src/domain/loan'
import type { AppDatabase } from './database'

type LoanRow = {
  id: string
  item: string
  person: string
  lent_at: string
  due_at: string
  note: string
  returned_at: string | null
}

function toLoan(row: LoanRow): Loan {
  return {
    id: row.id,
    item: row.item,
    person: row.person,
    lentAt: row.lent_at,
    dueAt: row.due_at,
    note: row.note,
    returnedAt: row.returned_at,
  }
}

/** O ID do usuário é fixado no construtor: toda consulta fica isolada por conta. */
export class SqliteLoanRepository implements LoanRepository {
  constructor(
    private readonly database: AppDatabase,
    private readonly userId: string,
  ) {}

  async list(): Promise<Loan[]> {
    const rows = this.database
      .prepare('SELECT * FROM loans WHERE user_id = ? ORDER BY created_at DESC, rowid DESC')
      .all(this.userId) as LoanRow[]
    return rows.map(toLoan)
  }

  async findById(id: string): Promise<Loan | null> {
    const row = this.database
      .prepare('SELECT * FROM loans WHERE id = ? AND user_id = ?')
      .get(id, this.userId) as LoanRow | undefined
    return row ? toLoan(row) : null
  }

  async create(loan: Loan): Promise<void> {
    this.database
      .prepare(
        `INSERT INTO loans
        (id, user_id, item, person, lent_at, due_at, note, returned_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        loan.id,
        this.userId,
        loan.item,
        loan.person,
        loan.lentAt,
        loan.dueAt,
        loan.note,
        loan.returnedAt,
        new Date().toISOString(),
      )
  }

  async update(loan: Loan): Promise<void> {
    this.database
      .prepare(
        `UPDATE loans SET item = ?, person = ?, lent_at = ?, due_at = ?,
        note = ?, returned_at = ? WHERE id = ? AND user_id = ?`,
      )
      .run(
        loan.item,
        loan.person,
        loan.lentAt,
        loan.dueAt,
        loan.note,
        loan.returnedAt,
        loan.id,
        this.userId,
      )
  }
}
