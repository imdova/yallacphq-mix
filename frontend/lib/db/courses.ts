import type { Course, CreateCourseInput, UpdateCourseInput } from "@/types/course";
import { delay } from "./delay";

const INSTRUCTOR = "Dr Ahmed Habib";
const INSTRUCTOR_TITLE = "CPHQ, Healthcare Quality Director";

let store: Course[] = [
  {
    id: "1",
    title: "CPHQ Comprehensive Review 2024",
    tag: "Exam Prep",
    rating: 4.9,
    reviewCount: 128,
    instructorName: INSTRUCTOR,
    instructorTitle: INSTRUCTOR_TITLE,
    durationHours: 12.5,
    enrolledCount: 1240,
    lessons: 52,
    status: "published",
    enableEnrollment: true,
    requireApproval: false,
    socialSharing: true,
    priceRegular: 249.99,
    priceSale: 199.99,
    level: "Intermediate",
    certificationType: "CPHQ Prep",
  },
  {
    id: "2",
    title: "Quality Improvement Methodologies",
    tag: "Quality Management",
    rating: 4.8,
    reviewCount: 94,
    instructorName: INSTRUCTOR,
    instructorTitle: INSTRUCTOR_TITLE,
    durationHours: 8,
    enrolledCount: 892,
    lessons: 34,
    status: "published",
    enableEnrollment: true,
    requireApproval: false,
    socialSharing: true,
    priceRegular: 199.99,
    priceSale: 149.99,
    level: "Intermediate",
    certificationType: "CME Credits",
  },
  {
    id: "3",
    title: "Patient Safety Fundamentals",
    tag: "Free Resource",
    rating: 4.7,
    reviewCount: 256,
    instructorName: INSTRUCTOR,
    instructorTitle: INSTRUCTOR_TITLE,
    durationHours: 4,
    enrolledCount: 2100,
    lessons: 16,
    status: "published",
    enableEnrollment: true,
    requireApproval: false,
    socialSharing: true,
    priceRegular: 0,
    level: "Beginner",
  },
  {
    id: "4",
    title: "Advanced Healthcare Analytics",
    tag: "Advanced",
    rating: 4.9,
    reviewCount: 72,
    instructorName: INSTRUCTOR,
    instructorTitle: INSTRUCTOR_TITLE,
    durationHours: 15,
    enrolledCount: 456,
    lessons: 60,
    status: "published",
    enableEnrollment: true,
    requireApproval: false,
    socialSharing: true,
    priceRegular: 299.99,
    priceSale: 249.99,
    level: "Advanced",
    certificationType: "Micro-Credential",
  },
  {
    id: "5",
    title: "Data Analysis for Quality Teams",
    tag: "Data Analysis",
    rating: 4.6,
    reviewCount: 58,
    instructorName: INSTRUCTOR,
    instructorTitle: INSTRUCTOR_TITLE,
    durationHours: 6,
    enrolledCount: 534,
    lessons: 24,
    status: "published",
    enableEnrollment: true,
    requireApproval: false,
    socialSharing: true,
    priceRegular: 179.99,
    priceSale: 139.99,
    level: "Intermediate",
  },
  {
    id: "6",
    title: "Regulatory Compliance in Healthcare",
    tag: "Compliance",
    rating: 4.8,
    reviewCount: 89,
    instructorName: INSTRUCTOR,
    instructorTitle: INSTRUCTOR_TITLE,
    durationHours: 10,
    enrolledCount: 678,
    lessons: 40,
    status: "published",
    enableEnrollment: true,
    requireApproval: false,
    socialSharing: true,
    priceRegular: 219.99,
    priceSale: 179.99,
    level: "Advanced",
    certificationType: "CME Credits",
  },
  {
    id: "7",
    title: "CPHQ Practice Exams & Strategies",
    tag: "Exam Prep",
    rating: 4.9,
    reviewCount: 201,
    instructorName: INSTRUCTOR,
    instructorTitle: INSTRUCTOR_TITLE,
    durationHours: 5,
    enrolledCount: 1580,
    lessons: 22,
    status: "published",
    enableEnrollment: true,
    requireApproval: false,
    socialSharing: true,
    priceRegular: 199.99,
    priceSale: 159.99,
    level: "Intermediate",
    certificationType: "CPHQ Prep",
  },
  {
    id: "8",
    title: "Root Cause Analysis in Healthcare",
    tag: "Quality Management",
    rating: 4.7,
    reviewCount: 112,
    instructorName: INSTRUCTOR,
    instructorTitle: INSTRUCTOR_TITLE,
    durationHours: 3,
    enrolledCount: 723,
    lessons: 14,
    status: "published",
    enableEnrollment: true,
    requireApproval: false,
    socialSharing: true,
    priceRegular: 149.99,
    priceSale: 119.99,
    level: "Beginner",
  },
  {
    id: "9",
    title: "Patient Safety Culture",
    tag: "Patient Safety",
    rating: 4.8,
    reviewCount: 67,
    instructorName: INSTRUCTOR,
    instructorTitle: INSTRUCTOR_TITLE,
    durationHours: 4.5,
    enrolledCount: 445,
    lessons: 18,
    status: "published",
    enableEnrollment: true,
    requireApproval: false,
    socialSharing: true,
    priceRegular: 169.99,
    priceSale: 129.99,
    level: "Intermediate",
  },
  {
    id: "10",
    title: "CPHQ Exam Simulation Pack",
    tag: "Exam Prep",
    rating: 4.9,
    reviewCount: 312,
    instructorName: INSTRUCTOR,
    instructorTitle: INSTRUCTOR_TITLE,
    durationHours: 6,
    enrolledCount: 1890,
    lessons: 28,
    status: "published",
    enableEnrollment: true,
    requireApproval: false,
    socialSharing: true,
    priceRegular: 229.99,
    priceSale: 189.99,
    level: "Intermediate",
    certificationType: "CPHQ Prep",
  },
  {
    id: "11",
    title: "Quality Tools Workshop",
    tag: "Quality Management",
    rating: 4.6,
    reviewCount: 45,
    instructorName: INSTRUCTOR,
    instructorTitle: INSTRUCTOR_TITLE,
    durationHours: 7,
    enrolledCount: 312,
    lessons: 30,
    status: "published",
    enableEnrollment: true,
    requireApproval: false,
    socialSharing: true,
    priceRegular: 189.99,
    level: "Advanced",
  },
  {
    id: "12",
    title: "Introduction to CPHQ",
    tag: "Free Resource",
    rating: 4.7,
    reviewCount: 189,
    instructorName: INSTRUCTOR,
    instructorTitle: INSTRUCTOR_TITLE,
    durationHours: 2,
    enrolledCount: 2340,
    lessons: 8,
    status: "published",
    enableEnrollment: true,
    requireApproval: false,
    socialSharing: true,
    priceRegular: 0,
    level: "Beginner",
  },
];

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function getCourses(): Promise<Course[]> {
  await delay(200);
  return clone(store);
}

