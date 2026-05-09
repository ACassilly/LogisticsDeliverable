import { NextRequest } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation result interface
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    errors: Array<{
      field: string;
      message: string;
    }>;
  };
}

/**
 * Format Zod validation errors into a readable format
 * 
 * @param error - Zod validation error
 * @returns Formatted error object
 */
function formatZodError(error: ZodError) {
  if (!error || !error.issues || !Array.isArray(error.issues)) {
    return {
      message: 'Validation failed',
      errors: [{ field: 'unknown', message: 'Validation error occurred' }],
    };
  }

  const errors = error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return {
    message: 'Validation failed',
    errors,
  };
}

/**
 * Validate request body against a Zod schema
 * 
 * Usage:
 * ```typescript
 * const validation = await validateRequest(request, createBlogSchema);
 * if (!validation.success) {
 *   return NextResponse.json(validation.error, { status: 400 });
 * }
 * // Use validation.data (fully typed)
 * ```
 * 
 * @param request - Next.js request object
 * @param schema - Zod validation schema
 * @returns Validation result with parsed data or errors
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: formatZodError(error),
      };
    }

    // Handle JSON parsing errors
    return {
      success: false,
      error: {
        message: 'Invalid JSON in request body',
        errors: [{ field: 'body', message: 'Request body must be valid JSON' }],
      },
    };
  }
}

/**
 * Validate request query parameters against a Zod schema
 * 
 * Usage:
 * ```typescript
 * const validation = validateQueryParams(request, blogFiltersSchema);
 * if (!validation.success) {
 *   return NextResponse.json(validation.error, { status: 400 });
 * }
 * ```
 * 
 * @param request - Next.js request object
 * @param schema - Zod validation schema
 * @returns Validation result with parsed data or errors
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): ValidationResult<T> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryObject: Record<string, string> = {};

    // Convert URLSearchParams to plain object
    searchParams.forEach((value, key) => {
      queryObject[key] = value;
    });

    const data = schema.parse(queryObject);

    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: formatZodError(error),
      };
    }

    return {
      success: false,
      error: {
        message: 'Invalid query parameters',
        errors: [{ field: 'query', message: 'Query parameters validation failed' }],
      },
    };
  }
}

/**
 * Validate plain data object against a Zod schema
 * Useful for validating data that's already parsed
 * 
 * @param data - Data to validate
 * @param schema - Zod validation schema
 * @returns Validation result with parsed data or errors
 */
export function validateData<T>(
  data: unknown,
  schema: ZodSchema<T>
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: formatZodError(error),
      };
    }

    return {
      success: false,
      error: {
        message: 'Data validation failed',
        errors: [{ field: 'data', message: 'Invalid data format' }],
      },
    };
  }
}

