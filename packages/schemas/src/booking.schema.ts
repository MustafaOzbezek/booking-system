import { z } from 'zod'

export const TIME_SLOTS = [
    '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00',
] as const

export const generateTimeSlots = () => [...TIME_SLOTS]

export const AvailableQuerySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-MM-DD formatında olmalı'),
})

export const BookingCreateSchema = z.object({
    userId: z.string().uuid('Geçerli bir kullanıcı ID gerekli'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-MM-DD formatında olmalı'),
    timeSlot: z.enum(TIME_SLOTS),
})

export type AvailableQueryInput = z.infer<typeof AvailableQuerySchema>
export type BookingCreateInput = z.infer<typeof BookingCreateSchema>