export async function getCourseById(id: string): Promise<Course | null> {
  await delay(100);
  const course = store.find((c) => c.id === id);
  return course ? clone(course) : null;
}

export async function getFeaturedCourses(limit = 12): Promise<Course[]> {
  await delay(150);
  const published = store.filter((c) => (c.status ?? "published") === "published");
  const featured = published
    .filter((c) => c.featured)
    .sort((a, b) => (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER));
  const items = (featured.length ? featured : published).slice(0, limit);
  return clone(items);
}

export async function getRelatedCourses(id: string, limit = 4): Promise<Course[]> {
  await delay(120);
  const course = store.find((c) => c.id === id && (c.status ?? "published") === "published");
  if (!course) return [];

  const seen = new Set<string>([id]);
  const related: Course[] = [];

  for (const relatedId of course.relatedCourseIds ?? []) {
    const match = store.find((c) => c.id === relatedId && (c.status ?? "published") === "published");
    if (!match || seen.has(match.id)) continue;
    seen.add(match.id);
    related.push(match);
    if (related.length >= limit) return clone(related.slice(0, limit));
  }

  for (const match of store) {
    if (related.length >= limit) break;
    if (match.id === id || seen.has(match.id)) continue;
    if ((match.status ?? "published") !== "published") continue;
    if (match.tag !== course.tag) continue;
    seen.add(match.id);
    related.push(match);
  }

  for (const match of store) {
    if (related.length >= limit) break;
    if (match.id === id || seen.has(match.id)) continue;
    if ((match.status ?? "published") !== "published") continue;
    seen.add(match.id);
    related.push(match);
  }

  return clone(related.slice(0, limit));
}

