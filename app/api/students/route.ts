import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isValidProvince, isValidDistrict } from '@/lib/srilanka-regions';

// POST /api/students — Submit student marks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, nic, iq_marks, province, district } = body;

    // Validation
    if (!name || !phone || !nic || iq_marks === undefined || iq_marks === null) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (typeof iq_marks !== 'number' || iq_marks < 0 || iq_marks > 100) {
      return NextResponse.json(
        { error: 'IQ marks must be between 0 and 100.' },
        { status: 400 }
      );
    }

    if (!province || !isValidProvince(province)) {
      return NextResponse.json(
        { error: 'Please select a valid province.' },
        { status: 400 }
      );
    }

    if (!district || !isValidDistrict(province, district)) {
      return NextResponse.json(
        { error: 'Please select a valid district for the selected province.' },
        { status: 400 }
      );
    }

    const nameStr = String(name).trim();
    const phoneStr = String(phone).trim();
    const nicStr = String(nic).trim().toUpperCase();

    if (nameStr.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters.' },
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
        { error: 'This NIC number is already registered.' },
        { status: 409 }
      );
    }

    // Insert new student
    const { data, error } = await supabase
      .from('students')
      .insert([{ name: nameStr, phone: phoneStr, nic: nicStr, iq_marks, province, district }])
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation (race condition)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This NIC number is already registered.' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { message: 'Marks submitted successfully!', student: data },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/students error:', error);
    return NextResponse.json(
      { error: 'A server error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/students — Get all students ranked by IQ marks (with optional province/district filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province') || '';
    const district = searchParams.get('district') || '';

    let query = supabase
      .from('students')
      .select('id, name, province, district, iq_marks, created_at')
      .order('iq_marks', { ascending: false });

    if (province) query = query.eq('province', province);
    if (district) query = query.eq('district', district);

    const { data, error } = await query;

    if (error) throw error;

    // Compute ranks within the filtered set
    const ranked = (data || []).map((student, index) => ({
      ...student,
      rank: index + 1,
    }));

    return NextResponse.json({ students: ranked });
  } catch (error) {
    console.error('GET /api/students error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students.' },
      { status: 500 }
    );
  }
}

// DELETE /api/students — Admin: delete all students (with auth check)
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-token');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!authHeader || authHeader !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { error } = await supabaseAdmin.from('students').delete().neq('id', '');

    if (error) throw error;

    return NextResponse.json({ message: 'All student records deleted.' });
  } catch (error) {
    console.error('DELETE /api/students error:', error);
    return NextResponse.json({ error: 'Failed to delete records.' }, { status: 500 });
  }
}
