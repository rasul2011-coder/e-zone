import {
  pgTable,
  integer,
  varchar,
  text,
  boolean,
  smallint,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { branches } from './branches'
import { courses } from './courses'

// ─── teachers ────────────────────────────────────────────────────────────────
export const teachers = pgTable('teachers', {
  id:               integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name:             varchar('name', { length: 150 }).notNull(),
  slug:             varchar('slug', { length: 150 }).notNull().unique(),
  photo:            varchar('photo', { length: 500 }),
  position:         varchar('position', { length: 150 }),
  specialization:   varchar('specialization', { length: 255 }),
  experienceYears:  smallint('experience_years'),
  qualification:    text('qualification'),
  languages:        varchar('languages', { length: 255 }),
  bio:              text('bio'),
  isActive:         boolean('is_active').notNull().default(true),
  sortOrder:        integer('sort_order').notNull().default(0),
})

// ─── teacher_courses ─────────────────────────────────────────────────────────
export const teacherCourses = pgTable(
  'teacher_courses',
  {
    teacherId: integer('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
    courseId:  integer('course_id').notNull().references(() => courses.id,   { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.teacherId, t.courseId] })],
)

// ─── teacher_branches ────────────────────────────────────────────────────────
export const teacherBranches = pgTable(
  'teacher_branches',
  {
    teacherId: integer('teacher_id').notNull().references(() => teachers.id,  { onDelete: 'cascade' }),
    branchId:  integer('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.teacherId, t.branchId] })],
)

// ─── relations ───────────────────────────────────────────────────────────────
export const teachersRelations = relations(teachers, ({ many }) => ({
  courses:  many(teacherCourses),
  branches: many(teacherBranches),
}))

export const teacherCoursesRelations = relations(teacherCourses, ({ one }) => ({
  teacher: one(teachers, { fields: [teacherCourses.teacherId], references: [teachers.id] }),
  course:  one(courses,  { fields: [teacherCourses.courseId],  references: [courses.id] }),
}))

export const teacherBranchesRelations = relations(teacherBranches, ({ one }) => ({
  teacher: one(teachers, { fields: [teacherBranches.teacherId], references: [teachers.id] }),
  branch:  one(branches, { fields: [teacherBranches.branchId],  references: [branches.id] }),
}))