function nextId(): string {
  const max = store.reduce((acc, c) => Math.max(acc, Number(c.id) || 0), 0);
  return String(max + 1);
}

export async function createCourse(data: CreateCourseInput): Promise<Course> {
  await delay(200);
  const course: Course = {
    id: nextId(),
    title: data.title,
    tag: data.tag,
    rating: data.rating ?? 4.8,
    reviewCount: data.reviewCount ?? 0,
    description: data.description,
    whoCanAttend: data.whoCanAttend,
    whyYalla: data.whyYalla,
    includes: data.includes,
    instructorName: data.instructorName,
    instructorTitle: data.instructorTitle,
    durationHours: data.durationHours,
    enrolledCount: data.enrolledCount ?? 0,
    lessons: data.lessons,
    status: data.status ?? "draft",
    enableEnrollment: data.enableEnrollment ?? true,
    requireApproval: data.requireApproval ?? false,
    socialSharing: data.socialSharing ?? true,
    priceRegular: data.priceRegular ?? 0,
    priceSale: data.priceSale,
    availability: data.availability,
    enablePromoCode: data.enablePromoCode,
    currency: data.currency,
    discountPercent: data.discountPercent,
    level: data.level,
    certificationType: data.certificationType,
    imagePlaceholder: data.imagePlaceholder,
    imageUrl: data.imageUrl,
    instructorImageUrl: data.instructorImageUrl,
    videoPreviewUrl: data.videoPreviewUrl,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    seoKeywords: data.seoKeywords,
    learningOutcomes: data.learningOutcomes,
    curriculumSections: data.curriculumSections,
    reviewMedia: data.reviewMedia,
    featured: data.featured ?? false,
    featuredOrder: data.featuredOrder,
    relatedCourseIds: data.relatedCourseIds,
  };
  store = [...store, course];
  return clone(course);
}

export async function updateCourse(id: string, data: UpdateCourseInput): Promise<Course | null> {
  await delay(200);
  const idx = store.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const prev = store[idx];
  const updated: Course = {
    ...prev,
    ...data,
    // ensure required fields remain
    title: data.title ?? prev.title,
    tag: data.tag ?? prev.tag,
    instructorName: data.instructorName ?? prev.instructorName,
    instructorTitle: data.instructorTitle ?? prev.instructorTitle,
    durationHours: data.durationHours ?? prev.durationHours,
    imagePlaceholder: data.imagePlaceholder ?? prev.imagePlaceholder,
    imageUrl: data.imageUrl ?? prev.imageUrl,
    description: data.description ?? prev.description,
    whoCanAttend: data.whoCanAttend ?? prev.whoCanAttend,
    whyYalla: data.whyYalla ?? prev.whyYalla,
    status: data.status ?? prev.status,
    enableEnrollment: data.enableEnrollment ?? prev.enableEnrollment,
    requireApproval: data.requireApproval ?? prev.requireApproval,
    socialSharing: data.socialSharing ?? prev.socialSharing,
    learningOutcomes: data.learningOutcomes ?? prev.learningOutcomes,
    curriculumSections: data.curriculumSections ?? prev.curriculumSections,
    reviewMedia: data.reviewMedia ?? prev.reviewMedia,
    featured: data.featured ?? prev.featured,
    featuredOrder: data.featuredOrder ?? prev.featuredOrder,
    relatedCourseIds: data.relatedCourseIds ?? prev.relatedCourseIds,
  };
  store = store.map((c) => (c.id === id ? updated : c));
  return clone(updated);
}

export async function deleteCourse(id: string): Promise<boolean> {
  await delay(200);
  const before = store.length;
  store = store.filter((c) => c.id !== id);
  return store.length !== before;
}
