import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This function lets us do: cn("text-red-500", isError && "font-bold")
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}