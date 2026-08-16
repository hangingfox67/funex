export interface ViatorProduct {
  productCode: string;
  title: string;
  category: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
  meetingPoints: { lat: number; lng: number; label: string }[];
}

export interface RailConnector {
  syncCatalog(destination: string): Promise<ViatorProduct[]>;
  bookingUrl(providerProductId: string, sessionId: string): string;
}
