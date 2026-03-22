import { Injectable, ConflictException, BadRequestException, Logger } from '@nestjs/common'
import { db } from '../db'
import { bookings } from '../db/schema'
import { eq } from 'drizzle-orm'
import { generateTimeSlots, BookingCreateInput } from '@booking/schemas'
import { ErrorCodes } from '../common/error-codes.enum'

function normalizeDate(date: string): Date {
    return new Date(`${date}T00:00:00.000Z`)
}

function isValidDate(date: string): boolean {
    const d = new Date(date)
    return !isNaN(d.getTime()) && date === d.toISOString().split('T')[0]
}

@Injectable()
export class BookingsService {
    private readonly logger = new Logger(BookingsService.name)

    async getAvailableSlots(date: string) {
        if (!isValidDate(date)) {
            throw new BadRequestException({
                error: ErrorCodes.INVALID_DATE,
                message: 'Gecersiz tarih formati, YYYY-MM-DD olmali',
            })
        }

        const today = new Date()
        today.setUTCHours(0, 0, 0, 0)
        const bookingDate = normalizeDate(date)

        if (bookingDate < today) {
            throw new BadRequestException({
                error: ErrorCodes.PAST_DATE,
                message: 'Gecmis bir tarih icin randevu alinamaz',
            })
        }

        const bookedSlots = await db
            .select({ timeSlot: bookings.timeSlot })
            .from(bookings)
            .where(eq(bookings.date, date))

        const bookedSet = new Set(bookedSlots.map(b => b.timeSlot))

        const allSlots = generateTimeSlots()
        const availableSlots = allSlots
            .filter(slot => !bookedSet.has(slot))
            .map(slot => ({
                timeSlot: slot,
                duration: 60,
                available: true,
            }))

        return {
            date,
            slots: availableSlots,
            message: availableSlots.length === 0 ? 'Bu gun icin musait slot yok' : undefined,
        }
    }

    async createBooking(input: BookingCreateInput & { userId: string }) {
        if (!isValidDate(input.date)) {
            throw new BadRequestException({
                error: ErrorCodes.INVALID_DATE,
                message: 'Gecersiz tarih formati, YYYY-MM-DD olmali',
            })
        }

        const today = new Date()
        today.setUTCHours(0, 0, 0, 0)
        const bookingDate = normalizeDate(input.date)

        if (bookingDate < today) {
            throw new BadRequestException({
                error: ErrorCodes.PAST_DATE,
                message: 'Gecmis bir tarih icin randevu alinamaz',
            })
        }

        const now = new Date()
        const bookingDateTime = new Date(`${input.date}T${input.timeSlot}:00.000Z`)
        if (bookingDateTime <= now) {
            throw new BadRequestException({
                error: ErrorCodes.PAST_TIME,
                message: 'Gecmis saat icin randevu alinamaz',
            })
        }

        try {
            const [booking] = await db.insert(bookings).values({
                userId: input.userId,
                date: input.date,
                timeSlot: input.timeSlot,
                duration: 60,
            }).returning()

            this.logger.log(`[EMAIL] Randevu onay: ${input.userId} - ${input.date} ${input.timeSlot}`)

            return {
                id: booking.id,
                date: booking.date,
                timeSlot: booking.timeSlot,
                duration: booking.duration,
                message: 'Randevunuz basariyla olusturuldu',
            }
        } catch (error: any) {
            if (error?.cause?.code === '23505' || error?.code === '23505') {
                // Hangi constraint ihlal edildi?
                const detail = error?.cause?.detail || error?.detail || ''
                if (detail.includes('user_id') || detail.includes('userId')) {
                    throw new ConflictException({
                        error: ErrorCodes.USER_ALREADY_BOOKED,
                        message: 'Bu gün için zaten bir randevunuz var',
                    })
                }
                throw new ConflictException({
                    error: ErrorCodes.SLOT_ALREADY_BOOKED,
                    message: 'Bu saat dilimi zaten dolu, lutfen baska bir saat secin',
                })
            }
            throw error
        }
    }

    async getMyBookings(userId: string) {
        return await db
            .select()
            .from(bookings)
            .where(eq(bookings.userId, userId))
    }
}