import { z } from "zod";
export declare const courseSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    tag: z.ZodString;
    rating: z.ZodNumber;
    reviewCount: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
    whoCanAttend: z.ZodOptional<z.ZodString>;
    whyYalla: z.ZodOptional<z.ZodString>;
    includes: z.ZodOptional<z.ZodString>;
    instructorName: z.ZodString;
    instructorTitle: z.ZodString;
    durationHours: z.ZodNumber;
    enrolledCount: z.ZodOptional<z.ZodNumber>;
    lessons: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>>;
    visibility: z.ZodOptional<z.ZodEnum<{
        public: "public";
        private: "private";
    }>>;
    enableEnrollment: z.ZodOptional<z.ZodBoolean>;
    requireApproval: z.ZodOptional<z.ZodBoolean>;
    socialSharing: z.ZodOptional<z.ZodBoolean>;
    priceRegular: z.ZodOptional<z.ZodNumber>;
    priceSale: z.ZodOptional<z.ZodNumber>;
    availability: z.ZodOptional<z.ZodEnum<{
        custom: "custom";
        permanent: "permanent";
        "1_month": "1_month";
        "3_months": "3_months";
        "6_months": "6_months";
        "1_year": "1_year";
    }>>;
    enablePromoCode: z.ZodOptional<z.ZodBoolean>;
    currency: z.ZodOptional<z.ZodString>;
    discountPercent: z.ZodOptional<z.ZodNumber>;
    level: z.ZodOptional<z.ZodEnum<{
        Beginner: "Beginner";
        Intermediate: "Intermediate";
        Advanced: "Advanced";
    }>>;
    certificationType: z.ZodOptional<z.ZodEnum<{
        "CPHQ Prep": "CPHQ Prep";
        "CME Credits": "CME Credits";
        "Micro-Credential": "Micro-Credential";
    }>>;
    imagePlaceholder: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    instructorImageUrl: z.ZodOptional<z.ZodString>;
    videoPreviewUrl: z.ZodOptional<z.ZodString>;
    seoTitle: z.ZodOptional<z.ZodString>;
    seoDescription: z.ZodOptional<z.ZodString>;
    seoKeywords: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ApiCourse = z.infer<typeof courseSchema>;
export declare const createCourseBodySchema: z.ZodObject<{
    title: z.ZodString;
    tag: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    whoCanAttend: z.ZodOptional<z.ZodString>;
    whyYalla: z.ZodOptional<z.ZodString>;
    includes: z.ZodOptional<z.ZodString>;
    instructorName: z.ZodString;
    instructorTitle: z.ZodString;
    durationHours: z.ZodNumber;
    status: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>>;
    visibility: z.ZodOptional<z.ZodEnum<{
        public: "public";
        private: "private";
    }>>;
    enableEnrollment: z.ZodOptional<z.ZodBoolean>;
    requireApproval: z.ZodOptional<z.ZodBoolean>;
    socialSharing: z.ZodOptional<z.ZodBoolean>;
    priceRegular: z.ZodOptional<z.ZodNumber>;
    priceSale: z.ZodOptional<z.ZodNumber>;
    availability: z.ZodOptional<z.ZodEnum<{
        custom: "custom";
        permanent: "permanent";
        "1_month": "1_month";
        "3_months": "3_months";
        "6_months": "6_months";
        "1_year": "1_year";
    }>>;
    enablePromoCode: z.ZodOptional<z.ZodBoolean>;
    currency: z.ZodOptional<z.ZodString>;
    discountPercent: z.ZodOptional<z.ZodNumber>;
    level: z.ZodOptional<z.ZodEnum<{
        Beginner: "Beginner";
        Intermediate: "Intermediate";
        Advanced: "Advanced";
    }>>;
    certificationType: z.ZodOptional<z.ZodEnum<{
        "CPHQ Prep": "CPHQ Prep";
        "CME Credits": "CME Credits";
        "Micro-Credential": "Micro-Credential";
    }>>;
    enrolledCount: z.ZodOptional<z.ZodNumber>;
    lessons: z.ZodOptional<z.ZodNumber>;
    imagePlaceholder: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    instructorImageUrl: z.ZodOptional<z.ZodString>;
    videoPreviewUrl: z.ZodOptional<z.ZodString>;
    seoTitle: z.ZodOptional<z.ZodString>;
    seoDescription: z.ZodOptional<z.ZodString>;
    seoKeywords: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateCourseBody = z.infer<typeof createCourseBodySchema>;
export declare const updateCourseBodySchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    whoCanAttend: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    whyYalla: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    includes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    instructorName: z.ZodOptional<z.ZodString>;
    instructorTitle: z.ZodOptional<z.ZodString>;
    durationHours: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>>>;
    visibility: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        public: "public";
        private: "private";
    }>>>;
    enableEnrollment: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    requireApproval: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    socialSharing: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    priceRegular: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    priceSale: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    availability: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        custom: "custom";
        permanent: "permanent";
        "1_month": "1_month";
        "3_months": "3_months";
        "6_months": "6_months";
        "1_year": "1_year";
    }>>>;
    enablePromoCode: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    currency: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    discountPercent: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    level: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        Beginner: "Beginner";
        Intermediate: "Intermediate";
        Advanced: "Advanced";
    }>>>;
    certificationType: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        "CPHQ Prep": "CPHQ Prep";
        "CME Credits": "CME Credits";
        "Micro-Credential": "Micro-Credential";
    }>>>;
    enrolledCount: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    lessons: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    imagePlaceholder: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    imageUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    instructorImageUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    videoPreviewUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    seoTitle: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    seoDescription: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    seoKeywords: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type UpdateCourseBody = z.infer<typeof updateCourseBodySchema>;
