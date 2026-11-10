import express, { type ErrorRequestHandler, type RequestHandler } from 'express'
import cookieParser from 'cookie-parser'
import { resolve } from 'node:path'
import { LoanService, LoanValidationError } from '../src/domain/LoanService'
import type { LoanDraft } from '../src/domain/loan'
import { AuthError, AuthService, sessionMaxAge, type User } from './AuthService'
import { SqliteLoanRepository } from './SqliteLoanRepository'
import type { AppDatabase } from './database'

const COOKIE_NAME = 'emprestaai_session'

function draftFrom(body: unknown): LoanDraft {
  if (!body || typeof body !== 'object')
    throw new LoanValidationError('Dados do empréstimo inválidos.')
  const values = body as Record<string, unknown>
  for (const field of ['item', 'person', 'lentAt', 'dueAt', 'note']) {
    if (typeof values[field] !== 'string') throw new LoanValidationError(`Campo ${field} inválido.`)
  }
  return values as unknown as LoanDraft
}

function credentialsFrom(body: unknown): { email: string; password: string; name: string } {
  if (!body || typeof body !== 'object') throw new AuthError('Dados inválidos.')
  const values = body as Record<string, unknown>
  return {
    email: typeof values.email === 'string' ? values.email : '',
    password: typeof values.password === 'string' ? values.password : '',
    name: typeof values.name === 'string' ? values.name : '',
  }
}

export function createApp(database: AppDatabase) {
  const app = express()
  const auth = new AuthService(database)
  app.disable('x-powered-by')
  app.use(express.json({ limit: '16kb' }))
  app.use(cookieParser())

  const sessionCookie = {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: sessionMaxAge,
    path: '/',
  }

  // Requisições mutáveis devem vir da mesma origem do app.
  app.use('/api', (request, _response, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const origin = request.get('origin')
      const host = request.get('host')
      if (origin && new URL(origin).host !== host)
        return next(new AuthError('Origem não permitida.', 403))
    }
    next()
  })

  app.post('/api/auth/register', async (request, response) => {
    const user = await auth.register(credentialsFrom(request.body))
    response
      .cookie(COOKIE_NAME, auth.createSession(user.id), sessionCookie)
      .status(201)
      .json({ user })
  })

  app.post('/api/auth/login', async (request, response) => {
    const user = await auth.login(credentialsFrom(request.body))
    response.cookie(COOKIE_NAME, auth.createSession(user.id), sessionCookie).json({ user })
  })

  app.post('/api/auth/logout', (request, response) => {
    auth.endSession(request.cookies[COOKIE_NAME])
    response.clearCookie(COOKIE_NAME, { path: '/' }).status(204).end()
  })

  app.get('/api/auth/me', (request, response) => {
    const user = auth.getUser(request.cookies[COOKIE_NAME])
    if (!user) throw new AuthError('Faça login para continuar.', 401)
    response.json({ user })
  })

  const requireUser: RequestHandler = (request, response, next) => {
    const user = auth.getUser(request.cookies[COOKIE_NAME])
    if (!user) return next(new AuthError('Faça login para continuar.', 401))
    response.locals.user = user
    next()
  }
  app.use('/api/loans', requireUser)
  const serviceFor = (user: User) => new LoanService(new SqliteLoanRepository(database, user.id))

  app.get('/api/loans', async (_request, response) => {
    response.json({ loans: await serviceFor(response.locals.user as User).list() })
  })
  app.get('/api/loans/:id', async (request, response) => {
    const loan = await new SqliteLoanRepository(
      database,
      (response.locals.user as User).id,
    ).findById(request.params.id as string)
    if (!loan) throw new LoanValidationError('Empréstimo não encontrado.')
    response.json({ loan })
  })
  app.post('/api/loans', async (request, response) => {
    const loan = await serviceFor(response.locals.user as User).create(draftFrom(request.body))
    response.status(201).json({ loan })
  })
  app.put('/api/loans/:id', async (request, response) => {
    const loan = await serviceFor(response.locals.user as User).update(
      request.params.id as string,
      draftFrom(request.body),
    )
    response.json({ loan })
  })
  app.post('/api/loans/:id/return', async (request, response) => {
    const loan = await serviceFor(response.locals.user as User).markReturned(
      request.params.id as string,
    )
    response.json({ loan })
  })

  app.use('/api', (_request, response) =>
    response.status(404).json({ error: 'Rota não encontrada.' }),
  )
  const dist = resolve('dist')
  app.use(express.static(dist))
  app.get('/{*path}', (_request, response) => response.sendFile(resolve(dist, 'index.html')))

  const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
    if (error instanceof AuthError)
      return void response.status(error.status).json({ error: error.message })
    if (error instanceof LoanValidationError) {
      const status = error.message === 'Empréstimo não encontrado.' ? 404 : 422
      return void response.status(status).json({ error: error.message })
    }
    if (error instanceof SyntaxError && 'body' in error)
      return void response.status(400).json({ error: 'JSON inválido.' })
    console.error(error)
    response.status(500).json({ error: 'Erro interno do servidor.' })
  }
  app.use(errorHandler)
  return app
}
