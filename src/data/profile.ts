// Single source of truth for everything shown on the site.
// Update this file (not the components) when the CV changes.

export const profile = {
  name: 'Tanadol Langputeh',
  shortName: 'Tanadol L.',
  handle: 'synxdicate',
  role: 'Offensive Security · Cybersecurity Student',
  location: 'Khon Kaen, Thailand',
  email: 'tanadol.l@kkumail.com',
  resumePdf: '/resumes/tanadol_langputeh-CV.pdf',
  summary:
    'Third-year Cybersecurity student at Khon Kaen University pursuing Offensive Security Engineering, with 3+ years of CTF experience and hands-on web/API and network pentesting.',
  links: {
    github: 'https://github.com/Synxdicate',
    linkedin: 'https://linkedin.com/in/tanadol-langputeh-569a43323',
    facebook: 'https://web.facebook.com/synxdicate66/',
    blog: 'https://synxdicate.github.io/blog/',
    htb: 'https://profile.hackthebox.com/profile/01a186b8-4812-72d9-a9c7-6c1c89b04ecf',
    thm: 'https://tryhackme.com/p/Harmonic66',
    thmBadge: 'https://cdn-images.tryhackme.com/public-profile/Harmonic66/badge-80d0a4a651dc.png',
  },
}

export const stats = [
  { value: '3+', label: 'Years of CTF' },
  { value: '8+', label: 'National awards & placements' },
  { value: '2nd', label: 'Cyber Top Talent 2022 (Junior)' },
]

export interface Education {
  school: string
  location: string
  degree: string
  period: string
  gpa: string
  note: string
}

export const education: Education[] = [
  {
    school: 'Khon Kaen University',
    location: 'Khon Kaen, TH',
    degree: 'B.Sc. Cybersecurity',
    period: 'Feb 2024 – Present',
    gpa: '3.36',
    note: 'Penetration testing, software & web security, malware analysis, digital forensics, cryptanalysis, cloud security.',
  },
  {
    school: 'Krabi Technical College',
    location: 'Krabi, TH',
    degree: 'Voc. Cert. in Electronics',
    period: 'Jun 2021 – Mar 2024',
    gpa: '3.57',
    note: 'Circuits, microcontrollers, networking, digital & power electronics.',
  },
]

