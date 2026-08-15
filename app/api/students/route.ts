import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/students — Submit student marks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, nic, iq_marks } = body;

    // Validation
    if (!name || !phone || !nic || iq_marks === undefined || iq_marks === null) {
      return NextResponse.json(
        { error: 'සියලුම ක්ෂේත්‍ර පිරවිය යුතුය.' },
        { status: 400 }
      );
    }

    if (typeof iq_marks !== 'number' || iq_marks < 0 || iq_marks > 200) {
      return NextResponse.json(
        { error: 'IQ ලකුණු 0 සහ 200 අතර විය යුතුය.' },
        { status: 400 }
      );
    }

    const nameStr = String(name).trim();
    const phoneStr = String(phone).trim();
    const nicStr = String(nic).trim().toUpperCase();

    if (nameStr.length < 2) {
      return NextResponse.json(
        { error: 'නම අවම වශයෙන් අකුරු 2ක් විය යුතුය.' },
        { status: 400 }
      );
    }

    // Check for duplicate NIC
    const { data: existing } = await supabase
      .from('students')
      .select('id')
      .eq('nic', nicStr)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'මෙම ජා.හැ. අංකය දැනටමත් ලියාපදිංචි කර ඇත.' },
        { status: 409 }
      );
    }

    // Insert new student
    const { data, error } = await supabase
      .from('students')
      .insert([{ name: nameStr, phone: phoneStr, nic: nicStr, iq_marks }])
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation (race condition)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'මෙම ජා.හැ. අංකය දැනටමත් ලියාපදිංචි කර ඇත.' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { message: 'ලකුණු සාර්ථකව ඇතුළත් කරන ලදී!', student: data },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/students error:', error);
    return NextResponse.json(
      { error: 'සර්වර් දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.' },
      { status: 500 }
    );
  }
}

// GET /api/students — Get all students ranked by IQ marks
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, name, iq_marks, created_at')
      .order('iq_marks', { ascending: false });

    if (error) throw error;

    // Compute ranks
    const ranked = (data || []).map((student, index) => ({
      ...student,
      rank: index + 1,
    }));

    return NextResponse.json({ students: ranked });
  } catch (error) {
    console.error('GET /api/students error:', error);
    return NextResponse.json(
      { error: 'ශිෂ්‍යයන් ලබා ගැනීමේ දෝෂයක් ඇතිවිය.' },
      { status: 500 }
    );
  }
}

// DELETE /api/students — Admin: delete all students (with auth check)
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-token');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!authHeader || authHeader !== adminSecret) {
    return NextResponse.json({ error: 'අනවසර ප්‍රවේශය.' }, { status: 401 });
  }

  try {
    const { error } = await supabaseAdmin.from('students').delete().neq('id', '');

    if (error) throw error;

    return NextResponse.json({ message: 'සියලු ශිෂ්‍ය දත්ත මකා දමන ලදී.' });
  } catch (error) {
    console.error('DELETE /api/students error:', error);
    return NextResponse.json({ error: 'මකා දැමීමේ දෝෂයක් ඇතිවිය.' }, { status: 500 });
  }
}
