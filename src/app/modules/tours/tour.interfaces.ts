export interface ITourPayload {
  guideId?: string;
  title: string;
  description: string;
  itinerary?: string;
  category: string;
  price: number;
  durationDays: number;
  physicality?: string;
  location: string;
  meetingPoint?: string;
  maxGroupSize?: number;
  thumbnailImage?: string;
  images?: string[];
  ageLimit?: string;
  departure?: string;
  departureTime?: string;
  includedLocations?: string[];
  notIncludedLocations?: string[];
}