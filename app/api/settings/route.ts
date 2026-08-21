import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Validate admin token from header
function isAdmin(request: NextRequest): boolean {
  const token = request.headers.get('x-admin-token');
  return token === process.env.ADMIN_SECRET;
}

// GET /api/settings — Public: returns all feature flags
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('key, value');

    if (error) throw error;

    // Convert array to object: { marks_entry_enabled: true, results_viewing_enabled: true }
    const settings: Record<string, boolean> = {};
    for (const row of data || []) {
      settings[row.key] = row.value === 'true';
    }

    // Defaults if table is empty / rows missing
    if (!('marks_entry_enabled' in settings)) settings.marks_entry_enabled = true;
    if (!('results_viewing_enabled' in settings)) settings.results_viewing_enabled = true;

    return NextResponse.json({ settings }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    // Fail open — return defaults so site still works if DB has issues
    return NextResponse.json({
      settings: {
        marks_entry_enabled: true,
        results_viewing_enabled: true,
      },
    });
  }
}

// PUT /api/settings — Admin only: toggle a feature flag
export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'අනවසර ප්‍රවේශය.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    const allowedKeys = ['marks_entry_enabled', 'results_viewing_enabled'];
    if (!allowedKeys.includes(key) || typeof value !== 'boolean') {
      return NextResponse.json({ error: 'Invalid setting.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('app_settings')
      .upsert({ key, value: String(value), updated_at: new Date().toISOString() }, {
        onConflict: 'key',
      });

    if (error) throw error;

    return NextResponse.json({
      message: `Setting '${key}' updated to ${value}.`,
      settings: { [key]: value },
    });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json(
      { error: 'සැකසුම් යාවත්කාලීන කිරීමේ දෝෂයක් ඇතිවිය.' },
      { status: 500 }
    );
  }
}