export declare const listCoursesResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        tag: z.ZodString;
        rating: z.ZodNumber;
        reviewCount: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
        whoCanAttend: z.ZodOptional<z.ZodString>;
        whyYalla: z.ZodOptional<z.ZodString>;
        includes: z.ZodOptional<z.ZodString>;
        instructorName: z.ZodString;
        instructorTitle: z.ZodString;
        durationHours: z.ZodNumber;
        enrolledCount: z.ZodOptional<z.ZodNumber>;
        lessons: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<{
            draft: "draft";
            published: "published";
        }>>;
        visibility: z.ZodOptional<z.ZodEnum<{
            public: "public";
            private: "private";
        }>>;
        enableEnrollment: z.ZodOptional<z.ZodBoolean>;
        requireApproval: z.ZodOptional<z.ZodBoolean>;
        socialSharing: z.ZodOptional<z.ZodBoolean>;
        priceRegular: z.ZodOptional<z.ZodNumber>;
        priceSale: z.ZodOptional<z.ZodNumber>;
        availability: z.ZodOptional<z.ZodEnum<{
            custom: "custom";
            permanent: "permanent";
            "1_month": "1_month";
            "3_months": "3_months";
            "6_months": "6_months";
            "1_year": "1_year";
        }>>;
        enablePromoCode: z.ZodOptional<z.ZodBoolean>;
        currency: z.ZodOptional<z.ZodString>;
        discountPercent: z.ZodOptional<z.ZodNumber>;
        level: z.ZodOptional<z.ZodEnum<{
            Beginner: "Beginner";
            Intermediate: "Intermediate";
            Advanced: "Advanced";
        }>>;
        certificationType: z.ZodOptional<z.ZodEnum<{
            "CPHQ Prep": "CPHQ Prep";
            "CME Credits": "CME Credits";
            "Micro-Credential": "Micro-Credential";
        }>>;
        imagePlaceholder: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        instructorImageUrl: z.ZodOptional<z.ZodString>;
        videoPreviewUrl: z.ZodOptional<z.ZodString>;
        seoTitle: z.ZodOptional<z.ZodString>;
        seoDescription: z.ZodOptional<z.ZodString>;
        seoKeywords: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ListCoursesResponse = z.infer<typeof listCoursesResponseSchema>;
