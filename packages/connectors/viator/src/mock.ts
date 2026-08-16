import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { RailConnector, ViatorProduct } from './interface.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureDir = resolve(__dirname, '..', '..', '..', '..', 'fixtures');

export class MockViatorConnector implements RailConnector {
  async syncCatalog(_destination: string): Promise<ViatorProduct[]> {
    const raw = readFileSync(
      resolve(fixtureDir, 'viator-sample.json'),
      'utf-8',
    );
    return JSON.parse(raw) as ViatorProduct[];
  }

  bookingUrl(providerProductId: string, sessionId: string): string {
    return `https://www.viator.com/tours/Phuket/${providerProductId}?sid=${sessionId}&pid=P00000000`;
  }
}
