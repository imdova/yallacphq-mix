export interface ModalState {
  formModalOpen: boolean;
  openFormModal: () => void;
  closeFormModal: () => void;
  toggleFormModal: () => void;
}

export const createModalSlice = (
  set: (fn: (state: ModalState) => Partial<ModalState>) => void
): ModalState => ({
  formModalOpen: false,
  openFormModal: () => set(() => ({ formModalOpen: true })),
  closeFormModal: () => set(() => ({ formModalOpen: false })),
  toggleFormModal: () => set((s) => ({ formModalOpen: !s.formModalOpen })),
});
