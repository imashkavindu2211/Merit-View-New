import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/students/admin — Admin: get ALL students with full data
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-token');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!authHeader || authHeader !== adminSecret) {
    return NextResponse.json({ error: 'අනවසර ප්‍රවේශය.' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('students')
      .select('*')
      .order('iq_marks', { ascending: false });

    if (error) throw error;

    const ranked = (data || []).map((student, index) => ({
      ...student,
      rank: index + 1,
    }));

    return NextResponse.json({ students: ranked });
  } catch (error) {
    console.error('GET /api/students/admin error:', error);
    return NextResponse.json(
      { error: 'ශිෂ්‍ය දත්ත ලබා ගැනීමේ දෝෂයක් ඇතිවිය.' },
      { status: 500 }
    );
  }
}
