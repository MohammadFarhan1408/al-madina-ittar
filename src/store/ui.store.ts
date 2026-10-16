/**
 * Transient UI state — toast queue. Exposes an imperative `toast` API so any module
 * (not just components) can trigger feedback.
 */
import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

/** Optional inline action rendered at the trailing edge of a toast (e.g. "View bag"). */
export type ToastAction = { label: string; onPress: () => void };

export type ToastConfig = {
  id: string;
  message: string;
  title?: string;
  variant: ToastVariant;
  duration: number;
  action?: ToastAction;
};

type ToastInput = {
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
};

type UIState = {
  toasts: ToastConfig[];
  showToast: (input: ToastInput) => string;
  dismissToast: (id: string) => void;
};

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  showToast: ({ message, title, variant = 'info', duration, action }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      // Actionable toasts linger a little longer so there is time to tap them.
      toasts: [
        ...state.toasts,
        { id, message, title, variant, duration: duration ?? (action ? 4200 : 2800), action },
      ],
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
