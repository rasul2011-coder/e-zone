import {
  pgTable,
  bigint,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  time,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { courses } from './courses'
import { branches } from './branches'
import { admins } from './auth'
import { teachers } from './teachers'

// ─── application_statuses ────────────────────────────────────────────────────
export const applicationStatuses = pgTable('application_statuses', {
  id:          integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name:        varchar('name', { length: 50 }).notNull(),
  description: varchar('description', { length: 255 }),
})

// ─── applications ─────────────────────────────────────────────────────────────
export const applications = pgTable('applications', {
  id:              bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  name:            varchar('name', { length: 150 }).notNull(),
  phone:           varchar('phone', { length: 30 }).notNull(),
  email:           varchar('email', { length: 255 }),
  courseId:        integer('course_id').references(() => courses.id, { onDelete: 'set null' }),
  branchId:        integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  preferredTime:   varchar('preferred_time', { length: 100 }),
  comment:         text('comment'),
  source:          varchar('source', { length: 100 }),
  statusId:        integer('status_id').notNull().references(() => applicationStatuses.id),
  privacyAccepted: boolean('privacy_accepted').notNull().default(false),
  // Payment fields
  courseName:      varchar('course_name', { length: 150 }),   // course name as text (when no DB course)
  paymentAmount:   integer('payment_amount'),                  // amount in KGS
  paymentReceipt:  varchar('payment_receipt', { length: 1000 }), // base64 or URL of uploaded receipt
  isPaid:          boolean('is_paid').notNull().default(false),
  // Extra user info
  age:             integer('age'),                             // age of student
  role:            varchar('role', { length: 50 }),            // 'student' | 'parent'
  createdAt:       timestamp('created_at').notNull().defaultNow(),
  updatedAt:       timestamp('updated_at').notNull().defaultNow(),
})

// ─── application_history ─────────────────────────────────────────────────────
export const applicationHistory = pgTable('application_history', {
  id:            bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  applicationId: bigint('application_id', { mode: 'number' }).notNull().references(() => applications.id, { onDelete: 'cascade' }),
  adminId:       integer('admin_id').notNull().references(() => admins.id),
  oldStatusId:   integer('old_status_id').references(() => applicationStatuses.id, { onDelete: 'set null' }),
  newStatusId:   integer('new_status_id').notNull().references(() => applicationStatuses.id),
  comment:       text('comment'),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
})

// ─── trial_lessons ───────────────────────────────────────────────────────────
export const trialLessons = pgTable('trial_lessons', {
  id:            bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  applicationId: bigint('application_id', { mode: 'number' }).notNull().references(() => applications.id, { onDelete: 'cascade' }),
  courseId:      integer('course_id').notNull().references(() => courses.id),
  branchId:      integer('branch_id').notNull().references(() => branches.id),
  teacherId:     integer('teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
  date:          date('date').notNull(),
  time:          time('time').notNull(),
  status:        varchar('status', { length: 50 }).notNull().default('pending'),
  comment:       text('comment'),
})

// ─── relations ───────────────────────────────────────────────────────────────
export const applicationsRelations = relations(applications, ({ one, many }) => ({
  course:  one(courses,              { fields: [applications.courseId],  references: [courses.id] }),
  branch:  one(branches,             { fields: [applications.branchId],  references: [branches.id] }),
  status:  one(applicationStatuses,  { fields: [applications.statusId],  references: [applicationStatuses.id] }),
  history: many(applicationHistory),
  trials:  many(trialLessons),
}))

export const applicationHistoryRelations = relations(applicationHistory, ({ one }) => ({
  application: one(applications,       { fields: [applicationHistory.applicationId], references: [applications.id] }),
  admin:       one(admins,             { fields: [applicationHistory.adminId],       references: [admins.id] }),
  oldStatus:   one(applicationStatuses, { fields: [applicationHistory.oldStatusId],  references: [applicationStatuses.id] }),
  newStatus:   one(applicationStatuses, { fields: [applicationHistory.newStatusId],  references: [applicationStatuses.id] }),
}))

export const trialLessonsRelations = relations(trialLessons, ({ one }) => ({
  application: one(applications, { fields: [trialLessons.applicationId], references: [applications.id] }),
  course:      one(courses,      { fields: [trialLessons.courseId],      references: [courses.id] }),
  branch:      one(branches,     { fields: [trialLessons.branchId],      references: [branches.id] }),
  teacher:     one(teachers,     { fields: [trialLessons.teacherId],     references: [teachers.id] }),
}))
