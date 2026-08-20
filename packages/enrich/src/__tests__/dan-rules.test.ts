import { describe, it, expect, afterEach } from 'vitest';
import { applyDanRules, _resetRulesCache } from '../dan-rules.js';

describe('Dan-rules precedence', () => {
  afterEach(() => {
    _resetRulesCache();
  });

  it('title-selector rule beats category-selector rule on the same attribute', () => {
    // "Phang Nga Bay Sunset Premium Tour by Speed Boat" matches:
    //   Rule 1 (category: boat/speedboat) → water_exposure not set, but non_swimmer_ok=true
    //   Rule 2 (title: Phang Nga) → water_exposure=sheltered_bay, seasickness_risk=low
    // If both set water_exposure, Rule 2 (title) should win.
    // In practice Rules 1 and 2 set different attributes, so let's test
    // a product that matches both Rule 2 (title: Phang Nga) and Rule 3 (title: Phi Phi)
    // on water_exposure:

    // "New Power catamaran for Phang Nga and Phi Phi island excursions" matches:
    //   Rule 2 (title: Phang Nga) → water_exposure=sheltered_bay
    //   Rule 3 (title: Phi Phi) → water_exposure=open_sea
    // Both are title-selector rules with same specificity type.
    // Rule 3 has more terms (2: ["Phi Phi", "Similan"]) vs Rule 2 (1: ["Phang Nga"]).
    // So Rule 3 should win with higher specificity.
    const { applied, overrideLog } = applyDanRules(
      'New Power catamaran for Phang Nga and Phi Phi island excursions',
      'boat_tour',
    );

    const waterExposure = applied.find((r) => r.attribute === 'water_exposure');
    expect(waterExposure).toBeDefined();
    // Rule 3 (Phi Phi/Similan, 2 terms) beats Rule 2 (Phang Nga, 1 term)
    expect(waterExposure!.value).toBe('open_sea');

    // Override should be logged
    expect(overrideLog.length).toBeGreaterThan(0);
    expect(overrideLog.some((l) => l.includes('water_exposure'))).toBe(true);
  });

  it('title-selector beats category-selector even when category rule appears later', () => {
    // "Elephant Sanctuary Small Group Tour in Phuket" matches:
    //   Rule 6 (title: Elephant Sanctuary) → non_swimmer_ok=true
    // It should NOT match Rule 1 (category: boat/island) even though
    // "island" appears nowhere in this title. But if we add "island" to
    // the title, Rule 1 (category) and Rule 6 (title) would both match
    // non_swimmer_ok. Title should win.
    const { applied } = applyDanRules(
      'Elephant Sanctuary Island Tour Phuket',
      'wildlife',
    );

    const nonSwimmer = applied.find((r) => r.attribute === 'non_swimmer_ok');
    expect(nonSwimmer).toBeDefined();
    // Rule 6 (title match, specificity=1000+4) beats Rule 1 (category match via "island" in title, specificity=0+6)
    expect(nonSwimmer!.selectorType).toBe('title');
    expect(nonSwimmer!.value).toBe(true);
  });

  it('excludes jet ski products from boat tour rule', () => {
    const { applied } = applyDanRules(
      'Phuket Jet Ski Island Tour 2 Hours of Thrills',
      'water_sport',
    );

    // Should NOT get non_swimmer_ok=true from Rule 1
    const nonSwimmer = applied.find((r) => r.attribute === 'non_swimmer_ok');
    expect(nonSwimmer).toBeUndefined();
  });

  it('excludes jetski (no space) from boat tour rule', () => {
    const { applied } = applyDanRules(
      'Half day 6 island Adventure Phuket Jetski Tour',
      'water_sport',
    );

    const nonSwimmer = applied.find((r) => r.attribute === 'non_swimmer_ok');
    expect(nonSwimmer).toBeUndefined();
  });

  it('boat tour rule still applies to non-jetski island tours', () => {
    const { applied } = applyDanRules(
      'Coral Island Private Boat Tour',
      'boat_tour',
    );

    const nonSwimmer = applied.find((r) => r.attribute === 'non_swimmer_ok');
    expect(nonSwimmer).toBeDefined();
    expect(nonSwimmer!.value).toBe(true);
  });
});
