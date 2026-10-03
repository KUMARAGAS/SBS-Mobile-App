import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * LAYER 4 — schema (PLAN.md §7 draft data model, minimal F1 slice).
 *
 * Only `employees` + `tickets` ship in F1 (Auth + My Jobs read).
 * `visits`, `customers`, `sites`, `assets`, `contracts` arrive in F2–F3
 * with their own migrations — one table group per feature, not big-bang.
 */
export const employees = pgTable('employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: text('org_id').notNull(),
  clerkUserId: text('clerk_user_id').unique(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  photoUrl: text('photo_url'),
  role: text('role').notNull().default('technician'),
  status: text('status').notNull().default('invited'),
  branch: text('branch'),
  onboardingComplete: text('onboarding_complete').notNull().default('false'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: text('org_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('new'),
  priority: text('priority').notNull().default('normal'),
  complaintType: text('complaint_type').notNull().default('breakdown'),
  customerId: text('customer_id').notNull(),
  siteId: text('site_id'),
  assetId: text('asset_id'),
  assigneeId: text('assignee_id'),
  officeCode: text('office_code'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
