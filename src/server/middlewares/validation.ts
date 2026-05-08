import { NextRequest } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: { message: string; errors: Array<{ field: string; message: string }> };
}

function formatZodError(error: ZodError) {
  if (!error || !error.issues || !Array.isArray(error.issues)) {
    return { message: 'Validation failed', errors: [{ field: 'unknown', message: 'Validation error occurred' }] };
  }
  return { message: 'Validation failed', errors: error.issues.map((err) => ({ field: err.path.join('.'), message: err.message })) };
}

export async function validateRequest<T>(request: NextRequest, schema: ZodSchema<T>): Promise<ValidationResult<T>> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) return { success: false, error: formatZodError(error) };
    return { success: false, error: { message: 'Invalid JSON in request body', errors: [{ field: 'body', message: 'Request body must be valid JSON' }] } };
  }
}

export function validateQueryParams<T>(request: NextRequest, schema: ZodSchema<T>): ValidationResult<T> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryObject: Record<string, string> = {};
    searchParams.forEach((value, key) => { queryObject[key] = value; });
    const data = schema.parse(queryObject);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) return { success: false, error: formatZodError(error) };
    return { success: false, error: { message: 'Invalid query parameters', errors: [{ field: 'query', message: 'Query parameters validation failed' }] } };
  }
}

export function validateData<T>(data: unknown, schema: ZodSchema<T>): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) return { success: false, error: formatZodError(error) };
    return { success: false, error: { message: 'Data validation failed', errors: [{ field: 'data', message: 'Invalid data format' }] } };
  }
}
