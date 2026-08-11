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
  // Optional low-opacity background image for the category card. URL-based
  // (no Storage) — existing categories without this field fall back to the
  // plain card design exactly as before.
  imageUrl?: string;
  order: number;
  createdAt: number;
}

// --- Roles & admin user management -----------------------------------
// master_admin is never stored as a Firestore role — it is derived purely
// from the account's email matching MASTER_ADMIN_EMAIL (see lib/roles.ts).
// Only 'admin' and 'moderator' accounts live in the users/{uid} collection.
export type Role = 'master_admin' | 'admin' | 'moderator';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator';
  status: 'active' | 'disabled';
  createdAt: number;
}

// --- Site-wide settings (settings/{docId}) -----------------------------
export interface SiteIdentitySettings {
  logoText: string;
  logoImageUrl: string;
}

export interface AboutSettings {
  bangladeshImageUrl: string;
  bangladeshTitle: string;
  bangladeshContent: string;
  // Replaces the old single "About the Creator" block with a full team
  // roster. teamTitle is the section heading (defaults to "Meet the
  // Team"); each member has their own avatar/name/title/bio/social links.
  teamTitle: string;
  team: TeamMember[];
}

export interface TeamMember {
  id: string;
  avatarUrl: string;
  name: string;
  title: string;
  bio: string;
  // Just URLs — the icon shown next to each is auto-detected from the URL
  // (see components/site/SocialIcon.tsx), no separate platform field to
  // keep in sync.
  socialUrls: string[];
}

export interface PrivacySettings {
  title: string;
  content: string;
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
