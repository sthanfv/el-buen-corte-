import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase';
import { headers } from 'next/headers';

async function verifyAdmin(idToken: string): Promise<boolean> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken.admin === true;
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { uidToMakeAdmin, adminUid } = await req.json();

    // The user making the request must be an admin themselves.
    // This is a simplified check. A real app might check the token.
    if (adminUid !== process.env.NEXT_PUBLIC_ADMIN_UID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await adminAuth.setCustomUserClaims(uidToMakeAdmin, { admin: true });

    return NextResponse.json({
      message: `Success! ${uidToMakeAdmin} has been made an admin.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
