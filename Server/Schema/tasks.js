// db/schema/tasks.js
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const priorityEnum = pgEnum('priority', ['high', 'medium', 'low']);
export const statusEnum = pgEnum('task_status', ['open', 'done']);

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: priorityEnum('priority').default('medium'),
  status: statusEnum('status').default('open'),
  due_date: timestamp('due_date'),           // null = No Date bucket
  completed_at: timestamp('completed_at'),   // null if open
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const task_tags = pgTable('task_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  task_id: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  label: text('label').notNull(), // e.g. "kubros", "learning"
});