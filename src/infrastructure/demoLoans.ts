import type { Loan } from '../domain/loan'

export const demoLoans: Loan[] = [
  {
    id: 'livro-pequeno-principe',
    item: 'O pequeno príncipe',
    person: 'Ana',
    lentAt: '2026-10-12',
    dueAt: '',
    note: 'Edição de capa dura.',
    returnedAt: null,
  },
  {
    id: 'furadeira',
    item: 'Furadeira',
    person: 'Bruno',
    lentAt: '2026-10-18',
    dueAt: '2026-11-02',
    note: 'Com a maleta e duas brocas.',
    returnedAt: null,
  },
  {
    id: 'camera',
    item: 'Câmera instantânea',
    person: 'Lia',
    lentAt: '2026-09-08',
    dueAt: '',
    note: '',
    returnedAt: '2026-09-15',
  },
]
