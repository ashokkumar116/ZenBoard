// db/schema/habits.js
import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const habits = pgTable('habits', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  frequency_type: text('frequency_type').default('daily'), // "daily" | "custom"
  frequency_days: jsonb('frequency_days').default([0,1,2,3,4,5,6]), // 0=Sun, 6=Sat
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
});

// One row per habit per day — streak source of truth
export const habit_logs = pgTable('habit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  habit_id: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),              // "YYYY-MM-DD"
  completed: boolean('completed').default(false),
  created_at: timestamp('created_at').defaultNow(),
  // Unique constraint: one log per habit per day
});

export const habit_tags = pgTable('habit_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  habit_id: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
});