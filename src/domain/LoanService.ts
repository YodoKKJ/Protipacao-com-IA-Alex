import type { LoanRepository } from './LoanRepository'
import { todayISO } from './loan'
import type { Loan, LoanDraft } from './loan'

export class LoanValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LoanValidationError'
  }
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}

/** Regras do empréstimo independentes de React e do tipo de armazenamento. */
export class LoanService {
  constructor(
    private readonly repository: LoanRepository,
    private readonly currentDate: () => string = todayISO,
    private readonly newId: () => string = () => crypto.randomUUID(),
  ) {}

  async list(): Promise<Loan[]> {
    return this.repository.list()
  }

  async create(draft: LoanDraft): Promise<Loan> {
    const values = this.validate(draft)
    const loan: Loan = { id: this.newId(), ...values, returnedAt: null }
    await this.repository.create(loan)
    return loan
  }

  async update(id: string, draft: LoanDraft): Promise<Loan> {
    const existing = await this.findOrThrow(id)
    if (existing.returnedAt) {
      throw new LoanValidationError('Um empréstimo devolvido não pode ser editado.')
    }
    const updated: Loan = { ...existing, ...this.validate(draft) }
    await this.repository.update(updated)
    return updated
  }

  async markReturned(id: string): Promise<Loan> {
    const existing = await this.findOrThrow(id)
    if (existing.returnedAt) return existing
    const updated: Loan = { ...existing, returnedAt: this.currentDate() }
    await this.repository.update(updated)
    return updated
  }

  private async findOrThrow(id: string): Promise<Loan> {
    const loan = await this.repository.findById(id)
    if (!loan) throw new LoanValidationError('Empréstimo não encontrado.')
    return loan
  }

  private validate(draft: LoanDraft): LoanDraft {
    const item = draft.item.trim()
    const person = draft.person.trim()
    const note = draft.note.trim()
    if (!item) throw new LoanValidationError('Informe o objeto emprestado.')
    if (!person) throw new LoanValidationError('Informe quem recebeu o objeto.')
    if (!isValidDate(draft.lentAt)) {
      throw new LoanValidationError('Informe uma data de empréstimo válida.')
    }
    if (draft.dueAt && !isValidDate(draft.dueAt)) {
      throw new LoanValidationError('Informe uma previsão de devolução válida.')
    }
    if (draft.dueAt && draft.dueAt < draft.lentAt) {
      throw new LoanValidationError('A previsão não pode ser anterior ao empréstimo.')
    }
    return { item, person, note, lentAt: draft.lentAt, dueAt: draft.dueAt }
  }
}
