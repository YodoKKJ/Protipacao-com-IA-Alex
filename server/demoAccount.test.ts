import { describe, expect, it } from 'vitest'
import { AuthService } from './AuthService'
import { openDatabase } from './database'
import { DEMO_EMAIL, DEMO_PASSWORD, ensureDemoAccount, shouldSeedDemoAccount } from './demoAccount'

describe('conta de demonstração local', () => {
  it('cria a conta uma vez e permite login com a senha documentada', async () => {
    const database = openDatabase(':memory:')
    try {
      await ensureDemoAccount(database)
      await ensureDemoAccount(database)
      expect(database.prepare('SELECT COUNT(*) AS total FROM users').get()).toMatchObject({
        total: 1,
      })
      const user = await new AuthService(database).login({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })
      expect(user.name).toBe('Conta Demo')
    } finally {
      database.close()
    }
  })

  it('não ativa a semeadura em produção ou em interface pública', () => {
    expect(shouldSeedDemoAccount('127.0.0.1', undefined)).toBe(true)
    expect(shouldSeedDemoAccount('127.0.0.1', 'production')).toBe(false)
    expect(shouldSeedDemoAccount('0.0.0.0', 'development')).toBe(false)
  })

  it('bloqueia login e sessão demo quando o mesmo banco é aberto em produção', async () => {
    const database = openDatabase(':memory:')
    const originalEnvironment = process.env.NODE_ENV
    try {
      await ensureDemoAccount(database)
      const auth = new AuthService(database)
      const user = await auth.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
      const token = auth.createSession(user.id)
      process.env.NODE_ENV = 'production'
      await expect(auth.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD })).rejects.toThrow(
        'E-mail ou senha incorretos.',
      )
      expect(auth.getUser(token)).toBeNull()
    } finally {
      if (originalEnvironment === undefined) delete process.env.NODE_ENV
      else process.env.NODE_ENV = originalEnvironment
      database.close()
    }
  })
})
