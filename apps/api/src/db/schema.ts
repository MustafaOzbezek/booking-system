import { pgTable, uuid, varchar, date, timestamp, unique, integer, index } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const bookings = pgTable('bookings', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    timeSlot: varchar('time_slot', { length: 5 }).notNull(),
    duration: integer('duration').notNull().default(60),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    uniqueBooking: unique().on(table.date, table.timeSlot),
    dateIdx: index('idx_bookings_date').on(table.date),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert