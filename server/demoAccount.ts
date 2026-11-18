import { AuthService } from './AuthService'
import type { AppDatabase } from './database'
import { DEMO_EMAIL, DEMO_PASSWORD, isLocalDemoMode } from './demoPolicy'

export { DEMO_EMAIL, DEMO_PASSWORD }

/** A conta compartilhada só é criada quando o servidor está restrito à máquina local. */
export function shouldSeedDemoAccount(host: string, environment: string | undefined): boolean {
  return isLocalDemoMode(host, environment)
}

export async function ensureDemoAccount(database: AppDatabase): Promise<void> {
  const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(DEMO_EMAIL)
  if (existing) return

  await new AuthService(database).register({
    name: 'Conta Demo',
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  })
}
