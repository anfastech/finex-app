import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateWorkspaceFileUrl(fileId: string): string {
  return `/api/workspaces/file/${fileId}`;
}
