import supertest from 'supertest'
import {
  afterAll,
  beforeAll,
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
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
    await prisma.meal.deleteMany()
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

  it('should list all meals', async () => {
    const mealDate = new Date().toISOString()
    const createResponse = await supertest(app.server).post('/meals').send({
      name: 'Hamburguer',
      description: 'very good hamburguer',
      date: mealDate,
      isOnDiet: false,
    })

    const cookies = createResponse.get('Set-Cookie')

    const response = await supertest(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(response.body.meals).toEqual([
      {
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userId: expect.any(String),
        name: 'Hamburguer',
        description: 'very good hamburguer',
        date: mealDate,
        isOnDiet: false,
      },
    ])
  })
})
