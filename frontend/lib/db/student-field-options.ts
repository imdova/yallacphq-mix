const defaultOptions = {
  countries: ["Egypt", "Saudi Arabia", "UAE", "Jordan"] as string[],
  specialities: ["Quality Management", "Patient Safety", "Compliance", "Healthcare"] as string[],
  categories: ["Exam Prep", "Quality Management", "Patient Safety", "Free Resource", "Data Analysis", "Compliance"] as string[],
};

const store = { ...defaultOptions };

export function getStudentFieldOptions(): { countries: string[]; specialities: string[]; categories: string[] } {
  return {
    countries: [...store.countries],
    specialities: [...store.specialities],
    categories: [...store.categories],
  };
}

export function updateStudentFieldOptions(update: {
  countries?: string[];
  specialities?: string[];
  categories?: string[];
}): { countries: string[]; specialities: string[]; categories: string[] } {
  if (update.countries !== undefined) {
    store.countries = update.countries.filter((s) => typeof s === "string" && s.trim() !== "");
  }
  if (update.specialities !== undefined) {
    store.specialities = update.specialities.filter((s) => typeof s === "string" && s.trim() !== "");
  }
  if (update.categories !== undefined) {
    store.categories = update.categories.filter((s) => typeof s === "string" && s.trim() !== "");
  }
  return getStudentFieldOptions();
}
