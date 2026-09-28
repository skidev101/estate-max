# EstateMax Arewa Nigeria — V1 Product Requirements Document (PRD)

**Scope:** Phase 1 — MVP only
**Source:** EstateMax Arewa Nigeria Product & Brand Blueprint
**Status:** Decisions locked (§13). Implementation begins at §11 step 0/1.

---

## 1. Product Summary

EstateMax Arewa Nigeria is a free property marketplace for Northern Nigeria, with optional paid visibility (featured listings). V1's job is to prove the core loop: **registered firms list properties for free → buyers and tenants discover and search them → both sides connect and transact off-platform.**

Everything not required for that loop is out of scope for V1.

**EstateMax is a discovery and connection layer, not a transaction venue.** The platform's responsibility ends at connecting a buyer with a firm. Payment, documentation, and transfer happen directly between the parties, off-platform. This is a deliberate position — it is why V1 requires no buyer accounts, no escrow, and no transaction handling. Any commission model would apply only where EstateMax directly facilitates a transaction, which the blueprint defers to Phase 2+.

**Strategic principle (from the blueprint):** Trust → Inventory → Discovery → Engagement → Monetization → Ecosystem. V1 covers the first four stages and one monetization mechanism.

---

## 2. V1 Goals

- Launch a working marketplace with free listings across Buy, Rent, Land, and Commercial categories
- Support **firm accounts** as the only listing providers, verified by phone OTP and document review
- Enable search/filter/discovery good enough to be usable, not exhaustive
- Enable enquiries via contact form, phone, and WhatsApp
- Give admin the tools to moderate listings, firm verification, and reports
- Support paid Featured Listings via Paystack as the only monetization in V1
- Publish EstateMax Insights (content/SEO) to start building local search authority
- Be mobile-first, because the target market is mobile-dominant

