import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  jsonb,
  serial,
  uniqueIndex,
  index,
  primaryKey,
  customType,
} from 'drizzle-orm/pg-core';

// ── PostGIS geometry ──

export const geometry = customType<{ data: string }>({
  dataType() {
    return 'geometry(Geometry, 4326)';
  },
});

// ── M1: Experience Graph ──

export const destinations = pgTable('destination', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  currency: text('currency').notNull(),
  timezone: text('timezone').notNull(),
  configRef: text('config_ref').notNull(),
});

export const zones = pgTable('zone', {
  slug: text('slug').notNull(),
  destinationSlug: text('destination_slug')
    .notNull()
    .references(() => destinations.slug),
  name: text('name').notNull(),
  kind: text('kind').notNull(),
  center: jsonb('center').$type<{ lng: number; lat: number }>(),
  geometry: geometry('geometry'),
}, (table) => ({
  pk: primaryKey({ columns: [table.destinationSlug, table.slug] }),
}));

export const vendors = pgTable('vendor', {
  id: text('id').primaryKey(),
  destinationSlug: text('destination_slug')
    .notNull()
    .references(() => destinations.slug),
  name: text('name').notNull(),
  channelManager: text('channel_manager'),
  contact: jsonb('contact'),
  health: text('health').notNull().default('unknown'),
});

export const experiences = pgTable('experience', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').references(() => vendors.id),
  destinationSlug: text('destination_slug')
    .notNull()
    .references(() => destinations.slug),
  title: text('title').notNull(),
  category: text('category').notNull(),
  meetingPoints: jsonb('meeting_points')
    .$type<{ lat: number; lng: number; label: string }[]>()
    .notNull()
    .default([]),
  durationMinutes: integer('duration_minutes'),
  basePriceCents: integer('base_price_cents'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const attributes = pgTable('attribute', {
  id: serial('id').primaryKey(),
  experienceId: text('experience_id')
    .notNull()
    .references(() => experiences.id),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  confidence: real('confidence').notNull(),
  evidence: jsonb('evidence')
    .$type<{ source: string; pointer: string }[]>()
    .notNull()
    .default([]),
  riskClass: text('risk_class').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqExpKey: uniqueIndex('attribute_experience_key_idx').on(
    table.experienceId,
    table.key,
  ),
}));

export const providerMappings = pgTable('provider_mapping', {
  id: serial('id').primaryKey(),
  experienceId: text('experience_id')
    .notNull()
    .references(() => experiences.id),
  provider: text('provider').notNull(),
  providerProductId: text('provider_product_id').notNull(),
}, (table) => ({
  uniqExpProvider: uniqueIndex('provider_mapping_exp_provider_idx').on(
    table.experienceId,
    table.provider,
  ),
}));

export const rails = pgTable('rail', {
  id: serial('id').primaryKey(),
  experienceId: text('experience_id')
    .notNull()
    .references(() => experiences.id),
  provider: text('provider').notNull(),
  payoutModel: text('payout_model').notNull(),
  rate: real('rate').notNull(),
  priority: integer('priority').notNull().default(0),
  health: text('health').notNull().default('active'),
}, (table) => ({
  uniqExpProvider: uniqueIndex('rail_exp_provider_idx').on(
    table.experienceId,
    table.provider,
  ),
}));

// ── M9: Session ──

export const sessions = pgTable('session', {
  id: text('id').primaryKey(),
  destinationSlug: text('destination_slug').references(() => destinations.slug),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  claimedBy: text('claimed_by'),
});

// ── M10: Event Log ──

export const events = pgTable('event', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id),
  type: text('type').notNull(),
  payload: jsonb('payload').notNull().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  sessionIdx: index('event_session_idx').on(table.sessionId),
  typeIdx: index('event_type_idx').on(table.type),
}));
