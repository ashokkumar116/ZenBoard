import { createContext, useContext } from "react";

export const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('[Zenboard] useToast must be used inside <ToastProvider>')
  return ctx
}