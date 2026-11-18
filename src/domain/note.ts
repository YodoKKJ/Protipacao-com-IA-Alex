export interface Note {
  id: string
  number: number
  issuerName: string
  recipient: string
  description: string
  amountCents: number
  issuedAt: string
}

export type NoteDraft = Pick<Note, 'recipient' | 'description' | 'amountCents'>

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
    if (
      !Number.isSafeInteger(draft.amountCents) ||
      draft.amountCents <= 0 ||
      draft.amountCents > 100_000_000_00
    ) {
      throw new NoteValidationError('Informe um valor maior que zero e de até R$ 100 milhões.')
    }
    return this.repository.create({
      id: this.newId(),
      issuerName,
      recipient,
      description,
      amountCents: draft.amountCents,
      issuedAt: this.now(),
    })
  }
}
