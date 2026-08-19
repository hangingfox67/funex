import type { RailConnector, ViatorProduct } from './interface.js';

const API_BASE = 'https://api.viator.com/partner';
const PHUKET_DESTINATION_ID = '349';

interface ViatorApiProduct {
  productCode: string;
  title: string;
  description: string;
  duration?: {
    fixedDurationInMinutes?: number;
    variableDurationFromMinutes?: number;
    variableDurationToMinutes?: number;
  };
  pricing?: {
    summary?: {
      fromPrice?: number;
    };
    currency?: string;
  };
  images?: {
    variants?: { url: string; width: number; height: number }[];
  }[];
  reviews?: {
    totalReviews?: number;
    combinedAverageRating?: number;
  };
  tags?: string[];
  productUrl?: string;
}

interface SearchResponse {
  products: ViatorApiProduct[];
  totalCount: number;
}

export class RealViatorConnector implements RailConnector {
  constructor(private apiKey: string) {}

  async syncCatalog(destination: string): Promise<ViatorProduct[]> {
    const destId = destination === 'phuket' ? PHUKET_DESTINATION_ID : destination;
    const allProducts: ViatorProduct[] = [];
    const pageSize = 50;
    let start = 1;
    let totalCount = Infinity;

    console.log(`  Fetching real Viator catalog for destination ${destId}...`);

    while (start <= totalCount) {
      const response = await fetch(`${API_BASE}/products/search`, {
        method: 'POST',
        headers: {
          'exp-api-key': this.apiKey,
          'Accept': 'application/json;version=2.0',
          'Accept-Language': 'en-US',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filtering: { destination: destId },
          pagination: { start, count: pageSize },
          currency: 'THB',
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Viator API error ${response.status}: ${body}`);
      }

      const data: SearchResponse = await response.json();
      totalCount = data.totalCount;

      for (const p of data.products) {
        const durationMinutes =
          p.duration?.fixedDurationInMinutes ??
          p.duration?.variableDurationFromMinutes ??
          0;

        const priceTHB = p.pricing?.summary?.fromPrice ?? 0;

        allProducts.push({
          productCode: p.productCode,
          title: p.title,
          category: this.inferCategory(p),
          description: p.description ?? '',
          durationMinutes,
          priceCents: Math.round(priceTHB * 100),
          meetingPoints: [],  // V1: meeting points not in search response, populated later
        });
      }

      console.log(`    Fetched ${allProducts.length}/${totalCount} products...`);
      start += pageSize;

      // Rate limit: 2 requests per second for partner API
      await new Promise((r) => setTimeout(r, 600));
    }

    console.log(`  Catalog sync complete: ${allProducts.length} products`);
    return allProducts;
  }

  bookingUrl(providerProductId: string, sessionId: string): string {
    return `https://www.viator.com/tours/Phuket/${providerProductId}?sid=${sessionId}&pid=P00000000`;
  }

  private inferCategory(product: ViatorApiProduct): string {
    const title = product.title.toLowerCase();
    const desc = (product.description ?? '').toLowerCase();
    const text = `${title} ${desc}`;

    if (text.includes('snorkel') && !text.includes('dive')) return 'snorkeling';
    if (text.includes('scuba') || text.includes('diving')) return 'diving';
    if (text.includes('cooking') || text.includes('culinary')) return 'cooking_class';
    if (text.includes('temple') || text.includes('buddha') || text.includes('wat ')) return 'temple_tour';
    if (text.includes('massage') || text.includes('spa') || text.includes('yoga') || text.includes('wellness')) return 'wellness';
    if (text.includes('elephant') || text.includes('wildlife') || text.includes('sanctuary')) return 'wildlife';
    if (text.includes('kayak') || text.includes('surf') || text.includes('paddleboard') || text.includes('jet ski') || text.includes('parasail')) return 'water_sport';
    if (text.includes('zipline') || text.includes('atv') || text.includes('muay thai') || text.includes('adventure')) return 'adventure';
    if (text.includes('food') || text.includes('market') || text.includes('street food') || text.includes('tasting')) return 'food_tour';
    if (text.includes('cabaret') || text.includes('nightlife') || text.includes('show') || text.includes('fantasia')) return 'nightlife';
    if (text.includes('transfer') || text.includes('airport') || text.includes('private car')) return 'transport';
    if (text.includes('island') || text.includes('boat') || text.includes('cruise') || text.includes('sailing')) return 'boat_tour';
    if (text.includes('tour') || text.includes('sightseeing') || text.includes('viewpoint')) return 'sightseeing';
    return 'activity';
  }
}
