import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const toDateKey = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const parseDateKey = (dateKey: string): Date => {
  const [yearText, monthText, dayText] = dateKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  return new Date(year, month - 1, day);
};

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const getLastDateKeys = (days: number, endDate = new Date()): string[] =>
  Array.from({ length: days }, (_, index) => {
    const offset = index - days + 1;
    return toDateKey(addDays(endDate, offset));
  });

export const formatDisplayDate = (dateKey: string): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(parseDateKey(dateKey));

export const getMoodBandIndex = (score: number): number => {
  if (score <= 2) {
    return 0;
  }
  if (score <= 4) {
    return 1;
  }
  if (score <= 6) {
    return 2;
  }
  if (score <= 8) {
    return 3;
  }
  return 4;
};
