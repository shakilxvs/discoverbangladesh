# DiscoverBangladesh

A modern, Pinterest-style directory of interesting places in Bangladesh. Next.js (App Router) + TypeScript + Tailwind v4 + Firebase (Auth + Firestore).

## What's built

**Public site:** homepage (search, keyword pills, masonry grid, categories, featured/newest places), category → sub-category → district browsing pages, spot detail pages (gallery, video embed, location button, share button, ratings, comments, related spots), light/dark/system theme.

**Admin panel** (`/admin`, gated to one admin email via email/password or Google): dashboard with live stats, full Spot management (create/edit/duplicate/delete/search, every field from spec plus a video URL), full Category and Sub-Category management (create/edit/delete/reorder, many-to-many assignment between them, the cascading picker used in the Spot form), full District management (create/edit/delete/reorder), and Comment moderation (hide/unhide/delete, plus locking comments per spot).

**Taxonomy:** fully database-driven — categories, sub-categories, their many-to-many relationships, and districts are seeded once and then managed entirely from the admin panel from then on. Nothing about the taxonomy is hardcoded into the app itself.

## One-time setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Create the admin user in Firebase**
   `.env.local` already has your real Firebase config. Firebase Auth still needs the actual user record created once:
   Firebase Console → Authentication → Users → Add user → use the email and password you set. Google sign-in needs no separate step — it auto-matches on first Google login since it checks the signed-in email, not the provider.

3. **Deploy the security rules**
   Console → Firestore Database → Rules → paste in the contents of `firestore.rules` → Publish. (Or via CLI: `firebase deploy --only firestore:rules`, if you have the Firebase CLI set up.)

4. **Seed default data**
   ```
   npm run seed
   ```
   Prompts for the admin password at runtime — it's used only for that one sign-in and is never written to any file. Seeds 9 categories, 54 sub-categories (including School Trip & Educational Tours and Picnic Spots under Special), and all 64 districts. Safe to run once; it skips itself if categories already exist.

5. **Run it**
   ```
   npm run dev
   ```
   Visit `/` for the site, `/admin` for the dashboard (redirects to `/admin/login` until you sign in). Add a few spots from `/admin/spots/new` and mark them Published to see the homepage fill in.

## Notes on a few decisions

- **No firebase-admin / service account.** Admin writes go through the regular client SDK, gated by a Firestore rule that checks `request.auth.token.email` against your admin email. Simpler, one less secret to manage.
- **Search is client-side** (Fuse.js) on the homepage and in the admin Spots search — fine up to a few thousand spots, and swapping in something like Algolia later is a contained change if the catalog outgrows it.
- **Every public data query uses a single equality filter**, with all further filtering/sorting (featured, newest, by category, by district, related spots, comment sorting) done in-memory afterward. This was a deliberate simplification: combining multiple Firestore filters with `orderBy` tends to require manually-created composite indexes, and avoiding that entirely means the whole app runs on Firestore's automatic indexes with zero extra setup on your end. Same reasoning behind why ratings are computed from a spot's comments in-memory rather than via a server-side aggregate.
- **Images accept any host** (`next.config.mjs` allows all HTTPS remote patterns) since spec calls for pasting URLs from any provider, not just a fixed CDN allowlist.
- **Video URL** accepts YouTube, Vimeo, or a direct video file link — parsed automatically into the right embed type.
- **"Lock comments on a spot"** reuses the Spot form's existing "Comments Enabled" toggle rather than adding a separate field — locking from the admin Comments page just flips that same toggle on the spot.

## Deployment

- **Vercel**: connect the GitHub repo, project name `discoverbangladesh` → `discoverbangladesh.vercel.app`. Add the same variables from `.env.local` as Vercel Environment Variables (Project Settings → Environment Variables) — `.env.local` itself is gitignored and won't be pushed via a normal `git push` (uploading through GitHub's web UI does include it, which is fine here — see the note Claude gave in chat about why).
- **GitHub**: `github.com/shakilxvs/discoverbangladesh`, public.
