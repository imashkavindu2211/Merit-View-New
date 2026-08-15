import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// DELETE /api/students/[id] — Admin: delete a specific student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('x-admin-token');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!authHeader || authHeader !== adminSecret) {
    return NextResponse.json({ error: 'අනවසර ප්‍රවේශය.' }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ශිෂ්‍ය හැඳුනුම්පත අවශ්‍ය වේ.' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'ශිෂ්‍ය සාර්ථකව මකා දමන ලදී.' });
  } catch (error) {
    console.error('DELETE /api/students/[id] error:', error);
    return NextResponse.json(
      { error: 'මකා දැමීමේ දෝෂයක් ඇතිවිය.' },
      { status: 500 }
    );
  }
}
