import {
  pgTable,
  bigint,
  varchar,
  boolean,
  timestamp,
  integer,
  text,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── roles ───────────────────────────────────────────────────────────────────
export const roles = pgTable('roles', {
  id:          integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name:        varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
})

// ─── admins ──────────────────────────────────────────────────────────────────
export const admins = pgTable('admins', {
  id:          bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  name:        varchar('name', { length: 100 }).notNull(),
  email:       varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  roleId:      integer('role_id').notNull().references(() => roles.id),
  isActive:    boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})

// ─── relations ───────────────────────────────────────────────────────────────
export const rolesRelations = relations(roles, ({ many }) => ({
  admins: many(admins),
}))

export const adminsRelations = relations(admins, ({ one }) => ({
  role: one(roles, { fields: [admins.roleId], references: [roles.id] }),
}))
