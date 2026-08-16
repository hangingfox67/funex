CREATE TABLE "attribute" (
	"id" serial PRIMARY KEY NOT NULL,
	"experience_id" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"confidence" real NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"risk_class" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "destination" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"currency" text NOT NULL,
	"timezone" text NOT NULL,
	"config_ref" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience" (
	"id" text PRIMARY KEY NOT NULL,
	"vendor_id" text,
	"destination_slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"meeting_points" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"duration_minutes" integer,
	"base_price_cents" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_mapping" (
	"id" serial PRIMARY KEY NOT NULL,
	"experience_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_product_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rail" (
	"id" serial PRIMARY KEY NOT NULL,
	"experience_id" text NOT NULL,
	"provider" text NOT NULL,
	"payout_model" text NOT NULL,
	"rate" real NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"health" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"destination_slug" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"claimed_by" text
);
--> statement-breakpoint
CREATE TABLE "vendor" (
	"id" text PRIMARY KEY NOT NULL,
	"destination_slug" text NOT NULL,
	"name" text NOT NULL,
	"channel_manager" text,
	"contact" jsonb,
	"health" text DEFAULT 'unknown' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zone" (
	"slug" text NOT NULL,
	"destination_slug" text NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"center" jsonb,
	"geometry" geometry(Geometry, 4326),
	CONSTRAINT "zone_destination_slug_slug_pk" PRIMARY KEY("destination_slug","slug")
);
--> statement-breakpoint
ALTER TABLE "attribute" ADD CONSTRAINT "attribute_experience_id_experience_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience" ADD CONSTRAINT "experience_vendor_id_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience" ADD CONSTRAINT "experience_destination_slug_destination_slug_fk" FOREIGN KEY ("destination_slug") REFERENCES "public"."destination"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_mapping" ADD CONSTRAINT "provider_mapping_experience_id_experience_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rail" ADD CONSTRAINT "rail_experience_id_experience_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_destination_slug_destination_slug_fk" FOREIGN KEY ("destination_slug") REFERENCES "public"."destination"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor" ADD CONSTRAINT "vendor_destination_slug_destination_slug_fk" FOREIGN KEY ("destination_slug") REFERENCES "public"."destination"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zone" ADD CONSTRAINT "zone_destination_slug_destination_slug_fk" FOREIGN KEY ("destination_slug") REFERENCES "public"."destination"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "attribute_experience_key_idx" ON "attribute" USING btree ("experience_id","key");--> statement-breakpoint
CREATE INDEX "event_session_idx" ON "event" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "event_type_idx" ON "event" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_mapping_exp_provider_idx" ON "provider_mapping" USING btree ("experience_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "rail_exp_provider_idx" ON "rail" USING btree ("experience_id","provider");