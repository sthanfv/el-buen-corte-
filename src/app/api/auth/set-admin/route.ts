import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const { uidToMakeAdmin, adminUid } = await req.json();

    // MANDATO-FILTRO: Verificación estricta de privilegio raíz
    // Solo el UID maestro definido en el servidor puede promover otros administradores.
    if (!adminUid || adminUid !== process.env.NEXT_PUBLIC_ADMIN_UID) {
      return NextResponse.json({ error: 'Acceso denegado: Se requieren privilegios de administrador raíz' }, { status: 403 });
    }

    await adminAuth.setCustomUserClaims(uidToMakeAdmin, { admin: true });

    return NextResponse.json({
      message: `¡Éxito! El usuario ${uidToMakeAdmin} ahora tiene privilegios de administrador.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al procesar la solicitud de privilegios' }, { status: 500 });
  }
}
