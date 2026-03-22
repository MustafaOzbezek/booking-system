import * as postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!


const sql = ((postgres as any).default || postgres)(connectionString, { ssl: 'require' })

export const db = drizzle(sql, { schema })