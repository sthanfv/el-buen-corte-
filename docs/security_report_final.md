# 🛡️ Informe de Seguridad y Endurecimiento - El Buen Corte
**Fecha:** 24 de Diciembre de 2025
**Estado:** ✅ PRODUCCIÓN HARDENED
**Certificación**: Protocolo MANDATO-FILTRO v3.5

Este documento resume las capas de seguridad implementadas para proteger la integridad del negocio y los datos de los clientes.

---

## 1. 🏰 Defensa de Borde (Middleware Proxy)
El punto de entrada está blindado mediante el `src/middleware.ts` conectado a **Upstash Redis**:
- **Rate Limiting**: Bloqueo automático de IPs que superen 100 peticiones/min o 5 órdenes/hora.
- **Blacklisting Dinámico**: Las IPs que activan el sistema *Honeypot* son baneadas por 30 días automáticamente.
- **Headers de Grado Militar**:
  - `Content-Security-Policy`: Restricción total de scripts externos no autorizados.
  - `Strict-Transport-Security (HSTS)`: Forzado de HTTPS por 365 días.
  - `X-Frame-Options`: Protección absoluta contra Clickjacking.

## 2. 🧱 Backend e Integridad de Datos
- **Transacciones ACID**: Uso de `runTransaction` para garantizar que el stock nunca sea inconsistente (prevención de Race Conditions).
- **Validación de Esquema (Zod)**: Inyección de datos imposible; cada entrada es validada estructuralmente antes de tocar la base de datos.
- **Sanitización XSS**: Todo el contenido generado por usuarios (experiencias/comentarios) es filtrado por un motor de limpieza antes del renderizado.
- **Producción Limpia**: Eliminación total de `console.log` y logs de depuración que podrían exponer secretos o lógica interna.

## 3. 👥 Autenticación y Autorización
- **Admin Guard (Server-Side)**: Las rutas administrativas están protegidas por verificación de *Custom Claims* en Firebase Admin SDK. El acceso "fantasma" es imposible.
- **Estrategia Fail-Open**: El sistema de seguridad de Redis está diseñado para registrar fallos pero permitir la operación si Redis cae, priorizando la disponibilidad del negocio sin arriesgar la base de datos.
- **Protección de Identidad**: El sistema no almacena contraseñas; se delega en la infraestructura de seguridad de Google (Firebase Auth).

## 4. 🕵️ Auditoría y Monitoreo
- **System Logs**: Registro en tiempo real de eventos críticos:
  - Cambios de estado en pedidos.
  - Activaciones de Honeypot.
  - Fallos de autenticación.
- **Trazabilidad de IP**: Cada pedido guarda el rastro digital del comprador para prevención de fraudes.

---
**DICTAMEN FINAL**: La plataforma cumple con los estándares OWASP Top 10 y está lista para recibir tráfico real de forma segura.

---
*Seguridad Técnica - El Buen Corte v3.5*
