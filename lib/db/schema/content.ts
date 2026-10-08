import {
  pgTable,
  bigint,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  smallint,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { courses } from './courses'
import { branches } from './branches'
import { admins } from './auth'

// ─── reviews ─────────────────────────────────────────────────────────────────
export const reviews = pgTable('reviews', {
  id:          integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name:        varchar('name', { length: 150 }).notNull(),
  photo:       varchar('photo', { length: 500 }),
  text:        text('text').notNull(),
  rating:      smallint('rating').notNull().default(5), // 1–5
  courseId:    integer('course_id').references(() => courses.id,  { onDelete: 'set null' }),
  branchId:    integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  isPublished: boolean('is_published').notNull().default(false),
  sortOrder:   integer('sort_order').notNull().default(0),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
})

// ─── gallery ─────────────────────────────────────────────────────────────────
export const gallery = pgTable('gallery', {
  id:          bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  title:       varchar('title', { length: 150 }),
  image:       varchar('image', { length: 500 }).notNull(),
  description: text('description'),
  branchId:    integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  category:    varchar('category', { length: 100 }),
  isPublished: boolean('is_published').notNull().default(false),
  sortOrder:   integer('sort_order').notNull().default(0),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
})

// ─── faq ─────────────────────────────────────────────────────────────────────
export const faq = pgTable('faq', {
  id:          integer('id').primaryKey().generatedAlwaysAsIdentity(),
  question:    varchar('question', { length: 500 }).notNull(),
  answer:      text('answer').notNull(),
  category:    varchar('category', { length: 100 }),
  isPublished: boolean('is_published').notNull().default(true),
  sortOrder:   integer('sort_order').notNull().default(0),
})

// ─── pages ───────────────────────────────────────────────────────────────────
export const pages = pgTable('pages', {
  id:          integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title:       varchar('title', { length: 255 }).notNull(),
  slug:        varchar('slug', { length: 150 }).notNull().unique(),
  content:     text('content').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})

// ─── events ──────────────────────────────────────────────────────────────────
export const events = pgTable('events', {
  id:          integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title:       varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  image:       varchar('image', { length: 500 }),
  branchId:    integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  eventDate:   timestamp('event_date').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
})

// ─── media ───────────────────────────────────────────────────────────────────
export const media = pgTable('media', {
  id:          bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  fileName:    varchar('file_name', { length: 255 }).notNull(),
  fileUrl:     varchar('file_url', { length: 500 }).notNull(),
  fileType:    varchar('file_type', { length: 50 }).notNull(),
  fileSize:    integer('file_size'),
  altText:     varchar('alt_text', { length: 255 }),
  uploadedBy:  integer('uploaded_by').references(() => admins.id, { onDelete: 'set null' }),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
})

// ─── statistics ──────────────────────────────────────────────────────────────
export const statistics = pgTable('statistics', {
  id:          integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title:       varchar('title', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  icon:        varchar('icon', { length: 500 }),
  sortOrder:   integer('sort_order').notNull().default(0),
  isActive:    boolean('is_active').notNull().default(true),
})

// ─── relations ───────────────────────────────────────────────────────────────
export const reviewsRelations = relations(reviews, ({ one }) => ({
  course: one(courses,  { fields: [reviews.courseId], references: [courses.id] }),
  branch: one(branches, { fields: [reviews.branchId], references: [branches.id] }),
}))

export const galleryRelations = relations(gallery, ({ one }) => ({
  branch: one(branches, { fields: [gallery.branchId], references: [branches.id] }),
}))

export const eventsRelations = relations(events, ({ one }) => ({
  branch: one(branches, { fields: [events.branchId], references: [branches.id] }),
}))

export const mediaRelations = relations(media, ({ one }) => ({
  uploadedBy: one(admins, { fields: [media.uploadedBy], references: [admins.id] }),
}))
