import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'

test('cadastra, edita, devolve e recupera um empréstimo após novo login', async ({ page }) => {
  const email = `teste-${randomUUID()}@example.com`
  const password = 'senha-de-teste-123'
  const item = `Livro ${randomUUID().slice(0, 8)}`

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Bem-vindo de volta.' })).toBeVisible()
  await page.getByRole('button', { name: 'Ainda não tem conta? Cadastre-se' }).click()
  await page.getByRole('textbox', { name: 'Seu nome' }).fill('Alex Teste')
  await page.getByRole('textbox', { name: 'E-mail' }).fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page.getByRole('heading', { name: /O que é seu/ })).toBeVisible()

  await page.getByRole('link', { name: /Novo empréstimo/ }).click()
  await page.getByRole('button', { name: 'Salvar empréstimo' }).click()
  await expect(page.getByText('Informe o objeto emprestado.')).toBeVisible()
  await page.getByLabel('O que você emprestou?').fill(item)
  await page.getByLabel('Para quem?').fill('Ana')
  await page.getByLabel('Data do empréstimo').fill('2026-11-10')
  await page.getByLabel('Devolução prevista').fill('2026-11-20')
  await page.getByLabel('Algum detalhe importante?').fill('Capa azul')
  await page.getByRole('button', { name: 'Salvar empréstimo' }).click()
  await expect(page.getByRole('heading', { name: item })).toBeVisible()
  await expect(page.getByText('Capa azul')).toBeVisible()

  await page.getByRole('link', { name: 'Editar detalhes' }).click()
  await page.getByLabel('Para quem?').fill('Bia')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByText('Está com Bia.')).toBeVisible()

  await page.getByRole('button', { name: 'Marcar como devolvido' }).click()
  await expect(page.getByRole('dialog', { name: 'Objeto devolvido?' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirmar devolução' }).click()
  await expect(page.getByText('Devolvido', { exact: true })).toBeVisible()

  await page.getByRole('link', { name: 'Histórico' }).click()
  await expect(page.getByText(item)).toBeVisible()
  await page.reload()
  await expect(page.getByText(item)).toBeVisible()

  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page.getByRole('heading', { name: 'Bem-vindo de volta.' })).toBeVisible()
  await page.getByRole('textbox', { name: 'E-mail' }).fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.getByRole('link', { name: 'Histórico' }).click()
  await expect(page.getByText(item)).toBeVisible()
})
