import {
  prepareFiscalDetails,
  type FiscalDetails,
  type FiscalDraft,
  FiscalValidationError,
} from './fiscal'

export interface Note {
  id: string
  number: number
  issuerName: string
  recipient: string
  description: string
  amountCents: number
  issuedAt: string
  fiscal: FiscalDetails | null
}

export type NoteDraft = Pick<Note, 'recipient' | 'description' | 'amountCents'> & {
  fiscal?: FiscalDraft
}

export interface NoteRepository {
  list(): Promise<Note[]>
  findById(id: string): Promise<Note | null>
  create(note: Omit<Note, 'number'>): Promise<Note>
}

export class NoteValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NoteValidationError'
  }
}

/** Emite documentos demonstrativos; não produz NF-e nem identificadores fiscais. */
export class NoteService {
  constructor(
    private readonly repository: NoteRepository,
    private readonly newId: () => string = () => crypto.randomUUID(),
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  list(): Promise<Note[]> {
    return this.repository.list()
  }

  findById(id: string): Promise<Note | null> {
    return this.repository.findById(id)
  }

  async issue(draft: NoteDraft, issuerName: string): Promise<Note> {
    const recipient = draft.recipient?.trim()
    const description = draft.description?.trim()
    if (!recipient || recipient.length > 120) {
      throw new NoteValidationError('Informe um destinatário de até 120 caracteres.')
    }
    if (!description || description.length > 500) {
      throw new NoteValidationError('Informe uma descrição de até 500 caracteres.')
    }
    let fiscal: FiscalDetails | null = null
    try {
      if (draft.fiscal) fiscal = prepareFiscalDetails(draft.fiscal)
    } catch (error) {
      if (error instanceof FiscalValidationError) throw new NoteValidationError(error.message)
      throw error
    }
    const amountCents = fiscal?.totalCents ?? draft.amountCents
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0 || amountCents > 10_000_000_000) {
      throw new NoteValidationError('Informe um valor maior que zero e de até R$ 100 milhões.')
    }
    return this.repository.create({
      id: this.newId(),
      issuerName,
      recipient,
      description,
      amountCents,
      issuedAt: this.now(),
      fiscal,
    })
  }
}
