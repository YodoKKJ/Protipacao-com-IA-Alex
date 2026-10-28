import { describe, expect, it } from 'vitest'
import { LoanService, LoanValidationError } from './LoanService'
import type { LoanRepository } from './LoanRepository'
import type { Loan, LoanDraft } from './loan'

class InMemoryLoanRepository implements LoanRepository {
  constructor(private loans: Loan[] = []) {}

  async list(): Promise<Loan[]> {
    return [...this.loans]
  }

  async findById(id: string): Promise<Loan | null> {
    return this.loans.find((loan) => loan.id === id) ?? null
  }

  async create(loan: Loan): Promise<void> {
    this.loans = [loan, ...this.loans]
  }

  async update(updated: Loan): Promise<void> {
    this.loans = this.loans.map((loan) => (loan.id === updated.id ? updated : loan))
  }
}

const draft: LoanDraft = {
  item: ' Livro ',
  person: ' Ana ',
  lentAt: '2026-10-27',
  dueAt: '2026-11-03',
  note: ' Capa dura ',
}

function createService(repository = new InMemoryLoanRepository()) {
  return new LoanService(
    repository,
    () => '2026-11-03',
    () => 'loan-1',
  )
}

describe('LoanService', () => {
  it('cria um empréstimo normalizado e o coloca no início da lista', async () => {
    const service = createService()
    const loan = await service.create(draft)

    expect(loan).toMatchObject({
      id: 'loan-1',
      item: 'Livro',
      person: 'Ana',
      note: 'Capa dura',
      returnedAt: null,
    })
    expect((await service.list())[0]).toEqual(loan)
  })

  it('impede dados incompletos e prazo anterior ao empréstimo', async () => {
    const service = createService()

    await expect(service.create({ ...draft, item: ' ' })).rejects.toThrow(LoanValidationError)
    await expect(service.create({ ...draft, person: '' })).rejects.toThrow(LoanValidationError)
    await expect(service.create({ ...draft, lentAt: '2026-02-31' })).rejects.toThrow(
      'Informe uma data de empréstimo válida.',
    )
    await expect(service.create({ ...draft, dueAt: '2026-10-20' })).rejects.toThrow(
      'A previsão não pode ser anterior ao empréstimo.',
    )
    expect(await service.list()).toHaveLength(0)
  })

  it('registra a devolução uma vez e não permite editar um empréstimo concluído', async () => {
    const service = createService()
    await service.create(draft)

    expect((await service.markReturned('loan-1')).returnedAt).toBe('2026-11-03')
    expect((await service.markReturned('loan-1')).returnedAt).toBe('2026-11-03')
    await expect(service.update('loan-1', draft)).rejects.toThrow(
      'Um empréstimo devolvido não pode ser editado.',
    )
  })

  it('não modifica a lista ao tentar atualizar um ID desconhecido', async () => {
    const service = createService()
    await service.create(draft)

    await expect(service.update('inexistente', draft)).rejects.toThrow('Empréstimo não encontrado.')
    expect(await service.list()).toHaveLength(1)
  })
})
