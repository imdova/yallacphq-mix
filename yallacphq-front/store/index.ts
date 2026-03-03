import { create } from "zustand";
import { createUiSlice, type UiState } from "./slices/ui-slice";
import { createModalSlice, type ModalState } from "./slices/modal-slice";

/**
 * Zustand store using slice pattern.
 * Each slice is independent; select only what you need to avoid re-renders.
 *
 * Usage:
 *   const collapsed = useStore((s) => s.sidebarCollapsed);
 *   const toggleSidebar = useStore((s) => s.toggleSidebar);
 */

export type AppState = UiState & ModalState;

export const useStore = create<AppState>((set) => ({
  ...createUiSlice(set as (fn: (s: UiState) => Partial<UiState>) => void),
  ...createModalSlice(set as (fn: (s: ModalState) => Partial<ModalState>) => void),
}));
