export const DEMO_EMAIL = 'demo@emprestaai.local'
export const DEMO_PASSWORD = 'EmprestaAi123!'

export function isLocalDemoMode(host: string, environment: string | undefined): boolean {
  return environment !== 'production' && ['127.0.0.1', 'localhost', '::1'].includes(host)
}

export function demoLoginAllowed(): boolean {
  return isLocalDemoMode(process.env.HOST ?? '127.0.0.1', process.env.NODE_ENV)
}
