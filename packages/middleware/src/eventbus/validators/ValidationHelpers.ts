/**
 * Helper functions for validating event data.
 *
 * @since event-bus-start--JP
 */
export const ValidationHelpers = {
  isObject: (x: unknown): x is Record<string, unknown> => {
    return x !== null && typeof x === 'object' && !Array.isArray(x);
  },
  hasObject: (obj: Record<string, unknown>, key: string): boolean => {
    return obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key]);
  },
  hasArray: (obj: Record<string, unknown>, key: string): boolean => {
    return Array.isArray(obj[key]);
  },
  hasString: (obj: Record<string, unknown>, key: string): boolean => {
    return typeof obj[key] === 'string';
  },
  hasNumber: (obj: Record<string, unknown>, key: string): boolean => {
    return typeof obj[key] === 'number';
  },
  hasBoolean: (obj: Record<string, unknown>, key: string): boolean => {
    return typeof obj[key] === 'boolean';
  },
  /** Accepts a Date instance or a valid ISO 8601 date string (e.g. from JSON). */
  hasDate: (obj: Record<string, unknown>, key: string): boolean => {
    const value = obj[key];

    if (value instanceof Date) return !isNaN(value.getTime());

    if (typeof value !== 'string') return false;

    const parsedValue = Date.parse(value);
    return !isNaN(parsedValue);
  },
  hasEmail: (obj: Record<string, unknown>, key: string): boolean => {
    return typeof obj[key] === 'string' && obj[key].includes('@');
  },
  hasPhone: (obj: Record<string, unknown>, key: string): boolean => {
    return typeof obj[key] === 'string' && obj[key].match(/^\d{10}$/) !== null;
  },
  /** eNum: TypeScript enum object (e.g. OrderStatusEnum). Checks obj[key] is one of the enum values. */
  hasEnum: (obj: Record<string, unknown>, key: string, eNum: Record<string, string | number>): boolean => {
    const values = Object.values(eNum);
    return values.includes(obj[key] as string | number);
  },
} as const;
