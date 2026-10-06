-- Venue register: physical locations where activities take place.
-- Enables per-product zone routing instead of destination-wide median.

CREATE TABLE IF NOT EXISTS venue (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'venue',  -- venue, pier, meeting_point, pickup_area
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  zone_slug TEXT,
  precision TEXT NOT NULL DEFAULT 'unknown',  -- exact_point, approximate_area, unknown
  verification TEXT NOT NULL DEFAULT 'unresolved',  -- verified, needs_review, unresolved
  source TEXT NOT NULL,
  source_ref TEXT,
  evidence TEXT,
  last_checked TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS product_venue (
  experience_id TEXT NOT NULL REFERENCES experience(id),
  venue_id TEXT NOT NULL REFERENCES venue(id),
  relationship TEXT NOT NULL,  -- activity_location, meeting_point, departure_pier, pickup_area
  product_option TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (experience_id, venue_id, relationship)
);