export declare const courseResponseSchema: z.ZodObject<{
    course: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        tag: z.ZodString;
        rating: z.ZodNumber;
        reviewCount: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
        whoCanAttend: z.ZodOptional<z.ZodString>;
        whyYalla: z.ZodOptional<z.ZodString>;
        includes: z.ZodOptional<z.ZodString>;
        instructorName: z.ZodString;
        instructorTitle: z.ZodString;
        durationHours: z.ZodNumber;
        enrolledCount: z.ZodOptional<z.ZodNumber>;
        lessons: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<{
            draft: "draft";
            published: "published";
        }>>;
        visibility: z.ZodOptional<z.ZodEnum<{
            public: "public";
            private: "private";
        }>>;
        enableEnrollment: z.ZodOptional<z.ZodBoolean>;
        requireApproval: z.ZodOptional<z.ZodBoolean>;
        socialSharing: z.ZodOptional<z.ZodBoolean>;
        priceRegular: z.ZodOptional<z.ZodNumber>;
        priceSale: z.ZodOptional<z.ZodNumber>;
        availability: z.ZodOptional<z.ZodEnum<{
            custom: "custom";
            permanent: "permanent";
            "1_month": "1_month";
            "3_months": "3_months";
            "6_months": "6_months";
            "1_year": "1_year";
        }>>;
        enablePromoCode: z.ZodOptional<z.ZodBoolean>;
        currency: z.ZodOptional<z.ZodString>;
        discountPercent: z.ZodOptional<z.ZodNumber>;
        level: z.ZodOptional<z.ZodEnum<{
            Beginner: "Beginner";
            Intermediate: "Intermediate";
            Advanced: "Advanced";
        }>>;
        certificationType: z.ZodOptional<z.ZodEnum<{
            "CPHQ Prep": "CPHQ Prep";
            "CME Credits": "CME Credits";
            "Micro-Credential": "Micro-Credential";
        }>>;
        imagePlaceholder: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        instructorImageUrl: z.ZodOptional<z.ZodString>;
        videoPreviewUrl: z.ZodOptional<z.ZodString>;
        seoTitle: z.ZodOptional<z.ZodString>;
        seoDescription: z.ZodOptional<z.ZodString>;
        seoKeywords: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CourseResponse = z.infer<typeof courseResponseSchema>;
export declare const courseNullableResponseSchema: z.ZodObject<{
    course: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        tag: z.ZodString;
        rating: z.ZodNumber;
        reviewCount: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
        whoCanAttend: z.ZodOptional<z.ZodString>;
        whyYalla: z.ZodOptional<z.ZodString>;
        includes: z.ZodOptional<z.ZodString>;
        instructorName: z.ZodString;
        instructorTitle: z.ZodString;
        durationHours: z.ZodNumber;
        enrolledCount: z.ZodOptional<z.ZodNumber>;
        lessons: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<{
            draft: "draft";
            published: "published";
        }>>;
        visibility: z.ZodOptional<z.ZodEnum<{
            public: "public";
            private: "private";
        }>>;
        enableEnrollment: z.ZodOptional<z.ZodBoolean>;
        requireApproval: z.ZodOptional<z.ZodBoolean>;
        socialSharing: z.ZodOptional<z.ZodBoolean>;
        priceRegular: z.ZodOptional<z.ZodNumber>;
        priceSale: z.ZodOptional<z.ZodNumber>;
        availability: z.ZodOptional<z.ZodEnum<{
            custom: "custom";
            permanent: "permanent";
            "1_month": "1_month";
            "3_months": "3_months";
            "6_months": "6_months";
            "1_year": "1_year";
        }>>;
        enablePromoCode: z.ZodOptional<z.ZodBoolean>;
        currency: z.ZodOptional<z.ZodString>;
        discountPercent: z.ZodOptional<z.ZodNumber>;
        level: z.ZodOptional<z.ZodEnum<{
            Beginner: "Beginner";
            Intermediate: "Intermediate";
            Advanced: "Advanced";
        }>>;
        certificationType: z.ZodOptional<z.ZodEnum<{
            "CPHQ Prep": "CPHQ Prep";
            "CME Credits": "CME Credits";
            "Micro-Credential": "Micro-Credential";
        }>>;
        imagePlaceholder: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        instructorImageUrl: z.ZodOptional<z.ZodString>;
        videoPreviewUrl: z.ZodOptional<z.ZodString>;
        seoTitle: z.ZodOptional<z.ZodString>;
        seoDescription: z.ZodOptional<z.ZodString>;
        seoKeywords: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CourseNullableResponse = z.infer<typeof courseNullableResponseSchema>;
export declare const adminCourseResponseSchema: z.ZodObject<{
    course: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        tag: z.ZodString;
        rating: z.ZodNumber;
        reviewCount: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
        whoCanAttend: z.ZodOptional<z.ZodString>;
        whyYalla: z.ZodOptional<z.ZodString>;
        includes: z.ZodOptional<z.ZodString>;
        instructorName: z.ZodString;
        instructorTitle: z.ZodString;
        durationHours: z.ZodNumber;
        enrolledCount: z.ZodOptional<z.ZodNumber>;
        lessons: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<{
            draft: "draft";
            published: "published";
        }>>;
        visibility: z.ZodOptional<z.ZodEnum<{
            public: "public";
            private: "private";
        }>>;
        enableEnrollment: z.ZodOptional<z.ZodBoolean>;
        requireApproval: z.ZodOptional<z.ZodBoolean>;
        socialSharing: z.ZodOptional<z.ZodBoolean>;
        priceRegular: z.ZodOptional<z.ZodNumber>;
        priceSale: z.ZodOptional<z.ZodNumber>;
        availability: z.ZodOptional<z.ZodEnum<{
            custom: "custom";
            permanent: "permanent";
            "1_month": "1_month";
            "3_months": "3_months";
            "6_months": "6_months";
            "1_year": "1_year";
        }>>;
        enablePromoCode: z.ZodOptional<z.ZodBoolean>;
        currency: z.ZodOptional<z.ZodString>;
        discountPercent: z.ZodOptional<z.ZodNumber>;
        level: z.ZodOptional<z.ZodEnum<{
            Beginner: "Beginner";
            Intermediate: "Intermediate";
            Advanced: "Advanced";
        }>>;
        certificationType: z.ZodOptional<z.ZodEnum<{
            "CPHQ Prep": "CPHQ Prep";
            "CME Credits": "CME Credits";
            "Micro-Credential": "Micro-Credential";
        }>>;
        imagePlaceholder: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        instructorImageUrl: z.ZodOptional<z.ZodString>;
        videoPreviewUrl: z.ZodOptional<z.ZodString>;
        seoTitle: z.ZodOptional<z.ZodString>;
        seoDescription: z.ZodOptional<z.ZodString>;
        seoKeywords: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AdminCourseResponse = z.infer<typeof adminCourseResponseSchema>;
export declare const adminCourseNullableResponseSchema: z.ZodObject<{
    course: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        tag: z.ZodString;
        rating: z.ZodNumber;
        reviewCount: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
        whoCanAttend: z.ZodOptional<z.ZodString>;
        whyYalla: z.ZodOptional<z.ZodString>;
        includes: z.ZodOptional<z.ZodString>;
        instructorName: z.ZodString;
        instructorTitle: z.ZodString;
        durationHours: z.ZodNumber;
        enrolledCount: z.ZodOptional<z.ZodNumber>;
        lessons: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<{
            draft: "draft";
            published: "published";
        }>>;
        visibility: z.ZodOptional<z.ZodEnum<{
            public: "public";
            private: "private";
        }>>;
        enableEnrollment: z.ZodOptional<z.ZodBoolean>;
        requireApproval: z.ZodOptional<z.ZodBoolean>;
        socialSharing: z.ZodOptional<z.ZodBoolean>;
        priceRegular: z.ZodOptional<z.ZodNumber>;
        priceSale: z.ZodOptional<z.ZodNumber>;
        availability: z.ZodOptional<z.ZodEnum<{
            custom: "custom";
            permanent: "permanent";
            "1_month": "1_month";
            "3_months": "3_months";
            "6_months": "6_months";
            "1_year": "1_year";
        }>>;
        enablePromoCode: z.ZodOptional<z.ZodBoolean>;
        currency: z.ZodOptional<z.ZodString>;
        discountPercent: z.ZodOptional<z.ZodNumber>;
        level: z.ZodOptional<z.ZodEnum<{
            Beginner: "Beginner";
            Intermediate: "Intermediate";
            Advanced: "Advanced";
        }>>;
        certificationType: z.ZodOptional<z.ZodEnum<{
            "CPHQ Prep": "CPHQ Prep";
            "CME Credits": "CME Credits";
            "Micro-Credential": "Micro-Credential";
        }>>;
        imagePlaceholder: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        instructorImageUrl: z.ZodOptional<z.ZodString>;
        videoPreviewUrl: z.ZodOptional<z.ZodString>;
        seoTitle: z.ZodOptional<z.ZodString>;
        seoDescription: z.ZodOptional<z.ZodString>;
        seoKeywords: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AdminCourseNullableResponse = z.infer<typeof adminCourseNullableResponseSchema>;
export declare const adminDeleteCourseResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
export type AdminDeleteCourseResponse = z.infer<typeof adminDeleteCourseResponseSchema>;
export declare const publicCoursesResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        tag: z.ZodString;
        rating: z.ZodNumber;
        reviewCount: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
        whoCanAttend: z.ZodOptional<z.ZodString>;
        whyYalla: z.ZodOptional<z.ZodString>;
        includes: z.ZodOptional<z.ZodString>;
        instructorName: z.ZodString;
        instructorTitle: z.ZodString;
        durationHours: z.ZodNumber;
        enrolledCount: z.ZodOptional<z.ZodNumber>;
        lessons: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<{
            draft: "draft";
            published: "published";
        }>>;
        visibility: z.ZodOptional<z.ZodEnum<{
            public: "public";
            private: "private";
        }>>;
        enableEnrollment: z.ZodOptional<z.ZodBoolean>;
        requireApproval: z.ZodOptional<z.ZodBoolean>;
        socialSharing: z.ZodOptional<z.ZodBoolean>;
        priceRegular: z.ZodOptional<z.ZodNumber>;
        priceSale: z.ZodOptional<z.ZodNumber>;
        availability: z.ZodOptional<z.ZodEnum<{
            custom: "custom";
            permanent: "permanent";
            "1_month": "1_month";
            "3_months": "3_months";
            "6_months": "6_months";
            "1_year": "1_year";
        }>>;
        enablePromoCode: z.ZodOptional<z.ZodBoolean>;
        currency: z.ZodOptional<z.ZodString>;
        discountPercent: z.ZodOptional<z.ZodNumber>;
        level: z.ZodOptional<z.ZodEnum<{
            Beginner: "Beginner";
            Intermediate: "Intermediate";
            Advanced: "Advanced";
        }>>;
        certificationType: z.ZodOptional<z.ZodEnum<{
            "CPHQ Prep": "CPHQ Prep";
            "CME Credits": "CME Credits";
            "Micro-Credential": "Micro-Credential";
        }>>;
        imagePlaceholder: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        instructorImageUrl: z.ZodOptional<z.ZodString>;
        videoPreviewUrl: z.ZodOptional<z.ZodString>;
        seoTitle: z.ZodOptional<z.ZodString>;
        seoDescription: z.ZodOptional<z.ZodString>;
        seoKeywords: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type PublicCoursesResponse = z.infer<typeof publicCoursesResponseSchema>;
export declare const publicCourseResponseSchema: z.ZodObject<{
    course: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        tag: z.ZodString;
        rating: z.ZodNumber;
        reviewCount: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
        whoCanAttend: z.ZodOptional<z.ZodString>;
        whyYalla: z.ZodOptional<z.ZodString>;
        includes: z.ZodOptional<z.ZodString>;
        instructorName: z.ZodString;
        instructorTitle: z.ZodString;
        durationHours: z.ZodNumber;
        enrolledCount: z.ZodOptional<z.ZodNumber>;
        lessons: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<{
            draft: "draft";
            published: "published";
        }>>;
        visibility: z.ZodOptional<z.ZodEnum<{
            public: "public";
            private: "private";
        }>>;
        enableEnrollment: z.ZodOptional<z.ZodBoolean>;
        requireApproval: z.ZodOptional<z.ZodBoolean>;
        socialSharing: z.ZodOptional<z.ZodBoolean>;
        priceRegular: z.ZodOptional<z.ZodNumber>;
        priceSale: z.ZodOptional<z.ZodNumber>;
        availability: z.ZodOptional<z.ZodEnum<{
            custom: "custom";
            permanent: "permanent";
            "1_month": "1_month";
            "3_months": "3_months";
            "6_months": "6_months";
            "1_year": "1_year";
        }>>;
        enablePromoCode: z.ZodOptional<z.ZodBoolean>;
        currency: z.ZodOptional<z.ZodString>;
        discountPercent: z.ZodOptional<z.ZodNumber>;
        level: z.ZodOptional<z.ZodEnum<{
            Beginner: "Beginner";
            Intermediate: "Intermediate";
            Advanced: "Advanced";
        }>>;
        certificationType: z.ZodOptional<z.ZodEnum<{
            "CPHQ Prep": "CPHQ Prep";
            "CME Credits": "CME Credits";
            "Micro-Credential": "Micro-Credential";
        }>>;
        imagePlaceholder: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        instructorImageUrl: z.ZodOptional<z.ZodString>;
        videoPreviewUrl: z.ZodOptional<z.ZodString>;
        seoTitle: z.ZodOptional<z.ZodString>;
        seoDescription: z.ZodOptional<z.ZodString>;
        seoKeywords: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type PublicCourseResponse = z.infer<typeof publicCourseResponseSchema>;
export declare const enrollCourseBodySchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type EnrollCourseBody = z.infer<typeof enrollCourseBodySchema>;
export declare const enrollCourseResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    enrolledCount: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type EnrollCourseResponse = z.infer<typeof enrollCourseResponseSchema>;
