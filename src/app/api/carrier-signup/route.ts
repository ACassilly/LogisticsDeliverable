import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { odooCreate } from '@/lib/odoo-client';

// Validation schema for carrier signup
const carrierSignupSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  mcNumber: z.string().min(1, 'MC number is required').max(20),
  dotNumber: z.string().min(1, 'DOT number is required').max(20),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').max(15),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validation = carrierSignupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { companyName, mcNumber, dotNumber, contactName, email, phone } = validation.data;

    // Create carrier record in Odoo
    const partnerId = await odooCreate('res.partner', {
      name: companyName,
      email,
      phone,
      is_company: true,
      // Add carrier-specific fields
      x_mc_number: mcNumber,
      x_dot_number: dotNumber,
      x_contact_name: contactName,
      // Set as carrier/supplier
      supplier_rank: 1,
      // Add to carrier category or tag if needed
      category_id: [], // You might want to set specific categories
    });

    return NextResponse.json({
      ok: true,
      id: partnerId,
      message: 'Carrier signup successful'
    });

  } catch (error) {
    console.error('Carrier signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process carrier signup' },
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