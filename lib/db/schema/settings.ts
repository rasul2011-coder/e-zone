import {
  pgTable,
  bigint,
  integer,
  varchar,
  text,
  boolean,
} from 'drizzle-orm/pg-core'

// ─── contacts ────────────────────────────────────────────────────────────────
export const contacts = pgTable('contacts', {
  id:           integer('id').primaryKey().generatedAlwaysAsIdentity(),
  phone:        varchar('phone', { length: 30 }).notNull(),
  email:        varchar('email', { length: 255 }),
  whatsapp:     varchar('whatsapp', { length: 255 }),
  instagram:    varchar('instagram', { length: 255 }),
  telegram:     varchar('telegram', { length: 255 }),
  address:      varchar('address', { length: 255 }),
  workingHours: varchar('working_hours', { length: 255 }),
})

// ─── social_links ─────────────────────────────────────────────────────────────
export const socialLinks = pgTable('social_links', {
  id:        integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name:      varchar('name', { length: 50 }).notNull(),
  url:       varchar('url', { length: 500 }).notNull(),
  icon:      varchar('icon', { length: 500 }),
  isActive:  boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
})

// ─── site_settings ───────────────────────────────────────────────────────────
export const siteSettings = pgTable('site_settings', {
  id:          integer('id').primaryKey().generatedAlwaysAsIdentity(),
  key:         varchar('key', { length: 100 }).notNull().unique(),
  value:       text('value').notNull(),
  type:        varchar('type', { length: 30 }).notNull().default('string'),
  description: varchar('description', { length: 255 }),
})

// ─── languages ───────────────────────────────────────────────────────────────
export const languages = pgTable('languages', {
  id:        integer('id').primaryKey().generatedAlwaysAsIdentity(),
  code:      varchar('code', { length: 10 }).notNull().unique(),
  name:      varchar('name', { length: 50 }).notNull(),
  isActive:  boolean('is_active').notNull().default(true),
  isDefault: boolean('is_default').notNull().default(false),
})

// ─── seo ─────────────────────────────────────────────────────────────────────
export const seo = pgTable('seo', {
  id:            bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  pageType:      varchar('page_type', { length: 50 }).notNull(),
  pageId:        bigint('page_id', { mode: 'number' }).notNull(),
  title:         varchar('title', { length: 255 }).notNull(),
  description:   text('description'),
  canonicalUrl:  varchar('canonical_url', { length: 500 }),
  ogTitle:       varchar('og_title', { length: 255 }),
  ogDescription: text('og_description'),
  ogImage:       varchar('og_image', { length: 500 }),
})
