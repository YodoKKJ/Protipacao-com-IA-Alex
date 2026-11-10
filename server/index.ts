import { createApp } from './app'
import { openDatabase } from './database'

const port = Number(process.env.PORT ?? 3001)
const database = openDatabase()
createApp(database).listen(port, () => {
  console.log(`EmprestaAí disponível em http://localhost:${port}`)
})
