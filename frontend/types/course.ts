export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";
export type DurationRange = "0-2 Hours" | "3-6 Hours" | "6+ Hours";
export type CertificationType = "CPHQ Prep" | "CME Credits" | "Micro-Credential";

export interface Course {
  id: string;
  title: string;
  tag: string;
  rating: number;
  reviewCount: number;
  description?: string;
  whoCanAttend?: string;
  whyYalla?: string;
  includes?: string;
  instructorName: string;
  instructorTitle: string;
  durationHours: number;
  enrolledCount?: number;
  lessons?: number;
  status?: "draft" | "published";
  enableEnrollment?: boolean;
  requireApproval?: boolean;
  socialSharing?: boolean;
  /** Regular price in dollars (e.g. 199.99). */
  priceRegular?: number;
  /** Sale price in dollars; if set, shown instead of regular. */
  priceSale?: number;
  availability?: "permanent" | "1_month" | "3_months" | "6_months" | "1_year" | "custom";
  enablePromoCode?: boolean;
  currency?: string;
  discountPercent?: number;
  level?: CourseLevel;
  certificationType?: CertificationType;
  imagePlaceholder?: string;
  imageUrl?: string;
  instructorImageUrl?: string;
  videoPreviewUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseInput {
  title: string;
  tag: string;
  description?: string;
  whoCanAttend?: string;
  whyYalla?: string;
  includes?: string;
  instructorName: string;
  instructorTitle: string;
  durationHours: number;
  status?: "draft" | "published";
  enableEnrollment?: boolean;
  requireApproval?: boolean;
  socialSharing?: boolean;
  priceRegular?: number;
  priceSale?: number;
  availability?: "permanent" | "1_month" | "3_months" | "6_months" | "1_year" | "custom";
  enablePromoCode?: boolean;
  currency?: string;
  discountPercent?: number;
  level?: CourseLevel;
  certificationType?: CertificationType;
  enrolledCount?: number;
  lessons?: number;
  imagePlaceholder?: string;
  imageUrl?: string;
  instructorImageUrl?: string;
  videoPreviewUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export type UpdateCourseInput = Partial<CreateCourseInput>;
