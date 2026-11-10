import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Server } from 'node:http'
import { createApp } from './app'
import { openDatabase, type AppDatabase } from './database'

let server: Server | undefined
let database: AppDatabase | undefined
let directory: string | undefined

afterEach(async () => {
  if (server) await new Promise<void>((resolve) => server!.close(() => resolve()))
  database?.close()
  if (directory) rmSync(directory, { recursive: true, force: true })
  server = undefined
  database = undefined
  directory = undefined
})

async function start() {
  directory = mkdtempSync(join(tmpdir(), 'emprestaai-test-'))
  database = openDatabase(join(directory, 'test.sqlite'))
  server = createApp(database).listen(0)
  await new Promise<void>((resolve) => server!.once('listening', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Porta indisponível')
  const base = `http://127.0.0.1:${address.port}`
  async function request(path: string, method = 'GET', body?: unknown, cookie?: string) {
    const response = await fetch(`${base}/api${path}`, {
      method,
      headers: { ...(cookie ? { Cookie: cookie } : {}), 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const data = response.status === 204 ? null : await response.json()
    return {
      status: response.status,
      data,
      cookie: response.headers.get('set-cookie')?.split(';')[0],
    }
  }
  return request
}

const draft = {
  item: 'Livro',
  person: 'Ana',
  lentAt: '2026-11-10',
  dueAt: '2026-11-20',
  note: 'Capa azul',
}

describe('API do EmprestaAí', () => {
  it('exige sessão, valida entradas e executa o ciclo completo do empréstimo', async () => {
    const request = await start()
    expect((await request('/loans')).status).toBe(401)
    expect(
      (await request('/auth/register', 'POST', { name: 'Alex', email: 'x', password: '123' }))
        .status,
    ).toBe(400)

    const registration = await request('/auth/register', 'POST', {
      name: 'Alex',
      email: 'alex@example.com',
      password: 'senha-forte-123',
    })
    expect(registration.status).toBe(201)
    const cookie = registration.cookie!
    expect(cookie).toMatch(/^emprestaai_session=/)
    expect((await request('/loans', 'GET', undefined, cookie)).data.loans).toEqual([])

    expect(
      (await request('/loans', 'POST', { ...draft, dueAt: '2026-11-01' }, cookie)).status,
    ).toBe(422)
    const created = await request('/loans', 'POST', draft, cookie)
    expect(created.status).toBe(201)
    const id = created.data.loan.id as string
    expect((await request(`/loans/${id}`, 'GET', undefined, cookie)).data.loan.item).toBe('Livro')
    expect(
      (await request(`/loans/${id}`, 'PUT', { ...draft, item: 'Livro atualizado' }, cookie)).data
        .loan.item,
    ).toBe('Livro atualizado')
    const returned = await request(`/loans/${id}/return`, 'POST', undefined, cookie)
    expect(returned.data.loan.returnedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(
      (await request(`/loans/${id}/return`, 'POST', undefined, cookie)).data.loan.returnedAt,
    ).toBe(returned.data.loan.returnedAt)
    expect((await request(`/loans/${id}`, 'PUT', draft, cookie)).status).toBe(422)
  })

  it('isola contas, mantém dados no SQLite e invalida a sessão ao sair', async () => {
    const request = await start()
    const first = await request('/auth/register', 'POST', {
      name: 'Alex',
      email: 'alex@example.com',
      password: 'senha-forte-123',
    })
    const second = await request('/auth/register', 'POST', {
      name: 'Bia',
      email: 'bia@example.com',
      password: 'senha-forte-123',
    })
    const firstCookie = first.cookie!
    const secondCookie = second.cookie!
    const created = await request('/loans', 'POST', draft, firstCookie)
    const id = created.data.loan.id as string
    expect((await request('/loans', 'GET', undefined, secondCookie)).data.loans).toEqual([])
    expect((await request(`/loans/${id}`, 'GET', undefined, secondCookie)).status).toBe(404)
    expect((await request(`/loans/${id}/return`, 'POST', undefined, secondCookie)).status).toBe(404)

    const login = await request('/auth/login', 'POST', {
      email: 'alex@example.com',
      password: 'senha-forte-123',
    })
    expect(login.status).toBe(200)
    expect((await request('/loans', 'GET', undefined, login.cookie!)).data.loans).toHaveLength(1)
    expect((await request('/auth/logout', 'POST', undefined, login.cookie!)).status).toBe(204)
    expect((await request('/loans', 'GET', undefined, login.cookie!)).status).toBe(401)

    const path = join(directory!, 'test.sqlite')
    database!.close()
    database = openDatabase(path)
    expect(database.prepare('SELECT count(*) AS total FROM loans').get()).toMatchObject({
      total: 1,
    })
  })
})
