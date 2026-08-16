import type { RailConnector } from './interface.js';
import { MockViatorConnector } from './mock.js';
import { RealViatorConnector } from './real.js';

export function createViatorConnector(): RailConnector {
  if (process.env.MOCK_VIATOR === '1' || !process.env.VIATOR_API_KEY) {
    return new MockViatorConnector();
  }
  return new RealViatorConnector(process.env.VIATOR_API_KEY);
}
