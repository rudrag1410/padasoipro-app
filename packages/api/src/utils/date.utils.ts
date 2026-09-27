export const addSeconds = (date: Date, seconds: number): Date => new Date(date.getTime() + seconds * 1000);

export const secondsBetween = (from: Date, to: Date): number => Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 1000));

export const toIso = (date: Date): string => date.toISOString();

export const fromIso = (value: string): Date => new Date(value);

export const fromIsoOrNull = (value: string | null | undefined): Date | null => (value ? new Date(value) : null);
