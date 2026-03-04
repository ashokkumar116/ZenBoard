// db/schema/notes.js
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const folders = pgTable('folders', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  parent_id: uuid('parent_id'),              // null = root. 1 level nesting only in v1
  created_at: timestamp('created_at').defaultNow(),
});

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  folder_id: uuid('folder_id').references(() => folders.id, { onDelete: 'set null' }),
  title: text('title').notNull().default('Untitled'),
  content: text('content').default(''),      // markdown string
  is_pinned: boolean('is_pinned').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const note_tags = pgTable('note_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  note_id: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
});