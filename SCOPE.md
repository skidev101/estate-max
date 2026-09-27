# EstateMax Arewa Nigeria — V1 Product Requirements Document (PRD)

**Scope:** Phase 1 — MVP only

---

## 1. Product Summary

EstateMax Arewa Nigeria is a free property marketplace for Northern Nigeria, with optional paid visibility (featured listings) and business tools for firms. V1's job is to prove the core loop: **owners/agents/firms list properties for free → buyers/tenants discover and search them → both sides connect and transact off-platform.**

Everything not required for that loop is out of scope for V1.

## 2. V1 Goals

- Launch a working marketplace with free listings across Buy, Rent, Land, and Commercial categories
- Support three listing-provider types: Owner, Agent, Firm — each with basic verification
- Enable search/filter/discovery good enough to be usable, not exhaustive
- Enable enquiries via contact form, phone, and WhatsApp
- Give admin the tools to moderate listings, verification, and reports
- Support paid Featured Listings as the only monetization in V1
- Publish EstateMax Insights (content/SEO) to start building local search authority

## 3. Explicitly Out of Scope for V1

(Deferred to Phase 2+ per the blueprint — flag immediately if the client tries to fold these in)

- Map-based search, saved searches, notifications, in-platform messaging
- Property comparison, inspection requests, reviews/ratings
- Advanced analytics, recommendations, mobile apps
- Diaspora features (multi-currency, international payments, virtual tours)
- Property management, valuation, financing, insurance, AI/AR/VR/blockchain
- Pro/Agent paid plan (blueprint says: "does not need to be heavily developed in V1")
- Favourites — blueprint marks this as "if development capacity allows," so treat as stretch, not committed

## 4. User Roles (V1)

| Role                 | Can do                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Visitor**          | Browse, search, filter, read Insights, view agent/firm profiles, contact providers                                                         |
| **Property Owner**   | Register, verify, list free, manage own listings, receive enquiries, promote, mark sold/rented                                             |
| **Estate Agent**     | Register, professional profile, verify, list, manage multiple listings, receive enquiries, promote                                         |
| **Real Estate Firm** | Company account, verify business, company profile, manage properties, add team members/agents, receive enquiries, promote, basic analytics |
| **Admin**            | Manage users, listings (approve/reject/edit/delete/feature), verification, payments, subscriptions, blog, locations, reports, settings     |

## 5. Core V1 Features

### 5.1 Search & Filters

- Search by keyword, state, city, area, property type, purpose (buy/rent)
- Filters: buy/rent, property type, location, price range, bedrooms, bathrooms, size, furnished, verified, provider type (owner/agent/firm), featured

### 5.2 Property Listing

- Listing form: title, description, type, purpose, price, location (state/city/area), bedrooms, bathrooms, size, amenities, photos, videos, contact info, provider identity, verification status
- Listing lifecycle: **Submitted → Review → Approved → Published**, with a "Requires Changes → Resubmitted" branch
- Admin can approve, reject, suspend, edit, delete, feature

### 5.3 Verification

- Owner, Agent, and Firm verification flows
- Workflow: **Submitted → Under Review → Approved/Rejected**
- Verification status must be visibly displayed on listings and profiles (this is a stated trust-differentiator, not cosmetic — build it as a first-class UI element, not an afterthought)

### 5.4 Featured Listings (Monetization)

- Paid visibility: featured badge, higher search placement, homepage/location-page exposure
- Admin controls price, duration, placement, availability
- This is the **only** paid feature in V1 — Business plan and Pro/Agent plan are described in the blueprint but not required for V1 launch

### 5.5 Enquiries

- Contact form, phone, and WhatsApp on every property page
- Enquiry record tied to user, property, provider, message, status, date

### 5.6 Reporting

- Users can report: fraud, fake listing, duplicate listing, incorrect info, suspicious user, other
- Workflow: **Report → Investigation → Action → Resolved**
- Admin actions: warning, remove listing, suspend listing, suspend account, ban account

### 5.7 Dashboards

- **Owner:** overview, my properties, add property, enquiries, promotions, verification, profile, settings
- **Agent:** same as owner + analytics
- **Firm:** overview, properties, team, agents, enquiries, analytics, promotions, subscription, company profile, settings
- **Admin:** full platform management (users, properties, verification, reports, payments, subscriptions, featured listings, blog, locations, pages, FAQs, settings)

### 5.8 Content / SEO (EstateMax Insights)

- Blog/articles with categories, authors, tags, SEO metadata
- Location pages structured Region → State → City → Area (e.g. "Houses for Sale in Kaduna")
- This is a launch requirement, not a later add-on — the blueprint's marketing strategy depends on location-page SEO from day one

## 6. Public Site Structure (V1)

Home · Buy · Rent · Land · Commercial · Property Details · Agents · Firms · List Property · Pricing · About · Contact · Help/FAQ · Insights (articles, area guides, market reports) · Login/Register/Forgot Password/Account Verification

## 7. Data Model (V1 entities)

Users · Properties · Firms · Agents · Enquiries · Subscriptions (Featured only, for now) · Promotions · Verification · Reports · Content (articles) · Locations (Region → State → City → Area)

Full field lists are in the source blueprint (Section 8) — carry those over as-is when building schema.

## 8. Trust & Safety (build in from day one)

- Verification status visible everywhere
- Listing moderation before publish
- Duplicate/fraud reporting
- Terms of Service + Privacy Policy
- Platform disclaimer: EstateMax connects but does not guarantee ownership — encourage independent verification before payment

## 9. Open Questions for the Client

- What counts as "verification" in practice for an individual owner (ID? proof of ownership document? phone OTP only)? This materially changes scope and timeline.
- Payment provider for Featured Listings — any existing preference (Paystack/Flutterwave)?
- Who moderates listings at launch — is there an ops/admin person, or does that fall on you/the dev team initially?
- Any existing property inventory to seed the marketplace with at launch, or starting from zero?

## 10. Suggested Build Order

1. Data model + auth + user roles
2. Property listing CRUD + admin approval workflow
3. Search/filter + public property pages
4. Verification workflow
5. Enquiries (form/phone/WhatsApp)
6. Featured listings + payment integration
7. Dashboards (owner/agent/firm/admin)
8. Reporting workflow
9. Insights/blog + location pages (SEO)