**Launch bar (blueprint's Strategic Principle).** V1 has succeeded when there is: a populated property database, active firms, organic search traffic, returning users, and market credibility.

### Two confirmed risks

**1. Cold start — confirmed real.** The client is launching with **zero inventory and no firm relationships**. Under firms-only, supply cannot be bootstrapped by letting owners list directly, which the blueprint assumed. Every listing at launch must come from a firm that has been recruited, onboarded, and verified first. **A seeding plan is a launch prerequisite, not a growth task** (see §12).

**2. Inventory friction.** The blueprint's stated approach is *"reduce the barrier to getting property inventory onto EstateMax. A large, useful inventory is more important at launch than maximizing revenue immediately"* (§2.1). Restricting listing to registered firms raises that barrier. This is a deliberate trade of inventory velocity for provider legitimacy — correct **if** a clean, verified supply side is the priority. Risk 1 makes the trade sharper: there is no fallback supply.

---

## 3. Listing Providers — Firms Only

**Decision:** Only registered real-estate firms may list properties in V1. The Property Owner and Estate Agent roles are removed.

| Removed role | Consequence |
| --- | --- |
| **Property Owner** | An individual homeowner must register a firm to list. Contradicts blueprint §1.4 — *"Accessibility — make property listing and discovery accessible to ordinary property owners as well as professional agents and firms"* — and removes the blueprint's Property Owner journey from the product. |
| **Estate Agent** | Individual agents cannot list unless they incorporate. Removes the Agent journey and two of three verification flows. |

**Migration path to communicate:** an individual agent or owner who wants to list must register as a firm. **CAC registration is NOT required** (confirmed) — only phone OTP plus document review. This keeps the barrier meaningfully lower than incorporation would have made it, which materially reduces the inventory risk above.

**Reinstating either role later is a schema migration**, not a config change — it changes the `Users.role` enum and requires re-attributing existing properties. To keep that door open cheaply, `Properties.provider_type` is **retained with `firm` as the only value V1 accepts** (§7).

---

## 4. User Roles & Authentication (V1)

**Three roles. Two have accounts.**

| Role | Account? | Can do |
| --- | --- | --- |
| **Visitor** | No | Browse, search, filter, read Insights, view firm profiles, contact firms via form/phone/WhatsApp, submit reports |
| **Firm** | Yes | Register company account, verify business, company profile, manage properties, add team members, receive enquiries, promote listings, basic analytics |
| **Admin** | Yes | Manage users, listings, firm verification, payments, blog, locations, reports, settings |

**Firm sub-roles.** Firm staff log in as individual users. A user belongs to exactly one firm in V1:

- `firm_admin` — manages company profile, team members, promotions
- `firm_staff` — manages listings and enquiries only

This preserves a real actor on every listing and admin action. If firms later need staff across multiple firms, `Users.firm_id` becomes a join table — noted, not built.

### Authentication method (confirmed)

| Purpose | Method |
| --- | --- |
| **Account login** | Email + password |
| **Phone verification** | OTP via SMS, at the verification step only |

Auth and verification are deliberately separate concerns: passwords get firms in, phone OTP proves control of the number buyers will actually call. **No SMS cost is incurred at login** — only at verification.

- SMS provider: **Termii** (Nigerian routes, lowest cost per SMS). Requires a registered Nigerian business to open the account — **verify this against the client's incorporation status before step 4.**
- Password reset via email.

**Buyers and tenants do not register.** They browse anonymously and enquire through the contact form, phone, or WhatsApp. This is a locked decision (§13 #3) and reversible cheaply — `Enquiries.sender_user_id` exists in the schema but is unused in V1.

**Removed from the Admin role vs. the blueprint:** "manage subscriptions" — see §5.4.

---

## 5. Core V1 Features

### 5.1 Search & Filters

- Search by keyword, state, city, area, property type, purpose (buy/rent)
- Filters: buy/rent, property type, location, price range, bedrooms, bathrooms, size, furnished, verified, featured
- **Provider-type filter removed** — it filtered on owner/agent/firm, which has one value in V1
- **Price range filtering must account for rent period.** Rentals are quoted annually in this market; a bare price comparison across `per_year` and `total` listings is wrong. Filter UI groups by period before comparing (§7, `price_period`).

### 5.2 Property Listing

- Listing form: title, description, type, purpose, price, price period, location (state/city/area), bedrooms, bathrooms, size + unit, amenities, photos, videos, contact info, firm identity, verification status
- Lifecycle: **Draft → Submitted → Under Review → Approved → Published**, with a **Requires Changes → Resubmitted** branch, plus **Rejected**, **Suspended**, and terminal **Sold / Rented** states
- Admin can approve, reject, suspend, edit, delete, feature

### 5.3 Firm Verification (confirmed method)

**The full flow:**

1. Firm registers → email/password account created
2. **Phone OTP** — firm proves control of its contact number (Termii)
3. **Document upload** — firm submits verification documents
4. **Manual admin review** — a human reviews and decides
5. **Approved** → verified badge appears on listings, profile, and search results

**Statuses:** `unverified` → `submitted` → `under_review` → `approved` / `rejected`, with a **`requires_changes` → resubmitted** branch.

- **The rework branch is a V1 requirement, not an enhancement.** Without it, a firm whose document was merely blurry has no path back and must re-register — directly undermining the trust objective this feature exists to serve.
- **Verification carries more weight here than in the blueprint.** With one provider type, this badge is the platform's *entire* trust signal. The blueprint spread trust across three provider types; V1 concentrates it into one.
- Verification status must be visibly displayed on listings and firm profiles, and defined in the design system (§10).

**Document handling — security requirements.** Verification documents are identity documents (proof of business, proof of address). They must not be publicly reachable:

- Stored in Cloudinary with **`type: authenticated`** — unreachable without a signed URL
- Separate upload preset from listing media, so the two cannot be confused at upload time
- Admins view documents **through a backend proxy endpoint** that mints short-lived signed URLs and writes an audit log entry. The raw Cloudinary URL never reaches the browser.
- Only `firm_admin` and platform admins may trigger document access

**Document retention — policy required, not yet decided (§12 Q1).** Either delete documents on approval and retain only the verified flag (data minimisation) or retain them for dispute handling. Affects the Verification schema.

### 5.4 Featured Listings (Monetization)

- Paid visibility: featured badge, higher search placement, homepage/location-page exposure
- Admin controls price, duration, placement, availability
- **Payment provider: Paystack** (confirmed). Single integration, single webhook handler.
- A Featured purchase creates a `Promotion` record carrying payment status, provider, and reference — this is V1's payment record (§7). No separate Payments entity is needed.
- This is the **only** paid feature in V1. Neither the Business plan nor the Pro/Agent plan ships.
- **Monetization flag:** the blueprint describes the Business plan as *"primarily for real-estate firms"* (§2.3). With firms as the only provider type and the Business plan deferred, V1 has **one paid product aimed at one customer type**. Consistent with the blueprint's sequencing, but thin — a conscious choice, not an oversight.

### 5.5 Enquiries

- Contact form, phone, and WhatsApp on every property page
- Enquiry record tied to property, firm, sender details, message, channel, status, date
- **The enquiry record is V1's primary business record.** It yields the firm's lead list, platform demand data by location and property type, and a contactable audience for marketing. No buyer account is required for any of this.
- **Channel semantics.** Only the contact form produces a message. Phone and WhatsApp are contact-intent events recorded without a message body. They remain the primary conversion signal in this market.
- **No buyer accounts** (§4). Mandatory signup before contacting a provider is a severe drop-off. `Enquiries.sender_user_id` is unused in V1 so adding buyer accounts later is additive.

### 5.6 Reporting

- Visitors and firms can report: fraud, fake listing, duplicate listing, incorrect info, suspicious user, other
- Workflow: **Reported → Investigating → Actioned → Resolved** (with a **Dismissed** outcome)
- Admin actions: warning, **suspend listing**, **remove listing**, suspend account, ban account
- **Suspend vs. remove — distinct actions:** *suspend* is temporarily hidden, still owned by the firm, reversible, reason shown to the firm. *Remove* is deleted from public view, terminal, firm notified with reason.

### 5.7 Dashboards

**Two dashboards: Firm and Admin.**

- **Firm:** overview, properties, add property, team, enquiries, promotions, basic analytics, company profile, settings
- **Admin:** users, firms, properties, verification, reports, payments, featured listings, blog, locations, pages, FAQs, settings

**Admin console is operator-grade (confirmed — a dedicated ops person reviews at launch).** The review queue must support:

- Filtering and sorting across listings and verification submissions
- **Bulk actions** (approve/reject multiple)
- **Reviewer assignment**
- **Audit history** on every action, with reviewer identity and timestamps
- Internal notes on submissions
- Queue depth and ageing visible at a glance

This is more admin build than a lean dev-team queue would need — the trade was accepted deliberately for review turnaround and accountability.

**Removed surfaces:** Firm "Subscription" tab and Admin "Subscriptions" — the Business plan is out of V1 scope, and an empty subscription surface implies a product that does not exist.

**"Advanced analytics" (§3) vs. "basic analytics":** dashboards ship **counts and simple time-series only** — listing views, enquiry counts, channel breakdown, active promotions. No cohorts, funnels, benchmarking, or exports.

### 5.8 Content / SEO (EstateMax Insights)

- Blog/articles with categories, authors, tags, SEO metadata
- Location pages structured Region → State → City → Area (e.g. "Houses for Sale in Kaduna")
- Launch requirement, not a later add-on — the blueprint's marketing strategy depends on location-page SEO from day one
- **Structure alone does not rank.** V1 must carry a content plan or the location pages will be thin pages search engines discount:
  - The ten blueprint categories: Arewa real-estate news, state market updates, property investment, land, development projects, buying guides, renting guides, property documentation, area guides, diaspora property investment
  - Minimum coverage: one location page per state (19 states + FCT) and one area guide per launch city
  - Target phrase to own: **"Real Estate in Arewa Nigeria"**
- **This carries more weight than planned.** With zero starting inventory (§2), organic search is one of the few demand channels that does not require supply to already exist.

### 5.9 Favourites — Deferred to Phase 2

Requires a buyer account to save to. With no buyer accounts in V1, there is nowhere to store a favourite. Moved to Phase 2 bundled with buyer accounts, saved searches, and notifications — which share the dependency.

---

## 6. Public Site Structure (V1)

Home · Buy · Rent · Land · Commercial · Property Details · Firms · List Property · Pricing · About · Contact · Help/FAQ · Insights (articles, area guides, market reports) · Firm Registration / Login / Forgot Password

**Changes from the blueprint's structure:**

- **"Agents" page removed** — no agent role
- **Login/Register is firm-only.** No public consumer signup. Present the entry point as *"List your property — register your firm"*, or visitors will attempt to sign up as buyers and hit a wall.
- **"Pricing" describes Featured Listings only** — must not imply a subscription tier exists.

---

## 7. Data Model (V1 entities)

Field lists below are the authoritative V1 schema input. The blueprint's Section 8 is an entity sketch, not a field specification.

**Conventions:** every table has `id`, `created_at`, `updated_at`. Money is stored as integer minor units with an explicit `currency`. All public-facing entities have a unique `slug`.

### Users

`id` · `full_name` · `email` (unique) · `phone` (unique) · `password_hash` · `role` (`firm` | `admin`) · `firm_id` (nullable — required when `role = firm`) · `firm_role` (`firm_admin` | `firm_staff`, nullable) · `account_status` (`pending` | `active` | `suspended` | `banned`) · `email_verified_at` · `last_login_at` · `created_at` · `updated_at`

*No `verification_status` on Users — verification attaches to the Firm, not to individuals.*

### Firms

`id` · `company_name` · `slug` · `logo_url` · `description` · `contact_email` · `contact_phone` · `whatsapp` · `phone_verified_at` (nullable — set on OTP success) · `state_id` · `city_id` · `address` · `business_registration_number` (nullable — **not required in V1**) · `verification_status` (`unverified` | `submitted` | `under_review` | `requires_changes` | `approved` | `rejected`) · `created_at` · `updated_at`

*No `subscription_status` — the Business plan is out of scope. `rc_number` renamed to `business_registration_number` and made explicitly optional, since CAC is not required.*

### ~~Agents~~ — DELETED

*Removed with the Agent role. Agent profile fields are not needed — the firm is the public-facing provider identity.*

### Properties

`id` · `slug` · `provider_type` (`owner` | `agent` | `firm` — **V1 writes `firm` only**, value retained for Phase 2) · `provider_firm_id` (required) · `created_by_user_id` (audit) · `title` · `description` · `property_type` · `purpose` (`buy` | `rent`) · `price` · `currency` (`NGN`) · `price_period` (`total` | `per_year` | `per_month`) · `state_id` · `city_id` · `area_id` · `address` · `bedrooms` · `bathrooms` · `size_value` · `size_unit` (`sqm` | `sqft` | `plots` | `hectares`) · `amenities` · `furnished` · `verification_status` · `featured_status` · `publication_status` · `rejection_reason` (nullable) · `published_at` · `created_at` · `updated_at`

**Fields added beyond the blueprint:**
- `price_period` — price without a period is unusable for rentals, quoted annually in this market
- `size_unit` — "size" is meaningless across land (plots/hectares) and buildings (sqm/sqft)
- `rejection_reason` — required for the Requires Changes branch to give the firm anything actionable
- `created_by_user_id` — with firm staff accounts, listing authorship must be auditable

### Media

`id` · `property_id` · `type` (`photo` | `video`) · `url` · `thumbnail_url` · `sort_order` · `mime_type` · `size_bytes` · `cloudinary_public_id` · `created_at`

### Enquiries

`id` · `property_id` · `firm_id` · `sender_user_id` (**nullable, unused in V1** — reserved for Phase 2 buyer accounts) · `sender_name` · `sender_phone` · `sender_email` · `message` (nullable) · `channel` (`form` | `phone` | `whatsapp`) · `status` (`new` | `read` | `responded` | `closed`) · `created_at`

### Verification

`id` · `firm_id` · `submitted_by_user_id` · `documents` (Cloudinary authenticated public_ids + metadata) · `phone_otp_verified_at` · `status` (`submitted` | `under_review` | `requires_changes` | `approved` | `rejected`) · `requires_changes_reason` (nullable) · `reviewer_admin_id` · `review_notes` · `assigned_to_admin_id` (nullable — reviewer assignment) · `submitted_at` · `reviewed_at` · `created_at` · `updated_at`

*Retained as its own entity rather than fields on Firms, because resubmission history matters — a firm that failed twice and passed on the third attempt is a different risk profile than one that passed first time. `documents_deleted_at` (nullable) to be added if the §12 Q1 retention policy is delete-on-approval.*

### AdminAuditLog *(new — required by the operator-grade console decision)*

`id` · `admin_user_id` · `action` · `target_type` · `target_id` · `metadata` · `ip_address` · `created_at`

*Covers listing moderation, verification decisions, document access, user actions, and payment adjustments. The dedicated-ops decision makes this a V1 requirement, not a nice-to-have — with a non-developer operator making decisions, accountability must be structural.*

### Reports

`id` · `reporter_user_id` (nullable — visitors may report) · `target_type` (`property` | `firm`) · `target_id` · `reason` (`fraud` | `fake_listing` | `duplicate` | `incorrect_info` | `suspicious_user` | `other`) · `description` · `status` (`reported` | `investigating` | `actioned` | `resolved` | `dismissed`) · `admin_id` · `admin_action` · `resolved_at` · `created_at`

### Promotions

*V1's payment record. Replaces the absent Payments table.*

`id` · `property_id` · `purchased_by_user_id` · `promotion_type` (`featured`) · `amount` · `currency` (`NGN`) · `payment_status` (`pending` | `paid` | `failed` | `refunded`) · `payment_provider` (`paystack`) · `payment_reference` (unique — required for webhook idempotency) · `starts_at` · `ends_at` · `status` (`pending` | `active` | `expired` | `cancelled`) · `created_at` · `updated_at`

### Content

`id` · `slug` · `title` · `excerpt` · `body` · `author_user_id` (admin) · `category_id` · `tags` · `seo_title` · `seo_description` · `og_image_url` · `status` (`draft` | `published`) · `published_at` · `created_at` · `updated_at`

### Locations

`id` · `level` (`region` | `state` | `city` | `area`) · `parent_id` · `name` · `slug` · `seo_intro` · `created_at` · `updated_at`

**Region → State mapping — CONFIRMED:**

| Region | States |
| --- | --- |
| North West | Jigawa, Kaduna, Kano, Katsina, Kebbi, Sokoto, Zamfara |
| North East | Adamawa, Bauchi, Borno, Gombe, Taraba, Yobe |
| North Central | Benue, Kogi, Kwara, Nasarawa, Niger, Plateau |
| Federal Capital Territory | Abuja (FCT, its own region) |

19 states + FCT. Seed as a migration; `seo_intro` filled per state for the location pages in §5.8.

### Not modelled in V1

Agents (role removed), Payments (absorbed into Promotions), Subscriptions, Buyer accounts, Favourites, Notifications, Messages, Reviews, Saved Searches.

---

## 8. Trust & Safety (build in from day one)

- Firm verification status visible everywhere
- Listing moderation before publish
- Duplicate/fraud reporting
- Terms of Service + Privacy Policy
- Platform disclaimer — **use the blueprint's wording verbatim** (legal-adjacent text):

  > EstateMax helps you discover and connect with property providers. Always independently verify ownership, documentation and transaction details before making payments or commitments.

- Fraud-awareness content in Help/FAQ
- **Concentrated trust risk.** With firms as the only provider type, trust rests entirely on firm verification. If verification is weak or slow, there is no second trust signal — the blueprint's three-provider-type spread was itself risk mitigation. This is why a dedicated ops reviewer was chosen (§5.7) and why document handling is hardened (§5.3).

---

## 9. Non-Functional Requirements

**Targets confirmed as the V1 acceptance bar**, to be revisited after launch metrics exist.

### Mobile-first (blueprint requirement)

- Mobile layouts designed and built **before** desktop, per blueprint §10
- Primary breakpoint **360px**; secondary **768px**; desktop **1280px**
- All public pages and the listing form fully usable one-handed on a mid-range Android device

### Performance

- **LCP < 2.5s** on a 3G-class connection, mobile
- **Search returns first results in < 1s** at 10k listings
- Server-rendered or statically generated public pages — SEO depends on it

### Media

- Photos: max **20** per listing, **5MB** each, JPEG/PNG/WebP — auto-resized and thumbnailed on upload
- Video: max **1** per listing, **50MB**, MP4
- Server-side validation, not client-only
- Cloudinary's automatic WebP/AVIF conversion is used to serve modern formats — directly supports the LCP target

### Storage

**Cloudinary for all media** (confirmed), with access type split by sensitivity:

| Asset | Cloudinary type | Access |
| --- | --- | --- |
| Listing photos, video | `upload` (default) | Public via CDN |
| Verification documents | **`authenticated`** | Signed URLs only, via backend proxy, audit-logged |

- Separate upload presets per folder so the two classes cannot be confused at upload
- Server-side resize on upload (Cloudinary transforms are not relied on for listing media sizing)

### Currency & locale

- **NGN only** in V1. `currency` field retained for future multi-currency
- English only
- Phone numbers validated for Nigerian formats (+234)

### Accessibility & quality

- **WCAG 2.1 AA** for public pages
- Verified and Featured indicators must not rely on colour alone

### SEO

- Server-rendered HTML, semantic markup, per-page metadata
- `sitemap.xml`, `robots.txt`, canonical URLs on all location and listing pages
- Structured data (`RealEstateListing`, `Organization`) on listing and firm profile pages

### Security

- Password hashing (bcrypt/argon2); rate limiting on auth and enquiry endpoints
- **Phone OTP:** rate-limited per number and per IP, time-boxed codes, attempt caps, single-use codes. The OTP endpoint is publicly reachable and costs money per send — it is a fraud and cost-abuse target.
- **Anonymous enquiry endpoint** is public — needs honeypot + per-IP throttle. Without buyer accounts it is the most exposed write endpoint in the system.
- Verification document access is proxied and audit-logged (§5.3)
- Paystack webhooks idempotent via `payment_reference`; signature verification mandatory
- Admin actions written to `AdminAuditLog`

### Infrastructure

- **Web** → Vercel
- **API** → managed container host (Railway / Render / Fly)
- **Postgres + Redis** → managed
- Accepted trade: multi-vendor, cost scales up. Chosen for least operational overhead and native Next.js fit.

---

## 10. Design & Brand Foundation (Phase 0)

The blueprint specifies a design system and a Phase 0 that the build order must not skip. Verification and Featured indicators are brand-system components, not incidental UI.

**Phase 0 deliverables (blueprint §10 and §12):**

- Brand identity — logo usage, primary and secondary colours, typography
- UX architecture and sitemap
- Design system — buttons, cards, forms, icons, badges, alerts, spacing scale, responsive breakpoints
- **Verification indicators** — one visual language across listing cards, listing pages, and firm profiles. With one provider type this is the platform's primary trust element.
- **Featured indicators** — visually distinct from verification (trust vs. paid placement are different claims and must never be confusable)
- Technical architecture
- Legal/trust framework — ToS, Privacy Policy, disclaimer

**Design principles:** Clarity, Trust, Local relevance, Mobile-first, Property-first. The blueprint is explicit that EstateMax must not look like a generic classifieds site, and that imagery and content should authentically represent Arewa.

---

## 11. Build Order

0. **Phase 0 — Brand, design system, UX architecture, sitemap, legal framework.** Runs in parallel with step 1; must complete before step 3.
1. **Repo & toolchain fixes** (§12 Q4) + data model + auth (firm/admin, email+password) + Locations seeding
2. Property listing CRUD + Cloudinary media upload + admin approval workflow
3. Search/filter + public property pages + firm directory (mobile-first)
4. Firm verification — phone OTP (Termii) + document upload (authenticated) + review queue with audit log
5. Enquiries (form/phone/WhatsApp) + channel tracking + spam protection
6. Featured listings + Paystack integration
7. Firm and Admin dashboards (operator-grade admin console)
8. Reporting workflow
9. Insights/blog + location pages + launch content set (SEO)

*Removed from the earlier build order: owner and agent dashboards, agent profiles, multi-provider verification. Favourites moved to Phase 2.*

---

## 12. Open Questions

### Blocks step 1

1. **Verification document retention policy.** Delete documents on approval and keep only the verified flag (data minimisation, less liability), or retain them for dispute handling? Affects the `Verification` schema. *Owner: client.*
2. **Termii account prerequisites.** Termii requires a registered Nigerian business to open an account. If the client's own incorporation is not complete, this blocks step 4 — check before starting it. *Owner: client.*
3. **Cold-start / seeding plan.** Confirmed launching from zero inventory with no firm relationships. Under firms-only there is no fallback supply. **This is a launch prerequisite**: which firms are being recruited, by whom, and how many listings are needed before public launch. *Owner: client.*
4. **Repo and toolchain defects found during review** — see §13 #19–22. These must be fixed before any commit, since committing bakes in a broken install.

### Non-blocking — needed before launch

5. **Who the dedicated ops reviewer is, and when they start.** Confirmed that one exists; the admin console in §5.7 is built for them. *Owner: client.*
6. **Non-functional targets** are confirmed as the acceptance bar and will be revisited once real launch metrics exist.

### Not specified in either source document

7. **Timeline, budget, and team size.** Neither document states dates or effort. Verification scope and the firm onboarding bar are the largest variables.

---

## 13. Decisions Locked

Flag any you disagree with and it will be reopened.

| # | Decision | Rationale |
| --- | --- | --- |
| 1 | **Firms are the only listing providers.** Owner and Agent roles removed. | Client instruction. Trades inventory velocity for provider legitimacy — see §2, §3. |
| 2 | **`Properties.provider_type` retained, `firm`-only in V1** | Phase 2 re-add becomes a config change, not a migration across every property. |
| 3 | **No buyer accounts.** Anonymous browse and enquiry. | Derived from "no other roles." EstateMax is a connection layer, not a transaction venue. `sender_user_id` reserved for Phase 2. |
| 4 | **Favourites deferred to Phase 2** | Requires a buyer account to save to. Bundles with saved searches and notifications. |
| 5 | **CAC registration NOT required** to register as a firm | Client confirmed. Meaningfully lowers the onboarding barrier and reduces the §2 inventory risk. |
| 6 | **Verification = phone OTP + document upload + manual admin review** | Strongest option, and with one provider type the badge is the entire trust mechanism. |
| 7 | **Auth = email/password; phone OTP at verification only** | Separates auth from verification; no SMS cost per login. |
| 8 | **SMS provider: Termii** | Nigerian routes, lowest cost. Prerequisite check in §12 Q2. |
| 9 | **Payment provider: Paystack** | Dominant in Nigeria, best-documented, mature webhooks. |
| 10 | **Storage: Cloudinary, with `authenticated` type for verification documents + backend proxy + audit log** | Client chose single-provider simplicity; authenticated delivery closes the PII exposure that choice would otherwise create. |
| 11 | **Dedicated ops reviewer at launch → operator-grade admin console** | Confirmed. Drives bulk actions, assignment, audit log, and the new `AdminAuditLog` entity. |
| 12 | **Region mapping: 3 zones + FCT as its own region, 19 states + FCT** | Confirmed. Seeds Locations and drives SEO URL structure. |
| 13 | **Prisma aligned on 7.x stable** | CLI was `8.0.0-rc.17` against client `^7.10.0` — mismatched majors with an RC in the production path. |
| 14 | **NFR targets accepted as the V1 acceptance bar** | LCP < 2.5s @ 3G, search < 1s @ 10k, 20×5MB photos, 1×50MB video, WCAG 2.1 AA. |
| 15 | **Deployment: Vercel + managed container host + managed PG/Redis** | Least operational overhead, native Next.js fit. Multi-vendor cost accepted. |
| 16 | Business plan cut; Firm "Subscription" and Admin "Subscriptions" surfaces removed | Featured is the only paid feature; an empty subscription surface implies a product that doesn't exist. |
| 17 | Payments absorbed into `Promotions` | Neither source doc had a Payments entity, but Admin "manage payments" implied one. |
| 18 | Requires Changes branch added to firm verification | Blueprint had it for listings only. Without it a blurry document means permanent rejection. |
| 19 | "Suspend listing" and "remove listing" defined as distinct | Blueprint listed them as peers — suspend is reversible, remove is terminal. |
| 20 | Mobile-first promoted to an NFR with breakpoints | Blueprint §10 required it; the previous PRD never mentioned mobile. |
| 21 | Phase 0 (brand, design system, UX, legal) restored as build step 0 | Blueprint specified it; the previous build order started at the data model. |
| 22 | `price_period`, `size_unit`, `created_by_user_id` added; `channel` enum; nullable `message`; `AdminAuditLog` added | Each fixes an ambiguity or a missing accountability surface. |
| 23 | Blueprint's disclaimer restored verbatim | Legal-adjacent text; the previous PRD paraphrased it. |
| 24 | Launch content set added to §5.8 | Blueprint specified Insights structure but the PRD dropped the strategy. Structure alone does not rank. |
| 25 | **Flagged:** V1 has one paid product for one customer type | Firms-only plus deferred Business plan leaves Featured as the sole monetization. |
| 26 | **Flagged:** trust rests on firm verification alone | Blueprint spread trust across three provider types; V1 concentrates it into one. |
| 27 | **Flagged:** cold start is a first-order launch risk | Confirmed zero starting inventory, and firms-only removes the owner bootstrap path. |
