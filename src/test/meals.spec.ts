import supertest from 'supertest'
import {
  afterAll,
  beforeAll,
  describe,
  it,
  beforeEach,
  afterEach,
} from 'vitest'
import { app } from '../server'
import { execSync } from 'node:child_process'
import { prisma } from '../database/prisma'

describe('/meals', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.$connect()
    execSync('npx prisma db push')
  })

  afterEach(async () => {
    await prisma.$disconnect()
  })

  it('should create a new transaction', async () => {
    await supertest(app.server)
      .post('/meals')
      .send({
        name: 'Pizza',
        description: 'cool pizza',
        date: new Date().toISOString(),
        isOnDiet: false,
      })
      .expect(201)
  })
})
