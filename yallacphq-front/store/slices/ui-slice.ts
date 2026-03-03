export interface UiState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark" | "system";
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const createUiSlice = (set: (fn: (state: UiState) => Partial<UiState>) => void): UiState => ({
  sidebarCollapsed: false,
  theme: "system",
  setSidebarCollapsed: (collapsed) => set(() => ({ sidebarCollapsed: collapsed })),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setTheme: (theme) => set(() => ({ theme })),
});
