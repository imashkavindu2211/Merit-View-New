import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/login — Admin authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminPassword || !adminSecret) {
      return NextResponse.json(
        { error: 'Admin credentials not configured.' },
        { status: 500 }
      );
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        { error: 'වැරදි පරිශීලක නාමය හෝ මුරපදය.' },
        { status: 401 }
      );
    }

    // Return the admin token (used as X-Admin-Token header)
    const response = NextResponse.json({
      message: 'ශාසනය සාර්ථකයි!',
      token: adminSecret,
    });

    // Set a secure HTTP-only cookie
    response.cookies.set('admin_token', adminSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('POST /api/admin/login error:', error);
    return NextResponse.json(
      { error: 'සර්වර් දෝෂයක් ඇතිවිය.' },
      { status: 500 }
    );
  }
}

// POST /api/admin/logout
export async function DELETE() {
  const response = NextResponse.json({ message: 'පිටවීම සාර්ථකයි.' });
  response.cookies.delete('admin_token');
  return response;
}
