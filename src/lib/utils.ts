import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function generateWorkspaceFileUrl(fileId: string): string {
  return `/api/workspaces/file/${fileId}`;
}

export function generateInviteCode(length: number) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export function suppressWarnings() {
  if (process.env.NODE_ENV === 'development') {
    const originalWarn = console.warn;
    console.warn = function (...args) {
      if (
        args[0]?.includes?.('React DevTools') ||
        args[0]?.includes?.('Image with src') ||
        args[0]?.includes?.('params should be awaited')
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };
  }
}