export const skills: { group: string; items: string[] }[] = [
  { group: 'Offensive Security', items: ['Web/API Pentesting', 'Network Pentesting', 'Red Teaming'] },
  { group: 'Web', items: ['Burp Suite', 'sqlmap', 'ffuf'] },
  { group: 'AD / Network', items: ['BloodHound', 'NetExec', 'Responder', 'Mimikatz'] },
  { group: 'Reverse Engineering', items: ['Ghidra', 'GEF', 'jadx'] },
  { group: 'C2', items: ['Havoc', 'AdaptixC2'] },
  { group: 'Languages', items: ['Python', 'Go', 'C', 'C++', 'JavaScript', 'Bash'] },
  { group: 'Cloud & Infra', items: ['AWS', 'Docker'] },
  {
    group: 'Web Dev',
    items: ['Vue.js', 'Nuxt.js', 'Next.js', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Git'],
  },
]

export interface Award {
  title: string
  result: string
  year: number
  category: 'Cybersecurity' | 'Hackathon'
  /** news coverage that mentions the result */
  press?: { source: string; url: string }
}

export const awards: Award[] = [
  { title: 'Informatics MSU Hackathon 2026 (Cybersecurity Track)', result: '2nd Place', year: 2026, category: 'Cybersecurity', press: { source: 'KKU Computing', url: 'https://computing.kku.ac.th/content/news/2026-08-14-informatics-msu-hackathon-2026' } },
  { title: 'Disruptive Doing Season 6: OneLog Action Lab', result: 'Winner', year: 2026, category: 'Hackathon' },
  { title: 'BDI Young Innovator Hackathon (Intelligent Living)', result: 'Top 16 of 137 Teams', year: 2026, category: 'Hackathon' },
  { title: 'Marine Monitoring Hackathon', result: 'Winner — Smart Monitoring Track', year: 2025, category: 'Hackathon', press: { source: 'DMCR', url: 'https://www.dmcr.go.th/detailAll/79502/nws/' } },
  { title: 'Disruptive Thinking Season 5: NextGen One Logistic', result: 'First Runner-up', year: 2025, category: 'Hackathon' },
  { title: 'The CubeSat Quest: Exploring the Beyond', result: 'First Runner-up', year: 2025, category: 'Hackathon', press: { source: 'KKU Computing', url: 'https://computing.kku.ac.th/content/news/2025-10-17-cubesat' } },
  { title: 'Cyber Warrior Hackathon', result: 'Popular Vote Award', year: 2025, category: 'Hackathon', press: { source: 'KKU Computing', url: 'https://computing.kku.ac.th/content/news/2025-07-22-cyber-warrior-hackathon-2025' } },
  { title: 'Thailand Cyber Top Talent 2023 (Junior)', result: '7th Place', year: 2023, category: 'Cybersecurity' },
  { title: 'National Whitehat Challenge', result: 'Finalist (Top 25 Teams)', year: 2023, category: 'Cybersecurity' },
  { title: 'Thailand Cyber Top Talent 2022 (Junior)', result: '2nd Place', year: 2022, category: 'Cybersecurity' },
]

export interface Project {
  name: string
  kind: string
  desc: string
  highlights?: string[]
  stack: string[]
  github?: string
  demo?: string
  featured?: boolean
}

export const projects: Project[] = [
  {
    name: 'AustenC2',
    kind: 'Red Team Tooling',
    desc: 'Cross-platform Command & Control framework built to simulate red-team tradecraft for penetration testing research.',
    highlights: [
      'Go-based cross-platform agent with remote command execution',
      'Web operator dashboard for managing live agent sessions and payload deployment',
    ],
    stack: ['Python', 'Go', 'C2'],
    github: 'https://github.com/Synxdicate/AustenC2',
    featured: true,
  },
  {
    name: 'CertGuard',
    kind: 'Internal PKI Platform',
    desc: 'Automated certificate lifecycle management on a self-hosted Root CA, removing dependency on public CAs.',
    highlights: [
      'Root CA (RSA 2048, SHA-256) with automated issuance and renewal',
      'Docker Compose deployment across DMZ / Internal / Management zones',
      'Alerting dashboard for certificate health and expiry',
    ],
    stack: ['Vue.js', 'Express', 'SQLite', 'Docker'],
    github: 'https://github.com/Synxdicate/Certguard',
    featured: true,
  },
  {
    name: 'smart-plant-box',
    kind: 'IoT',
    desc: 'Arduino sensor box streaming plant health data over a wireless pipeline to a live web dashboard.',
    highlights: [
      'Arduino (C/C++) firmware for sensor data collection',
      'Wireless pipeline feeding a real-time Vue.js dashboard, deployed publicly on Vercel',
    ],
    stack: ['Arduino', 'C/C++', 'Vue.js', 'Vercel'],
    github: 'https://github.com/Synxdicate/Smart-Plant-Box',
    demo: 'https://smart-plant-box.vercel.app/',
    featured: true,
  },
  {
    name: 'OpenSAT',
    kind: 'CubeSat Quest 2025 · Team Lead',
    desc: 'Concept platform democratizing public access to CubeSat sensor data — PostgreSQL backend and Vue.js web app.',
    stack: ['TypeScript', 'Vue.js', 'PostgreSQL'],
    github: 'https://github.com/Synxdicate/cubesat',
  },
  {
    name: 'VITA-CORE',
    kind: 'BDI Hackathon 2026 · Top 16 of 137',
    desc: 'Clinical decision-support web app for type 2 diabetes (T2DM), built for the BDI Young Innovator Hackathon.',
    stack: ['Vue.js', 'Vite'],
    github: 'https://github.com/Synxdicate/BDI-hackathon',
    demo: 'https://bdi-hackathon.vercel.app',
  },
  {
    name: 'WASHFLOW',
    kind: 'Web App',
    desc: 'Car-wash booking system: pick a branch and car type, book a slot, manage membership and history, plus an employee side.',
    stack: ['Vue.js', 'TypeScript'],
    github: 'https://github.com/Synxdicate/washflow',
    demo: 'https://washflow-one.vercel.app',
  },
  {
    name: 'Kao (ก้าว)',
    kind: 'Web App',
    desc: '12-week weights + running plan with a calorie / protein calculator, Thai food suggestions and a weight log.',
    stack: ['TypeScript', 'Vite'],
    github: 'https://github.com/Synxdicate/exercise_plan',
    demo: 'https://exercise-plan-pi.vercel.app',
  },
  {
    name: 'Central_Clock',
    kind: 'Embedded',
    desc: 'C++ clock project with a segment mapper and tests on a MAX7219 LED display driver.',
    stack: ['C++', 'MAX7219'],
    github: 'https://github.com/Synxdicate/Central_Clock',
  },
  {
    name: 'Pwn-dbg_gef',
    kind: 'Tooling',
    desc: 'Debugger setup combining pwndbg and GEF for binary exploitation work.',
    stack: ['GDB', 'pwndbg', 'GEF'],
    github: 'https://github.com/Synxdicate/Pwn-dbg_gef',
  },
  {
    name: 'p_db',
    kind: 'Infra',
    desc: 'One-command PHP + MySQL dev stack with Docker Compose: Apache, MySQL and phpMyAdmin.',
    stack: ['Docker', 'PHP', 'MySQL'],
    github: 'https://github.com/Synxdicate/p_db',
  },
  {
    name: 'ihatenetwork',
    kind: 'Lab',
    desc: 'Packet Tracer labs for CCNA practice.',
    stack: ['Packet Tracer', 'Networking'],
    github: 'https://github.com/Synxdicate/ihatenetwork/',
  },
  {
    name: 'scanqr',
    kind: 'Web',
    desc: 'Camera-based QR scanner that captures and resolves links.',
    stack: ['Web'],
    github: 'https://github.com/Synxdicate/scanqr',
    demo: 'https://qrduck.vercel.app/',
  },
  {
    name: 'IDWTLG',
    kind: 'Web',
    desc: 'Pomodoro timer — work in progress.',
    stack: ['Web'],
    github: 'https://github.com/Synxdicate/IDWTLG',
    demo: 'https://idwtlg.vercel.app',
  },
  {
    name: 'Note',
    kind: 'Knowledge Base',
    desc: 'A second brain for thoughts and research notes.',
    stack: ['Knowledge'],
    github: 'https://github.com/Synxdicate/Note',
  },
]

export const leadership = [
  {
    title: 'The CubeSat Quest 2025 “Exploring the Beyond”',
    role: 'Team Lead',
    year: 2025,
    points: [
      'Led a 4-member team building OpenSAT and pitched as lead presenter through the final round',
      'Built the database and web app; led long-range wireless design for station-to-satellite links',
    ],
  },
  {
    title: 'High School Cybersecurity CTF — College of Computing, KKU',
    role: 'Assistant & Developer',
    year: 2024,
    points: ['Built the CTFd-based scoring platform and web UI, ran operations and mentored participants'],
  },
]

export interface Certification {
  name: string
  issuer: string
  year: string
  id?: string
  url?: string
  badge?: string
  note?: string
}

export const certifications: Certification[] = [
  {
    name: 'IT Essentials',
    issuer: 'Cisco Networking Academy',
    year: '2026',
    url: 'https://www.credly.com/badges/88ff796e-3136-4a63-8508-b4b2587d393b/public_url',
    badge: '/badges/cisco-it-essentials.webp',
  },
  {
    name: 'ISC2 Candidate',
    issuer: 'ISC2',
    year: '2026',
    note: 'Valid until Jan 2027',
    url: 'https://www.credly.com/badges/f3432137-de38-4474-b3c8-c21d80232087/public_url',
    badge: '/badges/isc2-candidate.webp',
  },
  {
    name: 'Basic Cybersecurity',
    issuer: 'NCSA Thailand · MOOC',
    year: '2024',
    id: 'SPG-15D97Y86ZVDHT',
    url: '/certificates/ncsa-basic-cybersecurity.pdf',
  },
  { name: 'Introduction to Critical Infrastructure Protection (ICIP)', issuer: 'OPSWAT Academy', year: '2023' },
  { name: 'Pre Security & Intro to Cyber Security', issuer: 'TryHackMe', year: '2022' },
]
