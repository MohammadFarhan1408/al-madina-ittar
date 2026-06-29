/**
 * Minimal React Hook Form resolver for Zod (avoids the extra @hookform/resolvers dep).
 * Maps Zod issues to RHF's flat FieldErrors shape — sufficient for our flat forms.
 */
import type { FieldErrors, FieldValues, Resolver, ResolverResult } from 'react-hook-form';
import type { ZodType } from 'zod';

export function zodResolver<T extends FieldValues>(schema: ZodType<T>): Resolver<T> {
  return async (values): Promise<ResolverResult<T>> => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.');
      if (key && !errors[key]) {
        errors[key] = { type: String(issue.code), message: issue.message };
      }
    }
    return { values: {}, errors: errors as FieldErrors<T> };
  };
}
