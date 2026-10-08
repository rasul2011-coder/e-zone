import {
  pgTable,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  decimal,
  smallint,
  bigint,
  time,
  date,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { branches } from './branches'

// ─── course_categories ───────────────────────────────────────────────────────
export const courseCategories = pgTable('course_categories', {
  id:          integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name:        varchar('name', { length: 100 }).notNull(),
  slug:        varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  isActive:    boolean('is_active').notNull().default(true),
})

// ─── courses ─────────────────────────────────────────────────────────────────
export const courses = pgTable('courses', {
  id:               integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name:             varchar('name', { length: 150 }).notNull(),
  slug:             varchar('slug', { length: 150 }).notNull().unique(),
  shortDescription: text('short_description').notNull(),
  description:      text('description').notNull(),
  image:            varchar('image', { length: 500 }),
  price:            decimal('price', { precision: 10, scale: 2 }),
  currency:         varchar('currency', { length: 10 }).notNull().default('KGS'),
  duration:         varchar('duration', { length: 100 }),
  ageFrom:          smallint('age_from'),
  ageTo:            smallint('age_to'),
  isActive:         boolean('is_active').notNull().default(true),
  isFeatured:       boolean('is_featured').notNull().default(false),
  sortOrder:        integer('sort_order').notNull().default(0),
  createdAt:        timestamp('created_at').notNull().defaultNow(),
  updatedAt:        timestamp('updated_at').notNull().defaultNow(),
})

// ─── course_categories_map ───────────────────────────────────────────────────
export const courseCategoriesMap = pgTable(
  'course_categories_map',
  {
    courseId:   integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').notNull().references(() => courseCategories.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.courseId, t.categoryId] })],
)

// ─── course_levels ───────────────────────────────────────────────────────────
export const courseLevels = pgTable('course_levels', {
  id:          integer('id').primaryKey().generatedAlwaysAsIdentity(),
  courseId:    integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  name:        varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  sortOrder:   integer('sort_order').notNull().default(0),
})

// ─── course_schedule ─────────────────────────────────────────────────────────
export const courseSchedule = pgTable('course_schedule', {
  id:         bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  courseId:   integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  branchId:   integer('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  levelId:    integer('level_id').references(() => courseLevels.id, { onDelete: 'set null' }),
  // teacherId is set in teachers.ts via migration order — added as plain integer here
  teacherId:  integer('teacher_id'),
  dayOfWeek:  smallint('day_of_week').notNull(), // 1=Mon … 7=Sun
  startTime:  time('start_time').notNull(),
  endTime:    time('end_time').notNull(),
  startDate:  date('start_date'),
  endDate:    date('end_date'),
  format:     varchar('format', { length: 30 }).notNull().default('offline'),
  isActive:   boolean('is_active').notNull().default(true),
})

// ─── course_translations ─────────────────────────────────────────────────────
export const courseTranslations = pgTable('course_translations', {
  id:               bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  courseId:         integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  // languageId FK is resolved in languages.ts
  languageId:       integer('language_id').notNull(),
  name:             varchar('name', { length: 150 }).notNull(),
  shortDescription: text('short_description'),
  description:      text('description'),
})

// ─── relations ───────────────────────────────────────────────────────────────
export const coursesRelations = relations(courses, ({ many }) => ({
  categoriesMap:    many(courseCategoriesMap),
  levels:           many(courseLevels),
  schedule:         many(courseSchedule),
  translations:     many(courseTranslations),
}))

export const courseCategoriesRelations = relations(courseCategories, ({ many }) => ({
  coursesMap: many(courseCategoriesMap),
}))

export const courseCategoriesMapRelations = relations(courseCategoriesMap, ({ one }) => ({
  course:   one(courses,          { fields: [courseCategoriesMap.courseId],   references: [courses.id] }),
  category: one(courseCategories, { fields: [courseCategoriesMap.categoryId], references: [courseCategories.id] }),
}))

export const courseLevelsRelations = relations(courseLevels, ({ one }) => ({
  course: one(courses, { fields: [courseLevels.courseId], references: [courses.id] }),
}))

export const courseScheduleRelations = relations(courseSchedule, ({ one }) => ({
  course:  one(courses,  { fields: [courseSchedule.courseId],  references: [courses.id] }),
  branch:  one(branches, { fields: [courseSchedule.branchId],  references: [branches.id] }),
  level:   one(courseLevels, { fields: [courseSchedule.levelId], references: [courseLevels.id] }),
}))
