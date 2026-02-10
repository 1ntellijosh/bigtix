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
  hasDate: (obj: Record<string, unknown>, key: string): boolean => {
    return obj[key] instanceof Date;
  },
  hasEmail: (obj: Record<string, unknown>, key: string): boolean => {
    return typeof obj[key] === 'string' && obj[key].includes('@');
  },
  hasPhone: (obj: Record<string, unknown>, key: string): boolean => {
    return typeof obj[key] === 'string' && obj[key].match(/^\d{10}$/) !== null;
  },
  hasEnum: (obj: Record<string, unknown>, key: string, eNum: any): boolean => {
    return eNum.includes(obj[key]);
  },
} as const;
