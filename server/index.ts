import { createApp } from './app'
import { openDatabase } from './database'
import { ensureDemoAccount, shouldSeedDemoAccount } from './demoAccount'

const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? '127.0.0.1'
const database = openDatabase()
if (shouldSeedDemoAccount(host, process.env.NODE_ENV)) {
  await ensureDemoAccount(database)
}
createApp(database).listen(port, host, () => {
  console.log(`EmprestaAí disponível em http://${host}:${port}`)
})
