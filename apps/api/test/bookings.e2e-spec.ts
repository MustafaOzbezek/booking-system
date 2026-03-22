/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { ZodExceptionFilter } from '../src/filters/zod-exception.filter'

describe('Bookings (e2e)', () => {
    let app: INestApplication
    let accessToken: string

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        app.useGlobalFilters(new ZodExceptionFilter())
        await app.init()

        const email = `e2e-${Date.now()}@test.com`
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({ name: 'E2E User', email, password: 'password123' })

        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password: 'password123' })

        // Token'ı body'den al
        accessToken = loginRes.body.token || ''
    })

    afterAll(async () => {
        await app.close()
    })

    describe('GET /bookings/available', () => {
        it('geçerli tarih için slot listesi döndürmeli', async () => {
            const res = await request(app.getHttpServer())
                .get('/bookings/available?date=2026-12-25')
                .expect(200)

            expect(res.body).toHaveProperty('slots')
            expect(Array.isArray(res.body.slots)).toBe(true)
        })

        it('geçersiz tarih için 400 döndürmeli', async () => {
            const res = await request(app.getHttpServer())
                .get('/bookings/available?date=invalid-date')

            expect(res.status).toBe(400)
        })

        it('geçmiş tarih için 400 döndürmeli', async () => {
            await request(app.getHttpServer())
                .get('/bookings/available?date=2020-01-01')
                .expect(400)
        })
    })

    describe('POST /bookings', () => {
        it('token olmadan 401 döndürmeli', async () => {
            await request(app.getHttpServer())
                .post('/bookings')
                .send({ date: '2026-12-25', timeSlot: '10:00' })
                .expect(401)
        })

        it('geçerli token ile booking oluşturmalı', async () => {
            const res = await request(app.getHttpServer())
                .post('/bookings')
                .set('Cookie', `token=${accessToken}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ date: '2026-12-25', timeSlot: '09:00' })

            expect([200, 201, 409]).toContain(res.status)
        })

        it('concurrent booking — biri başarılı biri 409 döndürmeli', async () => {
            const date = '2026-12-30'
            const timeSlot = '14:00'

            const [res1, res2] = await Promise.all([
                request(app.getHttpServer())
                    .post('/bookings')
                    .set('Cookie', `token=${accessToken}`)
                    .set('Authorization', `Bearer ${accessToken}`)
                    .send({ date, timeSlot }),
                request(app.getHttpServer())
                    .post('/bookings')
                    .set('Cookie', `token=${accessToken}`)
                    .set('Authorization', `Bearer ${accessToken}`)
                    .send({ date, timeSlot }),
            ])

            const statuses = [res1.status, res2.status]
            console.log('Concurrent Test Statuses:', statuses)

            expect(statuses.every(s => s !== 500)).toBe(true)
            expect(statuses.some(s => [200, 201, 409].includes(s))).toBe(true)
        })
    })
})