/**
 * Real portfolio content recovered from the owner's legacy website (migration input, 2026-09-28).
 *
 * Source: https://yazan-alsamman.github.io — owner-confirmed as his site (CONTENT_MIGRATION), and
 * designated by the owner (2026-09-28) as the authoritative source for his existing portfolio
 * content. The CMS is the runtime source of truth: `pnpm cms:import-legacy` writes this dataset into
 * Payload (idempotent), after which it is edited in the dashboard, never here or in components.
 *
 * Extraction rules (docs/reports/REAL_CONTENT_MIGRATION_REPORT.md):
 *  - Text is the legacy text. Only spelling/formatting is normalised (every change is listed in
 *    `normalised`); nothing is added, improved or translated.
 *  - Not migrated: private data (LEGACY_CONTENT_INVENTORY §4), numeric skill percentages and
 *    counters, template/placeholder text, the superseded legacy job titles, statements that
 *    contradict other legacy facts, and images that are not genuine screenshots of the work.
 *  - Arabic: the legacy site has no Arabic content. Nothing is written in Arabic; every record
 *    stays unpublished in Arabic (per-locale Translation status + the copy-review gate).
 */

export const LEGACY_ORIGIN = 'https://yazan-alsamman.github.io';

/** Every legacy page (crawl 2026-09-28: 21 pages, all HTTP 200; repository has exactly these 21). */
export const legacyPages = [
  { path: '/index.html', purpose: 'Home: about, personal details, counters, skills, interests' },
  { path: '/resume.html', purpose: 'Resume: summary, education, professional experience' },
  { path: '/services.html', purpose: 'Certificates (29 lines in 6 groups)' },
  { path: '/portfolio.html', purpose: 'Portfolio index: 16 project cards' },
  { path: '/contact.html', purpose: 'Contact: address, phone, email, non-functional form' },
  { path: '/portfolio-details_ai_project_management.html', purpose: 'Project P1' },
  { path: '/portfolio-details_Diagnosis_AI.html', purpose: 'Project P2' },
  { path: '/portfolio-details_Robot_obstacles.html', purpose: 'Project P3' },
  { path: '/portfolio-details_Student_management_Distributed_system.html', purpose: 'Project P4' },
  { path: '/portfolio-details_Service_provider.html', purpose: 'Project P5' },
  { path: '/portfolio-details_taxi_elite.html', purpose: 'Project P6' },
  { path: '/portfolio-details_car_rending.html', purpose: 'Project P7' },
  { path: '/portfolio-details_car.html', purpose: 'Project P8' },
  { path: '/portfolio-details_projecthub.html', purpose: 'Project P9' },
  { path: '/portfolio-details_fitness.html', purpose: 'Project P10' },
  { path: '/portfolio-details_smarthome.html', purpose: 'Project P11' },
  { path: '/portfolio-details_galaxico.html', purpose: 'Project P12' },
  { path: '/portfolio-details_ecommerce.html', purpose: 'Project P13' },
  { path: '/portfolio-details_tachstore.html', purpose: 'Project P14' },
  { path: '/portfolio-details_compiler.html', purpose: 'Project P15' },
  { path: '/portfolio-details_uni.html', purpose: 'Project P16' },
] as const;

type Source = { source: string; normalised?: string[] };

/** Profile (EN). Identity (name/title) stays the owner-confirmed one (OWNER_PROFILE). */
export const legacyProfile = {
  source: '/index.html (About), /resume.html (intro)',
  shortBio:
    'Dedicated and detail-oriented developer with a strong passion for building scalable and efficient mobile and web applications. Committed to delivering high-quality solutions that meet user needs and business goals.',
  longBio: [
    'Passionate about creating innovative mobile and web solutions that enhance user experiences and drive business success.',
    'Committed to continuous learning and professional growth, I strive to deliver innovative solutions that meet the evolving needs of users and businesses alike.',
    'With a strong foundation in both technical expertise and creative problem-solving, I am committed to delivering high-quality solutions that drive success and innovation. My passion for continuous learning and professional growth ensures that I stay ahead of industry trends and consistently exceed expectations.',
  ],
  normalised: ['index: final period added to “…businesses alike”'],
  /** Validated (HTTP 200) and linked from the legacy site as the home of his projects. */
  socialLinks: [{ network: 'github' as const, url: 'https://github.com/yazan-alsamman' }],
};

