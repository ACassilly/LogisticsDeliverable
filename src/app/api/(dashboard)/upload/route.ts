import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleApiError } from '@/server/middlewares';
import { validateUploadedFile } from '@/server/validations';
import { uploadImage } from '@/server/services';

export async function POST(request: NextRequest) {
  try {
    const user = await withAuth(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized', message: 'Authentication required' }, { status: 401 });
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const validation = validateUploadedFile(file);
    if (!validation.success) return NextResponse.json({ success: false, error: 'Validation Error', message: validation.error }, { status: 400 });
    const result = await uploadImage(file!);
    return NextResponse.json({ success: true, data: result, message: 'Image uploaded successfully' });
  } catch (error) { return handleApiError(error) }
}
