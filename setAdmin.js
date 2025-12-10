// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

const admin = require('firebase-admin');

// Construye el objeto de credenciales desde las variables de entorno
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Reemplaza los \\n en la clave privada por saltos de línea reales
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

// Verifica que todas las variables necesarias estén presentes
if (
  !serviceAccount.projectId ||
  !serviceAccount.clientEmail ||
  !serviceAccount.privateKey
) {
  console.error(
    '\x1b[31m%s\x1b[0m',
    'Error: Faltan variables de entorno para la cuenta de servicio de Firebase.'
  );
  console.log(
    'Asegúrate de que FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, y FIREBASE_PRIVATE_KEY estén en tu archivo .env'
  );
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const uid = process.env.NEXT_PUBLIC_ADMIN_UID;

  if (!uid) {
    throw new Error(
      'La variable de entorno NEXT_PUBLIC_ADMIN_UID no está definida.'
    );
  }

  admin
    .auth()
    .setCustomUserClaims(uid, { admin: true })
    .then(() => {
      console.log(
        `\x1b[32m%s\x1b[0m`,
        `¡Éxito! Custom claim { admin: true } fue asignado al usuario con UID: ${uid}`
      );
      console.log(
        'Ya puedes acceder al panel de administración. Puede que necesites iniciar sesión de nuevo.'
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error(
        '\x1b[31m%s\x1b[0m',
        'Error asignando el custom claim:',
        error.message
      );
      process.exit(1);
    });
} catch (error) {
  console.error(
    '\x1b[31m%s\x1b[0m',
    'Ocurrió un error inesperado al inicializar Firebase Admin:',
    error.message
  );
  process.exit(1);
}
