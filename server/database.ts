import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export function openDatabase(path = process.env.DATABASE_PATH ?? 'data/emprestaai.sqlite') {
  const file = path === ':memory:' ? path : resolve(path)
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true })
  const database = new DatabaseSync(file)
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_expires_at ON sessions(expires_at);
    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item TEXT NOT NULL,
      person TEXT NOT NULL,
      lent_at TEXT NOT NULL,
      due_at TEXT NOT NULL,
      note TEXT NOT NULL,
      returned_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS loans_user_created ON loans(user_id, created_at DESC);
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      number INTEGER NOT NULL,
      issuer_name TEXT NOT NULL,
      recipient TEXT NOT NULL,
      description TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      issued_at TEXT NOT NULL,
      fiscal_json TEXT,
      UNIQUE (user_id, number)
    );
    CREATE INDEX IF NOT EXISTS notes_user_number ON notes(user_id, number DESC);
  `)
  const noteColumns = database.prepare('PRAGMA table_info(notes)').all() as { name: string }[]
  if (!noteColumns.some((column) => column.name === 'fiscal_json')) {
    database.exec('ALTER TABLE notes ADD COLUMN fiscal_json TEXT')
  }
  return database
}

export type AppDatabase = ReturnType<typeof openDatabase>
