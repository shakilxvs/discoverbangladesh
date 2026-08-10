import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { MASTER_ADMIN_EMAIL } from '@/lib/roles';

// This is the enforcement layer for User Management — the /admin/users
// page is only reachable in the UI for the Master Admin, but that alone
// is not security. Every request here independently re-verifies the
// caller's Firebase ID token and their email before doing anything.
async function requireMasterAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return decoded.email === MASTER_ADMIN_EMAIL ? decoded : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const caller = await requireMasterAdmin(req);
  if (!caller) {
    return NextResponse.json({ error: 'Only the Master Admin can do this.' }, { status: 403 });
  }

  let body: { name?: string; email?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name = body.name?.trim() ?? '';
  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password ?? '';
  const role = body.role;

  if (!name || !email || password.length < 6) {
    return NextResponse.json(
      { error: 'Name, email, and a password of at least 6 characters are required.' },
      { status: 400 }
    );
  }
  if (role !== 'admin' && role !== 'moderator') {
    return NextResponse.json({ error: 'Role must be "admin" or "moderator".' }, { status: 400 });
  }
  // The Master Admin cannot be created, replaced, or duplicated from here.
  if (email === MASTER_ADMIN_EMAIL) {
    return NextResponse.json(
      { error: 'That email is reserved for the Master Admin account.' },
      { status: 400 }
    );
  }

  try {
    const userRecord = await adminAuth().createUser({ email, password, displayName: name });
    await adminDb().collection('users').doc(userRecord.uid).set({
      name,
      email,
      role,
      status: 'active',
      createdAt: Date.now(),
    });
    return NextResponse.json({ uid: userRecord.uid });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not create the user.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const caller = await requireMasterAdmin(req);
  if (!caller) {
    return NextResponse.json({ error: 'Only the Master Admin can do this.' }, { status: 403 });
  }

  let body: { uid?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const uid = body.uid;
  if (!uid) {
    return NextResponse.json({ error: 'Missing uid.' }, { status: 400 });
  }

  try {
    const record = await adminAuth().getUser(uid);
    if (record.email === MASTER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'The Master Admin account cannot be removed.' },
        { status: 400 }
      );
    }
    await adminAuth().deleteUser(uid);
    await adminDb().collection('users').doc(uid).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not delete the user.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
