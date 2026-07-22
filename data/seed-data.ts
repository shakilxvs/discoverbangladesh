// Imported by both scripts/seed.ts (the CLI script) and lib/seed-client.ts
// (the in-admin "Seed default data" button). The app itself never imports
// this — at runtime, categories, sub-categories and districts are read
// live from Firestore, and are fully manageable from the Admin Panel from
// that point on. This file exists purely to populate the initial state.

export interface SeedCategory {
  name: string;
  icon: string;
}

export const seedCategories: SeedCategory[] = [
  { name: 'Nature', icon: 'TreePine' },
  { name: 'Heritage', icon: 'Landmark' },
  { name: 'Infrastructure', icon: 'Building2' },
  { name: 'Adventure', icon: 'Mountain' },
  { name: 'Coastal', icon: 'Waves' },
  { name: 'Culture', icon: 'Palette' },
  { name: 'Special', icon: 'Sparkles' },
  { name: 'Eco Resorts', icon: 'Leaf' },
  { name: 'Nature Resorts', icon: 'Trees' },
];

// Full flat list of sub-categories. Order here becomes their initial
// display order (admin can reorder afterward). Includes the two additions
// requested under Special: "School Trip & Educational Tours" and
// "Picnic Spots".
export const subCategoryNames: string[] = [
  'Must Visit',
  'Hidden Gems',
  'Cinematic Places',
  'Abandoned / Forgotten Places',
  'Historical & Archaeological',
  'Zamindar Houses & Palaces',
  'Religious Heritage',
  'Tea Estates',
  'Forests & National Parks',
  'Rivers, Haors & Lakes',
  'Islands, Chars & Sandbars',
  'Hills & Mountains',
  'Waterfalls',
  'Scenic Roads & Viewpoints',
  'Seasonal Attractions',
  'Wetlands & Beels',
  'Mangrove Forests',
  'Caves & Rock Formations',
  'Cliffs & Escarpments',
  'Historic Mosques',
  'Churches',
  'Temples',
  'Buddhist Monasteries',
  'Forts & Citadels',
  'Cemeteries & Memorials',
  'Museums',
  'Bridges & Unique Structures',
  'Railway Viewpoints',
  'Historic Railway Stations',
  'Boat Routes & River Crossings',
  'Border & Zero Points',
  'Scenic Roads',
  'Night Photography Spots',
  'Trekking Routes',
  'Camping Spots',
  'Kayaking & Canoeing Spots',
  'Rock Climbing Areas',
  'Off-road Trails',
  'Beaches',
  'Lighthouses',
  'Marine Attractions',
  'Indigenous Villages',
  'Folk Villages & Craft Centers',
  'Tea Factories',
  'Wildlife & Safari',
  'Haunted / Mysterious Places',
  'Drone Photography Spots',
  'Sunrise Spots',
  'Sunset Spots',
  'Couple-Friendly Places',
  'Family-Friendly Places',
  'Movie Shooting Locations',
  'Famous Filming Locations',
  'School Trip & Educational Tours',
  'Picnic Spots',
];

// Category -> Sub-Category default mapping (many-to-many). A sub-category
// name can appear under multiple categories, e.g. "Must Visit" is valid
// everywhere.
export const categorySubCategoryMap: Record<string, string[]> = {
  Nature: [
    'Must Visit', 'Hidden Gems', 'Cinematic Places', 'Tea Estates',
    'Forests & National Parks', 'Rivers, Haors & Lakes', 'Islands, Chars & Sandbars',
    'Hills & Mountains', 'Waterfalls', 'Scenic Roads & Viewpoints', 'Seasonal Attractions',
    'Wetlands & Beels', 'Mangrove Forests', 'Caves & Rock Formations', 'Cliffs & Escarpments',
    'Trekking Routes', 'Camping Spots', 'Kayaking & Canoeing Spots', 'Rock Climbing Areas',
    'Off-road Trails', 'Beaches', 'Marine Attractions', 'Wildlife & Safari',
    'Sunrise Spots', 'Sunset Spots', 'Drone Photography Spots', 'Night Photography Spots',
  ],
  Heritage: [
    'Must Visit', 'Hidden Gems', 'Cinematic Places', 'Historical & Archaeological',
    'Zamindar Houses & Palaces', 'Religious Heritage', 'Historic Mosques', 'Churches',
    'Temples', 'Buddhist Monasteries', 'Forts & Citadels', 'Cemeteries & Memorials',
    'Museums', 'Movie Shooting Locations', 'Famous Filming Locations',
  ],
  Infrastructure: [
    'Must Visit', 'Hidden Gems', 'Cinematic Places', 'Bridges & Unique Structures',
    'Railway Viewpoints', 'Historic Railway Stations', 'Boat Routes & River Crossings',
    'Border & Zero Points', 'Scenic Roads', 'Night Photography Spots',
  ],
  Adventure: [
    'Must Visit', 'Hidden Gems', 'Cinematic Places', 'Trekking Routes', 'Camping Spots',
    'Kayaking & Canoeing Spots', 'Rock Climbing Areas', 'Off-road Trails', 'Hills & Mountains',
    'Waterfalls', 'Rivers, Haors & Lakes', 'Scenic Roads & Viewpoints',
  ],
  Coastal: [
    'Must Visit', 'Hidden Gems', 'Cinematic Places', 'Beaches', 'Islands, Chars & Sandbars',
    'Marine Attractions', 'Lighthouses', 'Boat Routes & River Crossings', 'Mangrove Forests',
    'Sunrise Spots', 'Sunset Spots',
  ],
  Culture: [
    'Must Visit', 'Hidden Gems', 'Cinematic Places', 'Indigenous Villages',
    'Folk Villages & Craft Centers', 'Tea Factories', 'Museums', 'Religious Heritage',
    'Movie Shooting Locations', 'Famous Filming Locations',
  ],
  Special: [
    'Must Visit', 'Hidden Gems', 'Cinematic Places', 'Abandoned / Forgotten Places',
    'Haunted / Mysterious Places', 'Couple-Friendly Places', 'Family-Friendly Places',
    'Drone Photography Spots', 'Night Photography Spots', 'Sunrise Spots', 'Sunset Spots',
    'School Trip & Educational Tours', 'Picnic Spots',
  ],
  'Eco Resorts': [
    'Must Visit', 'Hidden Gems', 'Cinematic Places', 'Couple-Friendly Places',
    'Family-Friendly Places', 'Sunrise Spots', 'Sunset Spots',
  ],
  'Nature Resorts': [
    'Must Visit', 'Hidden Gems', 'Cinematic Places', 'Couple-Friendly Places',
    'Family-Friendly Places', 'Tea Estates', 'Forests & National Parks', 'Rivers, Haors & Lakes',
    'Hills & Mountains', 'Waterfalls', 'Wildlife & Safari', 'Sunrise Spots', 'Sunset Spots',
  ],
};

