import { NextRequest, NextResponse } from 'next/server';
import { validateRequest, handleApiError } from '@/server/middlewares';
import { contactApiSchema } from '@/server/validations/contact.validation';
import { createCrmLead } from '@/server/services/odoo.service';
import { rateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/server/utils/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(`contact:${clientIp}`, RATE_LIMIT_PRESETS.STRICT);
    if (!rateLimitResult.allowed) return NextResponse.json({ success: false, error: 'Too many requests. Please wait before submitting again.', message: 'Rate limit exceeded' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)) } });
    const validation = await validateRequest(request, contactApiSchema);
    if (!validation.success) return NextResponse.json(validation.error, { status: 400 });
    const data = validation.data!;
    const descriptionParts: string[] = [`Contact Preference: ${data.contactPreference === 'phone' ? 'Phone' : 'Email'}`, '', `Location: ${data.city}, ${data.state} ${data.zipCode}, ${data.country}`, '', 'Services of Interest:', ...data.services.map((s: string) => `  • ${s}`)];
    if (data.comments) descriptionParts.push('', 'Additional Comments:', data.comments);
    descriptionParts.push('', `Submitted: ${new Date().toISOString()}`);
    const phone = data.ext ? `${data.phoneNumber} ext ${data.ext}` : data.phoneNumber;
    const leadId = await createCrmLead({ contactName: `${data.firstName} ${data.lastName}`, email: data.businessEmail, phone, companyName: data.companyName, city: data.city, zip: data.zipCode, description: descriptionParts.join('\n') });
    if (!leadId) return NextResponse.json({ success: false, error: 'Failed to submit your inquiry. Please try again later.', message: 'Lead creation failed' }, { status: 502 });
    return NextResponse.json({ success: true, data: { leadId }, message: 'Your inquiry has been submitted successfully. Our team will be in touch shortly.' }, { status: 201 });
  } catch (error) { return handleApiError(error) }
}