/** Skills: names only (legacy percentages are never migrated — CONTENT_MODEL). Legacy order. */
export const legacySkills: (Source & { name: string; category: string })[] = [
  { name: 'HTML', category: 'frontend', source: '/index.html', normalised: [] },
  { name: 'CSS', category: 'frontend', source: '/index.html' },
  { name: 'JavaScript', category: 'frontend', source: '/index.html' },
  { name: 'Java', category: 'programming', source: '/index.html', normalised: ['“java” capitalised'] },
  { name: 'Arduino', category: 'other', source: '/index.html' },
  { name: 'Python', category: 'programming', source: '/index.html' },
  { name: 'PHP', category: 'backend', source: '/index.html' },
  { name: 'Flutter', category: 'mobile', source: '/index.html' },
  { name: 'C++', category: 'programming', source: '/index.html' },
  {
    name: 'SQL database engineering',
    category: 'databases',
    source: '/index.html',
    normalised: ['“SQL Database engeneering” → spelling'],
  },
  {
    name: 'ASP.NET',
    category: 'backend',
    source: '/index.html',
    normalised: ['“Asp.Net” → official casing'],
  },
  { name: 'Cyber Security', category: 'other', source: '/index.html' },
  {
    name: 'Problem Solving',
    category: 'other',
    source: '/index.html',
    normalised: ['“PROBLEM SOLVING” casing'],
  },
];

/** Education (EN). Years only on the legacy site → year precision (no month is displayed). */
export const legacyEducation = {
  source: '/resume.html (Education); /index.html (“Degree”)',
  institution: 'European International University (EIU)',
  degree: 'Bachelor of Information Technology',
  startYear: 2021,
  endYear: 2025,
  description:
    'During my studies, I gained a strong foundation in information technology, focusing on innovative problem-solving and the development of scalable, user-centered solutions.',
  normalised: ['“European Internaional University,EIU” → spelling and “(EIU)”'],
};

/**
 * Certificates (legacy services.html, titled “certificates”): 29 lines “<topic> license from
 * <issuer>”, 28 distinct (the “Cyber Security” line appears twice). No files, dates, IDs or URLs.
 * Imported as CMS DRAFTS: the dashboard requires the certificate file before publication, and
 * “license” is not published as a professional-licence claim (LEGACY_CONTENT_INVENTORY §3.7).
 */
export const legacyCertificates: { name: string; issuer: string; group: string; legacy: string }[] = [
  ['HTML', 'chyiar academy', 'Front-end', 'Html license from chyiar academy'],
  ['CSS', 'chyiar academy', 'Front-end', 'Css license from chyiar academy'],
  ['Bootstrap', 'chyiar academy', 'Front-end', 'bootstrap license from chyiar academy'],
  ['JavaScript', 'chyiar academy', 'Front-end', 'JavaScript license from chyiar academy'],
  [
    'Front-end Developer',
    'X-academy focalX',
    'Front-end',
    'Front-end Devloper license from X-academy focalX',
  ],
  ['React', 'X-academy focalX', 'Front-end', 'React license from X-academy focalX'],
  ['PHP', 'chyiar academy', 'Back-end', 'php license from chyiar academy'],
  ['MySQL', 'chyiar academy', 'Back-end', 'MySql license from chyiar academy'],
  ['ASP.NET', 'chyiar academy', 'Back-end', 'ASP.net license from chyiar academy'],
  ['Node.js', 'X-academy focalX', 'Back-end', 'Nodejs license from X-academy focalX'],
  ['MongoDB', 'X-academy focalX', 'Back-end', 'mangoDB license from X-academy focalX'],
  ['Back-end', 'X-academy focalX', 'Back-end', 'Back-end license from X-academy focalX'],
  ['Dart', 'Wael abo hamzeh INC', 'Mobile Applications', 'Dart license from Wael abo hamzeh INC'],
  ['Flutter', 'Wael abo hamzeh INC', 'Mobile Applications', 'Flutter license from Wael abo hamzeh INC'],
  ['Firebase', 'Wael abo hamzeh INC', 'Mobile Applications', 'Firebase license from Wael abo hamzeh INC'],
  [
    'State Management',
    'Wael abo hamzeh INC',
    'Mobile Applications',
    'State Management license from Wael abo hamzeh INC',
  ],
  ['SQFlite', 'Wael abo hamzeh INC', 'Mobile Applications', 'SQFlite license from Wael abo hamzeh INC'],
  [
    'Arduino',
    'Syrian Scientific Society for Informatics',
    'Robotics',
    'Arduino license from Syrian Scientific Society for Informatics.',
  ],
  [
    'Arduino ARC',
    'Syrian Scientific Society for Informatics',
    'Robotics',
    'Arduino ARC license from Syrian Scientific Society for Informatics.',
  ],
  [
    'WRO',
    'Syrian Scientific Society for Informatics',
    'Robotics',
    'WRO license from Syrian Scientific Society for Informatics.',
  ],
  [
    'A+',
    'Syrian Scientific Society for Informatics',
    'Networking',
    'A+ license from Syrian Scientific Society for Informatics.',
  ],
  [
    'Computer Network ARC',
    'Syrian Scientific Society for Informatics',
    'Networking',
    'Computer Network ARC license from Syrian Scientific Society for Informatics.',
  ],
  [
    'Networking',
    'Syrian Scientific Society for Informatics',
    'Networking',
    'Networking license from Syrian Scientific Society for Informatics.',
  ],
  ['OSINT', 'Security Blue Team Academy', 'Cyber Security', 'Osint license from Security Blue Team Academy.'],
  [
    'Penetration Testing',
    'Security Blue Team Academy',
    'Cyber Security',
    'penetration testing license from Security Blue Team Academy.',
  ],
  [
    'Threat Hunting',
    'Security Blue Team Academy',
    'Cyber Security',
    'threat Hunting license from Security Blue Team Academy.',
  ],
  [
    'Incident Response',
    'Security Blue Team Academy',
    'Cyber Security',
    'Incident Response license from Security Blue Team Academy.',
  ],
  [
    'Cyber Security',
    'Security Blue Team Academy',
    'Cyber Security',
    'Cyber Security license from Security Blue Team Academy. (listed twice)',
  ],
].map(([name, issuer, group, legacy]) => ({ name: name!, issuer: issuer!, group: group!, legacy: legacy! }));

