import {
  pgTable,
  bigint,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:           bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  name:         varchar('name', { length: 150 }).notNull(),
  email:        varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),  // null if Google-only
  googleId:     varchar('google_id', { length: 100 }),
  avatar:       varchar('avatar', { length: 500 }),
  phone:        varchar('phone', { length: 30 }),
  isActive:     boolean('is_active').notNull().default(true),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
})
