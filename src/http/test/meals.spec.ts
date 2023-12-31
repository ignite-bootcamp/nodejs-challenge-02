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
import { app } from '../../server'
import { execSync } from 'node:child_process'
import { prisma } from '../../lib/prisma'

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
      expect.objectContaining({
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userId: expect.any(String),
        name: 'Hamburguer',
        description: 'very good hamburguer',
        date: mealDate,
        isOnDiet: false,
      }),
    ])
  })

  it('should list specific meal', async () => {
    const mealDate = new Date().toISOString()
    const createResponse = await supertest(app.server).post('/meals').send({
      name: 'Hamburguer',
      description: 'very good hamburguer',
      date: mealDate,
      isOnDiet: false,
    })

    const cookies = createResponse.get('Set-Cookie')

    const mealsResponse = await supertest(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = mealsResponse.body.meals[0].id

    const specificMeal = await supertest(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(specificMeal.body.meal).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userId: expect.any(String),
        name: 'Hamburguer',
        description: 'very good hamburguer',
        date: mealDate,
        isOnDiet: false,
      }),
    )
  })

  it('should update a meal', async () => {
    const mealDate = new Date().toISOString()
    const createMealResponse = await supertest(app.server).post('/meals').send({
      name: 'Hamburguer',
      description: 'very good hamburguer',
      date: mealDate,
      isOnDiet: false,
    })

    const cookies = createMealResponse.get('Set-Cookie')

    const mealResponse = await supertest(app.server)
      .get('/meals')
      .set('Cookie', cookies)
    const mealId = mealResponse.body.meals[0].id
    const oldUpdatedAt = mealResponse.body.meals[0].updatedAt

    await supertest(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Pizza',
        description: 'very good pizza',
        date: mealDate,
        isOnDiet: true,
      })

    const newMealResponse = await supertest(app.server)
      .get('/meals')
      .set('Cookie', cookies)
    const newUpdatedAt = newMealResponse.body.meals[0].updatedAt

    expect(oldUpdatedAt).not.toEqual(newUpdatedAt)
    expect(newMealResponse.body.meals).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userId: expect.any(String),
        name: 'Pizza',
        description: 'very good pizza',
        date: mealDate,
        isOnDiet: true,
      }),
    ])
  })

  it('should delete a meal', async () => {
    const mealDate = new Date().toISOString()
    const createMealResponse = await supertest(app.server).post('/meals').send({
      name: 'Hamburguer',
      description: 'very good hamburguer',
      date: mealDate,
      isOnDiet: false,
    })

    const cookies = createMealResponse.get('Set-Cookie')

    const mealResponse = await supertest(app.server)
      .get('/meals')
      .set('Cookie', cookies)
    const mealId = mealResponse.body.meals[0].id

    await supertest(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)

    const emptyListing = await supertest(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(emptyListing.body.meals).toHaveLength(0)
  })

  // Response example
  // {
  // 	"totalMeals": 4,
  // 	"totalMealsOnDiet": 3,
  // 	"totalMealsOffDiet": 1,
  // 	"mealsOnDietStreak": 3
  // }
  it('should return meals statistics', async () => {
    const postResponse = await supertest(app.server).post('/meals').send({
      name: 'Meal 1',
      description: 'Meal 1',
      date: new Date().toISOString(),
      isOnDiet: true,
    })

    const cookies = postResponse.get('Set-Cookie')

    await supertest(app.server)
      .post('/meals')
      .send({
        name: 'Meal 2',
        description: 'Meal 2',
        date: new Date().toISOString(),
        isOnDiet: true,
      })
      .set('Cookie', cookies)
    await supertest(app.server)
      .post('/meals')
      .send({
        name: 'Meal 3',
        description: 'Meal 3',
        date: new Date().toISOString(),
        isOnDiet: false,
      })
      .set('Cookie', cookies)

    const statisticsResponse = await supertest(app.server)
      .get('/meals/statistics')
      .set('Cookie', cookies)

    expect(statisticsResponse.body).toEqual(
      expect.objectContaining({
        totalMeals: 3,
        totalMealsOnDiet: 2,
        totalMealsOffDiet: 1,
        mealsOnDietStreak: 2,
      }),
    )
  })
})
