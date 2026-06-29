/**
 * Transient UI state — toast queue. Exposes an imperative `toast` API so any module
 * (not just components) can trigger feedback.
 */
import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export type ToastConfig = {
  id: string;
  message: string;
  title?: string;
  variant: ToastVariant;
  duration: number;
};

type ToastInput = {
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
};

type UIState = {
  toasts: ToastConfig[];
  showToast: (input: ToastInput) => string;
  dismissToast: (id: string) => void;
};

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  showToast: ({ message, title, variant = 'info', duration = 2800 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, title, variant, duration }],
    }));
    return id;
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Imperative toast helpers usable outside React. */
export const toast = {
  show: (input: ToastInput) => useUIStore.getState().showToast(input),
  success: (message: string, title?: string) =>
    useUIStore.getState().showToast({ message, title, variant: 'success' }),
  error: (message: string, title?: string) =>
    useUIStore.getState().showToast({ message, title, variant: 'error' }),
  info: (message: string, title?: string) =>
    useUIStore.getState().showToast({ message, title, variant: 'info' }),
  warning: (message: string, title?: string) =>
    useUIStore.getState().showToast({ message, title, variant: 'warning' }),
};
