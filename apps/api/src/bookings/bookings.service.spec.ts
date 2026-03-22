import { Test, TestingModule } from '@nestjs/testing'
import { BookingsService } from './bookings.service'
import { BadRequestException, ConflictException } from '@nestjs/common'

jest.mock('../db', () => ({
    db: {
        select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue([]),
            }),
        }),
        insert: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue({
                returning: jest.fn().mockResolvedValue([{
                    id: 'test-id',
                    date: '2026-12-25',
                    timeSlot: '10:00',
                    duration: 60,
                }]),
            }),
        }),
    },
}))

describe('BookingsService', () => {
    let service: BookingsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BookingsService],
        }).compile()

        service = module.get<BookingsService>(BookingsService)
    })

    describe('getAvailableSlots', () => {
        it('geçersiz tarih için 400 hatası vermeli', async () => {
            await expect(service.getAvailableSlots('invalid-date'))
                .rejects.toThrow(BadRequestException)
        })

        it('geçmiş tarih için 400 hatası vermeli', async () => {
            await expect(service.getAvailableSlots('2020-01-01'))
                .rejects.toThrow(BadRequestException)
        })

        it('geçerli tarih için slot listesi döndürmeli', async () => {
            const result = await service.getAvailableSlots('2026-12-25')
            expect(result).toHaveProperty('slots')
            expect(Array.isArray(result.slots)).toBe(true)
        })

        it('her slot duration:60 içermeli', async () => {
            const result = await service.getAvailableSlots('2026-12-25')
            result.slots.forEach(slot => {
                expect(slot.duration).toBe(60)
            })
        })
    })

    describe('createBooking', () => {
        it('geçmiş tarih için 400 hatası vermeli', async () => {
            await expect(service.createBooking({
                userId: 'user-123',
                date: '2020-01-01',
                timeSlot: '10:00' as any,
            })).rejects.toThrow(BadRequestException)
        })

        it('geçersiz tarih için 400 hatası vermeli', async () => {
            await expect(service.createBooking({
                userId: 'user-123',
                date: 'abc',
                timeSlot: '10:00' as any,
            })).rejects.toThrow(BadRequestException)
        })

        it('başarılı booking döndürmeli', async () => {
            const result = await service.createBooking({
                userId: 'user-123',
                date: '2026-12-25',
                timeSlot: '10:00' as any,
            })
            expect(result).toHaveProperty('id')
            expect(result).toHaveProperty('date')
            expect(result).toHaveProperty('timeSlot')
            expect(result.message).toBe('Randevunuz basariyla olusturuldu')
        })

        it('duplicate booking için 409 hatası vermeli', async () => {
            const { db } = require('../db')
            db.insert.mockReturnValueOnce({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockRejectedValue({
                        cause: { code: '23505' },
                    }),
                }),
            })

            await expect(service.createBooking({
                userId: 'user-123',
                date: '2026-12-25',
                timeSlot: '10:00' as any,
            })).rejects.toThrow(ConflictException)
        })
    })
})