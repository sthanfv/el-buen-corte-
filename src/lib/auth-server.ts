import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase';
import { logger } from '@/lib/logger';

/**
 * MANDATO-FILTRO: Sistema de Verificación de Autenticación Admin
 * 
 * Este módulo centraliza la validación de privilegios administrativos
 * mediante la verificación de Tokens de ID de Firebase y Custom Claims.
 */

export async function verifyAdmin(request: NextRequest): Promise<boolean> {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.warn('Intento de acceso admin sin token de autorización');
            return false;
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        // Verificación estricta del claim 'admin'
        if (decodedToken.admin !== true) {
            logger.warn(`Usuario ${decodedToken.uid} intentó acceder a recursos admin sin privilegios.`);
            return false;
        }

        return true;
    } catch (error) {
        // No exponemos detalles del error al log si es un token inválido común
        // pero registramos errores técnicos graves.
        logger.error('Fallo crítico en verifyAdmin', error);
        return false;
    }
}
