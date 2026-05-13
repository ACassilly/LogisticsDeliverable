import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { odooCreate } from '@/lib/odoo-client';

// Validation schema for newsletter signup
const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validation = newsletterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Create mailing contact in Odoo
    const contactId = await odooCreate('mailing.contact', {
      email,
      name: email, // Use email as name if no name provided
      opt_out: false, // Explicit opt-in
      // You might want to associate with a specific mailing list
      // list_ids: [[6, 0, [mailing_list_id]]], // Uncomment and set mailing list ID if needed
    });

    return NextResponse.json({
      ok: true,
      message: 'Newsletter signup successful'
    });

  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process newsletter signup' },
      { status: 500 }
    );
  }
}

// Return 405 for other methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}