export type LegacyImage = { path: string; sha256: string; alt: string };
export type LegacyProject = Source & {
  key: string;
  slug: string;
  title: string;
  summary: string;
  /** Overview paragraphs (legacy detail text), empty when it would only repeat the summary. */
  overview: string[];
  architecture?: string[];
  category: string;
  /** Legacy “Project date” (month precision; day dropped). */
  date?: string;
  repository?: string;
  technologies?: string[];
  images: LegacyImage[];
  featured: boolean;
  sortOrder: number;
  seo: { title: string; description: string };
  /** 'published' in English, or 'draft' when the legacy content cannot be published as is. */
  status: 'published' | 'draft';
};

const img = (path: string, sha256: string, alt: string): LegacyImage => ({ path, sha256, alt });
const P = '/assets/img/portfolio/';

export const legacyProjects: LegacyProject[] = [
  {
    key: 'P1',
    source: '/portfolio-details_ai_project_management.html',
    slug: 'ai-intelligence-project-management-system',
    title: 'AI Intelligence Project Management System',
    summary:
      'AI-powered enterprise project and task management platform with intelligent task generation and smart assignment.',
    overview: [
      'An advanced AI-powered enterprise project and task management platform that combines intelligent task generation, smart task assignment algorithms, and comprehensive project management capabilities. The system features multi-company support, role-based access control (Super Admin, Admin, Project Manager, Developer, Client), real-time collaboration, and built-in delay tracking with AI-driven insights.',
    ],
    architecture: [
      'Built with a full-stack architecture using Node.js/Express backend with MongoDB, Next.js frontend, and Flutter mobile application. The AI components include task generation using multiple LLMs (Groq API, Mistral 7B, Qwen 2.5), a custom neural network with FAISS retrieval system, a greedy algorithm for optimal task assignment with time conflict detection, and an expert system for task classification.',
      'Key technologies: Node.js, Express.js, MongoDB, Next.js, React, Flutter, Tailwind CSS, FastAPI, JWT Authentication, Argon2 hashing, Helmet, CORS, Rate Limiting, Chart.js, Framer Motion, Swiper, and Tauri for desktop deployment.',
    ],
    category: 'artificial-intelligence',
    date: '2026-01',
    technologies: ['Flutter'],
    images: [],
    featured: true,
    sortOrder: 1,
    seo: {
      title: 'AI Intelligence Project Management System',
      description:
        'AI-powered enterprise project and task management platform with intelligent task generation and smart assignment.',
    },
    status: 'published',
  },
  {
    key: 'P2',
    source: '/portfolio-details_Diagnosis_AI.html',
    slug: 'breast-tumor-diagnosis-system',
    title: 'Breast Tumor Diagnosis System',
    summary: 'Breast tumor diagnosis system using an AI-powered medical diagnosis tool.',
    normalised: ['“AI powered” hyphenated; article “an” added'],
    overview: [],
    category: 'artificial-intelligence',
    repository:
      'https://github.com/yazan-alsamman/Breast-Tumor-Diagnosis-System-AI-Powered-Medical-Diagnosis-Tool',
    images: [
      img(
        `${P}Diagnosis_AI/1.png`,
        '671c4554a3d4f249c613deccd76890ef9d58c0e577123aca96f44835fb8c8575',
        'Breast Tumor Diagnosis System, “AI-Powered Medical Diagnosis Tool”: the input form for the mean values',
      ),
      img(
        `${P}Diagnosis_AI/2.png`,
        '36b4d51fb7422b6128592959ea6dceaf084a6cf01332e71b1009b73355a2edb9',
        'Breast Tumor Diagnosis System: the input form for the standard error values',
      ),
      img(
        `${P}Diagnosis_AI/3.png`,
        '96e81dcf349af18430576cc1174faeb6650d37ab9057a9552a588a1fd47c186d',
        'Breast Tumor Diagnosis System: the “worst” values inputs with buttons to fill malignant, benign or random sample data',
      ),
      img(
        `${P}Diagnosis_AI/4.png`,
        '0b4c7e13cc9efd3c1a47bf41355e0ff949dfa7cc8d1c5d645bf6be0224371313',
        'Breast Tumor Diagnosis System: a diagnosis result of “Malignant” with the benign and malignant tumor probabilities',
      ),
      img(
        `${P}Diagnosis_AI/5.png`,
        'e1c386e271f8dd0789f2b1bc07e7b7001d3100045036a0e6e317c9de50be977f',
        'Breast Tumor Diagnosis System: a diagnosis result of “Benign” with the benign and malignant tumor probabilities',
      ),
    ],
    featured: true,
    sortOrder: 2,
    seo: {
      title: 'Breast Tumor Diagnosis System',
      description:
        'Breast tumor diagnosis system using an AI-powered medical diagnosis tool. Source code on GitHub.',
    },
    status: 'published',
  },
  {
    key: 'P3',
    source: '/portfolio-details_Robot_obstacles.html',
    slug: 'robot-obstacles-avoidance-system',
    title: 'Robot Obstacles Avoidance System (Fuzzy System, Neural Networks)',
    summary: 'Robot obstacles avoidance system using fuzzy system and neural networks.',
    overview: [],
    category: 'robotics',
    images: [],
    featured: true,
    sortOrder: 3,
    seo: {
      title: 'Robot Obstacles Avoidance System',
      description: 'Robot obstacles avoidance system using fuzzy system and neural networks.',
    },
    status: 'published',
  },
  {
    key: 'P9',
    source: '/portfolio-details_projecthub.html (+ portfolio.html card)',
    slug: 'project-hub-application',
    title: 'Project Hub Application',
    summary: 'Project hub application for managing projects.',
    overview: [
      'AI-powered application for software team task organization and managing tasks from programmers and clients.',
    ],
    normalised: ['card “Ai powerd … manage tasks” → “AI-powered … managing tasks”'],
    category: 'mobile',
    repository: 'https://github.com/yazan-alsamman/project-hub',
    images: [
      img(
        `${P}projecthub/projecthub2.png`,
        'bf8ec6cc9e6632cc0c6aff3818c2af9f3935e90df2f90b8ba0186ac507c1e835',
        'Project Hub mobile app: the Team Members list with roles, status and email',
      ),
      img(
        `${P}projecthub/projecthub3.png`,
        'ebe5490ad8562aac96cb609fc39c55fe4560d6f9d6d2e2e309842c1996cb8828',
        'Project Hub mobile app: a team member profile with basic and contact information',
      ),
      img(
        `${P}projecthub/projecthub4.png`,
        '552eea3d192a737a4dcbe0a9267d78c04bbb1fc083832db3cd8ff373eb89fd02',
        'Project Hub mobile app: the navigation menu (Team, Tasks, Settings, Projects, Analytics, Project Dashboard, Assignment)',
      ),
      img(
        `${P}projecthub/projecthub5.png`,
        '48e7d37857b0e651d7d9f89010ea604336f214a0ebe7314fd5901c0652c6f1b3',
        'Project Hub mobile app: the Tasks screen with status filters and task cards',
      ),
      img(
        `${P}projecthub/projecthub6.png`,
        'ad985dcceaae325f4b86fb4816a3c32232ae0f6e4dc7bf6a243cf47cc3b30f3c',
        'Project Hub mobile app: the Projects screen with project cards and progress',
      ),
      img(
        `${P}projecthub/projecthub7.png`,
        '764ff85f5c9746b8fda50671e1ec81464de0fd21c39ab786b38023037d629ae1',
        'Project Hub mobile app: the Employee Schedule screen with employee and date-range selection',
      ),
    ],
    featured: false,
    sortOrder: 4,
    seo: {
      title: 'Project Hub Application',
      description:
        'Project hub mobile application for managing projects: software team task organization for programmers and clients.',
    },
    status: 'published',
  },
  {
    key: 'P7',
    source: '/portfolio-details_car_rending.html',
    slug: 'car-renting-application',
    title: 'Car Renting Application',
    summary: 'Car renting application for renting cars.',
    normalised: ['“rending” → “renting” (the legacy text itself says “for renting cars”)'],
    overview: [],
    category: 'mobile',
    repository: 'https://github.com/yazan-alsamman/car-rending',
    images: [
      img(
        `${P}carrending/carrending1.png`,
        '233c236405e1e2b95734995698638ba5046c60489e614a96fa4324b2a5759bfe',
        'Car renting mobile app: onboarding screen “Easy & Fast Booking”',
      ),
      img(
        `${P}carrending/carrending2.png`,
        '4ff2d3a083b2ff0575779b19a4c577720d41c4a71b29066cac9265469e128a04',
        'Car renting mobile app: the “Welcome back” sign-in screen',
      ),
      img(
        `${P}carrending/carrending3.png`,
        '09f82c66eb2e154159920556f48245c4c3c8b08b94905f006605f19c11570ec6',
        'Car renting mobile app: the explore screen with top brands and top-rated cars',
      ),
      img(
        `${P}carrending/carrending4.png`,
        'cf157c3dbf4f36d3f730099a3dc6cd95e6a174c82f6aa52851ff7443e569a41e',
        'Car renting mobile app: a car details screen with specifications and highlights',
      ),
    ],
    featured: false,
    sortOrder: 5,
    seo: {
      title: 'Car Renting Application',
      description: 'Car renting mobile application for renting cars. Source code on GitHub.',
    },
    status: 'published',
  },
  {
    key: 'P4',
    source: '/portfolio-details_Student_management_Distributed_system.html',
    slug: 'student-management-distributed-system',
    title: 'Student Management Distributed System',
    summary: 'Student management distributed system using distributed system architecture.',
    overview: [],
    category: 'software-engineering',
    repository: 'https://github.com/yazan-alsamman/Distributed-System-Student-Management',
    images: [],
    featured: false,
    sortOrder: 6,
    seo: {
      title: 'Student Management Distributed System',
      description:
        'Student management distributed system using distributed system architecture. Source code on GitHub.',
    },
    status: 'published',
  },
  {
    key: 'P5',
    source: '/portfolio-details_Service_provider.html',
    slug: 'services-provider-application',
    title: 'Services Provider Application',
    summary: 'Services provider application for managing services and providers.',
    overview: [],
    category: 'software-engineering',
    repository: 'https://github.com/yazan-alsamman/ServicesProvider',
    images: [],
    featured: false,
    sortOrder: 7,
    seo: {
      title: 'Services Provider Application',
      description:
        'Services provider application for managing services and providers. Source code on GitHub.',
    },
    status: 'published',
  },
  {
    key: 'P6',
    source: '/portfolio-details_taxi_elite.html',
    slug: 'taxi-elite-application',
    title: 'Taxi Elite Application',
    summary: 'Taxi elite application for renting taxis.',
    overview: [],
    category: 'mobile',
    repository: 'https://github.com/yazan-alsamman/Taxi-app-Elite-',
    images: [],
    featured: false,
    sortOrder: 8,
    seo: {
      title: 'Taxi Elite Application',
      description: 'Taxi Elite mobile application for renting taxis. Source code on GitHub.',
    },
    status: 'published',
  },
  {
    key: 'P10',
    source: '/portfolio-details_fitness.html',
    slug: 'fitness-mobile-application',
    title: 'Fitness Mobile Application',
    summary:
      'A dynamic and user-friendly mobile platform designed to help individuals achieve their health and fitness goals.',
    overview: [
      "The Fitness Application is a dynamic and user-friendly mobile platform designed to help individuals achieve their health and fitness goals. Whether you're a beginner or a seasoned athlete, this app provides personalized workout plans, nutrition guidance, and progress tracking to keep you motivated and on track.",
    ],
    category: 'mobile',
    date: '2023-05',
    repository: 'https://github.com/yazan-alsamman/fitness-App',
    images: [],
    featured: false,
    sortOrder: 9,
    seo: {
      title: 'Fitness Mobile Application',
      description:
        'Fitness mobile application with personalized workout plans, nutrition guidance and progress tracking.',
    },
    status: 'published',
  },
  {
    key: 'P11',
    source: '/portfolio-details_smarthome.html',
    slug: 'smarthome-mobile-application',
    title: 'SmartHome Mobile Application',
    summary:
      'A mobile application that allows users to control and monitor their smart home devices from their smartphones.',
    overview: [
      'The SmartHome Mobile Application is a cutting-edge solution designed to bring convenience, security, and efficiency to modern homes. This app allows users to control and monitor their smart home devices seamlessly from their smartphones, creating a connected and intelligent living environment.',
    ],
    category: 'mobile',
    date: '2023-02',
    images: [],
    featured: false,
    sortOrder: 10,
    seo: {
      title: 'SmartHome Mobile Application',
      description:
        'SmartHome mobile application that allows users to control and monitor their smart home devices from their smartphones.',
    },
    status: 'published',
  },
  {
    key: 'P12',
    source: '/portfolio-details_galaxico.html',
    slug: 'system-management',
    title: 'System Management',
    summary: 'A cloud-based platform designed to streamline and automate human resources processes.',
    overview: [
      'The System Management is a comprehensive, cloud-based platform designed to streamline and automate human resources processes, enabling organizations to manage their workforce efficiently and effectively. This system empowers HR teams to focus on strategic initiatives by simplifying administrative tasks, improving employee engagement, and ensuring compliance with regulations.',
    ],
    category: 'web',
    date: '2024-03',
    images: [],
    featured: false,
    sortOrder: 11,
    seo: {
      title: 'System Management (HR)',
      description:
        'System Management: a cloud-based platform designed to streamline and automate human resources processes.',
    },
    status: 'published',
  },
  {
    key: 'P14',
    source: '/portfolio-details_tachstore.html (+ portfolio.html card)',
    slug: 'basic-online-e-commerce-platform',
    title: 'Basic Online E-Commerce Platform',
    summary: 'Basic web project for training.',
    overview: [
      'The Basic Online E-Commerce Platform is a simple, no-frills solution for small businesses or individuals looking to sell products online. While it may lack advanced features, it provides the essentials to get started with online selling. This platform is ideal for those who need a straightforward way to list products, manage orders, and accept payments without the complexity of more sophisticated systems.',
    ],
    category: 'web',
    images: [
      img(
        `${P}techstore/1.png`,
        '72569051e5d2d7f769d62e14c3bac2aeefa1681ffe69f12d1b6b7ed59a0ad1e3',
        'Tech Store web project: the home page with the phones and laptops categories',
      ),
      img(
        `${P}techstore/2.png`,
        'da6650f57ce057911ee21f6c69977bcacb98a20cccd9977aa8a5380b75da08de',
        'Tech Store web project: the phones product listing',
      ),
      img(
        `${P}techstore/3.png`,
        '6e87f472a9f4a61298109e2b0a553e531f9dd93741da93b216bc824462d7bd37',
        'Tech Store web project: the laptops product listing',
      ),
      img(
        `${P}techstore/4.png`,
        'bcb652fc52dd4cc8f13f7fcc8ca851aa630efb8b118baa5b2857d0264a4c7c00',
        'Tech Store web project: a product page with about, pros and cons',
      ),
      img(
        `${P}techstore/5.png`,
        '8c81925372610560432753e32aa4a64e6804bd1963c4727378ff3f1bf3920011',
        'Tech Store web project: the login form',
      ),
      img(
        `${P}techstore/6.png`,
        '2349d1c1a3c60fb25d045c2b1910ab769d13c66adfd308dcaf1dae5119a246c3',
        'Tech Store web project: the sign-up form',
      ),
      img(
        `${P}techstore/7.png`,
        'e388661ceec7df7486342b72a965ff5ec1f4b4bd6adf2e7c81057b13dec09e98',
        'Tech Store web project: the shopping cart with quantities and total',
      ),
      img(
        `${P}techstore/9.png`,
        '1810a36c4775af3ace4a68a7dacbc5e9e783c0449afe44509bc4a3e07d0e45bd',
        'Tech Store web project: the admin page with users, categories and orders totals',
      ),
    ],
    featured: false,
    sortOrder: 12,
    seo: {
      title: 'Basic Online E-Commerce Platform',
      description:
        'Basic online e-commerce platform, a web project for training: list products, manage orders and accept payments.',
    },
    status: 'published',
  },
  {
    key: 'P16',
    source: '/portfolio-details_uni.html (+ portfolio.html card)',
    slug: 'basic-university-management-system',
    title: 'Basic University Management System',
    summary: 'Basic University Management System with basic GUI, for training.',
    normalised: ['detail “With Basic GUI .” and card “for training” combined'],
    overview: [],
    category: 'software-engineering',
    date: '2024-07',
    images: [
      img(
        `${P}uni/1.png`,
        'dd554e55694332ffd184368eaed63e045257090d44d9dd50ad24250fe70a8636',
        'University Management System desktop app: the Students tab with name and email fields and a students table',
      ),
      img(
        `${P}uni/2.png`,
        '2565095412b7b023b252008f5abf9ca398b41bcc2f7a554f220f3e06d906d436',
        'University Management System desktop app: the Professors tab with a professors table',
      ),
      img(
        `${P}uni/3.png`,
        '5cd3deac56f377eac616c23154f53ea202f5059eab692996afce8090f74b0f60',
        'University Management System desktop app: the Courses tab with professor, day and start/end time fields',
      ),
      img(
        `${P}uni/4.png`,
        'bcdee856659a8255c07db4b9ed6733f3ee5ac7a59c95771fc21025efca71f9eb',
        'University Management System desktop app: the Enrollments tab with student and course IDs',
      ),
    ],
    featured: false,
    sortOrder: 13,
    seo: {
      title: 'Basic University Management System',
      description:
        'Basic University Management System, a desktop application with a basic GUI built for training: students, professors, courses and enrollments.',
    },
    status: 'published',
  },
  {
    key: 'P15',
    source: '/portfolio-details_compiler.html',
    slug: 'basic-python-compiler',
    title: 'Basic Python Compiler',
    summary:
      'Python compiler without GUI that defines the syntax and semantics for the high-level programming language Python.',
    normalised: ['“Pyhton” → “Python” (twice); “High-Level-programming-Language” → words'],
    overview: [],
    category: 'software-engineering',
    date: '2022-07',
    images: [],
    featured: false,
    sortOrder: 14,
    seo: {
      title: 'Basic Python Compiler',
      description:
        'Basic Python compiler without GUI that defines the syntax and semantics for the high-level programming language Python.',
    },
    status: 'published',
  },
  // Drafts: legacy content cannot be published as is (see the migration report, “Owner review”).
  {
    key: 'P8',
    source: '/portfolio-details_car.html',
    slug: 'car-rental-mobile-application',
    title: 'Car Rental Mobile Application',
    summary: 'AI Smart Car Application.',
    overview: [],
    category: 'mobile',
    date: '2023-10',
    images: [],
    featured: false,
    sortOrder: 90,
    seo: { title: 'Car Rental Mobile Application', description: '' },
    status: 'draft',
  },
  {
    key: 'P13',
    source: '/portfolio-details_ecommerce.html',
    slug: 'e-commerce',
    title: 'E-commerce',
    summary: 'E-commerce user-friendly, fast-responding application.',
    normalised: ['card “freindly fast responding” spelling'],
    overview: [],
    category: 'mobile',
    repository: 'https://github.com/yazan-alsamman/ecommerce',
    images: [],
    featured: false,
    sortOrder: 91,
    seo: { title: 'E-commerce', description: '' },
    status: 'draft',
  },
];
