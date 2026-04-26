/**
 * STUCareer — Job Seed Script
 * Usage: node seed-jobs.js
 * Seeds 24 realistic job listings using the first approved (or any) company in the DB.
 * If no company exists, it creates a demo company first.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

// ── Models (inline minimal schemas to avoid circular deps) ──────────────────
const jobSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },
  title: { type: String, required: true },
  type: { type: String, required: true, enum: ['Internship', 'Full Time', 'Part Time', 'Contract', 'Remote'] },
  location: { type: String, required: true },
  skills: [{ type: String }],
  requirements: { type: String },
  applicationDeadline: { type: String, required: true },
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'published' },
  salary: { type: String },
  closedReason: { type: String, default: null },
}, { timestamps: true });

const companySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyName: { type: String },
  registrationNumber: { type: String },
  businessType: { type: String, default: 'Private' },
  industry: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  websiteURL: { type: String },
  country: { type: String },
  city: { type: String },
  addressLine1: { type: String },
  description: { type: String },
  status: { type: String, default: 'approved' },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String, email: String, password: String,
  role: { type: String, default: 'company' },
}, { timestamps: true });

let Job, CompanyProfile, User;
try {
  Job = mongoose.model('Job');
} catch { Job = mongoose.model('Job', jobSchema); }
try {
  CompanyProfile = mongoose.model('CompanyProfile');
} catch { CompanyProfile = mongoose.model('CompanyProfile', companySchema); }
try {
  User = mongoose.model('User');
} catch { User = mongoose.model('User', userSchema); }

// ── Job Data ────────────────────────────────────────────────────────────────
const deadline = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

const JOBS = [
  // ── Technology / Engineering ─────────────────────────
  {
    title: 'Frontend Developer Intern',
    type: 'Internship', location: 'Bangalore, India',
    skills: ['React.js', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Git'],
    salary: '₹15,000/month',
    requirements: `We are looking for an enthusiastic Frontend Developer Intern to join our product team.

Responsibilities:
• Build responsive web interfaces using React.js and Tailwind CSS
• Collaborate with designers to implement pixel-perfect UI components
• Integrate RESTful APIs and handle state management
• Write clean, well-documented code following best practices
• Participate in daily stand-ups and sprint planning

Requirements:
• Currently pursuing B.Tech/B.E. in CS, IT or related field (3rd or 4th year)
• Strong understanding of HTML5, CSS3, JavaScript (ES6+)
• Hands-on experience with React.js (class/functional components, hooks)
• Familiarity with Git version control
• Portfolio with at least 2 web projects preferred

Perks:
• Stipend: ₹15,000/month
• Certificate of Internship + Letter of Recommendation
• Opportunity for Pre-Placement Offer (PPO)
• Flexible work-from-home days`,
    applicationDeadline: deadline(21),
  },
  {
    title: 'Backend Developer Intern',
    type: 'Internship', location: 'Hyderabad, India',
    skills: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'JavaScript'],
    salary: '₹18,000/month',
    requirements: `Join our engineering team as a Backend Developer Intern and work on scalable server-side systems.

Responsibilities:
• Design and build RESTful APIs using Node.js and Express
• Work with MongoDB for data modeling and queries
• Implement authentication (JWT, OAuth)
• Write unit and integration tests
• Optimize database queries and API performance

Requirements:
• Pursuing B.Tech/MCA in CS or related discipline
• Good knowledge of Node.js, Express.js, and MongoDB
• Understanding of REST principles and HTTP protocols
• Basic knowledge of Git
• Bonus: Experience with Docker or AWS

Perks:
• ₹18,000 monthly stipend
• PPO opportunity for top performers
• Mentorship from senior engineers`,
    applicationDeadline: deadline(18),
  },
  {
    title: 'Full Stack Developer',
    type: 'Full Time', location: 'Pune, India',
    skills: ['React.js', 'Node.js', 'MongoDB', 'TypeScript', 'AWS', 'Docker'],
    salary: '₹6–9 LPA',
    requirements: `We are hiring a Full Stack Developer to build and maintain our SaaS platform.

Responsibilities:
• Develop and maintain both frontend (React) and backend (Node.js) components
• Design MongoDB schemas and write efficient database queries
• Deploy applications on AWS (EC2, S3, Lambda)
• Participate in code reviews and architecture discussions
• Collaborate cross-functionally with product and design

Requirements:
• 0–2 years of experience (freshers with strong projects welcome)
• Proficiency in React.js, Node.js, Express, and MongoDB
• Understanding of TypeScript
• Knowledge of Docker and basic CI/CD pipelines
• Strong problem-solving skills

CTC: ₹6–9 LPA based on experience`,
    applicationDeadline: deadline(30),
  },
  {
    title: 'Mobile App Developer Intern',
    type: 'Internship', location: 'Remote',
    skills: ['React Native', 'JavaScript', 'Firebase', 'Redux', 'Expo'],
    salary: '₹12,000/month',
    requirements: `Work with our mobile team to build cross-platform apps used by 100,000+ users.

Responsibilities:
• Build screens and features using React Native and Expo
• Integrate Firebase for real-time data and authentication
• Work with REST APIs and handle async state with Redux
• Debug and fix app crashes using Crashlytics
• Write unit tests and conduct peer code reviews

Requirements:
• Knowledge of React Native or React.js
• Understanding of mobile UI/UX principles
• Basic experience with Firebase or similar
• Ability to work independently in a remote setup

Duration: 3–6 months | Stipend: ₹12,000/month`,
    applicationDeadline: deadline(14),
  },
  {
    title: 'Cloud & DevOps Intern',
    type: 'Internship', location: 'Noida, India',
    skills: ['AWS', 'Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Python'],
    salary: '₹20,000/month',
    requirements: `Get hands-on experience with enterprise-grade cloud infrastructure as a DevOps Intern.

Responsibilities:
• Assist in setting up and managing AWS infrastructure (EC2, S3, RDS, Lambda)
• Write Terraform scripts for infrastructure-as-code
• Configure CI/CD pipelines using GitHub Actions
• Monitor system health using CloudWatch and Grafana
• Container management with Docker and Kubernetes (K8s)

Requirements:
• Basic knowledge of Linux commands
• Familiarity with at least one cloud platform (AWS preferred)
• Understanding of Docker containers
• Interest in automation and scripting (Python/Bash)

Stipend: ₹20,000/month | Duration: 6 months`,
    applicationDeadline: deadline(25),
  },
  {
    title: 'Data Science Intern',
    type: 'Internship', location: 'Chennai, India',
    skills: ['Python', 'Machine Learning', 'Pandas', 'Scikit-learn', 'SQL', 'Jupyter'],
    salary: '₹18,000/month',
    requirements: `Join our analytics team to work on real-world ML models and data pipelines.

Responsibilities:
• Collect, clean, and analyze large datasets using Python (Pandas, NumPy)
• Build and evaluate ML models (classification, regression, clustering)
• Create data visualizations and dashboards
• Assist in feature engineering and model tuning
• Document experiments and present findings

Requirements:
• Currently in final year of B.Tech/M.Sc. in CS, Statistics, or Data Science
• Strong Python skills with data libraries
• Basic understanding of ML algorithms
• Experience with Jupyter Notebooks
• Knowledge of SQL is a plus

Stipend: ₹18,000/month`,
    applicationDeadline: deadline(20),
  },

  // ── Design ───────────────────────────────────────────
  {
    title: 'UI/UX Design Intern',
    type: 'Internship', location: 'Bangalore, India',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Wireframing'],
    salary: '₹12,000/month',
    requirements: `Join our design team and create meaningful digital experiences for students across India.

Responsibilities:
• Design user flows, wireframes, and high-fidelity mockups in Figma
• Conduct user research and usability testing
• Collaborate with developers to ensure pixel-perfect implementation
• Maintain and evolve the design system
• Present design decisions to stakeholders

Requirements:
• Portfolio showcasing UI/UX projects (mandatory)
• Proficiency in Figma or Adobe XD
• Understanding of design principles and accessibility standards
• Knowledge of human-centered design process
• Bonus: Basic HTML/CSS knowledge

Duration: 4 months | ₹12,000/month stipend`,
    applicationDeadline: deadline(16),
  },
  {
    title: 'Product Designer',
    type: 'Full Time', location: 'Mumbai, India',
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Notion'],
    salary: '₹5–8 LPA',
    requirements: `We are looking for a Product Designer to own the end-to-end design of our B2B SaaS product.

Responsibilities:
• Lead product design from research to final handoff
• Build and maintain a scalable design system in Figma
• Run user interviews and synthesize insights into design decisions
• Work closely with the PM and Engineering team
• Define information architecture and interaction patterns

Requirements:
• 0–2 years of product design experience (strong freshers welcome)
• Excellent portfolio demonstrating product thinking
• Mastery of Figma
• Experience conducting usability studies
• Strong communication and presentation skills

CTC: ₹5–8 LPA`,
    applicationDeadline: deadline(28),
  },

  // ── Marketing / Business ─────────────────────────────
  {
    title: 'Digital Marketing Intern',
    type: 'Internship', location: 'Delhi, India',
    skills: ['SEO', 'Google Analytics', 'Content Writing', 'Social Media', 'Canva'],
    salary: '₹10,000/month',
    requirements: `Drive our digital presence and contribute to growth marketing campaigns.

Responsibilities:
• Plan and execute social media campaigns (LinkedIn, Instagram, Twitter)
• Conduct keyword research and implement on-page SEO
• Write blogs, newsletters, and ad copy
• Analyze campaign performance using Google Analytics
• Assist in email marketing automation (Mailchimp/HubSpot)

Requirements:
• Interest in digital marketing and growth hacking
• Basic knowledge of SEO tools (SEMrush, Moz, or similar)
• Strong writing and communication skills in English
• Familiarity with social media platforms
• Canva design skills preferred

Duration: 3 months | ₹10,000/month`,
    applicationDeadline: deadline(12),
  },
  {
    title: 'Business Development Intern',
    type: 'Internship', location: 'Bangalore, India',
    skills: ['Sales', 'CRM', 'Communication', 'Market Research', 'Lead Generation'],
    salary: '₹8,000 + incentives',
    requirements: `Help us grow our B2B client base as a Business Development Intern.

Responsibilities:
• Identify and prospect new business opportunities
• Generate leads via LinkedIn, cold email, and referrals
• Conduct market research and competitive analysis
• Assist in preparing sales pitches and proposals
• Manage contacts in CRM (HubSpot or Salesforce)

Requirements:
• Strong communication and interpersonal skills
• Self-motivated with a go-getter attitude
• Basic knowledge of B2B sales cycles
• Familiarity with CRM tools is a plus
• MBA/BBA students preferred

Stipend: ₹8,000/month + performance incentives`,
    applicationDeadline: deadline(10),
  },
  {
    title: 'Content Writer Intern',
    type: 'Internship', location: 'Remote',
    skills: ['Content Writing', 'SEO Writing', 'Research', 'Editing', 'WordPress'],
    salary: '₹8,000/month',
    requirements: `Create compelling content that educates and engages our 200K+ student audience.

Responsibilities:
• Write SEO-optimized blog posts, guides, and landing page copy
• Research topics related to careers, internships, and skill development
• Edit and proofread content for grammar and clarity
• Upload content to WordPress CMS
• Collaborate with the design team for visual content

Requirements:
• Excellent written English
• Understanding of SEO basics and keyword placement
• Ability to write in a conversational yet professional tone
• Portfolio of written work (blogs, articles, or essays)

Duration: 3–6 months | ₹8,000/month`,
    applicationDeadline: deadline(15),
  },

  // ── Finance ─────────────────────────────────────────
  {
    title: 'Finance & Accounting Intern',
    type: 'Internship', location: 'Mumbai, India',
    skills: ['MS Excel', 'Tally', 'Financial Analysis', 'Accounting', 'GST'],
    salary: '₹10,000/month',
    requirements: `Support our finance team with accounting, reporting, and compliance tasks.

Responsibilities:
• Assist with accounts payable/receivable and bank reconciliation
• Prepare monthly financial reports in MS Excel
• Handle GST filings and TDS calculations
• Maintain records in Tally ERP
• Support audit preparation and documentation

Requirements:
• B.Com / MBA Finance student (final year preferred)
• Proficiency in MS Excel (pivot tables, VLOOKUP)
• Basic knowledge of Tally and accounting principles
• Attention to detail and accuracy
• Knowledge of Indian taxation (GST, TDS) preferred

₹10,000/month | 3-month internship`,
    applicationDeadline: deadline(22),
  },
  {
    title: 'Financial Analyst — Fresher',
    type: 'Full Time', location: 'Mumbai, India',
    skills: ['Financial Modeling', 'Excel', 'Power BI', 'Valuation', 'CFA L1'],
    salary: '₹4–6 LPA',
    requirements: `Join our investment research team as a Junior Financial Analyst.

Responsibilities:
• Build financial models (DCF, comparable analysis) in Excel
• Analyze company financials and write research notes
• Create dashboards and reports in Power BI
• Monitor market trends and macroeconomic data
• Support senior analysts with client presentations

Requirements:
• B.Com / MBA Finance or CFA Level 1 cleared
• Strong Excel and financial modeling skills
• Understanding of equity valuation methods
• Analytical mindset with good attention to detail
• Knowledge of Bloomberg/Reuters terminal is a plus

CTC: ₹4–6 LPA`,
    applicationDeadline: deadline(35),
  },

  // ── Operations / HR ──────────────────────────────────
  {
    title: 'HR Intern',
    type: 'Internship', location: 'Hyderabad, India',
    skills: ['Recruitment', 'HR Policies', 'MS Office', 'Communication', 'HRMS'],
    salary: '₹8,000/month',
    requirements: `Support our HR team with talent acquisition and employee engagement initiatives.

Responsibilities:
• Post job descriptions and screen resumes
• Schedule interviews and coordinate with candidates
• Assist in onboarding new employees
• Maintain HR records and update HRMS
• Help plan employee engagement events

Requirements:
• MBA HR or BBA student (final year)
• Strong interpersonal and communication skills
• Proficiency in MS Office (Word, Excel, PowerPoint)
• Interest in people management and organizational culture
• Basic knowledge of labor laws preferred

Duration: 3 months | ₹8,000/month`,
    applicationDeadline: deadline(13),
  },
  {
    title: 'Operations Executive',
    type: 'Full Time', location: 'Bangalore, India',
    skills: ['Process Improvement', 'MS Excel', 'Communication', 'Logistics', 'ERP'],
    salary: '₹3.5–5 LPA',
    requirements: `Drive operational efficiency across our logistics and supply chain functions.

Responsibilities:
• Coordinate with vendors, suppliers, and internal teams
• Monitor daily operations metrics and generate reports
• Identify process bottlenecks and implement improvements
• Manage inventory levels and procurement requests
• Handle escalations and resolve operational issues

Requirements:
• Any graduate / MBA Operations
• Strong Excel and data analysis skills
• Excellent communication and coordination skills
• Experience with ERP systems (SAP/Oracle) is a plus
• Ability to work in a fast-paced startup environment

CTC: ₹3.5–5 LPA`,
    applicationDeadline: deadline(20),
  },

  // ── Specialized Tech ─────────────────────────────────
  {
    title: 'Machine Learning Engineer — Intern',
    type: 'Internship', location: 'Bangalore, India',
    skills: ['Python', 'TensorFlow', 'Deep Learning', 'NLP', 'Computer Vision', 'PyTorch'],
    salary: '₹25,000/month',
    requirements: `Work on cutting-edge AI projects in NLP and Computer Vision with our research team.

Responsibilities:
• Train, fine-tune, and evaluate deep learning models (CNNs, Transformers)
• Work on NLP tasks: text classification, named entity recognition, summarization
• Implement data pipelines for large-scale model training
• Deploy models as REST APIs using FastAPI
• Document experiments using MLflow

Requirements:
• Strong Python programming skills
• Solid understanding of ML/DL fundamentals
• Experience with TensorFlow or PyTorch
• Familiarity with NLP libraries (HuggingFace, spaCy)
• Published papers or Kaggle rankings are a big plus

Stipend: ₹25,000/month | Duration: 6 months`,
    applicationDeadline: deadline(30),
  },
  {
    title: 'Cybersecurity Intern',
    type: 'Internship', location: 'Pune, India',
    skills: ['Network Security', 'Penetration Testing', 'Kali Linux', 'OWASP', 'Python'],
    salary: '₹15,000/month',
    requirements: `Join our security team and learn hands-on penetration testing and vulnerability assessment.

Responsibilities:
• Assist with web application penetration testing (OWASP Top 10)
• Conduct network vulnerability scans using Nmap, Nessus
• Analyze security logs and generate threat reports
• Document findings and assist in remediation recommendations
• Learn and implement security best practices

Requirements:
• Interest in cybersecurity and ethical hacking
• Basic knowledge of networking (TCP/IP, DNS, HTTP)
• Familiarity with Kali Linux and security tools
• CEH/CompTIA Security+ pursuing or cleared is a plus
• Python scripting knowledge preferred

₹15,000/month | 4-month internship`,
    applicationDeadline: deadline(18),
  },
  {
    title: 'Blockchain Developer Intern',
    type: 'Internship', location: 'Remote',
    skills: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'React.js'],
    salary: '₹20,000/month',
    requirements: `Build decentralized applications on Ethereum as part of our Web3 team.

Responsibilities:
• Write and test Solidity smart contracts
• Integrate contracts with React frontend using Web3.js / ethers.js
• Deploy and verify contracts on testnets (Goerli, Mumbai)
• Understand DeFi protocols and NFT standards (ERC-20, ERC-721)
• Participate in code audits and security reviews

Requirements:
• Basic knowledge of Solidity and Ethereum
• Familiarity with Hardhat or Truffle development frameworks
• React.js frontend skills
• Understanding of blockchain principles
• Portfolio projects on GitHub preferred

₹20,000/month | 6-month contract`,
    applicationDeadline: deadline(22),
  },
  {
    title: 'QA / Testing Intern',
    type: 'Internship', location: 'Kolkata, India',
    skills: ['Manual Testing', 'Selenium', 'JIRA', 'API Testing', 'Postman'],
    salary: '₹10,000/month',
    requirements: `Ensure product quality as a QA Intern, working across manual and automated testing.

Responsibilities:
• Write and execute test cases for web and mobile applications
• Perform functional, regression, and exploratory testing
• Automate test scenarios using Selenium WebDriver + Java
• Test REST APIs using Postman
• Log and track bugs in JIRA

Requirements:
• Knowledge of software testing lifecycle (STLC)
• Basic Selenium scripting ability
• Experience with JIRA or any bug tracking tool
• Attention to detail and analytical thinking
• Basic API testing knowledge (Postman)

₹10,000/month | 3-month internship`,
    applicationDeadline: deadline(15),
  },

  // ── Additional roles ──────────────────────────────────
  {
    title: 'Product Manager Intern',
    type: 'Internship', location: 'Bangalore, India',
    skills: ['Product Thinking', 'JIRA', 'User Stories', 'Data Analysis', 'Communication'],
    salary: '₹18,000/month',
    requirements: `Gain hands-on product management experience at a fast-growing EdTech startup.

Responsibilities:
• Define product requirements, write user stories and acceptance criteria
• Work with engineering and design on sprint delivery
• Analyze user behavior data (Mixpanel, Amplitude) to inform roadmap
• Conduct competitive analysis and user interviews
• Present product updates in weekly all-hands

Requirements:
• MBA / engineering student with strong analytical skills
• Ability to think from both user and business perspective
• Excellent communication and stakeholder management
• Basic SQL knowledge for self-serve analytics
• Prior PM internship or side project experience preferred

Stipend: ₹18,000/month | 4 months`,
    applicationDeadline: deadline(20),
  },
  {
    title: 'Data Analyst — Fresher',
    type: 'Full Time', location: 'Gurgaon, India',
    skills: ['SQL', 'Python', 'Power BI', 'Excel', 'Statistics', 'Tableau'],
    salary: '₹4–6 LPA',
    requirements: `Use data to drive business decisions at our analytics-first company.

Responsibilities:
• Write complex SQL queries to extract and transform data
• Build and maintain Power BI / Tableau dashboards for leadership
• Perform exploratory data analysis and report key trends
• Automate reporting workflows using Python
• Support A/B testing and experiment analysis

Requirements:
• B.Tech CS/IT, B.Sc Statistics, or MBA
• Strong SQL skills (window functions, CTEs, subqueries)
• Proficiency in Excel and at least one BI tool
• Basic Python (Pandas, Matplotlib) for data analysis
• Statistical knowledge (hypothesis testing, regression)

CTC: ₹4–6 LPA`,
    applicationDeadline: deadline(30),
  },
  {
    title: 'Python Developer Intern',
    type: 'Internship', location: 'Chennai, India',
    skills: ['Python', 'Django', 'REST APIs', 'PostgreSQL', 'Git'],
    salary: '₹15,000/month',
    requirements: `Build robust Python backend services for our healthcare SaaS platform.

Responsibilities:
• Develop features in Django REST Framework
• Write ORM queries and optimize database performance (PostgreSQL)
• Implement third-party API integrations
• Write unit tests with Pytest
• Participate in design and code review sessions

Requirements:
• Strong Python programming fundamentals
• Experience with Django or Flask web framework
• Basic understanding of relational databases and SQL
• RESTful API design knowledge
• Git workflow proficiency

₹15,000/month | 4-month internship`,
    applicationDeadline: deadline(17),
  },
  {
    title: 'Java Backend Developer',
    type: 'Full Time', location: 'Bangalore, India',
    skills: ['Java', 'Spring Boot', 'Microservices', 'MySQL', 'Kafka', 'Docker'],
    salary: '₹5–8 LPA',
    requirements: `Build scalable microservices for our fintech platform processing 1M+ daily transactions.

Responsibilities:
• Design and develop RESTful microservices using Spring Boot
• Implement event-driven architecture with Apache Kafka
• Write efficient MySQL queries and JPA/Hibernate mappings
• Deploy services using Docker and manage with Kubernetes
• Participate in architecture reviews and system design discussions

Requirements:
• Strong Java 11+ fundamentals (OOP, multithreading, streams)
• Experience with Spring Boot and Spring Security
• Knowledge of microservices and API design
• MySQL/PostgreSQL proficiency
• Freshers with strong internship/project experience welcome

CTC: ₹5–8 LPA`,
    applicationDeadline: deadline(28),
  },
  {
    title: 'Graphic Design Intern',
    type: 'Internship', location: 'Remote',
    skills: ['Adobe Illustrator', 'Photoshop', 'Canva', 'Brand Design', 'Motion Graphics'],
    salary: '₹8,000/month',
    requirements: `Create visually stunning brand and marketing assets for our growing startup.

Responsibilities:
• Design social media graphics, banners, and promotional materials
• Create brand guidelines and visual identity assets
• Design presentation decks and infographics
• Basic motion graphics / GIF animations
• Collaborate with the marketing team on campaign creatives

Requirements:
• Portfolio showcasing graphic design work
• Proficiency in Adobe Illustrator and Photoshop
• Eye for aesthetics and brand consistency
• Canva proficiency for quick turnarounds
• Motion graphics experience (After Effects) is a bonus

₹8,000/month | 3-month internship`,
    applicationDeadline: deadline(12),
  },
];

// ── Main Seed Function ──────────────────────────────────────────────────────
async function seed() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected!');

  // Find or create a company to link jobs to
  let company = await CompanyProfile.findOne({ status: 'approved' }).lean();

  if (!company) {
    console.log('⚠️  No approved company found. Looking for any company...');
    company = await CompanyProfile.findOne().lean();
  }

  if (!company) {
    console.log('⚠️  No company in DB. Creating a demo company...');
    // We need a user first
    let demoUser = await User.findOne({ role: 'company' }).lean();
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo Company Admin',
        email: 'demo.company@stucareer.com',
        password: 'hashed_password_placeholder',
        role: 'company',
      });
    }
    company = await CompanyProfile.create({
      userId: demoUser._id,
      companyName: 'STUCareer Demo Corp',
      registrationNumber: 'REG-DEMO-001',
      businessType: 'Startup',
      industry: 'Technology',
      email: 'hr@stucareer.com',
      phoneNumber: '+91-9000000000',
      websiteURL: 'https://stucareer.com',
      country: 'India',
      city: 'Bangalore',
      addressLine1: '123 MG Road, Bangalore',
      description: 'STUCareer is a student-first career platform connecting talented students with top companies across India.',
      status: 'approved',
    });
    console.log('✅ Demo company created:', company.companyName);
  }

  console.log(`📦 Using company: "${company.companyName}" (${company._id})`);

  // Delete old seeded jobs (optional — comment out to keep them)
  const deleted = await Job.deleteMany({ companyId: company._id });
  console.log(`🗑  Removed ${deleted.deletedCount} existing jobs for this company.`);

  // Insert all jobs
  const jobDocs = JOBS.map((j) => ({
    ...j,
    companyId: company._id,
    status: 'published',
  }));

  const inserted = await Job.insertMany(jobDocs);
  console.log(`\n🎉 Seeded ${inserted.length} jobs successfully!\n`);

  inserted.forEach((j, i) => {
    console.log(`  ${String(i + 1).padStart(2, '0')}. [${j.type.padEnd(10)}] ${j.title} — ${j.location}`);
  });

  await mongoose.disconnect();
  console.log('\n✅ Done. Disconnected from MongoDB.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
