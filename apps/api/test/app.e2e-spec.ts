/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { ZodExceptionFilter } from '../src/filters/zod-exception.filter'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalFilters(new ZodExceptionFilter())
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/auth/login (POST) → 400 döndürmeli (eksik body)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(400)
  })

  it('/bookings/available (GET) → 200 döndürmeli', async () => {
    const res = await request(app.getHttpServer())
      .get('/bookings/available?date=2026-12-25')
      .expect(200)

    expect(res.body).toHaveProperty('slots')
  })
})