import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto'
import { promisify } from 'node:util'
import type { AppDatabase } from './database'

const scrypt = promisify(scryptCallback)
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000

export interface User {
  id: string
  name: string
  email: string
}

type UserRow = User & { password_hash: string }

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export class AuthService {
  constructor(private readonly database: AppDatabase) {}

  async register(input: { name: string; email: string; password: string }): Promise<User> {
    const name = input.name?.trim()
    const email = input.email?.trim().toLowerCase()
    if (!name || name.length > 100) throw new AuthError('Informe um nome de até 100 caracteres.')
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AuthError('Informe um e-mail válido.')
    }
    if (
      typeof input.password !== 'string' ||
      input.password.length < 8 ||
      input.password.length > 128
    ) {
      throw new AuthError('A senha deve ter entre 8 e 128 caracteres.')
    }
    const existing = this.database.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) throw new AuthError('Este e-mail já está cadastrado.', 409)
    const salt = randomBytes(16).toString('hex')
    const hash = (await scrypt(input.password, salt, 64)) as Buffer
    const user: User = { id: randomUUID(), name, email }
    this.database
      .prepare(
        'INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .run(user.id, name, email, `${salt}:${hash.toString('hex')}`, new Date().toISOString())
    return user
  }

  async login(input: { email: string; password: string }): Promise<User> {
    const email = input.email?.trim().toLowerCase()
    const row = this.database.prepare('SELECT * FROM users WHERE email = ?').get(email) as
      UserRow | undefined
    if (!row || typeof input.password !== 'string') {
      throw new AuthError('E-mail ou senha incorretos.', 401)
    }
    const [salt, expectedHex] = row.password_hash.split(':')
    const actual = (await scrypt(input.password, salt, 64)) as Buffer
    const expected = Buffer.from(expectedHex, 'hex')
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      throw new AuthError('E-mail ou senha incorretos.', 401)
    }
    return { id: row.id, name: row.name, email: row.email }
  }

  createSession(userId: string): string {
    const token = randomBytes(32).toString('base64url')
    this.database
      .prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
      .run(tokenHash(token), userId, Date.now() + SESSION_DURATION_MS)
    return token
  }

  getUser(token: string | undefined): User | null {
    if (!token) return null
    const user = this.database
      .prepare(
        `SELECT users.id, users.name, users.email FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
      )
      .get(tokenHash(token), Date.now()) as User | undefined
    return user ?? null
  }

  endSession(token: string | undefined): void {
    if (token)
      this.database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash(token))
  }
}

export const sessionMaxAge = SESSION_DURATION_MS
