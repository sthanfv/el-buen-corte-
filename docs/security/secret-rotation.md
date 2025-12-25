# Protocolo de Rotación de Secretos (SOP)
**Versión:** 1.0 (Diciembre 2024)  
**Clasificación:** Confidencial / Seguridad Operacional

Este documento detalla el procedimiento estándar para la rotación de secretos y credenciales del proyecto "El Buen Corte" para mitigar riesgos de filtración y cumplir con estándares de auditoría.

## 📌 Checklist de Secretos

| Secreto | Frecuencia | Responsable | Impacto |
| :--- | :--- | :--- | :--- |
| Firebase Admin (JSON/Key) | 90 días | DevOps / Admin | Crítico (DB/Auth) |
| Upstash Redis REST Token | 90 días | DevOps | Medio (Rate Limit) |
| Resend API Key | 180 días | DevOps | Bajo (Emails) |
| Vercel Deployment Webhooks | Anual | Admin | Bajo (CI/CD) |

---

## 🛠️ Procedimiento de Rotación

### 1. Firebase Admin SDK
1. Ingresar a [Firebase Console](https://console.firebase.google.com/).
2. Ir a **Configuración del Proyecto** > **Cuentas de Servicio**.
3. Generar una **Nueva clave privada**.
4. Actualizar las variables de entorno en Vercel/Producción:
   - `FIREBASE_ADMIN_PRIVATE_KEY`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
5. Eliminar la clave antigua una vez verificado el despliegue.

### 2. Upstash Redis
1. Ingresar al dashboard de [Upstash](https://console.upstash.com/).
2. Seleccionar la base de datos de "El Buen Corte".
3. En la sección "REST API", hacer clic en **Rotate Token**.
4. Actualizar `UPSTASH_REDIS_REST_TOKEN` inmediatamente.
5. El sistema "fail-open" de nuestra aplicación garantiza que no se pierdan pedidos durante el cambio.

### 3. Resend
1. Ingresar a [Resend API Keys](https://resend.com/api-keys).
2. Crear una nueva API Key.
3. Actualizar `RESEND_API_KEY`.
4. Borrar la anterior tras 24 horas.

---

## 🛡️ Validación Post-Rotación
- [ ] Verificar creación de pedido (ACID Transaction).
- [ ] Verificar logs en `admin_audit_logs`.
- [ ] Verificar envío de email de confirmación (Resend).
- [ ] Verificar que el rate limit sigue funcionando (Redis).

> [!CAUTION]
> NUNCA guardes los secretos rotados en archivos locales o sistemas de mensajería (WhatsApp/Slack). Usa un gestor de contraseñas seguro (1Password, Bitwarden).
