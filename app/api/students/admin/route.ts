import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/students/admin — Admin: get ALL students with full data (with optional province/district filter)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-token');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!authHeader || authHeader !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province') || '';
    const district = searchParams.get('district') || '';

    let query = supabaseAdmin
      .from('students')
      .select('*')
      .order('iq_marks', { ascending: false });

    if (province) query = query.eq('province', province);
    if (district) query = query.eq('district', district);

    const { data, error } = await query;

    if (error) throw error;

    const ranked = (data || []).map((student, index) => ({
      ...student,
      rank: index + 1,
    }));

    return NextResponse.json({ students: ranked });
  } catch (error) {
    console.error('GET /api/students/admin error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student data.' },
      { status: 500 }
    );
  }
}
