import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

const email = process.argv[2];

if (!email) {
    console.error('❌ Error: Por favor especifica un correo electrónico.');
    console.log('Uso: npx tsx src/scripts/set-admin.ts usuario@ejemplo.com');
    process.exit(1);
}

// Reuse existing initialization logic or simplify for script
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey?.replace(/\\n/g, '\n'),
            }),
        });
        console.log('✅ Firebase Admin inicializado correctamente.');
    } catch (error) {
        console.error('❌ Error inicializando Firebase:', error);
        process.exit(1);
    }
}

async function setAdminClaim(userEmail: string) {
    try {
        const user = await admin.auth().getUserByEmail(userEmail);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });

        console.log(`🚀 ¡ÉXITO! Se han asignado permisos de administrador a: ${userEmail}`);
        console.log('Nota: El usuario debe cerrar sesión y volver a entrar para que los cambios surtan efecto.');
        process.exit(0);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            console.error(`❌ Error: El usuario ${userEmail} no existe en Firebase Authentication.`);
        } else {
            console.error('❌ Error asignando claims:', error);
        }
        process.exit(1);
    }
}

setAdminClaim(email);
