"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { Course } from "@/types/course";
import { adminCourseCreateSchema } from "@/lib/validations/course";
import { createCourse, fetchCourseById, updateCourse } from "@/lib/dal/courses";
import { getStudentFieldOptions } from "@/lib/dal/settings";
import { uploadCourseImage } from "@/lib/dal/upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField, FormInput, FormSelect } from "@/components/shared/forms";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  FileQuestion,
  GripVertical,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
  Video,
  X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

type FormValues = z.infer<typeof adminCourseCreateSchema>;

const FALLBACK_CATEGORIES = [
  "Exam Prep",
  "Quality Management",
  "Patient Safety",
  "Free Resource",
  "Data Analysis",
  "Compliance",
  "Advanced",
];

const LEVEL_OPTIONS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
] as const;

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
] as const;

const AVAILABILITY_OPTIONS = [
  { value: "permanent", label: "Permanent" },
  { value: "1_month", label: "1 month" },
  { value: "3_months", label: "3 months" },
  { value: "6_months", label: "6 months" },
  { value: "1_year", label: "1 year" },
  { value: "custom", label: "Custom time" },
] as const;

const CURRENCY_OPTIONS = [{ value: "USD", label: "USD" }] as const;

const CERTIFICATION_OPTIONS = [
  { value: "CPHQ Prep", label: "CPHQ Prep" },
  { value: "CME Credits", label: "CME Credits" },
  { value: "Micro-Credential", label: "Micro-Credential" },
] as const;

const READY_MADE_QUIZZES = [
  "Module Quiz",
  "Knowledge Check",
  "Practice Quiz",
  "CPHQ Practice Quiz",
  "Assessment",
  "Final Quiz",
  "Section Review",
  "Self-Assessment",
];

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface CurriculumLecture {
  id: string;
  type: "lecture";
  title: string;
  videoUrl: string;
  materialUrl: string;
  materialFileName?: string;
  materialDataUrl?: string;
  freeLecture: boolean;
  description?: string;
  thumbnailName?: string;
}

export interface CurriculumQuiz {
  id: string;
  type: "quiz";
  title: string;
}

export type CurriculumItem = CurriculumLecture | CurriculumQuiz;

export interface CurriculumSection {
  id: string;
  title: string;
  description: string;
  items: CurriculumItem[];
}

export interface ReviewMediaFormItem {
  id: string;
  kind: "image" | "video" | "youtube";
  src: string;
  caption: string;
  poster: string;
}

function parseMultilineList(input?: string): string[] {
  if (!input) return [];
  return Array.from(
    new Set(
      input
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function mapCurriculumSections(course: Course): CurriculumSection[] {
  return (course.curriculumSections ?? []).map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description ?? "",
    items: (section.items ?? []).map((item) =>
      item.type === "lecture"
        ? {
            id: item.id,
            type: "lecture" as const,
            title: item.title,
            videoUrl: item.videoUrl ?? "",
            materialUrl: item.materialUrl ?? "",
            materialFileName: item.materialFileName,
            materialDataUrl: undefined,
            freeLecture: item.freeLecture ?? false,
          }
        : {
            id: item.id,
            type: "quiz" as const,
            title: item.title,
          }
    ),
  }));
}

function mapReviewMediaItems(course: Course): ReviewMediaFormItem[] {
  return (course.reviewMedia ?? []).map((item) => ({
    id: item.id,
    kind: item.kind,
    src: item.src,
    caption: item.caption ?? "",
    poster: item.poster ?? "",
  }));
}

function serializeCurriculumSections(sections: CurriculumSection[]) {
  return sections
    .map((section) => ({
      id: section.id,
      title: section.title.trim(),
      description: section.description.trim() || undefined,
      items: section.items
        .map((item) =>
          item.type === "lecture"
            ? {
                id: item.id,
                type: "lecture" as const,
                title: item.title.trim(),
                videoUrl: item.videoUrl.trim() || undefined,
                materialUrl: item.materialUrl.trim() || undefined,
                materialFileName: item.materialFileName,
                freeLecture: item.freeLecture,
              }
            : {
                id: item.id,
                type: "quiz" as const,
                title: item.title.trim(),
              }
        )
        .filter((item) => item.title.length > 0),
    }))
    .filter((section) => section.title.length > 0);
}

function serializeReviewMedia(items: ReviewMediaFormItem[]) {
  return items
    .map((item) => ({
      id: item.id,
      kind: item.kind,
      src: item.src.trim(),
      caption: item.caption.trim() || undefined,
      poster: item.poster.trim() || undefined,
    }))
    .filter((item) => item.src.length > 0);
}

function courseToFormValues(course: Course): FormValues {
  return {
    title: course.title,
    tag: course.tag,
    status: course.status ?? "draft",
    description: course.description ?? "",
    whoCanAttend: course.whoCanAttend ?? "",
    whyYalla: course.whyYalla ?? "",
    includes: course.includes ?? "",
    imageUrl: course.imageUrl ?? "",
    instructorImageUrl: course.instructorImageUrl ?? "",
    videoPreviewUrl: course.videoPreviewUrl ?? "",
    instructorName: course.instructorName,
    instructorTitle: course.instructorTitle,
    durationHours: course.durationHours,
    priceRegular: course.priceRegular,
    priceSale: course.priceSale,
    availability: course.availability ?? "permanent",
    enablePromoCode: course.enablePromoCode ?? true,
    currency: course.currency ?? "USD",
    discountPercent: course.discountPercent ?? 0,
    level: course.level ?? "Intermediate",
    enrolledCount: course.enrolledCount ?? 0,
    rating: course.rating ?? 0,
    reviewCount: course.reviewCount ?? 0,
    lessons: course.lessons ?? 0,
    seoTitle: course.seoTitle ?? "",
    seoDescription: course.seoDescription ?? "",
    seoKeywords: course.seoKeywords ?? "",
    enableEnrollment: course.enableEnrollment ?? true,
    requireApproval: course.requireApproval ?? false,
    socialSharing: course.socialSharing ?? false,
    certificationType: course.certificationType,
    imagePlaceholder: course.imagePlaceholder ?? "",
    learningOutcomesText: (course.learningOutcomes ?? []).join("\n"),
    featured: course.featured ?? false,
    featuredOrder: course.featuredOrder ?? 0,
  };
}

