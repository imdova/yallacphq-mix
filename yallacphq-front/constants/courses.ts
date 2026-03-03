export const COURSE_CATEGORIES = [
  { id: "all", label: "All Resources" },
  { id: "exam-prep", label: "Exam Prep" },
  { id: "quality-management", label: "Quality Management" },
  { id: "patient-safety", label: "Patient Safety" },
  { id: "free", label: "Free Resources" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "duration-asc", label: "Duration: Short first" },
  { value: "duration-desc", label: "Duration: Long first" },
] as const;

export const TAG_STYLES: Record<string, string> = {
  "Exam Prep": "bg-gold text-gold-foreground",
  "Quality Management": "bg-blue-800 text-white",
  "Free Resource": "bg-emerald-600 text-white",
  Advanced: "bg-sky-500 text-white",
  "Data Analysis": "bg-amber-500 text-white",
  Compliance: "bg-red-600 text-white",
  "Patient Safety": "bg-violet-600 text-white",
};
