import { Controller, Get, Post, Query, Body, UseGuards, Request } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AvailableQuerySchema, BookingCreateSchema } from '@booking/schemas'

@Controller('bookings')
export class BookingsController {
    constructor(private bookingsService: BookingsService) { }

    @Get('available')
    getAvailable(@Query() query: unknown) {
        const { date } = AvailableQuerySchema.parse(query)
        return this.bookingsService.getAvailableSlots(date)
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    createBooking(@Body() body: unknown, @Request() req: any) {
        const { date, timeSlot } = BookingCreateSchema.omit({ userId: true }).parse(body)
        return this.bookingsService.createBooking({
            userId: req.user.id,
            date,
            timeSlot,
        })
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMyBookings(@Request() req: any) {
        return this.bookingsService.getMyBookings(req.user.id)
    }
}