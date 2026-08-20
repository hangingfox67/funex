export * from './schema.js';
export { db, client } from './connection.js';
export { searchExperiences, type ExperienceRow, type CatalogStats } from './search.js';

/** Fixture experiences use this ID prefix. They must never appear in serving-path results. */
export const FIXTURE_ID_PREFIX = 'exp_phuket_';

/** Returns true if the experience ID belongs to a fixture product. */
export function isFixture(experienceId: string): boolean {
  return experienceId.startsWith(FIXTURE_ID_PREFIX);
}
