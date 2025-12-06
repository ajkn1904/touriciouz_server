export interface ITourPayload {
  guideId?: string;
  title: string;
  description: string;
  itinerary?: string;
  category: string;
  packagePrice: number;
  guideFee: number;
  durationDays: number;
  physicality?: string;
  location: string;
  meetingPoint?: string;
  maxGroupSize?: number;
  images?: string[];
  ageLimit?: string;
  departure?: string;
  departureTime?: string;
  includedLocations?: string[];
  notIncludedLocations?: string[];
  priceIncludes?: string[];
  priceExcludes?: string[];
}