export default function AdminCourseNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = React.useMemo(() => searchParams.get("edit"), [searchParams]);
  const [loadingEdit, setLoadingEdit] = React.useState(!!editId);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const profileFileRef = React.useRef<HTMLInputElement | null>(null);
  const materialFileRef = React.useRef<HTMLInputElement | null>(null);
  const [coverError, setCoverError] = React.useState("");
  const [profileError, setProfileError] = React.useState("");
  const [coverUploading, setCoverUploading] = React.useState(false);
  const [profileUploading, setProfileUploading] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [categoryOptions, setCategoryOptions] = React.useState<string[]>(FALLBACK_CATEGORIES);
  const [curriculumSections, setCurriculumSections] = React.useState<CurriculumSection[]>([]);
  const [expandedSectionId, setExpandedSectionId] = React.useState<string | null>(null);
  const [expandedLectureIds, setExpandedLectureIds] = React.useState<Set<string>>(new Set());
  const [expandedQuizIds, setExpandedQuizIds] = React.useState<Set<string>>(new Set());
  const [materialUploadForLectureId, setMaterialUploadForLectureId] = React.useState<string | null>(
    null
  );
  const [seoKeywordInput, setSeoKeywordInput] = React.useState("");
  const [selectedRelatedCourseIds, setSelectedRelatedCourseIds] = React.useState<string[]>([]);
  const [reviewMediaItems, setReviewMediaItems] = React.useState<ReviewMediaFormItem[]>([]);
  const [curriculumQuery, setCurriculumQuery] = React.useState("");
  const [newSectionTitle, setNewSectionTitle] = React.useState("");
  const [builderTab, setBuilderTab] = React.useState<"lesson" | "quiz" | "material">("lesson");
  const [previewMode, setPreviewMode] = React.useState(true);

  const [draftLessonTitle, setDraftLessonTitle] = React.useState("");
  const [draftLessonVideoUrl, setDraftLessonVideoUrl] = React.useState("");
  const [draftLessonDescription, setDraftLessonDescription] = React.useState("");
  const [draftLessonThumbName, setDraftLessonThumbName] = React.useState("");
  const lessonThumbRef = React.useRef<HTMLInputElement | null>(null);
  const [addLessonOpen, setAddLessonOpen] = React.useState(false);
  const [addLessonSectionId, setAddLessonSectionId] = React.useState<string | null>(null);
  const [addQuizSectionId, setAddQuizSectionId] = React.useState<string | null>(null);

  const [draftQuizTitle, setDraftQuizTitle] = React.useState("");
  const [materialLectureId, setMaterialLectureId] = React.useState<string>("");
  const [materialUrlDraft, setMaterialUrlDraft] = React.useState("");
  const [draggingCurriculumItemId, setDraggingCurriculumItemId] = React.useState<string | null>(
    null
  );
  const [dragOverCurriculumItemId, setDragOverCurriculumItemId] = React.useState<string | null>(
    null
  );
  const [quizEditSearch, setQuizEditSearch] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    getStudentFieldOptions()
      .then((opts) => {
        const list = opts.categories?.length ? opts.categories : FALLBACK_CATEGORIES;
        setCategoryOptions(list);
      })
      .catch(() => setCategoryOptions(FALLBACK_CATEGORIES));
  }, []);

  React.useEffect(() => {
    if (!expandedSectionId && curriculumSections.length > 0) {
      setExpandedSectionId(curriculumSections[0].id);
    }
  }, [expandedSectionId, curriculumSections]);

  React.useEffect(() => {
    setPreviewMode(true);
    setBuilderTab("lesson");
    setCurriculumQuery("");
    setDraftLessonTitle("");
    setDraftLessonVideoUrl("");
    setDraftLessonDescription("");
    setDraftLessonThumbName("");
    setDraftQuizTitle("");
    setMaterialUrlDraft("");
  }, [expandedSectionId]);

  React.useEffect(() => {
    const activeId = expandedSectionId ?? curriculumSections[0]?.id ?? "";
    const section = curriculumSections.find((s) => s.id === activeId);
    const lectureIds = (section?.items ?? [])
      .filter((i): i is CurriculumLecture => i.type === "lecture")
      .map((l) => l.id);

    if (lectureIds.length === 0) {
      if (materialLectureId) setMaterialLectureId("");
      return;
    }
    if (!materialLectureId || !lectureIds.includes(materialLectureId)) {
      setMaterialLectureId(lectureIds[0]);
    }
  }, [expandedSectionId, curriculumSections, materialLectureId]);

  React.useEffect(() => {
    const activeId = expandedSectionId ?? curriculumSections[0]?.id ?? "";
    const section = curriculumSections.find((s) => s.id === activeId);
    const lecture = (section?.items ?? []).find(
      (i): i is CurriculumLecture => i.type === "lecture" && i.id === materialLectureId
    );
    if (lecture) setMaterialUrlDraft(lecture.materialUrl ?? "");
  }, [expandedSectionId, curriculumSections, materialLectureId]);

  const STEPS = [
    { id: 1, label: "Course details" },
    { id: 2, label: "Curriculum" },
  ] as const;

  const methods = useForm<FormValues>({
    resolver: zodResolver(adminCourseCreateSchema),
    defaultValues: {
      title: "",
      tag: "Exam Prep",
      status: "draft",
      description: "",
      whoCanAttend: "",
      whyYalla: "",
      includes: "",
      imageUrl: "",
      instructorImageUrl: "",
      videoPreviewUrl: "",
      instructorName: "Dr Ahmed Habib",
      instructorTitle: "CPHQ, Healthcare Quality Director",
      durationHours: 2,
      priceRegular: 0,
      priceSale: undefined,
      availability: "permanent",
      enablePromoCode: true,
      currency: "USD",
      discountPercent: 0,
      level: "Intermediate",
      enrolledCount: 0,
      rating: 4.8,
      reviewCount: 0,
      lessons: 0,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      enableEnrollment: true,
      requireApproval: false,
      socialSharing: false,
      certificationType: "CPHQ Prep",
      imagePlaceholder: "",
      learningOutcomesText: "",
      featured: false,
      featuredOrder: 0,
    },
    mode: "onSubmit",
  });
  const isFreeCourse =
    (methods.watch("priceRegular") ?? 0) === 0 && (methods.watch("priceSale") ?? 0) === 0;
  const instructorImageUrl = methods.watch("instructorImageUrl") ?? "";
  const currentTag = methods.watch("tag");
  const activeSection = React.useMemo(() => {
    const id = expandedSectionId ?? curriculumSections[0]?.id ?? null;
    if (!id) return null;
    return curriculumSections.find((s) => s.id === id) ?? null;
  }, [expandedSectionId, curriculumSections]);

  const activeSectionIndex = React.useMemo(() => {
    if (!activeSection) return -1;
    return curriculumSections.findIndex((s) => s.id === activeSection.id);
  }, [activeSection, curriculumSections]);

  const curriculumQueryNormalized = curriculumQuery.trim().toLowerCase();
  const activeSectionItems = activeSection?.items ?? [];
  const activeLectures = activeSectionItems.filter(
    (item): item is CurriculumLecture => item.type === "lecture"
  );
  const filteredActiveItems = curriculumQueryNormalized
    ? activeSectionItems.filter((item) =>
        String(item.title ?? "")
          .toLowerCase()
          .includes(curriculumQueryNormalized)
      )
    : activeSectionItems;
  const activeSectionDisplayTitle = activeSection
    ? /^\s*module\s*\d+/i.test(activeSection.title)
      ? activeSection.title
      : `Module ${Math.max(1, activeSectionIndex + 1)}: ${activeSection.title}`
    : "";
  const addLessonSectionInfo = React.useMemo(() => {
    if (!addLessonSectionId) return null;
    const index = curriculumSections.findIndex((s) => s.id === addLessonSectionId);
    const section = curriculumSections.find((s) => s.id === addLessonSectionId) ?? null;
    if (!section) return null;
    return { section, index };
  }, [addLessonSectionId, curriculumSections]);
  const addLessonModuleLabel = addLessonSectionInfo
    ? (() => {
        const raw = addLessonSectionInfo.section.title.trim();
        const cleaned = raw.replace(/^\s*module\s*\d+\s*:\s*/i, "").trim() || raw;
        const number = Math.max(1, addLessonSectionInfo.index + 1);
        return `Module ${number}: ${cleaned}`.toUpperCase();
      })()
    : "";
  const canSaveLesson = Boolean(addLessonSectionId && draftLessonTitle.trim().length > 0);

  const addQuizSectionInfo = React.useMemo(() => {
    if (!addQuizSectionId) return null;
    const index = curriculumSections.findIndex((s) => s.id === addQuizSectionId);
    const section = curriculumSections.find((s) => s.id === addQuizSectionId) ?? null;
    if (!section) return null;
    return { section, index };
  }, [addQuizSectionId, curriculumSections]);
  const addQuizModuleLabel = addQuizSectionInfo
    ? (() => {
        const raw = addQuizSectionInfo.section.title.trim();
        const cleaned = raw.replace(/^\s*module\s*\d+\s*:\s*/i, "").trim() || raw;
        const number = Math.max(1, addQuizSectionInfo.index + 1);
        return `Module ${number}: ${cleaned}`.toUpperCase();
      })()
    : "";

  const openAddQuizModal = (sectionId: string) => {
    setAddQuizSectionId(sectionId);
  };

  const closeAddQuizModal = () => {
    setAddQuizSectionId(null);
  };
  React.useEffect(() => {
    if (categoryOptions.length > 0 && currentTag && !categoryOptions.includes(currentTag)) {
      methods.setValue("tag", categoryOptions[0], { shouldValidate: false });
    }
  }, [categoryOptions, currentTag, methods]);

  React.useEffect(() => {
    if (!editId) {
      setLoadingEdit(false);
      setLoadError(null);
      setCurriculumSections([]);
      setSelectedRelatedCourseIds([]);
      setReviewMediaItems([]);
      return;
    }
    setLoadError(null);
    setLoadingEdit(true);
    fetchCourseById(editId)
      .then((course) => {
        if (course) {
          methods.reset(courseToFormValues(course));
          setCurriculumSections(mapCurriculumSections(course));
          setSelectedRelatedCourseIds(course.relatedCourseIds ?? []);
          setReviewMediaItems(mapReviewMediaItems(course));
        } else {
          setLoadError("Course not found.");
          setCurriculumSections([]);
          setSelectedRelatedCourseIds([]);
          setReviewMediaItems([]);
        }
      })
      .catch((e) => {
        setLoadError(e instanceof Error ? e.message : "Failed to load course.");
        setCurriculumSections([]);
        setSelectedRelatedCourseIds([]);
        setReviewMediaItems([]);
      })
      .finally(() => setLoadingEdit(false));
  }, [editId, methods]);

  const setCoverFromFile = async (file: File) => {
    setCoverError("");
    if (!file.type.startsWith("image/")) {
      setCoverError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCoverError("Max file size is 5MB.");
      return;
    }
    setCoverUploading(true);
    try {
      const { url } = await uploadCourseImage(file);
      methods.setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true });
    } catch (e) {
      setCoverError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setCoverUploading(false);
    }
  };

  const syncSaleFromDiscount = React.useCallback(() => {
    const regular = Number(methods.getValues("priceRegular")) || 0;
    const pct = Number(methods.getValues("discountPercent")) || 0;
    if (regular > 0) {
      const sale = Math.round(regular * (1 - pct / 100) * 100) / 100;
      methods.setValue("priceSale", sale, { shouldDirty: true });
    }
  }, [methods]);

  const syncDiscountFromSale = React.useCallback(() => {
    const regular = Number(methods.getValues("priceRegular")) || 0;
    const sale = Number(methods.getValues("priceSale")) ?? 0;
    if (regular > 0 && sale >= 0) {
      const pct = Math.round((1 - sale / regular) * 100);
      methods.setValue("discountPercent", Math.min(100, Math.max(0, pct)), { shouldDirty: true });
    }
  }, [methods]);

  const setProfileFromFile = async (file: File) => {
    setProfileError("");
    if (!file.type.startsWith("image/")) {
      setProfileError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Max file size is 2MB.");
      return;
    }
    setProfileUploading(true);
    try {
      const { url } = await uploadCourseImage(file);
      methods.setValue("instructorImageUrl", url, { shouldDirty: true, shouldValidate: true });
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setProfileUploading(false);
    }
  };

  const addSection = (title?: string) => {
    const id = nextId();
    const safeTitle = title?.trim() ? title.trim() : "New section";
    setCurriculumSections((prev) => [
      ...prev,
      { id, title: safeTitle, description: "", items: [] },
    ]);
    setExpandedSectionId(id);
    return id;
  };

  const addLecture = (
    sectionId: string,
    updates?: Partial<Omit<CurriculumLecture, "id" | "type">>
  ) => {
    const section = curriculumSections.find((s) => s.id === sectionId);
    if (!section) return;
    const lectureCount = section.items.filter((i) => i.type === "lecture").length + 1;
    const newLecture: CurriculumLecture = {
      id: nextId(),
      type: "lecture",
      title: updates?.title?.trim() ? updates.title.trim() : `Lesson ${lectureCount}`,
      videoUrl: updates?.videoUrl ?? "",
      materialUrl: updates?.materialUrl ?? "",
      materialFileName: updates?.materialFileName,
      materialDataUrl: updates?.materialDataUrl,
      freeLecture: updates?.freeLecture ?? false,
      description: updates?.description?.trim() ? updates.description.trim() : "",
      thumbnailName: updates?.thumbnailName?.trim() ? updates.thumbnailName.trim() : undefined,
    };
    setCurriculumSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, items: [...s.items, newLecture] } : s))
    );
    setExpandedLectureIds((prev) => new Set([...prev, newLecture.id]));
    return newLecture.id;
  };

  const addQuiz = (sectionId: string, updates?: Partial<Pick<CurriculumQuiz, "title">>) => {
    const section = curriculumSections.find((s) => s.id === sectionId);
    if (!section) return;
    const quizCount = section.items.filter((i) => i.type === "quiz").length + 1;
    const newQuiz: CurriculumQuiz = {
      id: nextId(),
      type: "quiz",
      title: updates?.title?.trim() ? updates.title.trim() : `Quiz ${quizCount}`,
    };
    setCurriculumSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, items: [...s.items, newQuiz] } : s))
    );
    return newQuiz.id;
  };

  const updateLecture = (
    sectionId: string,
    lectureId: string,
    updates: Partial<Omit<CurriculumLecture, "id" | "type">>
  ) => {
    setCurriculumSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((i) =>
                i.type === "lecture" && i.id === lectureId ? { ...i, ...updates } : i
              ),
            }
          : s
      )
    );
  };

  const updateQuiz = (
    sectionId: string,
    quizId: string,
    updates: Partial<Pick<CurriculumQuiz, "title">>
  ) => {
    setCurriculumSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((i) =>
                i.type === "quiz" && i.id === quizId ? { ...i, ...updates } : i
              ),
            }
          : s
      )
    );
  };

  const removeItem = (sectionId: string, itemId: string) => {
    setCurriculumSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s
      )
    );
    setExpandedLectureIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
    setExpandedQuizIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSectionId(sectionId);
  };

  const reorderSectionItem = (sectionId: string, activeId: string, overId: string) => {
    if (activeId === overId) return;
    setCurriculumSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const items = [...s.items];
        const fromIndex = items.findIndex((i) => i.id === activeId);
        const toIndex = items.findIndex((i) => i.id === overId);
        if (fromIndex === -1 || toIndex === -1) return s;
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        return { ...s, items };
      })
    );
  };

  const resetAddLessonDraft = () => {
    setDraftLessonTitle("");
    setDraftLessonVideoUrl("");
    setDraftLessonDescription("");
    setDraftLessonThumbName("");
  };

  const openAddLessonModal = (sectionId: string) => {
    setAddLessonSectionId(sectionId);
    resetAddLessonDraft();
    setAddLessonOpen(true);
  };

  const closeAddLessonModal = () => {
    setAddLessonOpen(false);
    setAddLessonSectionId(null);
    resetAddLessonDraft();
  };

  const toggleLectureExpanded = (lectureId: string) => {
    setExpandedLectureIds((prev) => {
      const next = new Set(prev);
      if (next.has(lectureId)) next.delete(lectureId);
      else next.add(lectureId);
      return next;
    });
  };

  const toggleQuizExpanded = (quizId: string) => {
    setExpandedQuizIds((prev) => {
      const next = new Set(prev);
      if (next.has(quizId)) next.delete(quizId);
      else next.add(quizId);
      return next;
    });
  };

  const triggerMaterialUpload = (lectureId: string) => {
    setMaterialUploadForLectureId(lectureId);
    materialFileRef.current?.click();
  };

  const handleMaterialUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const lectureId = materialUploadForLectureId;
    e.target.value = "";
    setMaterialUploadForLectureId(null);
    if (!file || !lectureId) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCurriculumSections((prev) =>
        prev.map((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.type === "lecture" && i.id === lectureId
              ? {
                  ...i,
                  materialFileName: file.name,
                  materialDataUrl: String(reader.result ?? ""),
                  materialUrl: "",
                }
              : i
          ),
        }))
      );
    };
    reader.readAsDataURL(file);
  };

  const addReviewMediaItem = () => {
    setReviewMediaItems((prev) => [
      ...prev,
      { id: nextId(), kind: "youtube", src: "", caption: "", poster: "" },
    ]);
  };

  const updateReviewMediaItem = (
    itemId: string,
    updates: Partial<Omit<ReviewMediaFormItem, "id">>
  ) => {
    setReviewMediaItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const removeReviewMediaItem = (itemId: string) => {
    setReviewMediaItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const submit = methods.handleSubmit(async (data) => {
    const curriculumPayload = serializeCurriculumSections(curriculumSections);
    const reviewMediaPayload = serializeReviewMedia(reviewMediaItems);
    const relatedCourseIds = selectedRelatedCourseIds.filter((id) => id !== editId);
    const learningOutcomes = parseMultilineList(data.learningOutcomesText);
    const payload = {
      title: data.title,
      tag: data.tag,
      status: data.status ?? "draft",
      description: data.description,
      whoCanAttend: data.whoCanAttend,
      whyYalla: data.whyYalla,
      includes: data.includes,
      instructorName: data.instructorName,
      instructorTitle: data.instructorTitle,
      durationHours: data.durationHours,
      priceRegular: data.priceRegular ?? 0,
      priceSale: data.priceSale,
      availability: data.availability,
      enablePromoCode: data.enablePromoCode,
      currency: data.currency,
      discountPercent: data.discountPercent,
      level: data.level,
      enableEnrollment: data.enableEnrollment ?? true,
      requireApproval: data.requireApproval ?? false,
      socialSharing: data.socialSharing ?? false,
      certificationType: data.certificationType,
      enrolledCount: data.enrolledCount ?? 0,
      rating: data.rating,
      reviewCount: data.reviewCount,
      lessons: data.lessons,
      imagePlaceholder: data.imagePlaceholder?.trim() || undefined,
      imageUrl: data.imageUrl?.trim() || undefined,
      instructorImageUrl: data.instructorImageUrl?.trim() || undefined,
      videoPreviewUrl: data.videoPreviewUrl?.trim() || undefined,
      seoTitle: data.seoTitle?.trim() || undefined,
      seoDescription: data.seoDescription?.trim() || undefined,
      seoKeywords: data.seoKeywords?.trim() || undefined,
      learningOutcomes: learningOutcomes.length ? learningOutcomes : undefined,
      curriculumSections: curriculumPayload.length ? curriculumPayload : undefined,
      reviewMedia: reviewMediaPayload.length ? reviewMediaPayload : undefined,
      featured: data.featured ?? false,
      featuredOrder: data.featured ? (data.featuredOrder ?? 0) : undefined,
      relatedCourseIds: relatedCourseIds.length ? relatedCourseIds : undefined,
    };
    if (editId) {
      await updateCourse(editId, payload);
      router.push(`/admin/courses/${editId}`);
    } else {
      await createCourse(payload);
      router.push("/admin/courses");
    }
    router.refresh();
  });

  return (
    <FormProvider {...methods}>
      <div className="min-w-0 max-w-full overflow-x-hidden">
        {loadError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p>{loadError}</p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/admin/courses">Back to courses</Link>
            </Button>
          </div>
        )}
        {loadingEdit && (
          <div className="flex items-center justify-center py-12 text-zinc-600">
            Loading course…
          </div>
        )}
        {!loadingEdit && !loadError && (
          <div
            className={cn(
              "grid gap-6 xl:gap-10",
              step === 2 ? "xl:grid-cols-[360px_1fr]" : "xl:grid-cols-[1fr_360px]"
            )}
          >
            <form
              onSubmit={submit}
              className={cn("w-full min-w-0 space-y-6", step === 2 ? "xl:order-2" : "xl:order-1")}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                  {STEPS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStep(s.id)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                        step === s.id
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-600 hover:text-zinc-900"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                          step === s.id
                            ? "bg-gold text-gold-foreground"
                            : "bg-zinc-200 text-zinc-600"
                        )}
                      >
                        {s.id}
                      </span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {step === 1 && (
                <>
                  <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Course details</CardTitle>
                      <CardDescription>
                        Course basics, duration, instructor, and how it will appear.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 pt-0">
                      <FormField name="title" label="Course title" required>
                        {({ id, error, ...rest }) => (
                          <FormInput
                            id={id}
                            error={error}
                            placeholder="e.g. CPHQ Comprehensive Review 2026"
                            className="rounded-xl border-zinc-200"
                            {...rest}
                          />
                        )}
                      </FormField>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <FormSelect
                          name="tag"
                          label="Category"
                          required
                          options={categoryOptions.map((c) => ({ value: c, label: c }))}
                          placeholder={
                            categoryOptions.length === 0
                              ? "Add categories in Settings"
                              : "Select category"
                          }
                        />
                        <FormSelect
                          name="status"
                          label="Status"
                          options={STATUS_OPTIONS as unknown as { value: string; label: string }[]}
                          placeholder="Select status"
                        />
                        <FormSelect
                          name="level"
                          label="Level"
                          options={LEVEL_OPTIONS as unknown as { value: string; label: string }[]}
                          placeholder="Select level"
                        />
                      </div>

                      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Availability</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                          <FormField name="availability" label="Availability">
                            {({ id }) => (
                              <div
                                className="flex flex-wrap gap-4"
                                role="radiogroup"
                                aria-labelledby={id}
                              >
                                {AVAILABILITY_OPTIONS.map((opt) => (
                                  <label
                                    key={opt.value}
                                    className="flex cursor-pointer items-center gap-2"
                                  >
                                    <input
                                      type="radio"
                                      name={id}
                                      value={opt.value}
                                      checked={methods.watch("availability") === opt.value}
                                      onChange={() =>
                                        methods.setValue(
                                          "availability",
                                          opt.value as FormValues["availability"]
                                        )
                                      }
                                      className="h-4 w-4 border-zinc-300 text-zinc-600 focus:ring-zinc-400"
                                    />
                                    <span className="text-sm font-medium text-zinc-700">
                                      {opt.label}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </FormField>

                          <div className="space-y-4">
                            <FormField name="enablePromoCode">
                              {({ id }) => (
                                <label className="flex cursor-pointer items-center gap-2">
                                  <Checkbox
                                    id={id}
                                    checked={methods.watch("enablePromoCode") ?? false}
                                    onCheckedChange={(checked) =>
                                      methods.setValue("enablePromoCode", !!checked)
                                    }
                                  />
                                  <span className="text-sm font-medium text-zinc-700">
                                    Enable promo code
                                  </span>
                                </label>
                              )}
                            </FormField>

                            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                              <div>
                                <p className="text-sm font-semibold text-zinc-900">Free course</p>
                                <p className="text-xs text-zinc-500">
                                  No payment required; students can enroll for free.
                                </p>
                              </div>
                              <Switch
                                checked={isFreeCourse}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    methods.setValue("priceRegular", 0, { shouldDirty: true });
                                    methods.setValue("priceSale", undefined, { shouldDirty: true });
                                    methods.setValue("discountPercent", 0, { shouldDirty: true });
                                  } else {
                                    methods.setValue("priceRegular", 99, { shouldDirty: true });
                                    methods.setValue("priceSale", undefined, { shouldDirty: true });
                                    methods.setValue("discountPercent", 0, { shouldDirty: true });
                                  }
                                }}
                                className="data-[state=checked]:bg-emerald-500"
                              />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                              <FormField name="priceRegular" label="Original Price">
                                {({ id, error, ...rest }) => (
                                  <div className="space-y-1.5">
                                    <div className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white focus-within:ring-2 focus-within:ring-zinc-400/40">
                                      <select
                                        value={methods.watch("currency") ?? "USD"}
                                        onChange={(e) =>
                                          methods.setValue("currency", e.target.value)
                                        }
                                        disabled={isFreeCourse}
                                        className="border-0 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 focus:outline-none disabled:opacity-60"
                                      >
                                        {CURRENCY_OPTIONS.map((c) => (
                                          <option key={c.value} value={c.value}>
                                            {c.value}
                                          </option>
                                        ))}
                                      </select>
                                      <FormInput
                                        id={id}
                                        error={error}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="rounded-none border-0 border-l border-zinc-200 focus-visible:ring-0 disabled:bg-zinc-50 disabled:opacity-60"
                                        disabled={isFreeCourse}
                                        {...rest}
                                      />
                                    </div>
                                  </div>
                                )}
                              </FormField>
                              <FormField name="priceSale" label="Sale Price">
                                {({ id, error, ...rest }) => (
                                  <div className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white focus-within:ring-2 focus-within:ring-zinc-400/40">
                                    <select
                                      value={methods.watch("currency") ?? "USD"}
                                      onChange={(e) => methods.setValue("currency", e.target.value)}
                                      disabled={isFreeCourse}
                                      className="border-0 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 focus:outline-none disabled:opacity-60"
                                    >
                                      {CURRENCY_OPTIONS.map((c) => (
                                        <option key={c.value} value={c.value}>
                                          {c.value}
                                        </option>
                                      ))}
                                    </select>
                                    <FormInput
                                      id={id}
                                      error={error}
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="rounded-none border-0 border-l border-zinc-200 focus-visible:ring-0 disabled:bg-zinc-50 disabled:opacity-60"
                                      {...rest}
                                      onBlur={(e) => {
                                        const maybeOnBlur = (
                                          rest as {
                                            onBlur?: (
                                              ev: React.FocusEvent<HTMLInputElement>
                                            ) => void;
                                          }
                                        ).onBlur;
                                        maybeOnBlur?.(e);
                                        syncDiscountFromSale();
                                      }}
                                      disabled={isFreeCourse}
                                    />
                                  </div>
                                )}
                              </FormField>
                              <FormField name="discountPercent" label="Discount %">
                                {({ id, error, ...rest }) => (
                                  <div className="flex items-center overflow-hidden rounded-xl border border-zinc-200 bg-white focus-within:ring-2 focus-within:ring-zinc-400/40">
                                    <FormInput
                                      id={id}
                                      error={error}
                                      type="number"
                                      step="1"
                                      min="0"
                                      max="100"
                                      className="rounded-xl border-0 focus-visible:ring-0 disabled:bg-zinc-50 disabled:opacity-60"
                                      {...rest}
                                      onBlur={(e) => {
                                        const maybeOnBlur = (
                                          rest as {
                                            onBlur?: (
                                              ev: React.FocusEvent<HTMLInputElement>
                                            ) => void;
                                          }
                                        ).onBlur;
                                        maybeOnBlur?.(e);
                                        syncSaleFromDiscount();
                                      }}
                                      disabled={isFreeCourse}
                                    />
                                    <span className="px-3 text-sm text-zinc-500">%</span>
                                  </div>
                                )}
                              </FormField>
                            </div>
                            <p className="text-xs text-zinc-500">
                              Sale price and discount % stay in sync. Leave both prices at 0 for a
                              free course.
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <FormField name="durationHours" label="Duration (hours)" required>
                          {({ id, error, ...rest }) => (
                            <FormInput
                              id={id}
                              error={error}
                              type="number"
                              step="0.5"
                              min="0"
                              className="rounded-xl border-zinc-200"
                              {...rest}
                            />
                          )}
                        </FormField>
                        <FormField name="enrolledCount" label="Fake Enrollment" required>
                          {({ id, error, ...rest }) => (
                            <div className="space-y-1.5">
                              <div className="relative">
                                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <FormInput
                                  id={id}
                                  error={error}
                                  type="number"
                                  step="1"
                                  min="0"
                                  className="rounded-xl border-zinc-200 pl-9"
                                  {...rest}
                                />
                              </div>
                              <p className="text-xs text-zinc-500">
                                This number will be displayed as the enrollment count.
                              </p>
                            </div>
                          )}
                        </FormField>
                        <FormField name="lessons" label="Lessons">
                          {({ id, error, ...rest }) => (
                            <FormInput
                              id={id}
                              error={error}
                              type="number"
                              step="1"
                              min="0"
                              className="rounded-xl border-zinc-200"
                              {...rest}
                            />
                          )}
                        </FormField>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField name="rating" label="Fake Rating (0–5)">
                          {({ id, error, ...rest }) => (
                            <div className="space-y-1.5">
                              <FormInput
                                id={id}
                                error={error}
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                placeholder="e.g. 4.8"
                                className="rounded-xl border-zinc-200"
                                {...rest}
                              />
                              <p className="text-xs text-zinc-500">
                                Shown to students as course rating (stars).
                              </p>
                            </div>
                          )}
                        </FormField>
                        <FormField name="reviewCount" label="Fake Reviews">
                          {({ id, error, ...rest }) => (
                            <div className="space-y-1.5">
                              <FormInput
                                id={id}
                                error={error}
                                type="number"
                                step="1"
                                min="0"
                                placeholder="e.g. 128"
                                className="rounded-xl border-zinc-200"
                                {...rest}
                              />
                              <p className="text-xs text-zinc-500">
                                Shown to students as number of reviews.
                              </p>
                            </div>
                          )}
                        </FormField>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
                        <FormField name="instructorName" label="Instructor name" required>
                          {({ id, error, ...rest }) => (
                            <FormInput
                              id={id}
                              error={error}
                              className="rounded-xl border-zinc-200"
                              {...rest}
                            />
                          )}
                        </FormField>
                        <FormField name="instructorTitle" label="Instructor title" required>
                          {({ id, error, ...rest }) => (
                            <FormInput
                              id={id}
                              error={error}
                              placeholder="e.g. CPHQ, Healthcare Quality Director"
                              className="rounded-xl border-zinc-200"
                              {...rest}
                            />
                          )}
                        </FormField>
                        <div className="space-y-1.5">
                          <span className="text-sm font-medium text-zinc-700">Profile picture</span>
                          <input
                            ref={profileFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) void setProfileFromFile(f);
                              e.currentTarget.value = "";
                            }}
                          />
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => profileFileRef.current?.click()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ")
                                profileFileRef.current?.click();
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const f = e.dataTransfer.files?.[0];
                              if (f) void setProfileFromFile(f);
                            }}
                            className={cn(
                              "flex min-h-[72px] w-[120px] flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-2 text-center transition-colors hover:bg-zinc-100",
                              instructorImageUrl && "border-zinc-300 bg-white"
                            )}
                          >
                            {instructorImageUrl ? (
                              <div className="flex flex-col items-center gap-0.5">
                                {profileUploading ? (
                                  <span className="text-xs text-amber-600">Uploading…</span>
                                ) : (
                                  <>
                                    <Image
                                      src={instructorImageUrl}
                                      alt="Profile"
                                      width={40}
                                      height={40}
                                      className="h-10 w-10 rounded-full object-cover ring-2 ring-zinc-200"
                                      unoptimized
                                    />
                                    <span className="text-[10px] font-medium text-zinc-600">
                                      Change
                                    </span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <>
                                {profileUploading ? (
                                  <span className="text-xs text-amber-600">Uploading…</span>
                                ) : (
                                  <>
                                    <UploadCloud className="h-4 w-4 text-zinc-500" />
                                    <span className="text-[10px] font-medium text-zinc-700">
                                      Drop or click
                                    </span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                          {profileError ? (
                            <p className="text-xs text-destructive">{profileError}</p>
                          ) : null}
                        </div>
                      </div>

                      <FormField name="description" label="Description" required>
                        {({ id, error, ...rest }) => (
                          <textarea
                            id={id}
                            aria-invalid={!!error}
                            aria-describedby={error ? `${id}-error` : undefined}
                            className={cn(
                              "min-h-[120px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none",
                              "focus-visible:ring-2 focus-visible:ring-zinc-400/40",
                              error && "border-destructive focus-visible:ring-destructive"
                            )}
                            placeholder="Write a clear, benefit-focused summary of the course…"
                            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                          />
                        )}
                      </FormField>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">What course includes?</CardTitle>
                      <CardDescription>
                        Add what learners will get (modules, mock exams, downloads, support).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <FormField name="includes" label="What this course includes (optional)">
                        {({ id, error, ...rest }) => (
                          <textarea
                            id={id}
                            aria-invalid={!!error}
                            aria-describedby={error ? `${id}-error` : undefined}
                            className={cn(
                              "min-h-[120px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none",
                              "focus-visible:ring-2 focus-visible:ring-zinc-400/40",
                              error && "border-destructive focus-visible:ring-destructive"
                            )}
                            placeholder={
                              "Example:\n- 12 high‑yield modules\n- 3 mock exams + explanations\n- Downloadable summaries\n- Weekly study plan"
                            }
                            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                          />
                        )}
                      </FormField>
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Users className="h-4 w-4 text-gold" />
                          Who can attend
                        </CardTitle>
                        <CardDescription>Target audience and prerequisites.</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <FormField name="whoCanAttend" label="Audience" required>
                          {({ id, error, ...rest }) => (
                            <textarea
                              id={id}
                              aria-invalid={!!error}
                              aria-describedby={error ? `${id}-error` : undefined}
                              className={cn(
                                "min-h-[140px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none",
                                "focus-visible:ring-2 focus-visible:ring-zinc-400/40",
                                error && "border-destructive focus-visible:ring-destructive"
                              )}
                              placeholder="Who should take this course? (roles, experience level, prerequisites)"
                              {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                            />
                          )}
                        </FormField>
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Sparkles className="h-4 w-4 text-gold" />
                          Why CPHQ with Yalla CPHQ
                        </CardTitle>
                        <CardDescription>Your unique value proposition.</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <FormField name="whyYalla" label="Why Yalla CPHQ" required>
                          {({ id, error, ...rest }) => (
                            <textarea
                              id={id}
                              aria-invalid={!!error}
                              aria-describedby={error ? `${id}-error` : undefined}
                              className={cn(
                                "min-h-[140px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none",
                                "focus-visible:ring-2 focus-visible:ring-zinc-400/40",
                                error && "border-destructive focus-visible:ring-destructive"
                              )}
                              placeholder="Why should learners choose Yalla CPHQ for this course?"
                              {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                            />
                          )}
                        </FormField>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Course page content</CardTitle>
                      <CardDescription>
                        Content that powers the public course details page from backend data.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 pt-0">
                      <FormField name="learningOutcomesText" label="Learning outcomes">
                        {({ id, error, ...rest }) => (
                          <textarea
                            id={id}
                            aria-invalid={!!error}
                            aria-describedby={error ? `${id}-error` : undefined}
                            className={cn(
                              "min-h-[140px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none",
                              "focus-visible:ring-2 focus-visible:ring-zinc-400/40",
                              error && "border-destructive focus-visible:ring-destructive"
                            )}
                            placeholder={
                              "Add one learning outcome per line.\nExample:\nMaster the 5 CPHQ exam domains\nApply patient safety tools in real scenarios"
                            }
                            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                          />
                        )}
                      </FormField>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormSelect
                          name="certificationType"
                          label="Certification type"
                          options={
                            CERTIFICATION_OPTIONS as unknown as { value: string; label: string }[]
                          }
                          placeholder="Select certification type"
                        />
                        <FormField name="imagePlaceholder" label="Image placeholder (optional)">
                          {({ id, error, ...rest }) => (
                            <FormInput
                              id={id}
                              error={error}
                              placeholder="Fallback text for cover image"
                              className="rounded-xl border-zinc-200"
                              {...rest}
                            />
                          )}
                        </FormField>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                      Tip: Keep the description short, clear, and exam-focused.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl border-zinc-200"
                        onClick={() => {
                          methods.reset();
                          setCurriculumSections([]);
                          setSelectedRelatedCourseIds([]);
                          setReviewMediaItems([]);
                          router.push("/admin/courses");
                        }}
                      >
                        <X className="h-4 w-4" />
                        Discard
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl border-zinc-200"
                        onClick={() => setStep(2)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        type="submit"
                        className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                      >
                        <Check className="h-4 w-4" />
                        {editId ? "Save changes" : "Create course"}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-6">
                    <div className="hidden flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-gold" aria-hidden />
                          <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                            Lessons & Quizzes
                          </h2>
                        </div>
                        <p className="mt-1 text-sm text-zinc-600">
                          Review and edit the lessons and quizzes in your curriculum.
                        </p>
                      </div>

                      <div className="w-full lg:max-w-sm">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                          <input
                            value={curriculumQuery}
                            onChange={(e) => setCurriculumQuery(e.target.value)}
                            type="search"
                            placeholder="Search lessons & quizzes..."
                            className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                            autoComplete="off"
                          />
                        </div>
                      </div>
                    </div>

                    <input
                      ref={materialFileRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      className="hidden"
                      onChange={handleMaterialUpload}
                    />

                    <Card className="hidden rounded-2xl border-zinc-200 bg-white shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Curriculum items</CardTitle>
                        <CardDescription>All lessons and quizzes across modules.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0">
                        {curriculumSections.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              No lessons or quizzes yet
                            </p>
                            <p className="mt-1 text-sm text-zinc-500">
                              Add a section on the left, then add lessons and quizzes.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {curriculumSections.map((section, sectionIndex) => {
                              const displayTitle = /^\s*module\s*\d+/i.test(section.title)
                                ? section.title
                                : `Module ${sectionIndex + 1}: ${section.title}`;
                              const lessonsCount = section.items.filter(
                                (i) => i.type === "lecture"
                              ).length;
                              const quizzesCount = section.items.filter(
                                (i) => i.type === "quiz"
                              ).length;
                              const filteredItems = curriculumQueryNormalized
                                ? section.items.filter((i) =>
                                    String(i.title ?? "")
                                      .toLowerCase()
                                      .includes(curriculumQueryNormalized)
                                  )
                                : section.items;

                              return (
                                <div
                                  key={section.id}
                                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-zinc-900">
                                      {displayTitle}
                                    </p>
                                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                      {lessonsCount} {lessonsCount === 1 ? "Lesson" : "Lessons"} ·{" "}
                                      {quizzesCount} {quizzesCount === 1 ? "Quiz" : "Quizzes"}
                                    </p>
                                  </div>

                                  <div className="mt-4 space-y-3">
                                    {filteredItems.length === 0 ? (
                                      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center">
                                        <p className="text-sm font-semibold text-zinc-900">
                                          {curriculumQueryNormalized
                                            ? "No matching items"
                                            : "No items yet"}
                                        </p>
                                        <p className="mt-1 text-sm text-zinc-500">
                                          {curriculumQueryNormalized
                                            ? "Try a different search term."
                                            : "Add your first lesson or quiz for this module."}
                                        </p>
                                      </div>
                                    ) : (
                                      filteredItems.map((item) => {
                                        if (item.type === "lecture") {
                                          const lecture = item as CurriculumLecture;
                                          return (
                                            <div
                                              key={lecture.id}
                                              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                                            >
                                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="flex min-w-0 items-start gap-3">
                                                  <Video
                                                    className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500"
                                                    aria-hidden
                                                  />
                                                  <div className="min-w-0 flex-1 space-y-3">
                                                    <div className="space-y-1.5">
                                                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                        Lesson title
                                                      </label>
                                                      <input
                                                        type="text"
                                                        value={lecture.title}
                                                        onChange={(e) =>
                                                          updateLecture(section.id, lecture.id, {
                                                            title: e.target.value,
                                                          })
                                                        }
                                                        placeholder="Lesson title..."
                                                        className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                                      />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                        Video URL
                                                      </label>
                                                      <input
                                                        type="url"
                                                        value={lecture.videoUrl}
                                                        onChange={(e) =>
                                                          updateLecture(section.id, lecture.id, {
                                                            videoUrl: e.target.value,
                                                          })
                                                        }
                                                        placeholder="https://www.youtube.com/watch?v=…"
                                                        className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                                      />
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="flex items-center justify-end gap-2">
                                                  <div className="flex items-center gap-2">
                                                    <span className="whitespace-nowrap text-xs font-medium text-zinc-500">
                                                      Free
                                                    </span>
                                                    <Switch
                                                      checked={lecture.freeLecture}
                                                      onCheckedChange={(checked) =>
                                                        updateLecture(section.id, lecture.id, {
                                                          freeLecture: !!checked,
                                                        })
                                                      }
                                                      className="data-[state=checked]:bg-emerald-500"
                                                      aria-label="Free lesson"
                                                    />
                                                  </div>
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-zinc-500 hover:text-destructive"
                                                    onClick={() =>
                                                      removeItem(section.id, lecture.id)
                                                    }
                                                    aria-label="Delete lesson"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }

                                        const quiz = item as CurriculumQuiz;
                                        const isQuizExpandedList = expandedQuizIds.has(quiz.id);
                                        return (
                                          <div
                                            key={quiz.id}
                                            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                                          >
                                            <div className="flex items-center gap-3 p-4">
                                              <FileQuestion
                                                className="h-4 w-4 shrink-0 text-zinc-500"
                                                aria-hidden
                                              />
                                              <input
                                                type="text"
                                                value={quiz.title}
                                                onChange={(e) =>
                                                  updateQuiz(section.id, quiz.id, {
                                                    title: e.target.value,
                                                  })
                                                }
                                                className="min-w-0 flex-1 truncate rounded border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-zinc-900 outline-none focus:border-zinc-200 focus:bg-white"
                                              />
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-zinc-600 hover:text-zinc-900"
                                                onClick={() => toggleQuizExpanded(quiz.id)}
                                              >
                                                {isQuizExpandedList ? (
                                                  <>
                                                    Close <ChevronUp className="ml-1 h-4 w-4" />
                                                  </>
                                                ) : (
                                                  <>
                                                    Edit <ChevronDown className="ml-1 h-4 w-4" />
                                                  </>
                                                )}
                                              </Button>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-zinc-500 hover:text-destructive"
                                                onClick={() => removeItem(section.id, quiz.id)}
                                                aria-label="Delete quiz"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                            {isQuizExpandedList ? (
                                              <div className="space-y-4 border-t border-zinc-200 bg-zinc-50/50 p-4">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                  <p className="text-sm text-zinc-600">
                                                    Current:{" "}
                                                    <span className="font-semibold text-zinc-900">
                                                      {quiz.title}
                                                    </span>
                                                  </p>
                                                  <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-xl border-zinc-200 text-zinc-600 hover:border-destructive/50 hover:text-destructive"
                                                    onClick={() => {
                                                      removeItem(section.id, quiz.id);
                                                      toggleQuizExpanded(quiz.id);
                                                    }}
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove quiz
                                                  </Button>
                                                </div>
                                                <div className="space-y-2">
                                                  <label className="text-sm font-medium text-zinc-700">
                                                    Select from ready-made quizzes
                                                  </label>
                                                  <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                                    <input
                                                      type="text"
                                                      value={quizEditSearch[quiz.id] ?? ""}
                                                      onChange={(e) =>
                                                        setQuizEditSearch((prev) => ({
                                                          ...prev,
                                                          [quiz.id]: e.target.value,
                                                        }))
                                                      }
                                                      placeholder="Search quizzes..."
                                                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                                    />
                                                  </div>
                                                  <div className="grid max-h-40 gap-1.5 overflow-y-auto">
                                                    {(quizEditSearch[quiz.id]
                                                      ? READY_MADE_QUIZZES.filter((q) =>
                                                          q
                                                            .toLowerCase()
                                                            .includes(
                                                              (
                                                                quizEditSearch[quiz.id] ?? ""
                                                              ).toLowerCase()
                                                            )
                                                        )
                                                      : READY_MADE_QUIZZES
                                                    ).map((title) => (
                                                      <button
                                                        key={title}
                                                        type="button"
                                                        onClick={() => {
                                                          updateQuiz(section.id, quiz.id, {
                                                            title,
                                                          });
                                                          setQuizEditSearch((prev) => {
                                                            const next = { ...prev };
                                                            delete next[quiz.id];
                                                            return next;
                                                          });
                                                        }}
                                                        className={cn(
                                                          "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                                                          quiz.title === title
                                                            ? "border-gold bg-gold/10 text-zinc-900"
                                                            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                                                        )}
                                                      >
                                                        <FileQuestion className="h-4 w-4 shrink-0 text-zinc-500" />
                                                        {title}
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>
                                            ) : null}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="rounded-xl border-zinc-200"
                                      onClick={() => addLecture(section.id)}
                                    >
                                      <Video className="h-4 w-4" />
                                      Add Lesson
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="rounded-xl border-zinc-200"
                                      onClick={() => openAddQuizModal(section.id)}
                                    >
                                      <FileQuestion className="h-4 w-4" />
                                      Add Quiz
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="grid gap-6">
                      <Card className="flex max-h-[80vh] flex-col rounded-2xl border-zinc-200 bg-white shadow-sm">
                        <CardContent className="flex min-h-0 flex-col pt-0">
                          {activeSection ? (
                            <div className="flex max-h-[80vh] min-h-0 flex-col p-6">
                              <h3 className="shrink-0 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
                                {activeSectionDisplayTitle}
                              </h3>

                              <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
                                {previewMode ? (
                                  <div className="space-y-3">
                                    {filteredActiveItems.map((item) => {
                                      if (item.type === "lecture") {
                                        const isLectureExpanded = expandedLectureIds.has(item.id);
                                        return (
                                          <div
                                            key={item.id}
                                            onDragOver={(e) => {
                                              if (!draggingCurriculumItemId) return;
                                              e.preventDefault();
                                              setDragOverCurriculumItemId(item.id);
                                            }}
                                            onDragLeave={() => {
                                              setDragOverCurriculumItemId((prev) =>
                                                prev === item.id ? null : prev
                                              );
                                            }}
                                            onDrop={(e) => {
                                              if (!activeSection) return;
                                              e.preventDefault();
                                              const activeId =
                                                draggingCurriculumItemId ??
                                                e.dataTransfer.getData("text/plain");
                                              if (!activeId || activeId === item.id) return;
                                              reorderSectionItem(
                                                activeSection.id,
                                                activeId,
                                                item.id
                                              );
                                              setDraggingCurriculumItemId(null);
                                              setDragOverCurriculumItemId(null);
                                            }}
                                            className={cn(
                                              "overflow-hidden rounded-2xl border bg-white shadow-sm",
                                              dragOverCurriculumItemId === item.id &&
                                                draggingCurriculumItemId !== item.id
                                                ? "border-gold/40 ring-2 ring-gold/30"
                                                : "border-zinc-200"
                                            )}
                                          >
                                            <div className="flex items-center gap-3 p-4">
                                              <button
                                                type="button"
                                                draggable
                                                onDragStart={(e) => {
                                                  e.dataTransfer.setData("text/plain", item.id);
                                                  e.dataTransfer.effectAllowed = "move";
                                                  setDraggingCurriculumItemId(item.id);
                                                }}
                                                onDragEnd={() => {
                                                  setDraggingCurriculumItemId(null);
                                                  setDragOverCurriculumItemId(null);
                                                }}
                                                className="cursor-grab rounded-md p-1 text-zinc-400 hover:text-zinc-700 active:cursor-grabbing"
                                                aria-label="Drag to reorder"
                                              >
                                                <GripVertical className="h-4 w-4" aria-hidden />
                                              </button>
                                              <Video
                                                className="h-4 w-4 shrink-0 text-zinc-500"
                                                aria-hidden
                                              />
                                              <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) =>
                                                  updateLecture(activeSection.id, item.id, {
                                                    title: e.target.value,
                                                  })
                                                }
                                                className="min-w-0 flex-1 truncate rounded border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-zinc-900 outline-none focus:border-zinc-200 focus:bg-white"
                                              />
                                              <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-2">
                                                  <span className="whitespace-nowrap text-xs font-medium text-zinc-500">
                                                    Free
                                                  </span>
                                                  <Switch
                                                    checked={item.freeLecture}
                                                    onCheckedChange={(checked) =>
                                                      updateLecture(activeSection.id, item.id, {
                                                        freeLecture: !!checked,
                                                      })
                                                    }
                                                    className="data-[state=checked]:bg-emerald-500"
                                                    aria-label="Free lesson"
                                                  />
                                                </div>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="text-zinc-600 hover:text-zinc-900"
                                                  onClick={() => toggleLectureExpanded(item.id)}
                                                >
                                                  {isLectureExpanded ? (
                                                    <>
                                                      Close <ChevronUp className="ml-1 h-4 w-4" />
                                                    </>
                                                  ) : (
                                                    <>
                                                      Edit <ChevronDown className="ml-1 h-4 w-4" />
                                                    </>
                                                  )}
                                                </Button>
                                              </div>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-zinc-500 hover:text-destructive"
                                                onClick={() =>
                                                  removeItem(activeSection.id, item.id)
                                                }
                                                aria-label="Delete lesson"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>

                                            {isLectureExpanded ? (
                                              <div className="space-y-4 border-t border-zinc-200 bg-zinc-50/50 p-4">
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                  <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-zinc-700">
                                                      Video URL
                                                    </label>
                                                    <input
                                                      type="url"
                                                      value={item.videoUrl}
                                                      onChange={(e) =>
                                                        updateLecture(activeSection.id, item.id, {
                                                          videoUrl: e.target.value,
                                                        })
                                                      }
                                                      placeholder="https://www.youtube.com/watch?v=…"
                                                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                                    />
                                                  </div>
                                                  <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-zinc-700">
                                                      Material URL
                                                    </label>
                                                    <div className="flex gap-2">
                                                      <div className="relative flex-1">
                                                        <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                                        <input
                                                          type="url"
                                                          value={item.materialUrl}
                                                          onChange={(e) =>
                                                            updateLecture(
                                                              activeSection.id,
                                                              item.id,
                                                              {
                                                                materialUrl: e.target.value,
                                                                materialFileName: undefined,
                                                                materialDataUrl: undefined,
                                                              }
                                                            )
                                                          }
                                                          placeholder="https://…"
                                                          className="h-10 w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                                        />
                                                      </div>
                                                      <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-10 rounded-xl border-zinc-200"
                                                        onClick={() =>
                                                          triggerMaterialUpload(item.id)
                                                        }
                                                      >
                                                        <UploadCloud className="h-4 w-4" />
                                                      </Button>
                                                    </div>
                                                    {item.materialFileName ? (
                                                      <p className="text-xs text-zinc-500">
                                                        Uploaded:{" "}
                                                        <span className="font-medium text-zinc-700">
                                                          {item.materialFileName}
                                                        </span>
                                                      </p>
                                                    ) : null}
                                                  </div>
                                                </div>
                                              </div>
                                            ) : null}
                                          </div>
                                        );
                                      }

                                      const isQuizExpanded = expandedQuizIds.has(item.id);
                                      return (
                                        <div
                                          key={item.id}
                                          onDragOver={(e) => {
                                            if (!draggingCurriculumItemId) return;
                                            e.preventDefault();
                                            setDragOverCurriculumItemId(item.id);
                                          }}
                                          onDragLeave={() => {
                                            setDragOverCurriculumItemId((prev) =>
                                              prev === item.id ? null : prev
                                            );
                                          }}
                                          onDrop={(e) => {
                                            if (!activeSection) return;
                                            e.preventDefault();
                                            const activeId =
                                              draggingCurriculumItemId ??
                                              e.dataTransfer.getData("text/plain");
                                            if (!activeId || activeId === item.id) return;
                                            reorderSectionItem(activeSection.id, activeId, item.id);
                                            setDraggingCurriculumItemId(null);
                                            setDragOverCurriculumItemId(null);
                                          }}
                                          className={cn(
                                            "overflow-hidden rounded-2xl border bg-white shadow-sm",
                                            dragOverCurriculumItemId === item.id &&
                                              draggingCurriculumItemId !== item.id
                                              ? "border-gold/40 ring-2 ring-gold/30"
                                              : "border-zinc-200"
                                          )}
                                        >
                                          <div className="flex items-center gap-3 p-4">
                                            <button
                                              type="button"
                                              draggable
                                              onDragStart={(e) => {
                                                e.dataTransfer.setData("text/plain", item.id);
                                                e.dataTransfer.effectAllowed = "move";
                                                setDraggingCurriculumItemId(item.id);
                                              }}
                                              onDragEnd={() => {
                                                setDraggingCurriculumItemId(null);
                                                setDragOverCurriculumItemId(null);
                                              }}
                                              className="cursor-grab rounded-md p-1 text-zinc-400 hover:text-zinc-700 active:cursor-grabbing"
                                              aria-label="Drag to reorder"
                                            >
                                              <GripVertical className="h-4 w-4" aria-hidden />
                                            </button>
                                            <FileQuestion
                                              className="h-4 w-4 shrink-0 text-zinc-500"
                                              aria-hidden
                                            />
                                            <input
                                              type="text"
                                              value={item.title}
                                              onChange={(e) =>
                                                updateQuiz(activeSection.id, item.id, {
                                                  title: e.target.value,
                                                })
                                              }
                                              className="min-w-0 flex-1 truncate rounded border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-zinc-900 outline-none focus:border-zinc-200 focus:bg-white"
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="text-zinc-600 hover:text-zinc-900"
                                              onClick={() => toggleQuizExpanded(item.id)}
                                            >
                                              {isQuizExpanded ? (
                                                <>
                                                  Close <ChevronUp className="ml-1 h-4 w-4" />
                                                </>
                                              ) : (
                                                <>
                                                  Edit <ChevronDown className="ml-1 h-4 w-4" />
                                                </>
                                              )}
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="h-9 w-9 text-zinc-500 hover:text-destructive"
                                              onClick={() => removeItem(activeSection.id, item.id)}
                                              aria-label="Delete quiz"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>

                                          {isQuizExpanded ? (
                                            <div className="space-y-4 border-t border-zinc-200 bg-zinc-50/50 p-4">
                                              <div className="flex flex-wrap items-center justify-between gap-3">
                                                <p className="text-sm text-zinc-600">
                                                  Current:{" "}
                                                  <span className="font-semibold text-zinc-900">
                                                    {item.title}
                                                  </span>
                                                </p>
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  size="sm"
                                                  className="rounded-xl border-zinc-200 text-zinc-600 hover:border-destructive/50 hover:text-destructive"
                                                  onClick={() => {
                                                    removeItem(activeSection.id, item.id);
                                                    toggleQuizExpanded(item.id);
                                                  }}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                  Remove quiz
                                                </Button>
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-700">
                                                  Select from ready-made quizzes
                                                </label>
                                                <div className="relative">
                                                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                                  <input
                                                    type="text"
                                                    value={quizEditSearch[item.id] ?? ""}
                                                    onChange={(e) =>
                                                      setQuizEditSearch((prev) => ({
                                                        ...prev,
                                                        [item.id]: e.target.value,
                                                      }))
                                                    }
                                                    placeholder="Search quizzes..."
                                                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                                  />
                                                </div>
                                                <div className="grid max-h-40 gap-1.5 overflow-y-auto">
                                                  {(quizEditSearch[item.id]
                                                    ? READY_MADE_QUIZZES.filter((q) =>
                                                        q
                                                          .toLowerCase()
                                                          .includes(
                                                            (
                                                              quizEditSearch[item.id] ?? ""
                                                            ).toLowerCase()
                                                          )
                                                      )
                                                    : READY_MADE_QUIZZES
                                                  ).map((title) => (
                                                    <button
                                                      key={title}
                                                      type="button"
                                                      onClick={() => {
                                                        updateQuiz(activeSection.id, item.id, {
                                                          title,
                                                        });
                                                        setQuizEditSearch((prev) => {
                                                          const next = { ...prev };
                                                          delete next[item.id];
                                                          return next;
                                                        });
                                                      }}
                                                      className={cn(
                                                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                                                        item.title === title
                                                          ? "border-gold bg-gold/10 text-zinc-900"
                                                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                                                      )}
                                                    >
                                                      <FileQuestion className="h-4 w-4 shrink-0 text-zinc-500" />
                                                      {title}
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          ) : null}
                                        </div>
                                      );
                                    })}
                                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 rounded-xl border-zinc-200"
                                        onClick={() => openAddLessonModal(activeSection.id)}
                                      >
                                        <Video className="h-4 w-4" />
                                        Add Lesson
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 rounded-xl border-zinc-200"
                                        onClick={() => openAddQuizModal(activeSection.id)}
                                      >
                                        <FileQuestion className="h-4 w-4" />
                                        Add Quiz
                                      </Button>
                                    </div>
                                  </div>
                                ) : builderTab === "lesson" ? (
                                  <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                                    <input
                                      ref={lessonThumbRef}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        setDraftLessonThumbName(f?.name ?? "");
                                        e.currentTarget.value = "";
                                      }}
                                    />

                                    <div className="grid gap-4 sm:grid-cols-2">
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                          Lesson title
                                        </label>
                                        <input
                                          type="text"
                                          value={draftLessonTitle}
                                          onChange={(e) => setDraftLessonTitle(e.target.value)}
                                          placeholder="e.g. Introduction to Healthcare Quality"
                                          className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                          Video URL (Vimeo/YouTube)
                                        </label>
                                        <input
                                          type="url"
                                          value={draftLessonVideoUrl}
                                          onChange={(e) => setDraftLessonVideoUrl(e.target.value)}
                                          placeholder="https://vimeo.com/…"
                                          className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                        />
                                      </div>
                                    </div>

                                    <div className="mt-4 space-y-1.5">
                                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Lesson description
                                      </label>
                                      <textarea
                                        value={draftLessonDescription}
                                        onChange={(e) => setDraftLessonDescription(e.target.value)}
                                        placeholder="Brief overview of what the student will learn..."
                                        rows={4}
                                        className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                      />
                                    </div>

                                    <div className="mt-5 space-y-2">
                                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Thumbnail image
                                      </p>
                                      <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => lessonThumbRef.current?.click()}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter" || e.key === " ")
                                            lessonThumbRef.current?.click();
                                        }}
                                        className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center"
                                      >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-zinc-700 shadow-sm">
                                          <UploadCloud className="h-5 w-5" />
                                        </div>
                                        <div className="text-sm font-semibold text-zinc-900">
                                          Click to upload lesson thumbnail
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                          Recommended: 1280x720px (JPG, PNG)
                                        </div>
                                        {draftLessonThumbName ? (
                                          <div className="text-xs text-zinc-600">
                                            Selected:{" "}
                                            <span className="font-medium text-zinc-800">
                                              {draftLessonThumbName}
                                            </span>
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>

                                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                        onClick={() => {
                                          setDraftLessonTitle("");
                                          setDraftLessonVideoUrl("");
                                          setDraftLessonDescription("");
                                          setDraftLessonThumbName("");
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        type="button"
                                        className="h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                                        onClick={() => {
                                          addLecture(activeSection.id, {
                                            title: draftLessonTitle,
                                            videoUrl: draftLessonVideoUrl,
                                          });
                                          setDraftLessonTitle("");
                                          setDraftLessonVideoUrl("");
                                          setDraftLessonDescription("");
                                          setDraftLessonThumbName("");
                                          setPreviewMode(true);
                                        }}
                                      >
                                        Save Lesson
                                      </Button>
                                    </div>
                                  </div>
                                ) : builderTab === "quiz" ? (
                                  <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Quiz title
                                      </label>
                                      <input
                                        type="text"
                                        value={draftQuizTitle}
                                        onChange={(e) => setDraftQuizTitle(e.target.value)}
                                        placeholder="e.g. Knowledge Check"
                                        className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                      />
                                    </div>

                                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                        onClick={() => setDraftQuizTitle("")}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        type="button"
                                        className="h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                                        onClick={() => {
                                          addQuiz(activeSection.id, { title: draftQuizTitle });
                                          setDraftQuizTitle("");
                                          setPreviewMode(true);
                                        }}
                                      >
                                        Save Quiz
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                          Select lesson
                                        </label>
                                        <select
                                          value={materialLectureId}
                                          onChange={(e) => setMaterialLectureId(e.target.value)}
                                          className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                        >
                                          <option value="" disabled>
                                            {activeLectures.length > 0
                                              ? "Choose a lesson…"
                                              : "No lessons yet"}
                                          </option>
                                          {activeLectures.map((l) => (
                                            <option key={l.id} value={l.id}>
                                              {l.title}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                          Material URL
                                        </label>
                                        <input
                                          type="url"
                                          value={materialUrlDraft}
                                          onChange={(e) => setMaterialUrlDraft(e.target.value)}
                                          placeholder="https://…"
                                          className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                        />
                                      </div>
                                    </div>

                                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 rounded-xl border-zinc-200"
                                        onClick={() => {
                                          if (!materialLectureId) return;
                                          triggerMaterialUpload(materialLectureId);
                                        }}
                                        disabled={!materialLectureId}
                                      >
                                        <UploadCloud className="h-4 w-4" />
                                        Upload File
                                      </Button>

                                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="h-10 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                          onClick={() => setMaterialUrlDraft("")}
                                          disabled={!materialLectureId}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          type="button"
                                          className="h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                                          onClick={() => {
                                            if (!materialLectureId) return;
                                            updateLecture(activeSection.id, materialLectureId, {
                                              materialUrl: materialUrlDraft,
                                              materialFileName: undefined,
                                              materialDataUrl: undefined,
                                            });
                                            setPreviewMode(true);
                                          }}
                                          disabled={!materialLectureId}
                                        >
                                          Save Material
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="hidden rounded-2xl border-zinc-200 bg-white shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Student review media</CardTitle>
                        <CardDescription>
                          Add image, video, or YouTube review items for the public course page
                          gallery.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0">
                        {reviewMediaItems.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
                            No review media added yet.
                          </div>
                        ) : null}

                        {reviewMediaItems.map((item, index) => (
                          <div
                            key={item.id}
                            className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-zinc-900">
                                  Media item {index + 1}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  Add a hosted image/video URL or a YouTube link.
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-500 hover:text-destructive"
                                onClick={() => removeReviewMediaItem(item.id)}
                                aria-label="Remove review media item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700">Type</label>
                                <select
                                  value={item.kind}
                                  onChange={(e) =>
                                    updateReviewMediaItem(item.id, {
                                      kind: e.target.value as ReviewMediaFormItem["kind"],
                                    })
                                  }
                                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                >
                                  <option value="youtube">YouTube</option>
                                  <option value="video">Video</option>
                                  <option value="image">Image</option>
                                </select>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700">
                                  Source URL
                                </label>
                                <input
                                  type="url"
                                  value={item.src}
                                  onChange={(e) =>
                                    updateReviewMediaItem(item.id, { src: e.target.value })
                                  }
                                  placeholder={
                                    item.kind === "youtube"
                                      ? "https://www.youtube.com/watch?v=..."
                                      : "https://example.com/media-file"
                                  }
                                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700">Caption</label>
                                <input
                                  type="text"
                                  value={item.caption}
                                  onChange={(e) =>
                                    updateReviewMediaItem(item.id, { caption: e.target.value })
                                  }
                                  placeholder="Optional caption"
                                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700">
                                  Poster URL
                                </label>
                                <input
                                  type="url"
                                  value={item.poster}
                                  onChange={(e) =>
                                    updateReviewMediaItem(item.id, { poster: e.target.value })
                                  }
                                  placeholder="Optional poster / thumbnail URL"
                                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-xl border-dashed border-zinc-300 py-5 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                          onClick={addReviewMediaItem}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Review Media
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="hidden text-xs text-zinc-500">
                      Step 2: Define your course structure and lessons.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl border-zinc-200"
                        onClick={() => setStep(1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        type="submit"
                        className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                      >
                        <Check className="h-4 w-4" />
                        {editId ? "Save changes" : "Create course"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </form>

            <Dialog
              open={addLessonOpen}
              onOpenChange={(open) => {
                if (!open) closeAddLessonModal();
                else setAddLessonOpen(true);
              }}
            >
              <DialogContent
                showClose={false}
                className="max-w-3xl overflow-hidden rounded-3xl border-zinc-200 p-0"
              >
                <div className="flex items-center justify-between gap-4 bg-gold px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/10 text-zinc-900">
                      <Video className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <DialogTitle className="text-base font-semibold text-zinc-900">
                        Add New Lesson
                      </DialogTitle>
                      <DialogDescription className="mt-0.5 truncate text-xs font-semibold uppercase tracking-wide text-zinc-900/70">
                        {addLessonModuleLabel}
                      </DialogDescription>
                    </div>
                  </div>
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="rounded-xl p-2 text-zinc-900/70 transition-colors hover:bg-black/10 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/20"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" aria-hidden />
                    </button>
                  </DialogClose>
                </div>

                <div className="bg-white px-6 py-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Lesson title
                      </label>
                      <input
                        type="text"
                        value={draftLessonTitle}
                        onChange={(e) => setDraftLessonTitle(e.target.value)}
                        placeholder="e.g. Introduction to Healthcare Quality"
                        className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Video URL (Vimeo/YouTube)
                      </label>
                      <input
                        type="url"
                        value={draftLessonVideoUrl}
                        onChange={(e) => setDraftLessonVideoUrl(e.target.value)}
                        placeholder="https://vimeo.com/…"
                        className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Lesson description
                      </label>
                      <textarea
                        value={draftLessonDescription}
                        onChange={(e) => setDraftLessonDescription(e.target.value)}
                        rows={4}
                        placeholder="Brief overview of what the student will learn…"
                        className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-10 rounded-xl"
                      onClick={closeAddLessonModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                      disabled={!canSaveLesson}
                      onClick={() => {
                        if (!addLessonSectionId) return;
                        const title = draftLessonTitle.trim();
                        if (!title) return;
                        addLecture(addLessonSectionId, {
                          title,
                          videoUrl: draftLessonVideoUrl.trim(),
                          description: draftLessonDescription.trim(),
                        });
                        closeAddLessonModal();
                      }}
                    >
                      Save Lesson
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={addQuizSectionId !== null}
              onOpenChange={(open) => {
                if (!open) closeAddQuizModal();
              }}
            >
              <DialogContent
                showClose={false}
                className="max-w-2xl overflow-hidden rounded-3xl border-zinc-200 p-0"
              >
                <div className="flex items-center justify-between gap-4 bg-gold px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/10 text-zinc-900">
                      <FileQuestion className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <DialogTitle className="text-base font-semibold text-zinc-900">
                        Add Quiz
                      </DialogTitle>
                      <DialogDescription className="mt-0.5 truncate text-xs font-semibold uppercase tracking-wide text-zinc-900/70">
                        {addQuizModuleLabel}
                      </DialogDescription>
                    </div>
                  </div>
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="rounded-xl p-2 text-zinc-900/70 transition-colors hover:bg-black/10 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/20"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" aria-hidden />
                    </button>
                  </DialogClose>
                </div>

                <div className="bg-white px-6 py-6">
                  <p className="mb-4 text-sm text-zinc-600">
                    Select a ready-made quiz to add to this module.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {READY_MADE_QUIZZES.map((title) => (
                      <button
                        key={title}
                        type="button"
                        onClick={() => {
                          if (!addQuizSectionId) return;
                          addQuiz(addQuizSectionId, { title });
                          closeAddQuizModal();
                          setPreviewMode(true);
                        }}
                        className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:border-gold/50 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-gold/30"
                      >
                        <FileQuestion className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                        {title}
                      </button>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Side panel */}
            <aside
              className={cn(
                "min-w-0 space-y-4 xl:sticky xl:top-24 xl:self-start",
                step === 2 ? "-mt-4 pt-0 md:-mt-6 xl:order-1" : "xl:order-2"
              )}
            >
              {step === 2 ? (
                <>
                  <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900">
                        Sections
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSectionTitle}
                          onChange={(e) => setNewSectionTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (!newSectionTitle.trim()) return;
                              addSection(newSectionTitle);
                              setNewSectionTitle("");
                            }
                          }}
                          placeholder="Section Title..."
                          className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                        />
                        <Button
                          type="button"
                          size="icon"
                          className="h-10 w-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                          onClick={() => {
                            if (!newSectionTitle.trim()) return;
                            addSection(newSectionTitle);
                            setNewSectionTitle("");
                          }}
                          aria-label="Add section"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {curriculumSections.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center">
                          <p className="text-sm font-semibold text-zinc-900">No sections yet</p>
                          <p className="mt-1 text-sm text-zinc-500">
                            Add your first section to start building the curriculum.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {curriculumSections.map((section, index) => {
                            const lessonsCount = section.items.filter(
                              (i) => i.type === "lecture"
                            ).length;
                            const quizzesCount = section.items.filter(
                              (i) => i.type === "quiz"
                            ).length;
                            const isActive = activeSection?.id === section.id;
                            const displayTitle = /^\s*module\s*\d+/i.test(section.title)
                              ? section.title
                              : `Module ${index + 1}: ${section.title}`;

                            return (
                              <button
                                key={section.id}
                                type="button"
                                onClick={() => toggleSectionExpanded(section.id)}
                                className={cn(
                                  "w-full rounded-2xl border p-4 text-left shadow-sm transition",
                                  isActive
                                    ? "border-gold/30 bg-gold/10"
                                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "flex h-10 w-10 items-center justify-center rounded-2xl",
                                      isActive ? "text-gold" : "text-zinc-400"
                                    )}
                                  >
                                    <GripVertical className="h-5 w-5" aria-hidden />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-base font-semibold text-zinc-900">
                                      {displayTitle}
                                    </p>
                                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                      {lessonsCount} {lessonsCount === 1 ? "Lesson" : "Lessons"} ·{" "}
                                      {quizzesCount} {quizzesCount === 1 ? "Quiz" : "Quizzes"}
                                    </p>
                                  </div>
                                  <ChevronRight
                                    className="h-4 w-4 shrink-0 text-zinc-400"
                                    aria-hidden
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Course Cover</CardTitle>
                      <CardDescription>
                        Upload an image or paste a URL. Recommended: 1200×630px.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void setCoverFromFile(f);
                          e.currentTarget.value = "";
                        }}
                      />

                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => fileRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const f = e.dataTransfer.files?.[0];
                          if (f) void setCoverFromFile(f);
                        }}
                        className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-center"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-zinc-700 shadow-sm">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-semibold text-zinc-900">Click to upload</div>
                        <div className="text-xs text-zinc-500">
                          or drag & drop (PNG/JPG/GIF, max 5MB)
                        </div>
                        {coverUploading ? (
                          <div className="text-xs text-amber-600">Uploading…</div>
                        ) : null}
                      </div>

                      {coverError ? <p className="text-sm text-destructive">{coverError}</p> : null}

                      <FormField name="imageUrl" label="Course Cover URL">
                        {({ id, error, ...rest }) => (
                          <FormInput
                            id={id}
                            error={error}
                            placeholder="https://example.com/course-cover.jpg"
                            className="rounded-xl border-zinc-200"
                            {...rest}
                          />
                        )}
                      </FormField>

                      <FormField name="videoPreviewUrl" label="Course Video Preview URL">
                        {({ id, error, ...rest }) => (
                          <FormInput
                            id={id}
                            error={error}
                            placeholder="https://www.youtube.com/watch?v=…"
                            className="rounded-xl border-zinc-200"
                            {...rest}
                          />
                        )}
                      </FormField>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Search className="h-4 w-4 text-emerald-600" />
                        SEO Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <FormField name="seoTitle" label="SEO Title">
                        {({ id, ...rest }) => {
                          const value = methods.watch("seoTitle") ?? "";
                          return (
                            <div className="space-y-1.5">
                              <FormInput
                                id={id}
                                placeholder="Enter SEO title (50-60 characters recommended)"
                                className="rounded-xl border-zinc-200 bg-zinc-50/50"
                                maxLength={60}
                                {...rest}
                              />
                              <p className="text-xs text-zinc-500">{value.length}/60 characters</p>
                            </div>
                          );
                        }}
                      </FormField>

                      <FormField name="seoDescription" label="SEO Description">
                        {({ id, ...rest }) => {
                          const value = methods.watch("seoDescription") ?? "";
                          return (
                            <div className="space-y-1.5">
                              <textarea
                                id={id}
                                placeholder="Enter SEO meta description (150-160 characters recommended)"
                                rows={4}
                                className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                maxLength={160}
                                {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                              />
                              <p className="text-xs text-zinc-500">{value.length}/160 characters</p>
                            </div>
                          );
                        }}
                      </FormField>

                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <FormField name="seoKeywords" label="SEO Keywords">
                            {({ id }) => {
                              const keywordsStr = methods.watch("seoKeywords") ?? "";
                              const keywords = keywordsStr
                                ? keywordsStr
                                    .split(",")
                                    .map((k) => k.trim())
                                    .filter(Boolean)
                                : [];
                              const addKeyword = () => {
                                const trimmed = seoKeywordInput.trim();
                                if (trimmed) {
                                  const next = keywords.includes(trimmed)
                                    ? keywords
                                    : [...keywords, trimmed];
                                  methods.setValue("seoKeywords", next.join(", "), {
                                    shouldDirty: true,
                                  });
                                  setSeoKeywordInput("");
                                }
                              };
                              return (
                                <>
                                  <input
                                    id={id}
                                    type="text"
                                    value={seoKeywordInput}
                                    onChange={(e) => setSeoKeywordInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addKeyword();
                                      }
                                    }}
                                    placeholder="Enter a keyword"
                                    className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 shrink-0 rounded-xl border-zinc-200"
                                    onClick={addKeyword}
                                    aria-label="Add keyword"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </>
                              );
                            }}
                          </FormField>
                        </div>
                        {methods.watch("seoKeywords") && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(methods.watch("seoKeywords") ?? "")
                              .split(",")
                              .map((k) => k.trim())
                              .filter(Boolean)
                              .map((keyword) => (
                                <span
                                  key={keyword}
                                  className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700"
                                >
                                  {keyword}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = (methods.getValues("seoKeywords") ?? "")
                                        .split(",")
                                        .map((k) => k.trim())
                                        .filter(Boolean);
                                      methods.setValue(
                                        "seoKeywords",
                                        current.filter((k) => k !== keyword).join(", "),
                                        { shouldDirty: true }
                                      );
                                    }}
                                    className="rounded p-0.5 hover:bg-zinc-200"
                                    aria-label={`Remove ${keyword}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </aside>
          </div>
        )}
      </div>
    </FormProvider>
  );
}
