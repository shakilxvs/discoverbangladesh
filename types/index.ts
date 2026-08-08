export type SpotStatus =
  | 'open'
  | 'temporarily_closed'
  | 'permanently_closed'
  | 'seasonal'
  | 'permit_required'
  | 'restricted_access'
  | 'private_property'
  | 'under_renovation'
  | 'unknown';

export type Visibility = 'published' | 'draft' | 'hidden';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  createdAt: number;
}

// Many-to-many with Category, stored on the sub-category side as an array
// of parent category IDs. This is what powers the cascading selector: pick
// categories first, then only sub-categories whose categoryIds intersect
// the selection are shown.
export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryIds: string[];
  order: number;
  createdAt: number;
}

// The homepage banner. Admin-managed list of slides — each is either an
// image or a video, shown at a 16:9 aspect ratio with the title/subtitle
// overlaid bottom-left. `order` controls slide sequence; `active` lets an
// admin hide a slide without deleting it.
export interface HeroSlide {
  id: string;
  type: 'image' | 'video';
  // Image URL for type 'image'. For type 'video': a YouTube/Vimeo link or
  // a direct .mp4/.webm URL — same as Spot.videoUrl, parsed with
  // lib/video's parseVideoUrl.
  mediaUrl: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  order: number;
  active: boolean;
  createdAt: number;
}

export interface District {
  id: string;
  name: string;
  division: string;
  slug: string;
  order: number;
}

export interface Spot {
  id: string;
  name: string;
  slug: string;
  division: string;
  district: string;
  upazila?: string;
  address?: string;
  description: string;
  locationUrl: string;
  featuredImage: string;
  galleryImages: string[];
  // Optional — admin pastes a single link (YouTube, Vimeo, or a direct
  // video file URL) the same way Location URL works. Rendered as an
  // embedded player alongside the gallery on the spot detail page.
  videoUrl?: string;
  categoryIds: string[];
  subCategoryIds: string[];
  keywords: string[];
  status: SpotStatus;
  visibility: Visibility;
  featured: boolean;
  commentsEnabled: boolean;
  verified: boolean;
  createdAt: number;
  updatedAt: number;
}

// Rating and comment are the same submission (name + 1-5 stars + optional
// text), which is what "Simple 5-star rating, show average" plus
// "Comments — automatically approved" collapse down to. Average/count are
// computed on read via a Firestore aggregation query rather than
// denormalized onto the Spot, so no Cloud Function is needed to keep them
// in sync.
export interface Comment {
  id: string;
  spotId: string;
  authorName: string;
  rating: number;
  text?: string;
  hidden: boolean;
  createdAt: number;
}
