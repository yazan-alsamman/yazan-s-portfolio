/**
 * Phase 15 — client systems delivered through VegaCORE (2026-09-29), applied by
 * `pnpm cms:apply-content` together with Phase 14. English only; Arabic stays gated.
 *
 * Sources (read by the agent from the owner's project folders; nothing invented):
 * - Dr. Elias Dahdal clinic system: the requirements specification and the code (roles, models,
 *   routes, 3D patient welcome, GitHub Actions deployment); live at eliasdahdal.clinic.
 * - NewLook: its System Requirements Document (#1246/#NL1) and the code.
 * - Touché Beauty: VegaCORE's proposal to the client (2026-03-27) and the code.
 * - Zina Almokri website: its project documentation and phase reports; live at zinaalmokri.com.
 * Deliberately left out: prices and deal terms, staff and patient data, credentials.
 *
 * Screenshots (src/cms/content/media) are genuine renders, never mock-ups:
 * - clinic: the public login page of the live system (everything behind it is patient data);
 * - Zina: the live public site;
 * - NewLook / Touché: each project's own front end and API run locally (temporary containers)
 *   with the sample catalogue shipped in its database.sql — the captions say so.
 */
import type { Phase14Project, Phase14Skill } from './phase14-content';

export type MediaSpec = NonNullable<Phase14Project['cover']>;

const LIVE = (site: string) => `screenshot of the live public site ${site}, 2026-09-29`;
const LOCAL = (name: string) =>
  `screenshot of ${name} running locally from the project's own code and sample catalogue (database.sql), 2026-09-29`;
const VEGACORE = { organization: 'VegaCORE', title: 'Chief Technology Officer (CTO)' };

export const phase15Skills: Phase14Skill[] = [
  {
    name: 'MySQL',
    category: 'databases',
    provenance: 'verified',
    displayOrder: 53,
    source: 'NewLook and Touché Beauty (MySQL schema, transactional order approval)',
  },
  {
    name: 'Astro',
    category: 'frontend',
    provenance: 'verified',
    displayOrder: 48,
    source: 'Zina Almokri website (Astro 5 static site, 85 routes)',
  },
  {
    name: 'Interactive maps (Leaflet)',
    category: 'frontend',
    provenance: 'verified',
    displayOrder: 49,
    source: 'NewLook and Touché Beauty checkout (delivery location picked on a map)',
  },
];

