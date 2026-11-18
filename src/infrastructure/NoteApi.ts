import type { Note, NoteDraft } from '../domain/note'
import { api } from './api'

export class NoteApi {
  async list(): Promise<Note[]> {
    return (await api<{ notes: Note[] }>('/notes')).notes
  }

  async findById(id: string): Promise<Note> {
    return (await api<{ note: Note }>(`/notes/${encodeURIComponent(id)}`)).note
  }

  async issue(draft: NoteDraft): Promise<Note> {
    return (
      await api<{ note: Note }>('/notes', {
        method: 'POST',
        body: JSON.stringify(draft),
      })
    ).note
  }
}
