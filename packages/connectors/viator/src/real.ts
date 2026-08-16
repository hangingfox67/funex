import type { RailConnector, ViatorProduct } from './interface.js';

export class RealViatorConnector implements RailConnector {
  constructor(private apiKey: string) {}

  async syncCatalog(_destination: string): Promise<ViatorProduct[]> {
    throw new Error(
      'Real Viator sync not yet implemented. Use MOCK_VIATOR=1.',
    );
  }

  bookingUrl(providerProductId: string, sessionId: string): string {
    return `https://www.viator.com/tours/Phuket/${providerProductId}?sid=${sessionId}&pid=P00000000`;
  }
}