export const phase15Projects: Phase14Project[] = [
  {
    slug: 'dr-elias-dahdal-clinic-management-system',
    title: 'Dr. Elias Dahdal Clinic — Clinic Management System',
    summary:
      'A multi-department clinic management system in production: reception, laser, dermatology and dental workflows, billing and accounting in two currencies, payroll, inventory, audit and a patient portal.',
    category: 'software-engineering',
    provenance: 'verified',
    tier: 'flagship',
    featured: true,
    sortOrder: 25,
    schematic: 'modules',
    experience: VEGACORE,
    source:
      'Owner project folder: requirements specification and code (backend models/routes, frontend pages, deploy workflow); live at eliasdahdal.clinic.',
    sections: {
      description: [
        'The operating system of a multi-department clinic, built for the Dr. Elias Dahdal clinic and running in production: one platform for reception and scheduling, the laser, dermatology and dental departments, billing, accounting, salaries and doctor shares, inventory, notifications and an audit trail — with a separate portal for patients. The interface is Arabic, right-to-left.',
      ],
      problem: [
        'A clinic with several departments runs on many people deciding at once: reception assigns specialists and rooms, each department records its own procedures, materials are consumed from a shared stock, and every payment has to be split correctly between the clinic and its doctors — in US dollars and Syrian pounds. On paper and spreadsheets, none of that can be audited.',
      ],
      constraints: [
        'Each department’s records are visible only to that department and to the super admin. Operations run inside a working day that the super admin opens and closes, and the USD/SYP exchange rate is entered once at the start of each day — every price, profit and share is calculated against it. Every staff action has to be traceable, and patients need their own, strictly limited access.',
      ],
      solution: [
        'The work started from a written requirements specification agreed with the clinic — roles, departments, procedure catalogues, pricing and the financial rules — and was built as a role-based system in which every role works in its own workspace and sees only what it is allowed to.',
      ],
      architecture: [
        'A React + TypeScript front end (Vite) and a Node.js/Express REST API over MongoDB (Mongoose). The API is organised into 23 route modules — patients, scheduling, rooms, laser, dermatology, skin, dental, solarium, clinical sessions, billing, accounting, finance, salaries, doctor shares, inventory, notifications, reports, audit, users and the patient portal — with JWT authentication kept separate for staff and patients.',
        'Deployment is automated: a GitHub Actions workflow deploys to the VPS over SSH and restarts the API under pm2.',
      ],
      decisions: [
        'A “business day” record gates daily operations and stores that day’s exchange rate, so financial records cannot drift from the rate they were created under.',
        'Authorisation follows the clinic’s organisation: eight staff roles (super admin, reception, laser, dermatology staff, manager and assistant manager, dental branch and dental assistant) map onto route-level access rules.',
        'Dermatology sessions draw their materials from the clinic inventory and report items that are running low; doctor shares are computed from percentages the super admin configures.',
      ],
      results: [
        'In production at the clinic (eliasdahdal.clinic). The patient portal covers appointments, records, a financial statement, profile and account security, and opens with a 3D welcome scene of the clinic built with React Three Fiber.',
      ],
    },
    technologies: [
      'React',
      'TypeScript',
      'Three.js / WebGL',
      'Node.js',
      'Express.js',
      'MongoDB',
      'REST API design',
      'Authentication & session security',
      'Authorization (RBAC)',
      'Internationalization & RTL',
      'CI/CD',
    ],
    cover: {
      file: 'clinic-login.webp',
      alt: 'Dr. Elias Dahdal clinic system — the public sign-in page for staff and patients (Arabic, right-to-left)',
      source: LIVE('eliasdahdal.clinic'),
    },
    seo: {
      title: 'Clinic management system — Dr. Elias Dahdal Clinic',
      description:
        'A production clinic system: reception, laser, dermatology and dental workflows, two-currency billing, doctor shares, inventory, audit and a patient portal.',
    },
  },
  {
    slug: 'newlook-ecommerce-platform',
    title: 'NewLook — Branded Footwear E-Commerce Platform',
    summary:
      'A responsive e-commerce platform for branded footwear: WhatsApp OTP sign-up, map-based local delivery or governorate shipping, two currencies, and an admin panel for products, brands, delivery areas and orders.',
    category: 'web',
    provenance: 'verified',
    tier: 'strong',
    featured: false,
    sortOrder: 112,
    schematic: 'browser',
    experience: VEGACORE,
    source: 'Owner project folder: System Requirements Document (#1246/#NL1) and code.',
    sections: {
      description: [
        'An online store for branded footwear (Nike, Louis Vuitton, New Balance, Converse and Adidas): customers browse by brand, order with local delivery or shipping to a governorate, and follow their order; the store team runs products, brands, delivery areas and orders from an admin panel.',
      ],
      problem: [
        'A local retailer needed to sell online in a market where customers identify by phone number rather than email, prices are shown in US dollars and Syrian pounds, and delivery is either to a precise location in the city or to one of the country’s governorates.',
      ],
      architecture: [
        'A React single-page application (Vite, Tailwind CSS, Framer Motion) over a PHP REST API and MySQL. Customers sign up with their WhatsApp number and a six-digit one-time code (five-minute expiry, at most three requests per phone per fifteen minutes), then set a password; sessions use JWTs.',
        'At checkout the customer chooses local delivery — picking the exact location on an interactive Leaflet map, with a fee per delivery area — or shipping to one of 13 governorates, plus a delivery date and time slot.',
      ],
      decisions: [
        'Stock is re-validated at checkout, and approving an order deducts stock inside a database transaction, so two approvals can never sell the same pair twice. The cart persists across sessions in the browser.',
      ],
    },
    technologies: [
      'React',
      'Tailwind CSS',
      'PHP',
      'MySQL',
      'REST API design',
      'Authentication & session security',
      'Interactive maps (Leaflet)',
    ],
    cover: {
      file: 'newlook-home.webp',
      alt: 'NewLook storefront home page — run locally from the project code with its sample catalogue',
      source: LOCAL('NewLook'),
    },
    gallery: [
      {
        file: 'newlook-home-full.webp',
        alt: 'NewLook home page in full: featured shoes and shop-by-brand — local run, sample catalogue with placeholder photos',
        source: LOCAL('NewLook'),
      },
      {
        file: 'newlook-product.webp',
        alt: 'NewLook product page with stock status and quantity — local run, sample catalogue with a placeholder photo',
        source: LOCAL('NewLook'),
      },
      {
        file: 'newlook-admin.webp',
        alt: 'NewLook admin dashboard: order statistics and recent orders (local run, no orders yet)',
        source: LOCAL('NewLook'),
      },
      {
        file: 'newlook-mobile.webp',
        alt: 'NewLook home page on a phone — local run',
        source: LOCAL('NewLook'),
      },
    ],
    seo: {
      title: 'NewLook — footwear e-commerce platform (React, PHP)',
      description:
        'An e-commerce platform with WhatsApp OTP sign-up, map-based delivery, governorate shipping, two currencies and transactional order approval.',
    },
  },
  {
    slug: 'touche-beauty-ecommerce-platform',
    title: 'Touché Beauty — Bilingual Beauty Store and Workshops',
    summary:
      'A bilingual (English/Arabic) online beauty store with workshop bookings: catalogue by category, cart, map-based checkout, and an admin dashboard for products, categories, delivery areas, orders and workshops.',
    category: 'web',
    provenance: 'verified',
    tier: 'strong',
    featured: false,
    sortOrder: 114,
    schematic: 'browser',
    experience: VEGACORE,
    source: 'Owner project folder: VegaCORE proposal to the client (2026-03-27) and code.',
    sections: {
      description: [
        'An online store for Touché Beauty — makeup, accessories, bags and clothing — that also sells places in the brand’s beauty workshops. VegaCORE proposed it to move the client’s shopping experience online, with an admin dashboard so the client can run the store without a developer.',
      ],
      architecture: [
        'Built on the same React (Vite, Tailwind CSS) and PHP/MySQL foundation as NewLook, extended for a bilingual brand: product and category content is stored in English and Arabic, the API answers in the visitor’s language, and the interface switches between left-to-right and right-to-left.',
        'A workshops module adds scheduled sessions with registrations that the admin reviews per workshop, alongside products, categories, delivery areas and orders.',
      ],
      decisions: [
        'Reusing a proven store foundation let the project spend its effort on what was specific to this client — bilingual content and workshops — rather than rebuilding cart, checkout and order management.',
      ],
    },
    technologies: [
      'React',
      'Tailwind CSS',
      'PHP',
      'MySQL',
      'REST API design',
      'Internationalization & RTL',
      'Interactive maps (Leaflet)',
      'Authentication & session security',
    ],
    cover: {
      file: 'touche-home.webp',
      alt: 'Touché Beauty storefront home page — run locally from the project code with its sample catalogue',
      source: LOCAL('Touché Beauty'),
    },
    gallery: [
      {
        file: 'touche-home-full.webp',
        alt: 'Touché Beauty home page in full: featured products and shop-by-category — local run, sample catalogue',
        source: LOCAL('Touché Beauty'),
      },
      {
        file: 'touche-category.webp',
        alt: 'Touché Beauty category page (bags) — local run, sample catalogue',
        source: LOCAL('Touché Beauty'),
      },
      {
        file: 'touche-admin.webp',
        alt: 'Touché Beauty admin dashboard with order statistics and account settings (local run, no orders yet)',
        source: LOCAL('Touché Beauty'),
      },
      {
        file: 'touche-mobile.webp',
        alt: 'Touché Beauty home page on a phone — local run',
        source: LOCAL('Touché Beauty'),
      },
    ],
    seo: {
      title: 'Touché Beauty — bilingual beauty store and workshops',
      description:
        'A bilingual English/Arabic beauty e-commerce platform with workshop registrations, map-based checkout and an admin dashboard (React, PHP, MySQL).',
    },
  },
  {
    slug: 'zina-personal-brand-website',
    title: 'Zina Almokri — Personal Brand Website',
    summary:
      'A bilingual, editorial website for a beauty creator: product reviews with published test conditions, a six-stage testing method, a journal and portfolio — built phase by phase with Astro and a 3D product layer.',
    category: 'web',
    provenance: 'verified',
    tier: 'strong',
    featured: false,
    sortOrder: 116,
    schematic: 'browser',
    experience: VEGACORE,
    source:
      'Owner project folder (docs, phase reports 0–17, package.json) and the public repository zina; live at zinaalmokri.com.',
    sections: {
      description: [
        'The personal website of the beauty creator Zina Almokri, live at zinaalmokri.com in English and Arabic: reviews that publish the conditions of every test, a six-stage testing method, a journal, a portfolio of work and brand collaboration enquiries.',
      ],
      constraints: [
        'Nothing about the person may be invented — no biography, audience figures, awards or product claims. The build enforces it: content is marked mock or verified, and a release guard refuses to publish mock content.',
      ],
      solution: [
        'The build was divided into phases — discovery, information architecture, creative direction, UX, design system, the signature 3D experience, content, SEO, performance, accessibility, QA and a content-management system — each closed with a written report before the next began.',
      ],
      architecture: [
        'A static Astro 5 site (85 routes across both languages) with Arabic right-to-left typography, an MDX journal, per-locale sitemaps and structured data. A Three.js layer choreographs 3D product packages alongside the editorial content, with complete fallbacks for reduced motion, Save-Data, no WebGL and no JavaScript.',
        'A custom content-management system lets an administrator edit every public word without a developer: draft and published layers, publish snapshots for rollback and an audit log.',
      ],
      results: [
        'Live at zinaalmokri.com. As recorded in the project’s reports: 685 automated tests after the CMS phase, whose public build was byte-for-byte identical to the build before it; a production audit of all 85 routes in two viewports and both languages with no console errors or failed requests; and a responsive sweep of 459 viewport-and-route combinations with no horizontal overflow.',
      ],
    },
    technologies: [
      'Astro',
      'TypeScript',
      'Three.js / WebGL',
      'Internationalization & RTL',
      'Web accessibility',
      'Performance engineering',
      'Automated testing',
    ],
    links: [
      { label: 'Live site', url: 'https://zinaalmokri.com/en/', kind: 'demo' },
      { label: 'Repository', url: 'https://github.com/yazan-alsamman/zina', kind: 'repository' },
    ],
    cover: {
      file: 'zina-home.webp',
      alt: 'Zina Almokri website home page — hero: “I test it on my own skin, then I tell you exactly what happened.”',
      source: LIVE('zinaalmokri.com'),
    },
    gallery: [
      {
        file: 'zina-chapter.webp',
        alt: 'Zina Almokri home page, chapter “Conditions” — editorial photography with the 3D product layer',
        source: LIVE('zinaalmokri.com'),
      },
      {
        file: 'zina-reviews.webp',
        alt: 'Zina Almokri reviews page — testing records with published conditions',
        source: LIVE('zinaalmokri.com'),
      },
      {
        file: 'zina-method.webp',
        alt: 'Zina Almokri method page — the six-stage test',
        source: LIVE('zinaalmokri.com'),
      },
      {
        file: 'zina-mobile.webp',
        alt: 'Zina Almokri home page on a phone',
        source: LIVE('zinaalmokri.com'),
      },
    ],
    seo: {
      title: 'Zina Almokri — bilingual personal brand website (Astro)',
      description:
        'A bilingual editorial website for a beauty creator: Astro 5, a 3D product layer, a custom CMS, verified-content guards and 685 automated tests.',
    },
  },
];
