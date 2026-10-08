import {
  pgTable,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  decimal,
} from 'drizzle-orm/pg-core'

// ─── branches ────────────────────────────────────────────────────────────────
export const branches = pgTable('branches', {
  id:           integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name:         varchar('name', { length: 150 }).notNull(),
  slug:         varchar('slug', { length: 150 }).notNull().unique(),
  address:      varchar('address', { length: 255 }).notNull(),
  phone:        varchar('phone', { length: 30 }).notNull(),
  email:        varchar('email', { length: 255 }),
  workingHours: varchar('working_hours', { length: 255 }).notNull(),
  latitude:     decimal('latitude', { precision: 10, scale: 7 }),
  longitude:    decimal('longitude', { precision: 10, scale: 7 }),
  description:  text('description').notNull(),
  image:        varchar('image', { length: 500 }),
  isActive:     boolean('is_active').notNull().default(true),
  sortOrder:    integer('sort_order').notNull().default(0),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
})