export interface SeedDistrict {
  name: string;
  division: string;
}

// All 64 districts of Bangladesh across its 8 divisions.
export const seedDistricts: SeedDistrict[] = [
  // Barisal
  { name: 'Barguna', division: 'Barisal' },
  { name: 'Barisal', division: 'Barisal' },
  { name: 'Bhola', division: 'Barisal' },
  { name: 'Jhalokati', division: 'Barisal' },
  { name: 'Patuakhali', division: 'Barisal' },
  { name: 'Pirojpur', division: 'Barisal' },
  // Chittagong
  { name: 'Bandarban', division: 'Chittagong' },
  { name: 'Brahmanbaria', division: 'Chittagong' },
  { name: 'Chandpur', division: 'Chittagong' },
  { name: 'Chittagong', division: 'Chittagong' },
  { name: 'Comilla', division: 'Chittagong' },
  { name: "Cox's Bazar", division: 'Chittagong' },
  { name: 'Feni', division: 'Chittagong' },
  { name: 'Khagrachhari', division: 'Chittagong' },
  { name: 'Lakshmipur', division: 'Chittagong' },
  { name: 'Noakhali', division: 'Chittagong' },
  { name: 'Rangamati', division: 'Chittagong' },
  // Dhaka
  { name: 'Dhaka', division: 'Dhaka' },
  { name: 'Faridpur', division: 'Dhaka' },
  { name: 'Gazipur', division: 'Dhaka' },
  { name: 'Gopalganj', division: 'Dhaka' },
  { name: 'Kishoreganj', division: 'Dhaka' },
  { name: 'Madaripur', division: 'Dhaka' },
  { name: 'Manikganj', division: 'Dhaka' },
  { name: 'Munshiganj', division: 'Dhaka' },
  { name: 'Narayanganj', division: 'Dhaka' },
  { name: 'Narsingdi', division: 'Dhaka' },
  { name: 'Rajbari', division: 'Dhaka' },
  { name: 'Shariatpur', division: 'Dhaka' },
  { name: 'Tangail', division: 'Dhaka' },
  // Khulna
  { name: 'Bagerhat', division: 'Khulna' },
  { name: 'Chuadanga', division: 'Khulna' },
  { name: 'Jessore', division: 'Khulna' },
  { name: 'Jhenaidah', division: 'Khulna' },
  { name: 'Khulna', division: 'Khulna' },
  { name: 'Kushtia', division: 'Khulna' },
  { name: 'Magura', division: 'Khulna' },
  { name: 'Meherpur', division: 'Khulna' },
  { name: 'Narail', division: 'Khulna' },
  { name: 'Satkhira', division: 'Khulna' },
  // Mymensingh
  { name: 'Jamalpur', division: 'Mymensingh' },
  { name: 'Mymensingh', division: 'Mymensingh' },
  { name: 'Netrokona', division: 'Mymensingh' },
  { name: 'Sherpur', division: 'Mymensingh' },
  // Rajshahi
  { name: 'Bogra', division: 'Rajshahi' },
  { name: 'Chapai Nawabganj', division: 'Rajshahi' },
  { name: 'Joypurhat', division: 'Rajshahi' },
  { name: 'Naogaon', division: 'Rajshahi' },
  { name: 'Natore', division: 'Rajshahi' },
  { name: 'Pabna', division: 'Rajshahi' },
  { name: 'Rajshahi', division: 'Rajshahi' },
  { name: 'Sirajganj', division: 'Rajshahi' },
  // Rangpur
  { name: 'Dinajpur', division: 'Rangpur' },
  { name: 'Gaibandha', division: 'Rangpur' },
  { name: 'Kurigram', division: 'Rangpur' },
  { name: 'Lalmonirhat', division: 'Rangpur' },
  { name: 'Nilphamari', division: 'Rangpur' },
  { name: 'Panchagarh', division: 'Rangpur' },
  { name: 'Rangpur', division: 'Rangpur' },
  { name: 'Thakurgaon', division: 'Rangpur' },
  // Sylhet
  { name: 'Habiganj', division: 'Sylhet' },
  { name: 'Moulvibazar', division: 'Sylhet' },
  { name: 'Sunamganj', division: 'Sylhet' },
  { name: 'Sylhet', division: 'Sylhet' },
];
