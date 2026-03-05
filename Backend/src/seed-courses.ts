import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CoursesService } from './modules/courses/courses.service';
import { UsersService } from './modules/users/users.service';
import { Role } from './common/auth/role';

const SEED_COURSES = [
  {
    title: 'CPHQ Exam Prep 2026',
    tag: 'CPHQ',
    instructorName: 'Dr. Sarah Mitchell',
    instructorTitle: 'Quality Director',
    durationHours: 12,
    description: 'A complete course to prepare for the CPHQ certification exam. Covers healthcare quality management, patient safety, and regulatory standards.',
    whoCanAttend: 'Healthcare quality professionals, nurses, physicians in quality roles',
    whyYalla: 'Expert instructors, practice exams, and flexible self-paced learning.',
    includes: 'Videos, PDFs, mock exams, study guides',
    status: 'published' as const,
    enableEnrollment: true,
    priceRegular: 399,
    priceSale: 299,
    currency: 'usd',
    lessons: 24,
    level: 'Intermediate' as const,
    certificationType: 'CPHQ Prep' as const,
    enrolledCount: 0,
  },
  {
    title: 'Patient Safety Essentials',
    tag: 'Patient Safety',
    instructorName: 'Dr. James Chen',
    instructorTitle: 'Patient Safety Officer',
    durationHours: 8,
    description: 'Foundations of patient safety, incident reporting, root cause analysis, and safety culture.',
    whoCanAttend: 'Clinical staff, quality managers, risk managers',
    whyYalla: 'Evidence-based content aligned with national patient safety goals.',
    includes: 'Case studies, templates, quizzes',
    status: 'published' as const,
    enableEnrollment: true,
    priceRegular: 249,
    priceSale: 199,
    currency: 'usd',
    lessons: 16,
    level: 'Beginner' as const,
    certificationType: 'CME Credits' as const,
    enrolledCount: 0,
  },
  {
    title: 'Healthcare Data Analytics',
    tag: 'Analytics',
    instructorName: 'Dr. Aisha Patel',
    instructorTitle: 'Chief Analytics Officer',
    durationHours: 10,
    description: 'Data analysis for healthcare quality: metrics, dashboards, statistical process control, and reporting.',
    whoCanAttend: 'Quality analysts, data analysts, healthcare administrators',
    whyYalla: 'Hands-on exercises with real-world datasets and tools.',
    includes: 'Excel/BI exercises, sample data, video walkthroughs',
    status: 'published' as const,
    enableEnrollment: true,
    priceRegular: 349,
    priceSale: 279,
    currency: 'usd',
    lessons: 20,
    level: 'Intermediate' as const,
    certificationType: 'Micro-Credential' as const,
    enrolledCount: 0,
  },
  {
    title: 'Root Cause Analysis (RCA) in Healthcare',
    tag: 'RCA',
    instructorName: 'Dr. Michael Torres',
    instructorTitle: 'Risk Management Director',
    durationHours: 6,
    description: 'Structured approaches to RCA: 5 Whys, fishbone diagrams, failure mode analysis, and action plans.',
    whoCanAttend: 'Quality teams, safety officers, department leads',
    whyYalla: 'Step-by-step methodology with templates and examples.',
    includes: 'Templates, case studies, facilitator guide',
    status: 'published' as const,
    enableEnrollment: true,
    priceRegular: 199,
    currency: 'usd',
    lessons: 12,
    level: 'Beginner' as const,
    certificationType: 'CME Credits' as const,
    enrolledCount: 0,
  },
  {
    title: 'Quality Improvement Methods: Lean & Six Sigma',
    tag: 'QI',
    instructorName: 'Dr. Emily Watson',
    instructorTitle: 'Process Improvement Lead',
    durationHours: 14,
    description: 'Introduction to Lean and Six Sigma in healthcare: DMAIC, value stream mapping, and rapid improvement events.',
    whoCanAttend: 'QI specialists, operations managers, clinical leads',
    whyYalla: 'Practical tools you can apply immediately in your organization.',
    includes: 'Toolkits, worksheets, project examples',
    status: 'published' as const,
    enableEnrollment: true,
    priceRegular: 449,
    priceSale: 359,
    currency: 'usd',
    lessons: 28,
    level: 'Intermediate' as const,
    certificationType: 'Micro-Credential' as const,
    enrolledCount: 0,
  },
  {
    title: 'Regulatory Compliance for Healthcare Quality',
    tag: 'Compliance',
    instructorName: 'Jennifer Adams',
    instructorTitle: 'Compliance Director',
    durationHours: 8,
    description: 'Overview of key regulations: Joint Commission, CMS, HIPAA, and accreditation readiness.',
    whoCanAttend: 'Compliance officers, quality directors, administrative staff',
    whyYalla: 'Up-to-date guidance and checklists for survey preparation.',
    includes: 'Checklists, policy templates, audit guides',
    status: 'published' as const,
    enableEnrollment: true,
    priceRegular: 279,
    currency: 'usd',
    lessons: 16,
    level: 'Beginner' as const,
    certificationType: 'CME Credits' as const,
    enrolledCount: 0,
  },
  {
    title: 'Biostatistics for Healthcare Quality',
    tag: 'Biostatistics',
    instructorName: 'Dr. David Kim',
    instructorTitle: 'Biostatistician',
    durationHours: 10,
    description: 'Statistical concepts for quality measurement: rates, risk adjustment, control charts, and significance testing.',
    whoCanAttend: 'Quality analysts, epidemiologists, clinical researchers',
    whyYalla: 'Clear explanations with healthcare-specific examples.',
    includes: 'Formulas, worked examples, practice problems',
    status: 'draft' as const,
    enableEnrollment: false,
    priceRegular: 329,
    currency: 'usd',
    lessons: 18,
    level: 'Advanced' as const,
    certificationType: 'CPHQ Prep' as const,
    enrolledCount: 0,
  },
  {
    title: 'Healthcare Leadership and Quality Culture',
    tag: 'Leadership',
    instructorName: 'Dr. Lisa Thompson',
    instructorTitle: 'Chief Quality Officer',
    durationHours: 6,
    description: 'Building a culture of quality: leadership behaviors, team engagement, and sustaining improvement.',
    whoCanAttend: 'Executives, directors, quality champions',
    whyYalla: 'Evidence-based leadership practices from high-reliability organizations.',
    includes: 'Assessments, action plans, discussion guides',
    status: 'published' as const,
    enableEnrollment: true,
    priceRegular: 229,
    currency: 'usd',
    lessons: 10,
    level: 'Intermediate' as const,
    certificationType: 'Micro-Credential' as const,
    enrolledCount: 0,
  },
];

async function seedCourses() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error'],
  });

  const coursesService = app.get(CoursesService);
  const usersService = app.get(UsersService);

  const admin = await usersService.findOne({ role: Role.admin });
  const createdByUserId = admin?.id;

  const existingCount = (await coursesService.listAll()).length;
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing course(s). Adding ${SEED_COURSES.length} more.`);
  }

  for (const course of SEED_COURSES) {
    await coursesService.create({
      ...course,
      createdByUserId,
    });
    console.log(`Created: ${course.title}`);
  }

  console.log(`Done. Seeded ${SEED_COURSES.length} courses.`);
  await app.close();
}

seedCourses().catch((err) => {
  console.error('Seed courses failed:', err);
  process.exit(1);
});
