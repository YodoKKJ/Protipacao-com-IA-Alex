import { describe, expect, it } from 'vitest'
import { NoteService, NoteValidationError, type Note, type NoteRepository } from './note'

class InMemoryNoteRepository implements NoteRepository {
  private notes: Note[] = []

  async list(): Promise<Note[]> {
    return [...this.notes].reverse()
  }

  async findById(id: string): Promise<Note | null> {
    return this.notes.find((note) => note.id === id) ?? null
  }

  async create(note: Omit<Note, 'number'>): Promise<Note> {
    const created = { ...note, number: this.notes.length + 1 }
    this.notes.push(created)
    return created
  }
}

function service() {
  return new NoteService(
    new InMemoryNoteRepository(),
    () => 'nota-1',
    () => '2026-11-17T12:00:00.000Z',
  )
}

describe('NoteService', () => {
  it('normaliza dados e guarda o emitente e a data no momento da emissão', async () => {
    const notes = service()
    const note = await notes.issue(
      { recipient: ' Ana ', description: ' Livro emprestado ', amountCents: 4590 },
      'Alex',
    )
    expect(note).toMatchObject({
      number: 1,
      issuerName: 'Alex',
      recipient: 'Ana',
      description: 'Livro emprestado',
      amountCents: 4590,
      issuedAt: '2026-11-17T12:00:00.000Z',
    })
    expect(await notes.findById(note.id)).toEqual(note)
  })

  it('recusa valores inválidos sem criar nota', async () => {
    const notes = service()
    await expect(
      notes.issue({ recipient: '', description: 'Livro', amountCents: 100 }, 'Alex'),
    ).rejects.toThrow(NoteValidationError)
    await expect(
      notes.issue({ recipient: 'Ana', description: ' ', amountCents: 100 }, 'Alex'),
    ).rejects.toThrow('Informe uma descrição')
    await expect(
      notes.issue({ recipient: 'Ana', description: 'Livro', amountCents: 10.5 }, 'Alex'),
    ).rejects.toThrow('Informe um valor')
    await expect(notes.list()).resolves.toEqual([])
  })
})
